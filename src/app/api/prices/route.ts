import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Yahoo Finance ticker map
const YAHOO_TICKERS: Record<string, string> = {
  "OANDA:XAUUSD": "GC=F",
  "FX:EURUSD": "EURUSD=X",
  "TVC:USOIL": "CL=F",
  "FX:GBPUSD": "GBPUSD=X",
}

// Binance ticker map
const BINANCE_TICKERS: Record<string, string> = {
  "BINANCE:BTCUSDT": "BTCUSDT",
  "BINANCE:ETHUSDT": "ETHUSDT",
}

/**
 * GET /api/prices?symbols=OANDA:XAUUSD,FX:EURUSD,BINANCE:BTCUSDT
 *
 * Server-side proxy for Yahoo Finance + Binance prices.
 * Solves CORS issue — browser can't fetch Yahoo Finance directly.
 *
 * Returns: { prices: { "OANDA:XAUUSD": { price, change }, ... } }
 *
 * IMPORTANT: This does NOT save anything to Supabase. It's a stateless
 * price-fetching proxy. Price data is NEVER stored in the database.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const symbolsParam = searchParams.get("symbols") || ""
  const symbols = symbolsParam.split(",").filter(Boolean)

  if (symbols.length === 0) {
    return NextResponse.json({ prices: {} })
  }

  const prices: Record<string, { price: number; change: number }> = {}

  await Promise.all(
    symbols.map(async (sym) => {
      // Yahoo Finance (forex/gold/oil)
      if (YAHOO_TICKERS[sym]) {
        try {
          const ticker = YAHOO_TICKERS[sym]
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`
          const res = await fetch(url, {
            cache: "no-store",
            signal: AbortSignal.timeout(8000),
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
          })
          if (res.ok) {
            const data = await res.json()
            const result = data?.chart?.result?.[0]
            const price = result?.meta?.regularMarketPrice
            const prevClose = result?.meta?.chartPreviousClose ?? result?.meta?.previousClose
            if (typeof price === "number" && Number.isFinite(price)) {
              const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0
              prices[sym] = { price, change }
            }
          }
        } catch {}
      }

      // Binance (crypto) — fallback if WebSocket not connected
      if (BINANCE_TICKERS[sym]) {
        try {
          const ticker = BINANCE_TICKERS[sym]
          const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${ticker}`, {
            cache: "no-store",
            signal: AbortSignal.timeout(8000),
          })
          if (res.ok) {
            const data = await res.json()
            const price = parseFloat(data?.lastPrice)
            const change = parseFloat(data?.priceChangePercent)
            if (Number.isFinite(price)) {
              prices[sym] = { price, change: Number.isFinite(change) ? change : 0 }
            }
          }
        } catch {}
      }
    })
  )

  return NextResponse.json({ prices })
}
