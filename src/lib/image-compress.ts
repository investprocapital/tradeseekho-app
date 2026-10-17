/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Image compression helper — auto-resize + convert to WebP + compress.
 *
 * Uses sharp (already installed) to process images on the server before
 * uploading to Vercel Blob. This way admins don't need to manually compress
 * with TinyPNG/Squoosh — the system does it automatically.
 *
 * PIPELINE:
 *   1. Resize: max 800px width (mobile-first, retina-ready)
 *   2. Convert: PNG/JPG → WebP (25-35% smaller than equivalent quality)
 *   3. Compress: quality 75 (auto-reduces if > 150KB, down to 30)
 *   4. Result: 80-150KB per image (visually identical to original)
 *
 * USAGE:
 *   import { compressImage } from "@/lib/image-compress"
 *   const compressed = await compressImage(file) // returns Buffer (WebP)
 *   // then upload `compressed` to Vercel Blob
 */
import sharp from "sharp"

export interface CompressResult {
  buffer: Buffer
  mimeType: string
  extension: string
  originalSize: number
  compressedSize: number
  savedPct: number
}

/**
 * Compress an image: resize (max 800px width) + convert to WebP + quality 75.
 * Auto-reduces quality if the result is over 150KB (down to 30).
 *
 * @param input - File object (from FormData) or Buffer
 * @returns Promise<CompressResult> with the compressed WebP buffer
 */
export async function compressImage(input: File | Buffer): Promise<CompressResult> {
  const rawBuf = Buffer.isBuffer(input) ? input : Buffer.from(await input.arrayBuffer())
  const originalSize = rawBuf.length

  // Get image metadata to check current dimensions
  const meta = await sharp(rawBuf).metadata()
  const originalWidth = meta.width || 800

  // Resize: max 800px width (don't enlarge if smaller)
  const targetWidth = Math.min(originalWidth, 800)

  // Start at quality 75, reduce if > 150KB
  let quality = 75
  let buffer = await sharp(rawBuf)
    .resize(targetWidth, null, { withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer()

  // Auto-reduce quality until under 150KB (min quality 30)
  while (buffer.length > 150 * 1024 && quality > 30) {
    quality -= 10
    buffer = await sharp(rawBuf)
      .resize(targetWidth, null, { withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toBuffer()
  }

  const compressedSize = buffer.length
  const savedPct = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0

  return {
    buffer,
    mimeType: "image/webp",
    extension: "webp",
    originalSize,
    compressedSize,
    savedPct,
  }
}

/**
 * Convenience function: compress + return as a File object (for uploadFile).
 */
export async function compressToWebPFile(input: File | Buffer, filename: string = "image"): Promise<File> {
  const result = await compressImage(input)
  return new File([result.buffer], `${filename}.webp`, { type: "image/webp" })
}
