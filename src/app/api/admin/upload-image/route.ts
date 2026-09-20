import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

// POST /api/admin/upload-image (multipart/form-data: file)
// Converts uploaded image to base64 data URL and returns it.
// Works on Vercel (read-only filesystem) — stores as base64 in DB.
export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const form = await req.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 })
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "not_image" }, { status: 400 })
  if (file.size > 500 * 1024) return NextResponse.json({ error: "too_large" }, { status: 400 })

  const buf = Buffer.from(await file.arrayBuffer())
  const dataUrl = `data:${file.type};base64,${buf.toString("base64")}`
  return NextResponse.json({ ok: true, url: dataUrl })
}
