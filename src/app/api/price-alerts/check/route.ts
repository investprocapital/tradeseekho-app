import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth"
import { pairLabel, formatPrice } from "@/lib/signals"

export const dynamic = "force-dynamic"

// Yahoo Finance tickers for price checking
const YAHOO_MAP: Record<string, string> = {
  "OANDA:XAUUSD": "GC=F",
  "FX:EURUSD": "EURUSD=X",
  "FX:GBPUSD": "GBPUSD=X",
  "BINANCE:BTCUSDT": "BTC-USD",
  "BINANCE:ETHUSDT": "ETH-USD",
  "TVC:USOIL": "CL=F",
}

async function fetchPrice(symbol: string): Promise<number | null> {
  const ticker = YAHOO_MAP[symbol]
  if (!ticker) return null
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice
    return typeof price === "number" ? price : null
  } catch {
    return null
  }
}

/**
 * GET /api/price-alerts/check
 *
 * Checks all of the user's ACTIVE (non-triggered) alerts against live market
 * prices. If a target is hit:
 *   1. Marks the alert as triggered (triggered=true, triggeredAt=now)
 *   2. Creates a Notification row so it shows in the notification bell
 *   3. Returns the list of newly-triggered alerts (so the client can show toast)
 *
 * This endpoint is polled by the client every 15-30 seconds while the app is open.
 * For push notifications when the app is CLOSED, FCM setup is needed (Phase 2).
 */
export async function GET() {
  const userId = await getCurrentUserId()

  // Get all active (non-triggered) alerts
  const activeAlerts = await db.priceAlert.findMany({
    where: { userId, triggered: false },
    take: 50,
  })

  if (activeAlerts.length === 0) {
    return NextResponse.json({ triggered: [], checked: 0 })
  }

  // Get unique symbols to check
  const symbols = [...new Set(activeAlerts.map((a) => a.symbol))]

  // Fetch live prices for all unique symbols
  const prices = new Map<string, number>()
  await Promise.all(
    symbols.map(async (sym) => {
      const price = await fetchPrice(sym)
      if (price !== null) prices.set(sym, price)
    }),
  )

  // Check each alert against the live price
  const triggeredAlerts: { id: string; symbol: string; targetPrice: number; direction: string; livePrice: number }[] = []

  for (const alert of activeAlerts) {
    const livePrice = prices.get(alert.symbol)
    if (livePrice === undefined) continue

    let hit = false
    if (alert.direction === "above" && livePrice >= alert.targetPrice) {
      hit = true
    } else if (alert.direction === "below" && livePrice <= alert.targetPrice) {
      hit = true
    }

    if (hit) {
      // Mark as triggered
      await db.priceAlert.update({
        where: { id: alert.id },
        data: { triggered: true, triggeredAt: new Date() },
      })

      // Create a notification (shows in the bell)
      const pair = pairLabel(alert.symbol)
      const dir = alert.direction === "above" ? "reached above" : "dropped below"
      await db.notification.create({
        data: {
          type: "signal",
          title: `🔔 ${pair} Alert Triggered!`,
          body: `${pair} ${dir} your target ${formatPrice(alert.symbol, alert.targetPrice)} — current price: ${formatPrice(alert.symbol, livePrice)}`,
          deepLink: `app://price-alert`,
        },
      })

      triggeredAlerts.push({
        id: alert.id,
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        direction: alert.direction,
        livePrice,
      })
    }
  }

  return NextResponse.json({
    triggered: triggeredAlerts,
    checked: activeAlerts.length,
    prices: Object.fromEntries(prices),
  })
}
