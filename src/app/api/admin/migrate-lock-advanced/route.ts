import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

/**
 * POST /api/admin/migrate-lock-advanced
 *
 * One-time migration: lock Advanced-level lessons 4+ (order >= 4) so they
 * require Pro access. Lessons 1-3 (SMC intro, Order Block, Fair Value Gap)
 * stay free; from lesson 4 onwards (Buy/Sell Liquidity, Market Structure,
 * Kill Zones, Risk Management, etc.) become Pro-only.
 *
 * Safe to run multiple times — it just sets isFree=false for advanced lessons
 * with order >= 4. Run once after deploying the seed update; existing Pro
 * users keep access, free users see the lock + upgrade popup.
 */
export async function POST() {
  const guard = await requireAdmin()
  if (guard) return guard

  // Find the Advanced category (slug "advanced")
  const advanced = await db.category.findUnique({ where: { slug: "advanced" } })
  if (!advanced) {
    return NextResponse.json({ error: "advanced category not found" }, { status: 404 })
  }

  // Lock advanced lessons with order >= 4 (lessons 1-3 stay free)
  const result = await db.lesson.updateMany({
    where: {
      categoryId: advanced.id,
      order: { gte: 4 },
    },
    data: { isFree: false },
  })

  // Count how many remain free in advanced (should be 3)
  const freeCount = await db.lesson.count({
    where: { categoryId: advanced.id, isFree: true },
  })

  return NextResponse.json({
    ok: true,
    lockedCount: result.count,
    freeRemaining: freeCount,
    message: `Locked ${result.count} advanced lessons (order 4+). ${freeCount} lessons remain free (1-3).`,
  })
}
