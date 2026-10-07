import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

// GET /api/price-alerts — list the signed-in user's price alerts
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ alerts: [] })
  }
  const userId = (session.user as { id?: string }).id
  if (!userId) {
    return NextResponse.json({ alerts: [] })
  }

  const alerts = await db.priceAlert.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

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
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Please sign in to set alerts" }, { status: 401 })
  }
  const userId = (session.user as { id?: string }).id
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 })
  }

  const body = await req.json()
  const { symbol, targetPrice, direction } = body
  if (!symbol || typeof targetPrice !== "number" || !Number.isFinite(targetPrice)) {
    return NextResponse.json({ error: "symbol and targetPrice required" }, { status: 400 })
  }

  // Limit: max 20 alerts per user
  const count = await db.priceAlert.count({ where: { userId } })
  if (count >= 20) {
    return NextResponse.json({ error: "Maximum 20 alerts allowed. Delete some first." }, { status: 400 })
  }

  const alert = await db.priceAlert.create({
    data: {
      userId,
      symbol,
      targetPrice,
      direction: direction === "below" ? "below" : "above",
    },
  })

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
}

// DELETE /api/price-alerts?id=X — delete a price alert
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session.user as { id?: string }).id
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

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
