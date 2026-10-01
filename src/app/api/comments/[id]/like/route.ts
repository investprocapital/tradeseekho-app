import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// POST /api/comments/[id]/like — increment like count
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const comment = await db.comment.update({
    where: { id },
    data: { likes: { increment: 1 } },
    select: { likes: true },
  })
  return NextResponse.json({ ok: true, likes: comment.likes })
}
