"use client"

import { useEffect, useRef } from "react"

/**
 * MarketGauge — TradingView Technical Analysis widget.
 * Shows a semi-circular gauge (Strong Sell → Strong Buy) with indicator
 * breakdown for the given symbol. Automatically adapts to the symbol.
 *
 * Uses TradingView's free embed-widget-technical-analysis.js widget.
 * The widget is injected into a container div via script (same pattern as
 * the advanced-chart widget in signal-manager).
 *
 * Supported symbols (auto-mapped from TradingView symbol format):
 *   OANDA:XAUUSD (Gold), BINANCE:BTCUSDT (BTC), BINANCE:ETHUSDT (ETH),
 *   FX:EURUSD, FX:GBPUSD, TVC:USOIL (Oil), PSX:OGDC etc.
 */
export function MarketGauge({
  symbol,
  height = 400,
  showTitle = true,
}: {
  symbol: string
  height?: number
  showTitle?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)

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
      interval: "1D",
      width: "100%",
      // The widget requires the TradingView symbol (e.g. OANDA:XAUUSD)
      symbol,
      showIntervalTabs: true,
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
  }, [symbol])

  return (
    <div className="space-y-2">
      {showTitle && (
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            📊 Market Gauge — {symbol.split(":")[1] || symbol}
          </span>
        </div>
      )}
      <div
        className="overflow-hidden rounded-xl border border-border"
        style={{ height: `${height}px` }}
      >
        <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  )
}
