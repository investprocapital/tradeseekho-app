import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// GET /api/watchlist — returns STATIC metadata for watchlist symbols.
// Prices are fetched CLIENT-SIDE (Binance WebSocket + TwelveData polling)
// via src/lib/client-prices.ts. This endpoint is now zero-cost (no Yahoo
// Finance fetch, no server-side price lookup).
const WATCHLIST = [
  { symbol: "OANDA:XAUUSD", label: "GOLD", pair: "XAUUSD", category: "Metal" },
  { symbol: "FX:EURUSD", label: "EURUSD", pair: "EURUSD", category: "Forex" },
  { symbol: "FX:GBPUSD", label: "GBPUSD", pair: "GBPUSD", category: "Forex" },
  { symbol: "BINANCE:BTCUSDT", label: "BTCUSD", pair: "BTCUSD", category: "Crypto" },
  { symbol: "BINANCE:ETHUSDT", label: "ETHUSD", pair: "ETHUSD", category: "Crypto" },
  { symbol: "TVC:USOIL", label: "WTI OIL", pair: "USOIL", category: "Commodity" },
]

export async function GET() {
  return NextResponse.json({
    pairs: WATCHLIST,
    note: "Prices are fetched client-side. Use useLivePrices() hook.",
  })
}
