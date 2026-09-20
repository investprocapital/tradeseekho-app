"use client"

import { useEffect, useRef } from "react"

/**
 * TradingView free EUR/USD chart widget — embedded via their official embed script.
 * Shows a live, interactive EUR/USD chart (users can draw lines, zoom, pan).
 * Logo is visible (TradingView branding) — that's fine per requirements.
 */
export function TradingViewChart({ height = 300 }: { height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    // Clear any previous widget
    containerRef.current.innerHTML = ""

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.async = true
    script.type = "text/javascript"
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "FX:EURUSD",
      interval: "60",
      timezone: "Asia/Karachi",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      hide_volume: true,
      support_host: "https://www.tradingview.com",
    })

    const widgetContainer = document.createElement("div")
    widgetContainer.className = "tradingview-widget-container"
    widgetContainer.style.height = `${height}px`
    widgetContainer.style.width = "100%"
    widgetContainer.appendChild(script)

    containerRef.current.appendChild(widgetContainer)
  }, [height])

  return (
    <div className="mt-5 mb-2">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
        <span className="inline-block h-2 w-2 rounded-full bg-[#00D09C] animate-pulse" />
        EUR/USD Live Chart
      </div>
      <div
        ref={containerRef}
        className="overflow-hidden rounded-xl border border-border"
        style={{ height: `${height}px`, width: "100%" }}
      />
    </div>
  )
}
