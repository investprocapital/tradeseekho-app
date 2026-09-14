import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

// POST /api/admin/seed — populates demo content (categories, lessons, quizzes)
// into the current database. Admin-gated. Idempotent (upserts by fixed IDs).
export async function POST() {
  const guard = await requireAdmin()
  if (guard) return guard

  // Re-use the seed logic inline (the seed.ts file uses bun-specific import;
  // this route runs in the Vercel serverless runtime which has DATABASE_URL).
  const { seedTradeSeekho } = await import("@/lib/seed-data")
  const result = await seedTradeSeekho(db)
  return NextResponse.json(result)
}
