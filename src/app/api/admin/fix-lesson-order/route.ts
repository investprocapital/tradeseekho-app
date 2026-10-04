import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

/**
 * POST /api/admin/fix-lesson-order
 *
 * One-time fix: eurusd-8 has order=1 in the DB (should be 8). This caused it
 * to appear as the 2nd lesson (after eurusd-1 which also has order=1), which
 * broke the sequential lock — lesson 12 (Quiz + Level 1 Test) was unreachable
 * because lessons 2-11 were locked behind eurusd-8's quiz.
 *
 * This endpoint sets eurusd-8's order to 8 (matching its ID) so the lesson
 * sequence is correct: 1,2,3,4,5,6,7,8,9,10,11,12.
 */
export async function POST() {
  const guard = await requireAdmin()
  if (guard) return guard

  // Fix eurusd-8 order: 1 → 8
  const fixed = await db.lesson.update({
    where: { id: "eurusd-8" },
    data: { order: 8 },
  })

  return NextResponse.json({
    ok: true,
    message: `Fixed eurusd-8: order ${1} → ${fixed.order}`,
  })
}
