import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { uploadFile } from "@/lib/blob-upload"

export const dynamic = "force-dynamic"

// POST /api/pro/request  (multipart/form-data: method, amount?, note?, file)
// User uploads a payment screenshot + picks a payment method. Creates a
// ProRequest(status=pending). Admin approves via /api/admin/pro/[id]/approve.
//
// The screenshot is uploaded to Vercel Blob (CDN) and only the URL is stored
// in ProRequest.screenshotPath — keeps Neon rows tiny. Falls back to base64
// data URL if Blob is not configured.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const form = await req.formData()
  const method = String(form.get("method") || "")
  const amount = Number(form.get("amount") || 0)
  const note = String(form.get("note") || "").slice(0, 300)
  const file = form.get("file")

  const VALID_METHODS = ["JazzCash", "Easypaisa", "Card", "SadaPay", "USDT", "USDT_BEP20"]
  if (!VALID_METHODS.includes(method)) {
    return NextResponse.json({ error: "bad_method" }, { status: 400 })
  }
  if ((method === "USDT" || method === "USDT_BEP20") && note.trim().length < 6) {
    return NextResponse.json({ error: "txid_required" }, { status: 400 })
  }
  if (method !== "Card" && !(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 })
  }
  if (file instanceof File) {
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "not_image" }, { status: 400 })
    if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "too_large" }, { status: 400 })
  }

  // Already Pro? skip
  const u = await db.user.findUnique({ where: { id: userId } })
  if (u?.proStatus === "active") return NextResponse.json({ error: "already_pro" }, { status: 400 })

  // Upload screenshot to Vercel Blob CDN (falls back to base64 if Blob not configured)
  let screenshotPath = ""
  if (file instanceof File) {
    const buf = Buffer.from(await file.arrayBuffer())
    if (buf.length > 800 * 1024) return NextResponse.json({ error: "too_large" }, { status: 400 })
    const { url } = await uploadFile(file, "pro-payments", `pro_${userId}_${Date.now()}`)
    screenshotPath = url
  }

  const req2 = await db.proRequest.create({
    data: { userId, method, amount, note: note || null, screenshotPath, status: "pending" },
  })
  await db.user.update({ where: { id: userId }, data: { proStatus: "pending" } })
  return NextResponse.json({ ok: true, requestId: req2.id })
}
