import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth"

export const dynamic = "force-dynamic"

// GET /api/pro/me — current user's pro status + latest request (for the modal)
export async function GET() {
  const userId = await getCurrentUserId()
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { proStatus: true, proExpiresAt: true },
  })
  const latest = await db.proRequest.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, method: true, status: true, createdAt: true, reviewerNote: true },
  })
  return NextResponse.json({
    proStatus: user?.proStatus ?? "none",
    proExpiresAt: user?.proExpiresAt ?? null,
    latestRequest: latest,
  })
}
