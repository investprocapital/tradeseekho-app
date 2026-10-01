import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

/**
 * POST /api/admin/migrate-level-colors
 *
 * One-time migration: updates the category colors so the 3 levels are visually
 * distinct (Beginner=Green, Intermediate=Amber, Advanced=Blue). Safe to run
 * multiple times.
 */
export async function POST() {
  const guard = await requireAdmin()
  if (guard) return guard

  await db.category.update({
    where: { slug: "beginner" },
    data: { color: "#00C853" }, // green
  })
  await db.category.update({
    where: { slug: "intermediate" },
    data: { color: "#FF9800" }, // orange/amber (more distinct from green)
  })
  await db.category.update({
    where: { slug: "advanced" },
    data: { color: "#2196F3" }, // blue (was teal #00BFA5 — too close to green)
  })

  return NextResponse.json({
    ok: true,
    message: "Level colors updated: Beginner=#00C853 (green), Intermediate=#FF9800 (orange), Advanced=#2196F3 (blue)",
  })
}
