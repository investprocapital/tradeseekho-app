import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth"

export const dynamic = "force-dynamic"

// GET local learner progress map { lessonId -> { score, total, passed, completed } }
export async function GET() {
  const userId = await getCurrentUserId()
  const rows = await db.progress.findMany({ where: { userId } })
  const map = Object.fromEntries(
    rows.map((p) => [p.lessonId, { score: p.score, total: p.total, passed: p.passed, completed: p.completed }]),
  )
  return NextResponse.json({ progress: map })
}
