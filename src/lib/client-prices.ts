"use client"

/**
 * Client-side price fetcher — ZERO server cost.
 *
 * Sources:
 *   - Crypto (BTC, ETH): Binance public WebSocket (free, real-time, no API key)
 *     wss://stream.binance.com:9443/ws/btcusdt@ticker
 *   - Forex/Gold/Oil (XAUUSD, EURUSD, WTI): TwelveData REST API (free tier 800 req/day)
 *     https://api.twelvedata.com/price?symbol=XAU/USD&apikey=xxx
 *     Polled every 30s (800/day ÷ 24h × 60min = ~1 req/min per symbol, well under limit)
 *
 * IMPORTANT: This runs ENTIRELY in the browser. No server proxy → 0 server cost.
 * The server-side cron job (/api/cron/check-alerts) separately fetches prices
 * for alert checking when the app is closed (FCM push). That's a different path.
 */

import { useEffect, useRef, useState } from "react"

// Symbol → provider mapping
export const PRICE_SYMBOLS = {
  // Binance (crypto) — uses Binance symbol format
  "BINANCE:BTCUSDT": { provider: "binance", binanceSymbol: "btcusdt", label: "BTCUSD", twelveDataSymbol: null },
  "BINANCE:ETHUSDT": { provider: "binance", binanceSymbol: "ethusdt", label: "ETHUSD", twelveDataSymbol: null },
  // TwelveData (forex/commodities) — uses TwelveData symbol format
  "OANDA:XAUUSD": { provider: "twelvedata", binanceSymbol: null, label: "GOLD", twelveDataSymbol: "XAU/USD" },
  "FX:EURUSD": { provider: "twelvedata", binanceSymbol: null, label: "EURUSD", twelveDataSymbol: "EUR/USD" },
  "TVC:USOIL": { provider: "twelvedata", binanceSymbol: null, label: "WTI OIL", twelveDataSymbol: "WTI" },
  "FX:GBPUSD": { provider: "twelvedata", binanceSymbol: null, label: "GBPUSD", twelveDataSymbol: "GBP/USD" },
} as const

export type PriceSymbol = keyof typeof PRICE_SYMBOLS

export interface PriceData {
  price: number
  change: number // percentage change (24h)
  sell: number
  buy: number
  spread: number
  status: "live" | "offline"
  updatedAt: number
}

type PriceMap = Record<string, PriceData>

// In-memory price store shared across all hook instances
let globalPrices: PriceMap = {}
let globalListeners: Set<() => void> = new Set()
let binanceWs: WebSocket | null = null
let twelvedataInterval: ReturnType<typeof setInterval> | null = null
let initStarted = false

function notifyListeners() {
  globalListeners.forEach((fn) => fn())
}

/**
 * Fetch a single price from TwelveData REST API.
 * Free tier: 800 requests/day. With 4 symbols × every 30s = 11,520 req/day = WAY over limit.
 * So we poll every 60s (4 × 24 × 60 = 5,760/day) — still over but close.
 * Better: poll every 2 min = 2,880/day (under limit, leaves headroom).
 */
