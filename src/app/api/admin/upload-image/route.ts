import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { uploadFile, isBlobConfigured } from "@/lib/blob-upload"

export const dynamic = "force-dynamic"
export const maxDuration = 30

// POST /api/admin/upload-image (multipart/form-data: file)
// Uploads an image to Vercel Blob (CDN) and returns the URL.
// - If BLOB_READ_WRITE_TOKEN is set → returns a CDN URL (image NOT in DB)
// - If not set → falls back to base64 data URL (image stored in DB)
// Max 2MB raw image.
export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const form = await req.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 })
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "not_image" }, { status: 400 })

  const rawBuf = Buffer.from(await file.arrayBuffer())
  if (rawBuf.length > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "too_large", message: "Image must be under 2MB" }, { status: 400 })
  }

  // Upload to Vercel Blob CDN (falls back to base64 if Blob not configured)
  const { url, stored } = await uploadFile(file, "admin-uploads", `img_${Date.now()}`)

  return NextResponse.json({
    ok: true,
    url,
    stored, // "blob" = CDN URL, "base64" = data URL fallback
    cdn: stored === "blob",
  })
}
