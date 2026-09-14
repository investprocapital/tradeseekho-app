import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

// GET /api/admin/pro — list all pro requests (newest first), with user info
export async function GET(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") // pending | approved | rejected | all
  const rows = await db.proRequest.findMany({
    where: status && status !== "all" ? { status } : {},
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    take: 100,
  })
  return NextResponse.json({ requests: rows })
}
