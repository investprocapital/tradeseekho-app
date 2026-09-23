import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

// POST /api/admin/seed-advanced — adds 16 Advanced lessons (30-45)
// with 80 quiz questions (5 per lesson) in 4 languages (EN/UR/HI/AR).
// Each lesson gets imageUrl /lessons/lesson-{N}.png (N = 30..45).
// Admin-gated. Replaces existing Advanced lessons.
export async function POST() {
  const guard = await requireAdmin()
  if (guard) return guard
  const { seedAdvancedLessons } = await import("@/lib/seed-advanced")
  const { db } = await import("@/lib/db")
  const result = await seedAdvancedLessons(db)
  return NextResponse.json(result)
}
