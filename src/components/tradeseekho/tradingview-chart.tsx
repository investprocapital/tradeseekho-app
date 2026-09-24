"use client"

import { useEffect, useRef } from "react"

/**
 * TradingView Advanced Chart — FREE with Draw Tools
 * Uses tv.js (not embed widget) so left-side toolbar with drawing tools is available:
 * Trendline, Horizontal Line, Fibonacci, Brush, Ruler, etc.
 * 100% free — no paid plan needed.
 */
export function TradingViewChart({ height = 300 }: { height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    // Clear any previous widget
    containerRef.current.innerHTML = ""

    // Create the widget container div
    const widgetDiv = document.createElement("div")
    widgetDiv.id = "tradingview_adv"
    widgetDiv.style.height = "100%"
    widgetDiv.style.width = "100%"

    const outerContainer = document.createElement("div")
    outerContainer.className = "tradingview-widget-container"
    outerContainer.style.height = "100%"
    outerContainer.style.width = "100%"
    outerContainer.appendChild(widgetDiv)

    containerRef.current.appendChild(outerContainer)

    // Load TradingView tv.js script
    const script = document.createElement("script")
    script.src = "https://s.tradingview.com/tv.js"
    script.async = true
    script.type = "text/javascript"

    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const TV = (window as any).TradingView
      if (!TV) return

      // Generate unique ID for this widget instance (in case multiple charts on page)
      const uniqueId = `tv_chart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      widgetDiv.id = uniqueId

      new TV.widget({
        autosize: true,
        symbol: "FX:EURUSD",
        interval: "15",
        timezone: "Asia/Karachi",
        theme: "dark",
        style: "1",
        locale: "en",
        enable_publishing: false,
        allow_symbol_change: true,
        hide_side_toolbar: false, // ← LEFT SIDE DRAW TOOLS VISIBLE
        studies: [],
        container_id: uniqueId,
        support_host: "https://www.tradingview.com",
      })
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (containerRef.current) containerRef.current.innerHTML = ""
      // Remove the script if it's still in head
      const existingScript = document.querySelector('script[src="https://s.tradingview.com/tv.js"]')
      if (existingScript) existingScript.remove()
    }
  }, [])

  return (
    <div className="mt-5 mb-2">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
        <span className="inline-block h-2 w-2 rounded-full bg-[#00D09C] animate-pulse" />
        EUR/USD Live Chart · Draw Tools Available
      </div>
      <div
        ref={containerRef}
        className="overflow-hidden rounded-xl border border-border"
        style={{ height: `${height}px`, width: "100%" }}
      />
    </div>
  )
}
