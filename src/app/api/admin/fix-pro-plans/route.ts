import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

/**
 * POST /api/admin/fix-pro-plans
 *
 * One-time migration + fix endpoint. Does TWO things:
 *
 * 1. SYNC all existing users: set their 3 boolean fields (isProLessons,
 *    isProAlerts, isProSignals) based on their current proPlans CSV.
 *    This ensures backward compat — users who were approved before the
 *    boolean fields existed get their booleans set correctly.
 *
 * 2. FIX a specific user (if ?email= or ?userId= is provided):
 *    Sets their booleans to EXACTLY what's specified in the body.
 *    Used to fix users like Ali10 who had all plans activated by mistake.
 *
 * Body for fixing a specific user:
 *   { "email": "user@example.com", "isProLessons": true, "isProAlerts": false, "isProSignals": false }
 *   OR
 *   { "userId": "cmv...", "isProLessons": true, "isProAlerts": false, "isProSignals": false }
 */
export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const { searchParams } = new URL(req.url)
  const targetEmail = searchParams.get("email")
  const targetUserId = searchParams.get("userId")

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  // ─── Mode 1: Fix a specific user ───
  if (targetEmail || targetUserId || body.email || body.userId) {
    const email = targetEmail || body.email
    const userId = targetUserId || body.userId

    let user
    if (email) {
      user = await withDbRetry(() => db.user.findUnique({ where: { email }, select: { id: true, email: true, name: true, proPlans: true, isProLessons: true, isProAlerts: true, isProSignals: true } }))
    } else if (userId) {
      user = await withDbRetry(() => db.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, proPlans: true, isProLessons: true, isProAlerts: true, isProSignals: true } }))
    }

    if (!user) {
      return NextResponse.json({ error: "user_not_found", message: `No user found for ${email || userId}` }, { status: 404 })
    }

    // Set booleans from body (default to false if not specified)
    const isProLessons = body.isProLessons === true
    const isProAlerts = body.isProAlerts === true
    const isProSignals = body.isProSignals === true

    // Rebuild proPlans CSV from booleans
    const plans: string[] = []
    if (isProLessons) plans.push("lessons")
    if (isProAlerts) plans.push("alerts")
    if (isProSignals) plans.push("signals")
    const newProPlans = plans.join(",")
    const newProStatus = plans.length > 0 ? "active" : "none"

    await withDbRetry(() => db.user.update({
      where: { id: user.id },
      data: {
        isProLessons,
        isProAlerts,
        isProSignals,
        proPlans: newProPlans,
        proStatus: newProStatus,
      },
    }))

    return NextResponse.json({
      ok: true,
      mode: "fix_user",
      user: { id: user.id, email: user.email, name: user.name },
      before: { isProLessons: user.isProLessons, isProAlerts: user.isProAlerts, isProSignals: user.isProSignals, proPlans: user.proPlans },
      after: { isProLessons, isProAlerts, isProSignals, proPlans: newProPlans, proStatus: newProStatus },
    })
  }

  // ─── Mode 2: Sync ALL users (migration) ───
  const allUsers = await withDbRetry(() => db.user.findMany({
    where: { proStatus: "active" },
    select: { id: true, email: true, proPlans: true, isProLessons: true, isProAlerts: true, isProSignals: true },
  }))

  let fixed = 0
  for (const u of allUsers) {
    const plans = u.proPlans ? u.proPlans.split(",").filter(Boolean) : []
    const shouldLessons = plans.includes("lessons")
    const shouldAlerts = plans.includes("alerts")
    const shouldSignals = plans.includes("signals")

    // Only update if booleans don't match the CSV
    if (u.isProLessons !== shouldLessons || u.isProAlerts !== shouldAlerts || u.isProSignals !== shouldSignals) {
      await withDbRetry(() => db.user.update({
        where: { id: u.id },
        data: {
          isProLessons: shouldLessons,
          isProAlerts: shouldAlerts,
          isProSignals: shouldSignals,
        },
      }))
      fixed++
    }
  }

  return NextResponse.json({
    ok: true,
    mode: "sync_all",
    totalActiveUsers: allUsers.length,
    fixed,
    message: `Synced ${fixed} of ${allUsers.length} active Pro users. Their boolean fields now match their proPlans CSV.`,
  })
}