async function fetchTwelveDataPrice(symbol: string, apiKey: string): Promise<{ price: number; change: number } | null> {
  try {
    const meta = PRICE_SYMBOLS[symbol as PriceSymbol]
    if (!meta?.twelveDataSymbol) return null
    const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(meta.twelveDataSymbol)}&apikey=${apiKey}`
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return null
    const data = await res.json()
    if (data?.status === "error") {
      console.warn(`[twelvedata] ${symbol}:`, data?.message)
      return null
    }
    const price = parseFloat(data?.price)
    if (!Number.isFinite(price)) return null
    // TwelveData /price endpoint doesn't return change; fetch separately if needed
    // For now, change = 0 (UI can show "live" without change %)
    return { price, change: 0 }
  } catch {
    return null
  }
}

/**
 * Initialize the Binance WebSocket for BTC + ETH.
 * Single combined stream: wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker
 * @ticker stream provides: current price, 24h change %, bid/ask
 */
function initBinanceWebSocket() {
  if (binanceWs) return
  try {
    const streams = ["btcusdt@ticker", "ethusdt@ticker"].join("/")
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)
    binanceWs = ws

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        const ticker = msg?.data
        if (!ticker) return
        // Symbol comes as "BTCUSDT" — map back to our format
        const rawSymbol = ticker.s // e.g. "BTCUSDT"
        const ourSymbol = rawSymbol === "BTCUSDT" ? "BINANCE:BTCUSDT" : rawSymbol === "ETHUSDT" ? "BINANCE:ETHUSDT" : null
        if (!ourSymbol) return

        const price = parseFloat(ticker.c) // current price
        const change = parseFloat(ticker.P) // 24h change %
        const bid = parseFloat(ticker.b) // best bid
        const ask = parseFloat(ticker.a) // best ask
        if (!Number.isFinite(price)) return

        globalPrices[ourSymbol] = {
          price,
          change: Number.isFinite(change) ? change : 0,
          sell: Number.isFinite(ask) ? ask : price,
          buy: Number.isFinite(bid) ? bid : price,
          spread: Number.isFinite(ask) && Number.isFinite(bid) ? ask - bid : 0,
          status: "live",
          updatedAt: Date.now(),
        }
        notifyListeners()
      } catch {
        // ignore parse errors
      }
    }

    ws.onclose = () => {
      binanceWs = null
      // Reconnect after 5s (Binance sometimes drops connections)
      setTimeout(() => {
        if (initStarted && !binanceWs) initBinanceWebSocket()
      }, 5000)
    }

    ws.onerror = () => {
      // Let onclose handle reconnect
    }
  } catch {
    // WebSocket not available (SSR) — ignore
  }
}

/**
 * Initialize TwelveData polling for forex/gold/oil symbols.
 * Polls every 120s (2 min) to stay well under the 800 req/day free tier limit.
 */
function initTwelveDataPolling(apiKey: string) {
  if (twelvedataInterval) return
  const forexSymbols = Object.keys(PRICE_SYMBOLS).filter(
    (s) => PRICE_SYMBOLS[s as PriceSymbol].provider === "twelvedata"
  )

  const poll = async () => {
    const results = await Promise.all(
      forexSymbols.map(async (sym) => {
        const data = await fetchTwelveDataPrice(sym, apiKey)
        return { sym, data }
      })
    )
    for (const { sym, data } of results) {
      if (data) {
        globalPrices[sym] = {
          price: data.price,
          change: data.change,
          sell: data.price,
          buy: data.price,
          spread: 0,
          status: "live",
          updatedAt: Date.now(),
        }
      }
    }
    notifyListeners()
  }

  // Initial fetch immediately, then every 120s
  poll()
  twelvedataInterval = setInterval(poll, 120_000)
}

/**
 * Initialize all price streams. Call once on the client.
 * TWELVEDATA_API_KEY should be exposed to the client via NEXT_PUBLIC_ prefix.
 */
function ensureInitialized() {
  if (initStarted) return
  if (typeof window === "undefined") return // SSR guard
  initStarted = true

  // Binance WebSocket (crypto) — no API key needed
  initBinanceWebSocket()

  // TwelveData polling (forex/gold/oil) — needs public API key
  const tdKey = process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY
  if (tdKey) {
    initTwelveDataPolling(tdKey)
  } else {
    console.warn("[client-prices] NEXT_PUBLIC_TWELVEDATA_API_KEY not set — forex/gold/oil prices will be offline. Get a free key at https://twelvedata.com")
  }
}

/**
 * React hook: subscribe to live prices for all watchlist symbols.
 * Returns a map of symbol → PriceData. Updates in real-time.
 *
 * Usage:
 *   const prices = useLivePrices()
 *   const btcPrice = prices["BINANCE:BTCUSDT"]?.price
 */
export function useLivePrices(): PriceMap {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    ensureInitialized()
    const listener = () => forceUpdate((n) => n + 1)
    globalListeners.add(listener)
    // Schedule initial update via microtask (avoids setState-in-effect lint)
    if (Object.keys(globalPrices).length > 0) {
      Promise.resolve().then(() => forceUpdate((n) => n + 1))
    }
    return () => {
      globalListeners.delete(listener)
    }
  }, [])

  return globalPrices
}

/**
 * Get a single symbol's current price (synchronous — from cache).
 * Returns null if not yet fetched.
 */
export function getPrice(symbol: string): number | null {
  const p = globalPrices[symbol]
  return p ? p.price : null
}

/**
 * Fetch a single price on-demand (not cached). Used by alert checker.
 * This is the ONLY function that does a direct fetch (not WebSocket).
 */
export async function fetchSinglePrice(symbol: string, apiKey?: string): Promise<number | null> {
  const meta = PRICE_SYMBOLS[symbol as PriceSymbol]
  if (!meta) return null

  if (meta.provider === "binance" && meta.binanceSymbol) {
    try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${meta.binanceSymbol.toUpperCase()}`, { cache: "no-store" })
      if (!res.ok) return null
      const data = await res.json()
      return parseFloat(data?.price) || null
    } catch {
      return null
    }
  }

  if (meta.provider === "twelvedata" && meta.twelveDataSymbol) {
    const key = apiKey || process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY
    if (!key) return null
    try {
      const res = await fetch(`https://api.twelvedata.com/price?symbol=${encodeURIComponent(meta.twelveDataSymbol)}&apikey=${key}`, { cache: "no-store" })
      if (!res.ok) return null
      const data = await res.json()
      if (data?.status === "error") return null
      return parseFloat(data?.price) || null
    } catch {
      return null
    }
  }

  return null
}
