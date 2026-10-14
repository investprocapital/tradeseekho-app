/* migrate-images-to-blob.ts
 *
 * One-time migration: moves all base64 images from the Neon DB to Vercel Blob
 * (CDN), and replaces the DB rows with CDN URLs.
 *
 * TARGETS:
 *   1. Signal.screenshot         — chart screenshots (admin uploads)
 *   2. Comment.image             — user comment images
 *   3. ProRequest.screenshotPath — payment screenshots
 *
 * PREREQUISITE: BLOB_READ_WRITE_TOKEN must be set in the environment
 * (Vercel dashboard → Storage → Blob → Create store → copy token).
 *
 * RUN (locally, against production Neon DB):
 *   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxx..." \
 *   DATABASE_URL="postgresql://...neon.tech/tradeseekho?sslmode=require" \
 *   bun run scripts/migrate-images-to-blob.ts
 *
 * Or on Vercel: set the token as an env var, then trigger a one-off
 * `bun run scripts/migrate-images-to-blob.ts` via the Vercel CLI / cron.
 *
 * The script is IDEMPOTENT — it only touches rows where the image starts with
 * "data:" (base64). Rows that already have an http(s) URL are skipped.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client")
const { put } = require("@vercel/blob")

const db = new PrismaClient()

function isBase64(s) {
  return typeof s === "string" && s.startsWith("data:")
}

async function uploadBase64(dataUrl, folder, id) {
  const match = String(dataUrl).match(/^data:(image\/[a-z+]+);base64,(.+)$/i)
  if (!match) return null
  const [, mimeType, base64Data] = match
  const ext = mimeType === "image/png" ? "png" : mimeType === "image/jpeg" ? "jpg" : mimeType === "image/webp" ? "webp" : "img"
  const buffer = Buffer.from(base64Data, "base64")
  const pathname = `${folder}/${id}.${ext}`
  const blob = await put(pathname, buffer, {
    access: "public",
    contentType: mimeType,
    addRandomSuffix: true,
  })
  return blob.url
}

async function migrate() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("❌ BLOB_READ_WRITE_TOKEN is not set. Aborting.")
    process.exit(1)
  }

  let stats = { signals: { migrated: 0, skipped: 0, failed: 0 }, comments: { migrated: 0, skipped: 0, failed: 0 }, pro: { migrated: 0, skipped: 0, failed: 0 } }

  // 1) Signal screenshots
  console.log("\n📸 [1/3] Migrating Signal.screenshot ...")
  const signals = await db.signal.findMany({ select: { id: true, screenshot: true } })
  console.log(`   Found ${signals.length} signals`)
  for (const s of signals) {
    if (!isBase64(s.screenshot)) { stats.signals.skipped++; continue }
    try {
      const url = await uploadBase64(s.screenshot, "signals", s.id)
      if (url) {
        await db.signal.update({ where: { id: s.id }, data: { screenshot: url } })
        stats.signals.migrated++
        if (stats.signals.migrated % 5 === 0) console.log(`   ✓ migrated ${stats.signals.migrated} signals ...`)
      } else {
        stats.signals.failed++
      }
    } catch (e) {
      console.error(`   ✗ signal ${s.id}:`, e.message)
      stats.signals.failed++
    }
  }
  console.log(`   ✅ Signals: ${stats.signals.migrated} migrated, ${stats.signals.skipped} skipped (already URL), ${stats.signals.failed} failed`)

  // 2) Comment images
  console.log("\n📸 [2/3] Migrating Comment.image ...")
  const comments = await db.comment.findMany({ select: { id: true, image: true } })
  console.log(`   Found ${comments.length} comments`)
  for (const c of comments) {
    if (!isBase64(c.image)) { stats.comments.skipped++; continue }
    try {
      const url = await uploadBase64(c.image, "comments", c.id)
      if (url) {
        await db.comment.update({ where: { id: c.id }, data: { image: url } })
        stats.comments.migrated++
      } else {
        stats.comments.failed++
      }
    } catch (e) {
      console.error(`   ✗ comment ${c.id}:`, e.message)
      stats.comments.failed++
    }
  }
  console.log(`   ✅ Comments: ${stats.comments.migrated} migrated, ${stats.comments.skipped} skipped, ${stats.comments.failed} failed`)

  // 3) ProRequest screenshots
  console.log("\n📸 [3/3] Migrating ProRequest.screenshotPath ...")
  const pros = await db.proRequest.findMany({ select: { id: true, screenshotPath: true } })
  console.log(`   Found ${pros.length} pro requests`)
  for (const p of pros) {
    if (!isBase64(p.screenshotPath)) { stats.pro.skipped++; continue }
    try {
      const url = await uploadBase64(p.screenshotPath, "pro-payments", p.id)
      if (url) {
        await db.proRequest.update({ where: { id: p.id }, data: { screenshotPath: url } })
        stats.pro.migrated++
      } else {
        stats.pro.failed++
      }
    } catch (e) {
      console.error(`   ✗ pro ${p.id}:`, e.message)
      stats.pro.failed++
    }
  }
  console.log(`   ✅ Pro requests: ${stats.pro.migrated} migrated, ${stats.pro.skipped} skipped, ${stats.pro.failed} failed`)

  console.log("\n" + "═".repeat(60))
  console.log("📊 MIGRATION SUMMARY")
  console.log("═".repeat(60))
  console.log(`  Signals:       ${stats.signals.migrated} migrated | ${stats.signals.skipped} skipped | ${stats.signals.failed} failed`)
  console.log(`  Comments:      ${stats.comments.migrated} migrated | ${stats.comments.skipped} skipped | ${stats.comments.failed} failed`)
  console.log(`  Pro requests:  ${stats.pro.migrated} migrated | ${stats.pro.skipped} skipped | ${stats.pro.failed} failed`)
  const totalMigrated = stats.signals.migrated + stats.comments.migrated + stats.pro.migrated
  console.log(`  TOTAL:         ${totalMigrated} images moved to Vercel Blob CDN ✅`)
  console.log("═".repeat(60))
}

migrate()
  .catch((e) => { console.error("Migration failed:", e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
