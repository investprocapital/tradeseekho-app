import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

// POST /api/admin/seed-intermediate — adds 10 Intermediate lessons (13-22)
// with 40 quiz questions (4 per lesson) in 4 languages (EN/UR/HI/AR).
// Each lesson gets imageUrl /lessons/lesson-{N}.png (N = 13..22).
// Admin-gated. Replaces existing Intermediate lessons.
export async function POST() {
  const guard = await requireAdmin()
  if (guard) return guard
  const { seedIntermediateLessons } = await import("@/lib/seed-intermediate")
  const { db } = await import("@/lib/db")
  const result = await seedIntermediateLessons(db)
  return NextResponse.json(result)
}
