import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

// POST /api/admin/pro/[id]/reject  body: { note? }
// Marks the request rejected + resets user's proStatus to "none" (unless another
// approved request exists).
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
  // has any other approved request for this user?
  const otherApproved = await db.proRequest.findFirst({
    where: { userId: r.userId, status: "approved", NOT: { id: r.id } },
    select: { id: true },
  })
  await db.$transaction([
    db.proRequest.update({
      where: { id },
      data: { status: "rejected", reviewedAt: new Date(), reviewerNote: note ?? null },
    }),
    ...(otherApproved ? [] : [db.user.update({ where: { id: r.userId }, data: { proStatus: "none" } })]),
  ])
  return NextResponse.json({ ok: true })
}
