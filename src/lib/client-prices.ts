"use client"

/**
 * Client-side price fetcher — ZERO server cost, NO API keys needed.
 *
 * Sources:
 *   - Crypto (BTC, ETH): Binance public WebSocket (free, real-time, no API key)
 *     wss://stream.binance.com:9443/ws/btcusdt@ticker
 *   - Forex/Gold/Oil (XAUUSD, EURUSD, GBPUSD, WTI): Yahoo Finance REST (FREE, no key)
 *     https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=2d
 *     Polled every 30s — no rate limits, no API key, completely free.
 *
 * IMPORTANT: This runs ENTIRELY in the browser. No server proxy → 0 server cost.
 * The server-side cron job (/api/cron/check-alerts) separately fetches prices
 * for alert checking when the app is closed (FCM push). That's a different path.
 */

import { useEffect, useRef, useState } from "react"

// Symbol → provider mapping
export const PRICE_SYMBOLS = {
  // Binance (crypto) — uses Binance symbol format
  "BINANCE:BTCUSDT": { provider: "binance", binanceSymbol: "btcusdt", label: "BTCUSD", yahooSymbol: null },
  "BINANCE:ETHUSDT": { provider: "binance", binanceSymbol: "ethusdt", label: "ETHUSD", yahooSymbol: null },
  // Yahoo Finance (forex/commodities) — uses Yahoo ticker format
  // GC=F = Gold futures, EURUSD=X = EUR/USD forex, GBPUSD=X = GBP/USD, CL=F = WTI Crude Oil
  "OANDA:XAUUSD": { provider: "yahoo", binanceSymbol: null, label: "GOLD", yahooSymbol: "GC=F" },
  "FX:EURUSD": { provider: "yahoo", binanceSymbol: null, label: "EURUSD", yahooSymbol: "EURUSD=X" },
  "TVC:USOIL": { provider: "yahoo", binanceSymbol: null, label: "WTI OIL", yahooSymbol: "CL=F" },
  "FX:GBPUSD": { provider: "yahoo", binanceSymbol: null, label: "GBPUSD", yahooSymbol: "GBPUSD=X" },
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
let yahooInterval: ReturnType<typeof setInterval> | null = null
let initStarted = false

function notifyListeners() {
  globalListeners.forEach((fn) => fn())
}

/**
 * Fetch price + 24h change from Yahoo Finance.
 * Yahoo Finance is COMPLETELY FREE — no API key, no rate limits.
 * URL: https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range=2d
 *
 * Returns: { price, change } where change is 24h percentage change.
 */
async function fetchYahooPrice(symbol: string): Promise<{ price: number; change: number } | null> {
  try {
    const meta = PRICE_SYMBOLS[symbol as PriceSymbol]
    if (!meta?.yahooSymbol) return null
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(meta.yahooSymbol)}?interval=1d&range=2d`
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    })
    if (!res.ok) return null
    const data = await res.json()
    const result = data?.chart?.result?.[0]
    if (!result) return null
    const price = result?.meta?.regularMarketPrice
    const prevClose = result?.meta?.chartPreviousClose ?? result?.meta?.previousClose
    if (typeof price !== "number" || !Number.isFinite(price)) return null
    const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0
    return { price, change }
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
 * Initialize Yahoo Finance polling for forex/gold/oil symbols.
 * Polls every 30s — Yahoo Finance has no rate limits for this endpoint.
 */
function initYahooPolling() {
  if (yahooInterval) return
  const forexSymbols = Object.keys(PRICE_SYMBOLS).filter(
    (s) => PRICE_SYMBOLS[s as PriceSymbol].provider === "yahoo"
  )

  const poll = async () => {
    const results = await Promise.all(
      forexSymbols.map(async (sym) => {
        const data = await fetchYahooPrice(sym)
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

  // Initial fetch immediately, then every 30s
  poll()
  yahooInterval = setInterval(poll, 30_000)
}

/**
 * Initialize all price streams. Call once on the client.
 * NO API keys needed — Binance WebSocket + Yahoo Finance are both free.
 */
function ensureInitialized() {
  if (initStarted) return
  if (typeof window === "undefined") return // SSR guard
  initStarted = true

  // Binance WebSocket (crypto) — no API key needed
  initBinanceWebSocket()

  // Yahoo Finance polling (forex/gold/oil) — no API key needed, completely free
  initYahooPolling()
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
export async function fetchSinglePrice(symbol: string): Promise<number | null> {
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

  if (meta.provider === "yahoo" && meta.yahooSymbol) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(meta.yahooSymbol)}?interval=1d&range=1d`
      const res = await fetch(url, {
        cache: "no-store",
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

  return null
}
