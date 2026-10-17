import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { uploadFile } from "@/lib/blob-upload"
import { compressImage } from "@/lib/image-compress"

export const dynamic = "force-dynamic"
export const maxDuration = 30

/**
 * POST /api/admin/upload-image (multipart/form-data: file)
 *
 * AUTO-COMPRESS pipeline (per user requirement):
 *   1. Resize: max 800px width (mobile-first)
 *   2. Convert: PNG/JPG → WebP (25-35% smaller)
 *   3. Compress: quality 75 (auto-reduces if > 150KB, down to 30)
 *   4. Upload compressed WebP to Vercel Blob CDN
 *   5. Return CDN URL (or base64 fallback if Blob not configured)
 *
 * Result: 80-150KB per image — admin never needs to manually compress.
 * Max 5MB raw input (will be compressed down).
 */
export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const form = await req.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 })
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "not_image" }, { status: 400 })

  // Allow up to 5MB raw input (will be compressed down to ~150KB)
  const rawBuf = Buffer.from(await file.arrayBuffer())
  if (rawBuf.length > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "too_large", message: "Image must be under 5MB" }, { status: 400 })
  }

  try {
    // ─── AUTO-COMPRESS: resize + WebP + quality 75 ───
    const compressed = await compressImage(rawBuf)

    // Create a File object from the compressed buffer for uploadFile
    const compressedFile = new File([compressed.buffer], `img_${Date.now()}.webp`, {
      type: "image/webp",
    })

    // Upload compressed WebP to Vercel Blob CDN (falls back to base64 if not configured)
    const { url, stored } = await uploadFile(compressedFile, "admin-uploads", `img_${Date.now()}`)

    return NextResponse.json({
      ok: true,
      url,
      stored, // "blob" = CDN URL, "base64" = data URL fallback
      cdn: stored === "blob",
      compression: {
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        savedPct: compressed.savedPct,
        format: "webp",
        maxWidth: 800,
      },
    })
  } catch (e: any) {
    console.error("[admin/upload-image] compression failed:", e?.message)
    return NextResponse.json(
      { error: "compression_failed", message: e?.message || "Failed to process image" },
      { status: 500 },
    )
  }
}
