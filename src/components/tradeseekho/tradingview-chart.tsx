"use client"

import { useEffect, useRef } from "react"

/**
 * TradingView Advanced Chart — FREE with Draw Tools + Auto indicators per lesson
 * Uses tv.js so left-side toolbar with drawing tools is available.
 * Auto-loads indicators based on lesson ID (e.g. beginner_6 → Support/Resistance).
 */

// Lesson-specific chart configs: auto indicators per lesson
const lessonChartConfig: Record<string, { symbol: string; studies: string[]; interval: string }> = {
  // --- BEGINNER (1-12) : Simple Candlestick ---
  "beginner_1": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_2": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_3": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_4": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_5": { symbol: "FX:EURUSD", studies: [], interval: "15" }, // Candlesticks
  "beginner_6": { symbol: "FX:EURUSD", studies: ["STD;Support%1Resistance"], interval: "15" }, // S/R
  "beginner_7": { symbol: "FX:EURUSD", studies: ["STD;Pivot_Points_Standard"], interval: "15" }, // Trend Lines
  "beginner_8": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_9": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_10": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_11": { symbol: "FX:EURUSD", studies: [], interval: "15" },
  "beginner_12": { symbol: "FX:EURUSD", studies: [], interval: "15" },

  // --- INTERMEDIATE (1-10) : Indicators Auto ---
  "intermediate_1": { symbol: "FX:EURUSD", studies: ["STD;MA_Simple", "STD;MA_Exponential"], interval: "15" }, // MA & EMA
  "intermediate_2": { symbol: "FX:EURUSD", studies: ["STD;RSI"], interval: "15" }, // RSI
  "intermediate_3": { symbol: "FX:EURUSD", studies: ["STD;MACD"], interval: "15" }, // MACD
  "intermediate_4": { symbol: "FX:EURUSD", studies: ["STD;Bollinger_Bands"], interval: "15" }, // Bollinger
  "intermediate_5": { symbol: "FX:EURUSD", studies: ["STD;Pivot_Points_Standard"], interval: "15" }, // Chart Patterns
  "intermediate_6": { symbol: "FX:EURUSD", studies: ["STD;Pivot_Points_Standard"], interval: "15" }, // Triangles/Flags
  "intermediate_7": { symbol: "FX:EURUSD", studies: ["STD;Auto_Fib_Retracement"], interval: "15" }, // Fibonacci
  "intermediate_8": { symbol: "FX:EURUSD", studies: [], interval: "15" }, // Price Action - clean
  "intermediate_9": { symbol: "FX:EURUSD", studies: [], interval: "15" }, // Fundamental
  "intermediate_10": { symbol: "FX:EURUSD", studies: [], interval: "15" }, // Fundamental

  // --- ADVANCED (1-21) : SMC Auto ---
  "advanced_1": { symbol: "FX:EURUSD", studies: [], interval: "15" }, // SMC Intro
  "advanced_2": { symbol: "FX:EURUSD", studies: ["STD;Support%1Resistance"], interval: "15" }, // Order Block
  "advanced_3": { symbol: "FX:EURUSD", studies: ["STD;Bollinger_Bands"], interval: "15" }, // FVG (bands as proxy)
  "advanced_4": { symbol: "FX:EURUSD", studies: ["STD;Support%1Resistance"], interval: "15" }, // Liquidity BSL/SSL
  "advanced_5": { symbol: "FX:EURUSD", studies: ["STD;Support%1Resistance"], interval: "15" }, // Breaker Block
  "advanced_6": { symbol: "FX:EURUSD", studies: ["STD;Pivot_Points_Standard"], interval: "15" }, // BOS & CHOCH
  "advanced_7": { symbol: "FX:EURUSD", studies: [], interval: "5" }, // London Kill Zone
  "advanced_8": { symbol: "FX:EURUSD", studies: [], interval: "5" }, // NY Kill Zone
  "advanced_9": { symbol: "FX:EURUSD", studies: [], interval: "15" }, // Risk Management
  "advanced_10": { symbol: "FX:EURUSD", studies: [], interval: "15" }, // Psychology
  "advanced_11": { symbol: "FX:EURUSD", studies: ["STD;RSI"], interval: "15" }, // News + SMC
  "advanced_12": { symbol: "FX:EURUSD", studies: ["STD;MA_Simple", "STD;MA_Exponential"], interval: "60" }, // Top-Down Daily
  "advanced_13": { symbol: "FX:EURUSD", studies: [], interval: "15" }, // Pro Strategy
  "advanced_14": { symbol: "FX:EURUSD", studies: ["STD;Support%1Resistance"], interval: "15" }, // BTC/Crypto SMC
  "advanced_15": { symbol: "FX:EURUSD", studies: [], interval: "15" }, // Funded Account
  "advanced_16": { symbol: "FX:EURUSD", studies: [], interval: "15" }, // Final Test
  // Bonus (17-21)
  "advanced_17": { symbol: "FX:EURUSD", studies: ["STD;Support%1Resistance"], interval: "15" }, // Live Trades
  "advanced_18": { symbol: "FX:EURUSD", studies: [], interval: "15" }, // Withdrawal
  "advanced_19": { symbol: "FX:EURUSD", studies: [], interval: "15" }, // Prop Firm Rules
  "advanced_20": { symbol: "FX:EURUSD", studies: [], interval: "15" }, // No Trade Days
  "advanced_21": { symbol: "FX:EURUSD", studies: [], interval: "15" }, // Career Roadmap
}

export function TradingViewChart({ height = 300, lessonId }: { height?: number; lessonId?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.innerHTML = ""

    // Determine lesson config
    let level = ""
    let lessonNum = ""
    if (lessonId) {
      // lessonId format: "eurusd-6" (beginner), "eurusd-13" (intermediate), "eurusd-30" (advanced)
      const num = parseInt(lessonId.replace("eurusd-", ""))
      if (num >= 1 && num <= 12) { level = "beginner"; lessonNum = String(num) }
      else if (num >= 13 && num <= 22) { level = "intermediate"; lessonNum = String(num - 12) }
      else if (num >= 30) { level = "advanced"; lessonNum = String(num - 29) }
    }

    const configKey = level && lessonNum ? `${level}_${lessonNum}` : ""
    const config = lessonChartConfig[configKey] || { symbol: "FX:EURUSD", studies: [], interval: "15" }

    // Create the widget container div
    const widgetDiv = document.createElement("div")
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
        hide_side_toolbar: false, // ← LEFT SIDE DRAW TOOLS VISIBLE
        studies: config.studies, // ← AUTO INDICATORS PER LESSON
        container_id: uniqueId,
        support_host: "https://www.tradingview.com",
      })
    }

    document.head.appendChild(script)

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = ""
      const existingScript = document.querySelector('script[src="https://s.tradingview.com/tv.js"]')
      if (existingScript) existingScript.remove()
    }
  }, [lessonId])

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
