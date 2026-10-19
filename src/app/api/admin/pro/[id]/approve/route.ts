import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

// POST /api/admin/pro/[id]/approve  body: { note? }
// Marks the request approved + adds the specific plan (planType) to the user's
// proPlans field. User gets access to ONLY what they paid for:
//   - planType="alerts" → adds "alerts" to proPlans → unlimited price alerts
//   - planType="lessons" → adds "lessons" to proPlans → all lessons unlocked
//   - planType="signals" → adds "signals" to proPlans → premium signals
// User can buy multiple plans one by one — each approval adds that plan.
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

  // Determine which plan to add (default to r.planType or "alerts")
  const planToAdd = r.planType || "alerts"
  const VALID_PLANS = ["alerts", "lessons", "signals"]
  if (!VALID_PLANS.includes(planToAdd)) {
    return NextResponse.json({ error: "invalid_plan", message: `Unknown plan: ${planToAdd}` }, { status: 400 })
  }

  // Get current user + their existing proPlans
  const user = await withDbRetry(() => db.user.findUnique({ where: { id: r.userId }, select: { proPlans: true, proStatus: true } }))
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 })

  // Add the plan to proPlans (comma-separated, no duplicates)
  const currentPlans = user.proPlans ? user.proPlans.split(",").filter(Boolean) : []
  if (!currentPlans.includes(planToAdd)) {
    currentPlans.push(planToAdd)
  }
  const newProPlans = currentPlans.join(",")

  // Update: mark request approved + add plan to user + set proStatus active
  await withDbRetry(() => db.$transaction([
    db.proRequest.update({
      where: { id },
      data: { status: "approved", reviewedAt: new Date(), reviewerNote: note ?? null },
    }),
    db.user.update({
      where: { id: r.userId },
      data: {
        proStatus: "active",
        proPlans: newProPlans,
      },
    }),
  ]))

  return NextResponse.json({ ok: true, planAdded: planToAdd, totalPlans: newProPlans })
}
