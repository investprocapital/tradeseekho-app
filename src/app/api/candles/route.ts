import { NextResponse } from "next/server"
import { yahooTicker, pairLabel } from "@/lib/signals"

export const dynamic = "force-dynamic"

// In-memory candle cache (per symbol+interval, 60s TTL). Keeps Yahoo happy.
type Candle = { t: number; o: number; h: number; l: number; c: number }
type Cached = { candles: Candle[]; ts: number }
const cache = new Map<string, Cached>()
const TTL_MS = 60_000

/**
 * GET /api/candles?symbol=OANDA:XAUUSD&interval=15m&range=1d
 *
 * Returns OHLC candlestick data from Yahoo Finance (server-side). Used by the
 * admin signal-manager to render a REAL candlestick chart on the canvas
 * screenshot — instead of the fake "lines only" template. Captures actual
 * market candles so the signal card looks like a real trading chart.
 *
 * Response: { symbol, pair, interval, range, candles: [{t,o,h,l,c}, ...] }
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get("symbol")
  const interval = searchParams.get("interval") || "15m"
  const range = searchParams.get("range") || "1d"
  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 })
  }

  const cacheKey = `${symbol}:${interval}:${range}`
  const hit = cache.get(cacheKey)
  if (hit && Date.now() - hit.ts < TTL_MS) {
    return NextResponse.json({
      symbol, pair: pairLabel(symbol), interval, range,
      candles: hit.candles,
    })
  }

  const ticker = yahooTicker(symbol)
  if (!ticker) {
    return NextResponse.json({ error: "unsupported symbol" }, { status: 400 })
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      ticker,
    )}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(range)}`
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      return NextResponse.json({ error: "yahoo fetch failed" }, { status: 502 })
    }
    const data = await res.json()
    const result = data?.chart?.result?.[0]
    const timestamps: number[] = result?.timestamp ?? []
    const quote = result?.indicators?.quote?.[0]
    if (!timestamps.length || !quote) {
      return NextResponse.json({ error: "no candle data" }, { status: 502 })
    }

    const candles: Candle[] = []
    for (let i = 0; i < timestamps.length; i++) {
      const o = quote.open?.[i]
      const h = quote.high?.[i]
      const l = quote.low?.[i]
      const c = quote.close?.[i]
      if (o == null || h == null || l == null || c == null) continue
      candles.push({ t: timestamps[i], o, h, l, c })
    }

    cache.set(cacheKey, { candles, ts: Date.now() })
    return NextResponse.json({
      symbol, pair: pairLabel(symbol), interval, range, candles,
    })
  } catch {
    return NextResponse.json(
      { error: "candle fetch failed", symbol, pair: pairLabel(symbol) },
      { status: 502 },
    )
  }
}
