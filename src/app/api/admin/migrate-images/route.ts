import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isBlobConfigured } from "@/lib/blob-upload"
import { withDbRetry } from "@/lib/db-retry"
import { put } from "@vercel/blob"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * POST /api/admin/migrate-images — ONE-TIME migration endpoint.
 *
 * Moves all base64 images from the Neon DB to Vercel Blob CDN.
 *
 * AUTH: admin cookie OR MIGRATION_ONE_TIME_TOKEN env var.
 * Idempotent: only touches rows where image starts with "data:".
 */
export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get("token") || req.headers.get("x-migration-token")

    let authorized = false
    if (token === process.env.MIGRATION_ONE_TIME_TOKEN) {
      authorized = true
    } else {
      const { requireAdmin } = await import("@/lib/admin-auth")
      const guard = await requireAdmin()
      if (!guard) authorized = true
    }

    if (!authorized) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    if (!isBlobConfigured()) {
      return NextResponse.json({
        error: "BLOB not configured",
        message: "BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID+VERCEL not set. Create a Blob store in Vercel dashboard.",
        debug: {
          hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
          hasBlobStoreId: !!process.env.BLOB_STORE_ID,
          isVercel: !!process.env.VERCEL,
        }
      }, { status: 400 })
    }

    const stats = {
      signals: { migrated: 0, skipped: 0, failed: 0 },
      comments: { migrated: 0, skipped: 0, failed: 0 },
      pro: { migrated: 0, skipped: 0, failed: 0 },
    }

    const isBase64 = (s: string | null): s is string => !!s && typeof s === "string" && s.startsWith("data:")

    async function uploadBase64(dataUrl: string, folder: string, id: string): Promise<string | null> {
      const match = dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/i)
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

    // 1) Signal screenshots
    const signals = await withDbRetry(() => db.signal.findMany({ select: { id: true, screenshot: true } }))
    for (const s of signals) {
      if (!isBase64(s.screenshot)) { stats.signals.skipped++; continue }
      try {
        const url = await uploadBase64(s.screenshot, "signals", s.id)
        if (url) {
          await withDbRetry(() => db.signal.update({ where: { id: s.id }, data: { screenshot: url } }))
          stats.signals.migrated++
        } else { stats.signals.failed++ }
      } catch (e) { stats.signals.failed++ }
    }

    // 2) Comment images
    const comments = await withDbRetry(() => db.comment.findMany({ select: { id: true, image: true } }))
    for (const c of comments) {
      if (!isBase64(c.image)) { stats.comments.skipped++; continue }
      try {
        const url = await uploadBase64(c.image, "comments", c.id)
        if (url) {
          await withDbRetry(() => db.comment.update({ where: { id: c.id }, data: { image: url } }))
          stats.comments.migrated++
        } else { stats.comments.failed++ }
      } catch (e) { stats.comments.failed++ }
    }

    // 3) ProRequest screenshots
    const pros = await withDbRetry(() => db.proRequest.findMany({ select: { id: true, screenshotPath: true } }))
    for (const p of pros) {
      if (!isBase64(p.screenshotPath)) { stats.pro.skipped++; continue }
      try {
        const url = await uploadBase64(p.screenshotPath, "pro-payments", p.id)
        if (url) {
          await withDbRetry(() => db.proRequest.update({ where: { id: p.id }, data: { screenshotPath: url } }))
          stats.pro.migrated++
        } else { stats.pro.failed++ }
      } catch (e) { stats.pro.failed++ }
    }

    const totalMigrated = stats.signals.migrated + stats.comments.migrated + stats.pro.migrated
    return NextResponse.json({
      ok: true,
      summary: {
        signals: stats.signals,
        comments: stats.comments,
        proRequests: stats.pro,
        totalMigrated,
        totalSkipped: stats.signals.skipped + stats.comments.skipped + stats.pro.skipped,
        totalFailed: stats.signals.failed + stats.comments.failed + stats.pro.failed,
      },
    })
  } catch (e: any) {
    return NextResponse.json({
      error: "migration_failed",
      message: e?.message || String(e),
      stack: process.env.NODE_ENV === "production" ? undefined : e?.stack,
    }, { status: 500 })
  }
}
