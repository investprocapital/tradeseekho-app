"use client"

/**
 * Client-side price fetcher — ZERO server DB cost.
 *
 * Sources:
 *   - Crypto (BTC, ETH): Binance public WebSocket (free, real-time, no API key)
 *     wss://stream.binance.com:9443/ws/btcusdt@ticker
 *   - Forex/Gold/Oil (XAUUSD, EURUSD, GBPUSD, WTI): Server proxy → Yahoo Finance
 *     GET /api/prices?symbols=OANDA:XAUUSD,FX:EURUSD,...
 *     Server fetches from Yahoo Finance (solves CORS), returns to client.
 *     Polled every 30s — no rate limits, no API key.
 *
 * IMPORTANT: Price data is NEVER stored in Supabase. The /api/prices endpoint
 * is a stateless proxy — it fetches live prices on each request and returns them.
 * Zero database impact.
 */

import { useEffect, useRef, useState } from "react"

// Symbol → provider mapping
export const PRICE_SYMBOLS = {
  "BINANCE:BTCUSDT": { provider: "binance", label: "BTCUSD" },
  "BINANCE:ETHUSDT": { provider: "binance", label: "ETHUSD" },
  "OANDA:XAUUSD": { provider: "yahoo", label: "GOLD" },
  "FX:EURUSD": { provider: "yahoo", label: "EURUSD" },
  "TVC:USOIL": { provider: "yahoo", label: "WTI OIL" },
  "FX:GBPUSD": { provider: "yahoo", label: "GBPUSD" },
} as const

export type PriceSymbol = keyof typeof PRICE_SYMBOLS

export interface PriceData {
  price: number
  change: number
  sell: number
  buy: number
  spread: number
  status: "live" | "offline"
  updatedAt: number
}

type PriceMap = Record<string, PriceData>

// In-memory price store
let globalPrices: PriceMap = {}
let globalListeners: Set<() => void> = new Set()
let binanceWs: WebSocket | null = null
let yahooInterval: ReturnType<typeof setInterval> | null = null
let initStarted = false

function notifyListeners() {
  globalListeners.forEach((fn) => fn())
}

/**
 * Fetch forex/gold/oil prices via server proxy (solves CORS).
 * The server endpoint fetches from Yahoo Finance + Binance REST.
 */
async function fetchYahooPrices() {
  try {
    const yahooSymbols = Object.keys(PRICE_SYMBOLS).filter(
      (s) => PRICE_SYMBOLS[s as PriceSymbol].provider === "yahoo"
    )
    const res = await fetch(`/api/prices?symbols=${encodeURIComponent(yahooSymbols.join(","))}`, { cache: "no-store" })
    if (!res.ok) return
    const data = await res.json()
    const prices = data?.prices ?? {}
    for (const [sym, info] of Object.entries(prices)) {
      const p = info as { price: number; change: number }
      if (p.price && Number.isFinite(p.price)) {
        globalPrices[sym] = {
          price: p.price,
          change: p.change || 0,
          sell: p.price,
          buy: p.price,
          spread: 0,
          status: "live",
          updatedAt: Date.now(),
        }
      }
    }
    notifyListeners()
  } catch {
    // Network error — will retry on next poll
  }
}

/**
 * Initialize Binance WebSocket for BTC + ETH.
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
        const rawSymbol = ticker.s
        const ourSymbol = rawSymbol === "BTCUSDT" ? "BINANCE:BTCUSDT" : rawSymbol === "ETHUSDT" ? "BINANCE:ETHUSDT" : null
        if (!ourSymbol) return

        const price = parseFloat(ticker.c)
        const change = parseFloat(ticker.P)
        const bid = parseFloat(ticker.b)
        const ask = parseFloat(ticker.a)
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
      } catch {}
    }

    ws.onclose = () => {
      binanceWs = null
      setTimeout(() => { if (initStarted && !binanceWs) initBinanceWebSocket() }, 5000)
    }

    ws.onerror = () => {}
  } catch {}
}

/**
 * Initialize Yahoo Finance polling via server proxy.
 * Polls every 60 seconds (was 30s — reduced to save Vercel bandwidth).
 * Each API call = bandwidth. 60s is a good balance between freshness + cost.
 */
function initYahooPolling() {
  if (yahooInterval) return
  fetchYahooPrices()
  yahooInterval = setInterval(fetchYahooPrices, 60_000) // 60s (was 30s)
}

function ensureInitialized() {
  if (initStarted) return
  if (typeof window === "undefined") return
  initStarted = true
  initBinanceWebSocket()
  initYahooPolling()
}

export function useLivePrices(): PriceMap {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    ensureInitialized()
    const listener = () => forceUpdate((n) => n + 1)
    globalListeners.add(listener)
    if (Object.keys(globalPrices).length > 0) {
      Promise.resolve().then(() => forceUpdate((n) => n + 1))
    }
    return () => { globalListeners.delete(listener) }
  }, [])

  return globalPrices
}

export function getPrice(symbol: string): number | null {
  const p = globalPrices[symbol]
  return p ? p.price : null
}

export async function fetchSinglePrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/prices?symbols=${encodeURIComponent(symbol)}`, { cache: "no-store" })
    if (!res.ok) return null
    const data = await res.json()
    const p = data?.prices?.[symbol]
    return p?.price && Number.isFinite(p.price) ? p.price : null
  } catch {
    return null
  }
}
