import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

export const dynamic = "force-dynamic"

// POST /api/auth/avatar  (multipart/form-data, field "file")
// Converts the uploaded image to a base64 data URL and stores it in User.image.
// (Vercel's filesystem is read-only in production, so we can't write to /public.
//  Base64 in the DB works for small avatars ≤ 200KB after resize.)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const form = await req.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 })
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "not_image" }, { status: 400 })
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "too_large" }, { status: 400 })

  // Read file → base64 data URL
  const buf = Buffer.from(await file.arrayBuffer())
  // Compress: if > 100KB, just reject (client should resize). Base64 adds ~33%.
  if (buf.length > 500 * 1024) return NextResponse.json({ error: "too_large" }, { status: 400 })
  const dataUrl = `data:${file.type};base64,${buf.toString("base64")}`

  await db.user.update({ where: { id: userId }, data: { image: dataUrl } })
  return NextResponse.json({ ok: true, image: dataUrl })
}
