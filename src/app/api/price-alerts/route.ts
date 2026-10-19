import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId, isUserPro } from "@/lib/auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

// GET /api/price-alerts — list the user's price alerts
export async function GET() {
  const userId = await getCurrentUserId()

  const alerts = await withDbRetry(() => db.priceAlert.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  }))

  return NextResponse.json({
    alerts: alerts.map((a) => ({
      id: a.id,
      symbol: a.symbol,
      targetPrice: a.targetPrice,
      direction: a.direction,
      triggered: a.triggered,
      createdAt: a.createdAt.toISOString(),
      triggeredAt: a.triggeredAt?.toISOString() ?? null,
    })),
  })
}

// POST /api/price-alerts — create a new price alert
// Body: { symbol: string, targetPrice: number, direction?: "above" | "below" }
//
// FREE USER LIMIT: Only 1 active (untriggered) alert allowed.
// If user tries to set a 2nd alert → returns 403 "free_limit" → client shows Pro popup.
// Pro users (alerts or all plan) get unlimited alerts.
export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId()

    const body = await req.json()
    const { symbol, targetPrice, direction } = body
    if (!symbol || typeof targetPrice !== "number" || !Number.isFinite(targetPrice)) {
      return NextResponse.json({ error: "symbol and targetPrice required" }, { status: 400 })
    }

    // Check if user is Pro (alerts plan or all plan)
    const isPro = await isUserPro()

    if (!isPro) {
      // FREE USER: count active (untriggered) alerts — limit to 1
      const activeCount = await withDbRetry(() => db.priceAlert.count({
        where: { userId, triggered: false },
      }))
      if (activeCount >= 1) {
        return NextResponse.json({
          error: "free_limit",
          message: "Free users can only set 1 active alert. Upgrade to Pro for unlimited alerts.",
        }, { status: 403 })
      }
    }

    const alert = await withDbRetry(() => db.priceAlert.create({
      data: {
        userId,
        symbol,
        targetPrice,
        direction: direction === "below" ? "below" : "above",
      },
    }))

    return NextResponse.json({
      ok: true,
      alert: {
        id: alert.id,
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        direction: alert.direction,
        triggered: alert.triggered,
      },
    })
  } catch (e: any) {
    console.error("[price-alerts POST] error:", e?.message)
    return NextResponse.json({ error: "failed", message: e?.message }, { status: 500 })
  }
}

// DELETE /api/price-alerts?id=X — delete a price alert
export async function DELETE(req: Request) {
  const userId = await getCurrentUserId()

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  // Ensure the alert belongs to the user
  const existing = await db.priceAlert.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  await db.priceAlert.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
