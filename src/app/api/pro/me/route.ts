import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

// GET /api/pro/me — current user's pro status + latest request (for the modal)
// Returns 3 explicit booleans (isProLessons, isProAlerts, isProSignals) which
// are the PRIMARY source of truth for plan-specific access on the frontend.
// Also returns proPlans CSV for backward compat.
export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({
        proStatus: "none",
        proPlans: "",
        isProLessons: false,
        isProAlerts: false,
        isProSignals: false,
        proExpiredAt: null,
        latestRequest: null,
      })
    }
    const user = await withDbRetry(() => db.user.findUnique({
      where: { id: userId },
      select: {
        proStatus: true,
        proPlans: true,
        isProLessons: true,
        isProAlerts: true,
        isProSignals: true,
        proExpiredAt: true,
      },
    }))
    const latest = await withDbRetry(() => db.proRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, method: true, status: true, planType: true, createdAt: true, reviewerNote: true },
    }))
    return NextResponse.json({
      proStatus: user?.proStatus ?? "none",
      proPlans: user?.proPlans ?? "",
      isProLessons: user?.isProLessons ?? false,
      isProAlerts: user?.isProAlerts ?? false,
      isProSignals: user?.isProSignals ?? false,
      proExpiredAt: user?.proExpiredAt ?? null,
      latestRequest: latest,
    })
  } catch (e: any) {
    console.error("[pro/me] DB unreachable:", e?.message)
    return NextResponse.json({
      proStatus: "none",
      proPlans: "",
      isProLessons: false,
      isProAlerts: false,
      isProSignals: false,
      proExpiredAt: null,
      latestRequest: null,
    })
  }
}
