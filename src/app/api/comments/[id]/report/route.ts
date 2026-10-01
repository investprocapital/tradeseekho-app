import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// POST /api/comments/[id]/report — increment report count (flags for admin)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const comment = await db.comment.update({
    where: { id },
    data: { reports: { increment: 1 } },
    select: { reports: true },
  })
  return NextResponse.json({ ok: true, reports: comment.reports })
}
