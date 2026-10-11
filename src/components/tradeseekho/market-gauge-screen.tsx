"use client"

import { useState, useRef, useEffect } from "react"
import { Search, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { pairLabel } from "@/lib/signals"

const SYMBOL_OPTIONS = [
  { value: "OANDA:XAUUSD", label: "GOLD (XAUUSD)" },
  { value: "BINANCE:BTCUSDT", label: "BTC (BTCUSDT)" },
  { value: "BINANCE:ETHUSDT", label: "ETH (ETHUSDT)" },
  { value: "FX:EURUSD", label: "EUR/USD" },
  { value: "FX:GBPUSD", label: "GBP/USD" },
  { value: "TVC:USOIL", label: "WTI Oil (USOIL)" },
]

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1D", "1W"]

const TV_INTERVAL_MAP: Record<string, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "1h": "60",
  "4h": "240",
  "1D": "1D",
  "1W": "1W",
}

/**
 * MarketGaugeScreen — searchable TradingView technical analysis gauge.
 * User can search any pair, select timeframe, and see the sentiment gauge.
 * Used on home page + lesson reader (replaces hardcoded EURUSD).
 *
 * Uses TradingView's FREE embed-widget-technical-analysis.js widget.
 */
export function MarketGaugeScreen({
  defaultSymbol = "FX:EURUSD",
  title = "Market Gauge",
  height = 400,
}: {
  defaultSymbol?: string
  title?: string
  height?: number
}) {
  const [symbol, setSymbol] = useState(defaultSymbol)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [timeframe, setTimeframe] = useState("1D")
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter symbols by search query
  const filteredSymbols = SYMBOL_OPTIONS.filter(
    (s) =>
      s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.value.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Mount/reload TradingView widget when symbol or timeframe changes
  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    container.innerHTML = ""

    const widgetContainer = document.createElement("div")
    widgetContainer.className = "tradingview-widget-container"
    widgetContainer.style.height = "100%"
    widgetContainer.style.width = "100%"

    const script = document.createElement("script")
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
    script.async = true
    script.type = "text/javascript"
    script.innerHTML = JSON.stringify({
      interval: TV_INTERVAL_MAP[timeframe] || "1D",
      width: "100%",
      symbol,
      showIntervalTabs: false,
      displayMode: "single",
      locale: "en",
      isTransparent: true,
      height: "100%",
      colorTheme: "dark",
    })

    widgetContainer.appendChild(script)
    container.appendChild(widgetContainer)

    return () => {
      container.innerHTML = ""
    }
  }, [symbol, timeframe])

  const onSelectSymbol = (val: string) => {
    setSymbol(val)
    setShowDropdown(false)
    setSearchQuery("")
  }

  return (
    <div className="space-y-3">
      {/* Title + current symbol */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
          📊 {title}
        </h3>
        <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-bold text-brand">
          {pairLabel(symbol)}
        </span>
      </div>

      {/* Search bar with dropdown */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search: BTCUSDT, EURUSD, GOLD..."
            className="h-10 ps-10 pe-9"
          />
          <ChevronDown
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          />
        </div>
        {/* Dropdown results */}
        {showDropdown && (
          <div className="absolute z-[70] mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
            {filteredSymbols.length === 0 ? (
              <p className="p-3 text-center text-xs text-muted-foreground">
                No pairs found. Try: GOLD, BTC, EURUSD, OIL
              </p>
            ) : (
              filteredSymbols.map((s) => (
                <button
                  key={s.value}
                  onClick={() => onSelectSymbol(s.value)}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-sm transition hover:bg-muted/60 ${
                    symbol === s.value ? "bg-brand-muted/40 font-bold text-brand" : ""
                  }`}
                >
                  <span>{s.label}</span>
                  {symbol === s.value && <span className="text-[10px] text-brand">✓ selected</span>}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Timeframe buttons */}
      <div className="flex flex-wrap gap-1.5">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              timeframe === tf
                ? "bg-brand text-brand-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* TradingView gauge widget */}
      <div
        className="overflow-hidden rounded-xl border border-border"
        style={{ height: `${height}px` }}
      >
        <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  )
}
