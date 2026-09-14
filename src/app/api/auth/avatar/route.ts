import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import crypto from "crypto"

export const dynamic = "force-dynamic"

// POST /api/auth/avatar  (multipart/form-data, field "file")
// Saves the avatar to /public/uploads and updates the signed-in user's image.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const form = await req.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 })
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "not_image" }, { status: 400 })
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "too_large" }, { status: 400 })

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 4)
  const name = `${userId}-${crypto.randomBytes(4).toString("hex")}.${ext}`
  const dir = path.join(process.cwd(), "public", "uploads")
  if (!existsSync(dir)) await mkdir(dir, { recursive: true })
  const buf = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(dir, name), buf)

  const url = `/uploads/${name}`
  await db.user.update({ where: { id: userId }, data: { image: url } })
  return NextResponse.json({ ok: true, image: url })
}
