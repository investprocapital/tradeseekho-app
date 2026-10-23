import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

// POST /api/admin/pro/[id]/approve  body: { note? }
// Marks the request approved + sets ONLY the specific plan boolean on the user.
// User gets access to ONLY what they paid for:
//   - planType="alerts"  → isProAlerts = true  → unlimited price alerts
//   - planType="lessons" → isProLessons = true → all lessons unlocked
//   - planType="signals" → isProSignals = true → premium signals unlocked
//   - planType="all"     → all 3 booleans = true (bundle/all-access)
//
// CRITICAL: Do NOT set all 3 booleans for a single-plan purchase. This was the
// root cause of the bug where buying ONE plan unlocked ALL features.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin()
  if (guard) return guard
  const { id } = await params
  const { note } = await req.json().catch(() => ({} as { note?: string }))

  const r = await withDbRetry(() => db.proRequest.findUnique({ where: { id } }))
  if (!r) return NextResponse.json({ error: "not_found" }, { status: 404 })

  // Determine which plan to activate (default to "alerts" if not specified)
  const planToAdd = r.planType || "alerts"
  const VALID_PLANS = ["alerts", "lessons", "signals", "all"]
  if (!VALID_PLANS.includes(planToAdd)) {
    return NextResponse.json({ error: "invalid_plan", message: `Unknown plan: ${planToAdd}` }, { status: 400 })
  }

  // Get current user + their existing plan booleans + proPlans CSV
  const user = await withDbRetry(() => db.user.findUnique({
    where: { id: r.userId },
    select: { proPlans: true, proStatus: true, isProLessons: true, isProAlerts: true, isProSignals: true },
  }))
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 })

  // ─── Set ONLY the specific plan boolean(s) ───
  // For "all" (bundle): set all 3 to true.
  // For single plans: set ONLY that one boolean. Do NOT touch the others.
  const updateData: { isProLessons?: boolean; isProAlerts?: boolean; isProSignals?: boolean; proStatus: string; proPlans?: string } = {
    proStatus: "active",
  }

  if (planToAdd === "lessons") {
    updateData.isProLessons = true
  } else if (planToAdd === "alerts") {
    updateData.isProAlerts = true
  } else if (planToAdd === "signals") {
    updateData.isProSignals = true
  } else if (planToAdd === "all") {
    updateData.isProLessons = true
    updateData.isProAlerts = true
    updateData.isProSignals = true
  }

  // Also update proPlans CSV for backward compat (some old code may still read it)
  const currentPlans = user.proPlans ? user.proPlans.split(",").filter(Boolean) : []
  if (planToAdd === "all") {
    if (!currentPlans.includes("alerts")) currentPlans.push("alerts")
    if (!currentPlans.includes("lessons")) currentPlans.push("lessons")
    if (!currentPlans.includes("signals")) currentPlans.push("signals")
  } else {
    if (!currentPlans.includes(planToAdd)) currentPlans.push(planToAdd)
  }
  updateData.proPlans = currentPlans.join(",")

  // Update: mark request approved + set plan boolean(s) on user
  await withDbRetry(() => db.$transaction([
    db.proRequest.update({
      where: { id },
      data: { status: "approved", reviewedAt: new Date(), reviewerNote: note ?? null },
    }),
    db.user.update({
      where: { id: r.userId },
      data: updateData,
    }),
  ]))

  return NextResponse.json({
    ok: true,
    planAdded: planToAdd,
    isProLessons: planToAdd === "lessons" || planToAdd === "all" ? true : user.isProLessons,
    isProAlerts: planToAdd === "alerts" || planToAdd === "all" ? true : user.isProAlerts,
    isProSignals: planToAdd === "signals" || planToAdd === "all" ? true : user.isProSignals,
    totalPlans: currentPlans.join(","),
  })
}
