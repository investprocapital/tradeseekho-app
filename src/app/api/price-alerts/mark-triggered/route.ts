import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth"
import { withDbRetry } from "@/lib/db-retry"
import { pairLabel, formatPrice } from "@/lib/signals"

export const dynamic = "force-dynamic"

/**
 * POST /api/price-alerts/mark-triggered
 * Body: { id: string }
 *
 * Called by the CLIENT when it detects a price alert has been hit.
 * Marks the alert as triggered + creates a DB notification (shows in the bell).
 *
 * NOTE: The server-side cron job (/api/cron/check-alerts) does the same thing
 * for when the app is CLOSED + sends FCM push. This endpoint is for instant
 * client-side feedback (no server price fetch — zero cost).
 */
export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId()
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const alert = await withDbRetry(() => db.priceAlert.findFirst({ where: { id, userId } }))
    if (!alert) return NextResponse.json({ error: "not_found" }, { status: 404 })
    if (alert.triggered) return NextResponse.json({ ok: true, alreadyTriggered: true })

    // Mark as triggered
    await withDbRetry(() => db.priceAlert.update({
      where: { id },
      data: { triggered: true, triggeredAt: new Date() },
    }))

    // Create a DB notification (shows in the bell)
    const pair = pairLabel(alert.symbol)
    const dir = alert.direction === "above" ? "reached above" : "dropped below"
    const target = formatPrice(alert.symbol, alert.targetPrice)
    await withDbRetry(() => db.notification.create({
      data: {
        type: "signal",
        title: `🔔 ${pair} Alert Triggered!`,
        body: `${pair} ${dir} your target ${target}.`,
        deepLink: `app://price-alert`,
      },
    }))

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[mark-triggered] error:", e?.message)
    return NextResponse.json({ error: "failed", message: e?.message }, { status: 500 })
  }
}
