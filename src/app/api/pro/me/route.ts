import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

// GET /api/pro/me — current user's pro status + latest request (for the modal)
export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ proStatus: "none", proExpiresAt: null, latestRequest: null })
    }
    const user = await withDbRetry(() => db.user.findUnique({
      where: { id: userId },
      select: { proStatus: true, proPlans: true, proExpiresAt: true },
    }))
    const latest = await withDbRetry(() => db.proRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, method: true, status: true, planType: true, createdAt: true, reviewerNote: true },
    }))
    return NextResponse.json({
      proStatus: user?.proStatus ?? "none",
      proPlans: user?.proPlans ?? "",
      proExpiredAt: user?.proExpiresAt ?? null,
      latestRequest: latest,
    })
  } catch (e: any) {
    console.error("[pro/me] DB unreachable:", e?.message)
    return NextResponse.json({ proStatus: "none", proExpiresAt: null, latestRequest: null })
  }
}
