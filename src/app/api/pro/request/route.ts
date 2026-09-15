import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

export const dynamic = "force-dynamic"

// POST /api/pro/request  (multipart/form-data: method, amount?, note?, file)
// User uploads a payment screenshot + picks JazzCash/Easypaisa. Creates a
// ProRequest(status=pending). Admin approves via /api/admin/pro/[id]/approve.
//
// NOTE: Vercel's filesystem is read-only in serverless, so the screenshot is
// stored as a base64 data URL in ProRequest.screenshotPath (works on Vercel +
// local). Admin can view it in the Pro Requests tab.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const form = await req.formData()
  const method = String(form.get("method") || "")
  const amount = Number(form.get("amount") || 0)
  const note = String(form.get("note") || "").slice(0, 300)
  const file = form.get("file")

  if (method !== "JazzCash" && method !== "Easypaisa") {
    return NextResponse.json({ error: "bad_method" }, { status: 400 })
  }
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 })
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "not_image" }, { status: 400 })
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "too_large" }, { status: 400 })

  // Already Pro? skip
  const u = await db.user.findUnique({ where: { id: userId } })
  if (u?.proStatus === "active") return NextResponse.json({ error: "already_pro" }, { status: 400 })

  // Convert screenshot to base64 data URL (Vercel filesystem is read-only)
  const buf = Buffer.from(await file.arrayBuffer())
  if (buf.length > 800 * 1024) return NextResponse.json({ error: "too_large" }, { status: 400 })
  const screenshotPath = `data:${file.type};base64,${buf.toString("base64")}`

  const req2 = await db.proRequest.create({
    data: { userId, method, amount, note: note || null, screenshotPath, status: "pending" },
  })
  // mark user pending
  await db.user.update({ where: { id: userId }, data: { proStatus: "pending" } })
  return NextResponse.json({ ok: true, requestId: req2.id })
}
