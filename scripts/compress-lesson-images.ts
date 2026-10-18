/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Compress lesson images — converts PNG to WebP, max 150KB per image.
 *
 * - Input: public/lessons/lesson-*.png (43 images, 6.7MB total)
 * - Output: public/lessons/lesson-*.webp (target: 80-150KB each)
 * - Quality: 75 (good balance — visually identical, 80% smaller)
 * - Resize: max 1200px width (mobile-first, retina-ready)
 *
 * Run: bun run scripts/compress-lesson-images.ts
 *
 * After running, update the seed data to use .webp extension:
 *   imageUrl: `/lessons/lesson-${order}.webp`  (was .png)
 */
const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

const LESSONS_DIR = path.join(process.cwd(), "public", "lessons")

async function compressAll() {
  const files = fs.readdirSync(LESSONS_DIR)
    .filter((f) => f.endsWith(".png"))
    .sort()

  console.log(`\n📸 Found ${files.length} PNG images to compress\n`)

  let totalOriginal = 0
  let totalCompressed = 0
  let converted = 0
  let skipped = 0

  for (const file of files) {
    const inputPath = path.join(LESSONS_DIR, file)
    const outputPath = path.join(LESSONS_DIR, file.replace(".png", ".webp"))

    const originalSize = fs.statSync(inputPath).size
    totalOriginal += originalSize

    try {
      // Get image metadata to check dimensions
      const meta = await sharp(inputPath).metadata()
      const width = meta.width || 1200

      // Compress to WebP with quality 75, max 1200px width
      const targetWidth = Math.min(width, 1200)
      let buffer = await sharp(inputPath)
        .resize(targetWidth, null, { withoutEnlargement: true })
        .webp({ quality: 75, effort: 4 })
        .toBuffer()

      // If still over 150KB, reduce quality further
      let quality = 75
      while (buffer.length > 150 * 1024 && quality > 30) {
        quality -= 10
        buffer = await sharp(inputPath)
          .resize(targetWidth, null, { withoutEnlargement: true })
          .webp({ quality, effort: 4 })
          .toBuffer()
      }

      fs.writeFileSync(outputPath, buffer)
      totalCompressed += buffer.length
      converted++

      const savedPct = ((1 - buffer.length / originalSize) * 100).toFixed(0)
      const sizeStr = `${(originalSize / 1024).toFixed(0)}KB → ${(buffer.length / 1024).toFixed(0)}KB`
      console.log(`  ✅ ${file.padEnd(16)} ${sizeStr.padEnd(20)} (-${savedPct}%)`)
    } catch (e) {
      console.error(`  ❌ ${file}: ${e.message}`)
      skipped++
    }
  }

  console.log(`\n${"═".repeat(60)}`)
  console.log("📊 COMPRESSION SUMMARY")
  console.log("═".repeat(60))
  console.log(`  Images converted:  ${converted}/${files.length}`)
  console.log(`  Skipped (errors):  ${skipped}`)
  console.log(`  Original total:    ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`)
  console.log(`  Compressed total:  ${(totalCompressed / 1024 / 1024).toFixed(2)} MB`)
  console.log(`  Saved:             ${((1 - totalCompressed / totalOriginal) * 100).toFixed(0)}%`)
  console.log(`  Avg per image:     ${(totalCompressed / converted / 1024).toFixed(0)}KB`)
  console.log("═".repeat(60))
  console.log("\n💡 Next step: update seed data to use .webp extension")
  console.log("   (bun run scripts/update-seed-webp.ts)\n")
}

compressAll().catch((e) => {
  console.error("Compression failed:", e)
  process.exit(1)
})
