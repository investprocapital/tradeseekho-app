import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { uploadFile } from "@/lib/blob-upload"
import { compressImage } from "@/lib/image-compress"
import { uploadToSupabase, isSupabaseConfigured } from "@/lib/supabase-storage"

export const dynamic = "force-dynamic"
export const maxDuration = 30

/**
 * POST /api/admin/upload-image (multipart/form-data: file)
 *
 * AUTO-COMPRESS pipeline:
 *   1. Resize: max 800px width (mobile-first)
 *   2. Convert: PNG/JPG → WebP (25-35% smaller)
 *   3. Compress: quality 75 (auto-reduces if > 150KB, down to 30)
 *   4. Upload to Supabase Storage (if configured) → else Vercel Blob → else base64
 *   5. Return URL
 *
 * Upload priority:
 *   1. Supabase Storage (free 1GB, Cache-Control 1 year) ← PRIMARY
 *   2. Vercel Blob (fallback if Supabase not configured)
 *   3. Base64 data URL (last resort fallback)
 *
 * Max 5MB raw input (will be compressed down to ~80-200KB).
 */
export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const form = await req.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 })
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "not_image" }, { status: 400 })

  // Allow up to 5MB raw input (will be compressed down)
  const rawBuf = Buffer.from(await file.arrayBuffer())
  if (rawBuf.length > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "too_large", message: "Image must be under 5MB" }, { status: 400 })
  }

  try {
    // ─── AUTO-COMPRESS: resize + WebP + quality 75 ───
    const compressed = await compressImage(rawBuf)
    const filename = `img_${Date.now()}.webp`

    let url: string | null = null
    let stored: "supabase" | "blob" | "base64" = "base64"

    // ─── Priority 1: Supabase Storage ───
    if (isSupabaseConfigured()) {
      const supaUrl = await uploadToSupabase(
        compressed.buffer,
        "admin-uploads",
        filename,
        "image/webp",
      )
      if (supaUrl) {
        url = supaUrl
        stored = "supabase"
      }
    }

    // ─── Priority 2: Vercel Blob (fallback) ───
    if (!url) {
      const compressedFile = new File([compressed.buffer], filename, { type: "image/webp" })
      const blobResult = await uploadFile(compressedFile, "admin-uploads", `img_${Date.now()}`)
      url = blobResult.url
      stored = blobResult.stored === "blob" ? "blob" : "base64"
    }

    return NextResponse.json({
      ok: true,
      url,
      stored,
      cdn: stored !== "base64",
      compression: {
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        savedPct: compressed.savedPct,
        format: "webp",
        maxWidth: 800,
      },
    })
  } catch (e: any) {
    console.error("[admin/upload-image] error:", e?.message)
    return NextResponse.json(
      { error: "compression_failed", message: e?.message || "Failed to process image" },
      { status: 500 },
    )
  }
}
