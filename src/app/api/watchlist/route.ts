import { NextResponse } from "next/server"
import { yahooTicker, pairLabel } from "@/lib/signals"

export const dynamic = "force-dynamic"

// Cache prices for 15s to avoid hammering Yahoo Finance
const cache = new Map<string, { data: any; ts: number }>()
const TTL = 15_000

// Watchlist symbols — 6 pairs covering Forex, Crypto, Commodities
const WATCHLIST = [
  { symbol: "OANDA:XAUUSD", label: "GOLD", pair: "XAUUSD", category: "Metal" },
  { symbol: "FX:EURUSD", label: "EURUSD", pair: "EURUSD", category: "Forex" },
  { symbol: "FX:GBPUSD", label: "GBPUSD", pair: "GBPUSD", category: "Forex" },
  { symbol: "BINANCE:BTCUSDT", label: "BTCUSD", pair: "BTCUSD", category: "Crypto" },
  { symbol: "BINANCE:ETHUSDT", label: "ETHUSD", pair: "ETHUSD", category: "Crypto" },
  { symbol: "TVC:USOIL", label: "WTI OIL", pair: "USOIL", category: "Commodity" },
]

// Yahoo Finance tickers for each watchlist symbol
const YAHOO_MAP: Record<string, string> = {
  "OANDA:XAUUSD": "GC=F",
  "FX:EURUSD": "EURUSD=X",
  "FX:GBPUSD": "GBPUSD=X",
  "BINANCE:BTCUSDT": "BTC-USD",
  "BINANCE:ETHUSDT": "ETH-USD",
  "TVC:USOIL": "CL=F",
}

async function fetchYahooPrice(ticker: string): Promise<{ price: number; change: number } | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const result = data?.chart?.result?.[0]
    const price = result?.meta?.regularMarketPrice
    const prevClose = result?.meta?.chartPreviousClose ?? result?.meta?.previousClose
    if (typeof price !== "number") return null
    const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0
    return { price, change }
  } catch {
    return null
  }
}

// GET /api/watchlist — returns live prices for all 6 watchlist pairs
export async function GET() {
  const hit = cache.get("watchlist")
  if (hit && Date.now() - hit.ts < TTL) {
    return NextResponse.json(hit.data)
  }

  const results = await Promise.all(
    WATCHLIST.map(async (w) => {
      const ticker = YAHOO_MAP[w.symbol]
      const data = await fetchYahooPrice(ticker)
      return {
        symbol: w.symbol,
        label: w.label,
        pair: w.pair,
        category: w.category,
        price: data?.price ?? 0,
        change: data?.change ?? 0,
        // Simulated bid/ask spread (Yahoo doesn't provide bid/ask on free API)
        sell: data ? data.price - 0.01 : 0,
        buy: data ? data.price + 0.01 : 0,
        spread: 0.02,
        status: data ? "live" : "offline",
      }
    }),
  )

  const response = { pairs: results, cachedAt: new Date().toISOString() }
  cache.set("watchlist", { data: response, ts: Date.now() })
  return NextResponse.json(response)
}
