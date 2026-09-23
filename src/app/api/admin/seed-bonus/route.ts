import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

// POST /api/admin/seed-bonus — adds 5 Bonus lessons (46-50) to the Advanced category
// with 25 quiz questions (5 per lesson) in 4 languages (EN/UR/HI/AR).
// Each lesson gets imageUrl /lessons/lesson-{N}.png (N = 46..50).
// Admin-gated. Replaces existing Bonus lessons (eurusd-46 to eurusd-50) only.
export async function POST() {
  const guard = await requireAdmin()
  if (guard) return guard
  const { seedBonusLessons } = await import("@/lib/seed-bonus")
  const { db } = await import("@/lib/db")
  const result = await seedBonusLessons(db)
  return NextResponse.json(result)
}
