import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

// POST /api/admin/pro/[id]/approve  body: { note? }
// Marks the request approved + sets the user's proStatus = active (lifetime).
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin()
  if (guard) return guard
  const { id } = await params
  const { note } = await req.json().catch(() => ({} as { note?: string }))
  const r = await db.proRequest.findUnique({ where: { id } })
  if (!r) return NextResponse.json({ error: "not_found" }, { status: 404 })
  await db.$transaction([
    db.proRequest.update({
      where: { id },
      data: { status: "approved", reviewedAt: new Date(), reviewerNote: note ?? null },
    }),
    db.user.update({ where: { id: r.userId }, data: { proStatus: "active" } }),
  ])
  return NextResponse.json({ ok: true })
}
