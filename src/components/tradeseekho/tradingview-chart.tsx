"use client"

import { useEffect, useRef, useState } from "react"

/**
 * TradingView Advanced Chart — FREE with Draw Tools + Auto indicators per lesson
 * Uses tv.js so left-side toolbar with drawing tools is available.
 * Auto-loads indicators based on lesson ID (e.g. beginner_6 → Support/Resistance).
 *
 * Performance: Loads lazily (only when visible), uses IntersectionObserver,
 * and shows a lightweight placeholder until the chart is ready.
 */

// Lesson-specific chart configs: auto indicators per lesson
const lessonChartConfig: Record<string, { symbol: string; studies: string[]; interval: string }> = {
  // --- BEGINNER (1-12) : Simple Candlestick ---
  "beginner_1": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_2": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_3": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_4": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_5": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_6": { symbol: "FX:EURUSD", studies: ["STD;Support%1Resistance"], interval: "15" },
  "beginner_7": { symbol: "FX:EURUSD", studies: ["STD;Pivot_Points_Standard"], interval: "15" },
  "beginner_8": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_9": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_10": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_11": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_12": { symbol: "FX:EURUSD", studies: [], interval: "15" },

  // --- INTERMEDIATE (1-10) : Indicators Auto ---
  "intermediate_1": { symbol: "FX:EURUSD", studies: ["STD;MA_Simple", "STD;MA_Exponential"], interval: "15" },
  "intermediate_2": { symbol: "FX:EURUSD", studies: ["STD;RSI"], interval: "15" },
  "intermediate_3": { symbol: "FX:EURUSD", studies: ["STD;MACD"], interval: "15" },
  "intermediate_4": { symbol: "FX:EURUSD", studies: ["STD;Bollinger_Bands"], interval: "15" },
  "intermediate_5": { symbol: "FX:EURUSD", studies: ["STD;Pivot_Points_Standard"], interval: "15" },
  "intermediate_6": { symbol: "FX:EURUSD", studies: ["STD;Pivot_Points_Standard"], interval: "15" },
  "intermediate_7": { symbol: "FX:EURUSD", studies: ["STD;Auto_Fib_Retracement"], interval: "15" },
  "intermediate_8": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "intermediate_9": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "intermediate_10": { symbol: "FX:EURUSD", studies: [], interval: "15" },

  // --- ADVANCED (1-21) : SMC Auto ---
  "advanced_1": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "advanced_2": { symbol: "FX:EURUSD", studies: ["STD;Support%1Resistance"], interval: "15" },
  "advanced_3": { symbol: "FX:EURUSD", studies: ["STD;Bollinger_Bands"], interval: "15" },
  "advanced_4": { symbol: "FX:EURUSD", studies: ["STD;Support%1Resistance"], interval: "15" },
  "advanced_5": { symbol: "FX:EURUSD", studies: ["STD;Support%1Resistance"], interval: "15" },
  "advanced_6": { symbol: "FX:EURUSD", studies: ["STD;Pivot_Points_Standard"], interval: "15" },
  "advanced_7": { symbol: "FX:EURUSD", studies: [], interval: "5" },
  "advanced_8": { symbol: "FX:EURUSD", studies: [], interval: "5" },
  "advanced_9": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "advanced_10": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "advanced_11": { symbol: "FX:EURUSD", studies: ["STD;RSI"], interval: "15" },
  "advanced_12": { symbol: "FX:EURUSD", studies: ["STD;MA_Simple", "STD;MA_Exponential"], interval: "60" },
  "advanced_13": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "advanced_14": { symbol: "FX:EURUSD", studies: ["STD;Support%1Resistance"], interval: "15" },
  "advanced_15": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "advanced_16": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "advanced_17": { symbol: "FX:EURUSD", studies: ["STD;Support%1Resistance"], interval: "15" },
  "advanced_18": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "advanced_19": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "advanced_20": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "advanced_21": { symbol: "FX:EURUSD", studies: [], interval: "15" },
}

export function TradingViewChart({ height = 300, lessonId }: { height?: number; lessonId?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const visibilityRef = useRef<HTMLDivElement>(null)

  // Lazy load: only init chart when the container is visible (IntersectionObserver)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (visibilityRef.current) observer.observe(visibilityRef.current)
    return () => observer.disconnect()
  }, [])

  // Load chart only when visible
  useEffect(() => {
    if (!isVisible || !containerRef.current) return
    containerRef.current.innerHTML = ""

    // Determine lesson config
    let level = ""
    let lessonNum = ""
    if (lessonId) {
      const num = parseInt(lessonId.replace("eurusd-", ""))
      if (num >= 1 && num <= 12) { level = "beginner"; lessonNum = String(num) }
      else if (num >= 13 && num <= 22) { level = "intermediate"; lessonNum = String(num - 12) }
      else if (num >= 30) { level = "advanced"; lessonNum = String(num - 29) }
    }

    const configKey = level && lessonNum ? `${level}_${lessonNum}` : ""
    const config = lessonChartConfig[configKey] || { symbol: "FX:EURUSD", studies: [], interval: "15" }

    const widgetDiv = document.createElement("div")
    widgetDiv.style.height = "100%"
    widgetDiv.style.width = "100%"

    const outerContainer = document.createElement("div")
    outerContainer.className = "tradingview-widget-container"
    outerContainer.style.height = "100%"
    outerContainer.style.width = "100%"
    outerContainer.appendChild(widgetDiv)

    containerRef.current.appendChild(outerContainer)

    // Check if tv.js is already loaded
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).TradingView) {
      initWidget()
    } else {
      const script = document.createElement("script")
      script.src = "https://s.tradingview.com/tv.js"
      script.async = true
      script.type = "text/javascript"
      script.onload = initWidget
      document.head.appendChild(script)
    }

    function initWidget() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const TV = (window as any).TradingView
      if (!TV) return

      const uniqueId = `tv_chart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      widgetDiv.id = uniqueId

      new TV.widget({
        autosize: true,
        symbol: config.symbol,
        interval: config.interval,
        timezone: "Asia/Karachi",
        theme: "dark",
        style: "1",
        locale: "en",
        enable_publishing: false,
        allow_symbol_change: true,
        hide_side_toolbar: false,
        studies: config.studies,
        container_id: uniqueId,
        support_host: "https://www.tradingview.com",
      })
      setIsLoaded(true)
    }

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = ""
    }
  }, [isVisible, lessonId])

  return (
    <div className="mt-5 mb-2" ref={visibilityRef}>
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
        <span className="inline-block h-2 w-2 rounded-full bg-[#00D09C] animate-pulse" />
        EUR/USD Live Chart · Draw Tools Available
      </div>
      <div
        className="relative overflow-hidden rounded-xl border border-border"
        style={{ height: `${height}px`, width: "100%" }}
      >
        {/* Loading placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/30">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
            <span className="text-[10px] font-medium text-muted-foreground">Loading chart...</span>
          </div>
        )}
        <div
          ref={containerRef}
          style={{ height: "100%", width: "100%" }}
        />
      </div>
    </div>
  )
}
