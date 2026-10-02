import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

// GET /api/admin/comments — admin: list ALL comments (incl. hidden) newest first
export async function GET(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard
  const { searchParams } = new URL(req.url)
  const filter = searchParams.get("filter") // "all" | "hidden" | "visible" | "reported"
  
  const where: Record<string, unknown> = {}
  if (filter === "hidden") where.hidden = true
  if (filter === "visible") where.hidden = false
  if (filter === "reported") where.reports = { gt: 0 }

  const comments = await db.comment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { signal: { select: { symbol: true, signalType: true } } },
  })
  return NextResponse.json({
    comments: comments.map((c) => ({
      id: c.id,
      signalId: c.signalId,
      signalSymbol: c.signal?.symbol ?? "",
      signalType: c.signal?.signalType ?? "",
      userId: c.userId,
      userName: c.userName,
      text: c.text,
      image: c.image,
      hidden: c.hidden,
      likes: c.likes,
      reports: c.reports,
      createdAt: c.createdAt.toISOString(),
    })),
  })
}

// PATCH /api/admin/comments?id=X — admin: toggle hidden (show/hide)
// Body: { hidden: boolean }
export async function PATCH(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  
  const body = await req.json()
  const updated = await db.comment.update({
    where: { id },
    data: { hidden: !!body.hidden },
  })
  return NextResponse.json({ ok: true, hidden: updated.hidden })
}

// DELETE /api/admin/comments?id=X — admin: delete a comment
export async function DELETE(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  
  await db.comment.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
