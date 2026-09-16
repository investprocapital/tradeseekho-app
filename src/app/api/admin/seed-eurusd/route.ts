import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

// POST /api/admin/seed-eurusd — replaces Beginner lessons with the 12 EUR/USD
// version (each with 4 quiz questions = 48 total). Admin-gated.
export async function POST() {
  const guard = await requireAdmin()
  if (guard) return guard
  const { seedEurUsdLessons } = await import("@/lib/seed-eurusd")
  const { db } = await import("@/lib/db")
  const result = await seedEurUsdLessons(db)
  return NextResponse.json(result)
}
