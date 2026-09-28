import { NextResponse } from "next/server"
import { yahooTicker, pairLabel } from "@/lib/signals"

export const dynamic = "force-dynamic"

// In-memory price cache (per-symbol, 15s TTL). Keeps the Yahoo API happy and
// makes the admin "Get Live Price" button feel instant on rapid clicks.
type Cached = { price: number; ts: number; source: string }
const cache = new Map<string, Cached>()
const TTL_MS = 15_000

/**
 * GET /api/price?symbol=OANDA:XAUUSD
 * Returns the LIVE mid price for a TradingView symbol.
 *
 * Source: Yahoo Finance chart API (free, no key, server-side only).
 * Fallbacks: Binance for crypto, gold-api.com for XAU.
 *
 * Response: { symbol, pair, price, source, cachedAt, stale }
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get("symbol")
  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 })
  }

  // Cache hit?
  const hit = cache.get(symbol)
  if (hit && Date.now() - hit.ts < TTL_MS) {
    return NextResponse.json({
      symbol,
      pair: pairLabel(symbol),
      price: hit.price,
      source: hit.source,
      cachedAt: new Date(hit.ts).toISOString(),
      stale: false,
    })
  }

  const ticker = yahooTicker(symbol)
  if (!ticker) {
    return NextResponse.json({ error: "unsupported symbol" }, { status: 400 })
  }

  // Try Yahoo Finance first (works for all 5 pairs).
  const price = await fetchYahoo(ticker)
  if (price !== null) {
    cache.set(symbol, { price, ts: Date.now(), source: "Yahoo Finance" })
    return NextResponse.json({
      symbol,
      pair: pairLabel(symbol),
      price,
      source: "Yahoo Finance",
      cachedAt: new Date().toISOString(),
      stale: false,
    })
  }

  // Fallbacks per symbol family.
  const fallback = await fetchFallback(symbol)
  if (fallback !== null) {
    cache.set(symbol, { price: fallback, ts: Date.now(), source: "fallback" })
    return NextResponse.json({
      symbol,
      pair: pairLabel(symbol),
      price: fallback,
      source: "fallback",
      cachedAt: new Date().toISOString(),
      stale: true,
    })
  }

  return NextResponse.json(
    { error: "price unavailable", symbol, pair: pairLabel(symbol) },
    { status: 502 },
  )
}

// Yahoo Finance chart API — returns regularMarketPrice from the meta block.
async function fetchYahoo(ticker: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      ticker,
    )}?interval=1d&range=1d`
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const p = data?.chart?.result?.[0]?.meta?.regularMarketPrice
    return typeof p === "number" && Number.isFinite(p) ? p : null
  } catch {
    return null
  }
}

// Fallback sources (used only if Yahoo is down/blocked).
async function fetchFallback(symbol: string): Promise<number | null> {
  try {
    if (symbol === "BINANCE:BTCUSDT") {
      const r = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT", {
        signal: AbortSignal.timeout(6000),
      })
      if (r.ok) {
        const d = (await r.json()) as { price?: string }
        const p = parseFloat(d.price ?? "")
        if (Number.isFinite(p)) return p
      }
    }
    if (symbol === "OANDA:XAUUSD") {
      const r = await fetch("https://api.gold-api.com/price/XAU", {
        signal: AbortSignal.timeout(6000),
      })
      if (r.ok) {
        const d = (await r.json()) as { price?: number }
        if (typeof d.price === "number") return d.price
      }
    }
  } catch {
    // ignore
  }
  return null
}
