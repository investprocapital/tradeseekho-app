import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { withDbRetry } from "@/lib/db-retry"
import { pairLabel, formatPrice } from "@/lib/signals"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * GET /api/cron/check-alerts
 *
 * Vercel Cron Job — runs EVERY 1 MINUTE (configured in vercel.json).
 * Checks ALL untriggered price alerts across ALL users.
 *
 * When a target is hit:
 *   1. Marks the alert as triggered (triggered=true, triggeredAt=now)
 *   2. Creates a DB Notification (shows in the bell when user opens app)
 *   3. Sends FCM push notification IF the user has an fcmToken (app closed)
 *
 * PRICE FETCHING (server-side, for alert checking only):
 *   - Crypto (BTC, ETH): Binance REST API (free, no key)
 *   - Forex/Gold/Oil: TwelveData REST API (free tier, server-side key)
 *
 * NOTE: This is SEPARATE from the client-side price fetching.
 * The client fetches prices for LIVE DISPLAY (zero server cost).
 * This cron fetches prices ONLY for alert checking (when app is closed).
 *
 * AUTH: Secured by CRON_SECRET — Vercel Cron sends ?secret=xxx header.
 * Without the secret, the endpoint returns 401.
 */

// Binance ticker → our symbol format
const BINANCE_MAP: Record<string, string> = {
  "BINANCE:BTCUSDT": "BTCUSDT",
  "BINANCE:ETHUSDT": "ETHUSDT",
}

// Yahoo Finance ticker → our symbol format (FREE, no API key needed)
const YAHOO_MAP: Record<string, string> = {
  "OANDA:XAUUSD": "GC=F",
  "FX:EURUSD": "EURUSD=X",
  "TVC:USOIL": "CL=F",
  "FX:GBPUSD": "GBPUSD=X",
}

async function fetchBinancePrice(binanceSymbol: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return parseFloat(data?.price) || null
  } catch {
    return null
  }
}

// Yahoo Finance price fetch — FREE, no API key, no rate limits.
async function fetchYahooPrice(yahooSymbol: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
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
 * Send FCM push notification via Firebase Admin SDK.
 * Set up by adding FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY env vars.
 * If not configured, FCM is skipped (DB notification still created).
 */
async function sendFcmPush(fcmToken: string, title: string, body: string): Promise<void> {
  if (!fcmToken) return
  // Check if Firebase Admin is configured
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  if (!projectId || !clientEmail || !privateKey) {
    return // FCM not configured — skip silently
  }

  try {
    // Lazy-load firebase-admin (avoid bundling if not used)
    const admin = await import("firebase-admin")
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      })
    }
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: { deepLink: "app://price-alert" },
      android: { priority: "high", notification: { icon: "tradeseekho-logo", color: "#0f766e" } },
    })
  } catch (e: any) {
    console.error("[fcm] send failed:", e?.message?.slice(0, 120))
  }
}

export async function GET(req: Request) {
  // Auth: Vercel Cron sends Authorization: Bearer <CRON_SECRET> header automatically.
  // Also accept ?secret= or x-api-key for manual testing.
  const url = new URL(req.url)
  const authHeader = req.headers.get("authorization") || ""
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""
  const secret = url.searchParams.get("secret") || req.headers.get("x-api-key") || bearerToken
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  try {
    // Fetch all untriggered alerts
    const alerts = await withDbRetry(() => db.priceAlert.findMany({
      where: { triggered: false },
      take: 200,
      include: { user: { select: { fcmToken: true } } },
    }))

    if (alerts.length === 0) {
      return NextResponse.json({ ok: true, checked: 0, triggered: 0 })
    }

    // Get unique symbols to fetch prices for
    const symbols = [...new Set(alerts.map((a) => a.symbol))]
    const prices = new Map<string, number>()

    // Fetch prices for all unique symbols in parallel
    await Promise.all(
      symbols.map(async (sym) => {
        let price: number | null = null
        if (BINANCE_MAP[sym]) {
          price = await fetchBinancePrice(BINANCE_MAP[sym])
        } else if (YAHOO_MAP[sym]) {
          price = await fetchYahooPrice(YAHOO_MAP[sym])
        }
        if (price !== null) prices.set(sym, price)
      })
    )

    // Check each alert against the fetched price
    let triggeredCount = 0
    for (const alert of alerts) {
      const livePrice = prices.get(alert.symbol)
      if (livePrice === undefined) continue

      let hit = false
      if (alert.direction === "above" && livePrice >= alert.targetPrice) hit = true
      else if (alert.direction === "below" && livePrice <= alert.targetPrice) hit = true

      if (hit) {
        try {
          // Mark as triggered
          await withDbRetry(() => db.priceAlert.update({
            where: { id: alert.id },
            data: { triggered: true, triggeredAt: new Date() },
          }))

          // Create DB notification (shows in the bell)
          const pair = pairLabel(alert.symbol)
          const dir = alert.direction === "above" ? "reached above" : "dropped below"
          const target = formatPrice(alert.symbol, alert.targetPrice)
          const live = formatPrice(alert.symbol, livePrice)
          const title = `🔔 ${pair} Alert Triggered!`
          const body = `${pair} ${dir} your target ${target} — current: ${live}`

          await withDbRetry(() => db.notification.create({
            data: { type: "signal", title, body, deepLink: "app://price-alert" },
          }))

          // Send FCM push (if user has a token + Firebase configured)
          if (alert.user?.fcmToken) {
            await sendFcmPush(alert.user.fcmToken, title, body)
          }

          triggeredCount++
        } catch (e) {
          // Continue to next alert even if one fails
          console.error("[cron] alert trigger failed:", alert.id, e?.message)
        }
      }
    }

    return NextResponse.json({
      ok: true,
      checked: alerts.length,
      triggered: triggeredCount,
      pricesFetched: prices.size,
    })
  } catch (e: any) {
    console.error("[cron/check-alerts] error:", e?.message)
    return NextResponse.json({ error: "failed", message: e?.message }, { status: 500 })
  }
}
