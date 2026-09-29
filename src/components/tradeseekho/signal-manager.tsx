"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Save, Trash2, Loader2, TrendingUp, TrendingDown, Camera,
  CheckCircle2, XCircle, Bell, Zap, RefreshCw, Maximize2, Minimize2, X,
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  SIGNAL_SYMBOLS, pairLabel, suggestLevels, formatPrice,
  type HitAction,
} from "@/lib/signals"

interface AdminSignal {
  id: string
  symbol: string
  signalType: string
  entry: string
  stopLoss: string
  tp1: string | null
  tp2: string | null
  tp3: string | null
  note: string | null
  screenshot: string
  status: string
  tp1HitAt: string | null
  tp2HitAt: string | null
  tp3HitAt: string | null
  slHitAt: string | null
  profitUsd: number | null
  createdAt: string
}

async function fetchSignals() {
  const res = await fetch("/api/admin/signals")
  if (!res.ok) throw new Error("failed")
  return res.json() as Promise<{ signals: AdminSignal[] }>
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  active: { label: "ACTIVE", cls: "bg-brand text-brand-foreground" },
  tp1_hit: { label: "TP1 HIT ✅", cls: "bg-emerald-500 text-white" },
  tp2_hit: { label: "TP2 HIT ✅", cls: "bg-sky-500 text-white" },
  tp3_hit: { label: "TP3 HIT ✅", cls: "bg-blue-800 text-white" },
  sl_hit: { label: "SL HIT ❌", cls: "bg-red-600 text-white" },
  closed: { label: "CLOSED", cls: "bg-muted text-muted-foreground" },
}

// ---------- BUG 2: pure canvas renderer (no React state) ----------
// Renders the signal-card "chart" to a canvas and returns the JPEG data URL.
// Extracted as a standalone function so `publish` can call it synchronously
// (fixing the stale-state bug where the screenshot was empty at publish time).
// Uses JPEG (0.85 quality) — 5-10x smaller than PNG, prevents API body-size
// issues on Vercel.
interface Candle { t: number; o: number; h: number; l: number; c: number }

interface RenderArgs {
  symbol: string
  signalType: string
  entry: string
  stopLoss: string
  tp1: string
  tp2: string
  tp3: string
  note: string
  livePrice: number | null
  candles: Candle[] // real OHLC data from /api/candles
}

// Renders a REAL candlestick chart on canvas using live market OHLC data +
// overlays Entry/SL/TP price levels. This is NOT a fake template — it draws
// actual candlesticks (green up / red down) fetched from Yahoo Finance, so the
// captured screenshot looks like a genuine trading chart.
function renderSignalCard(a: RenderArgs): string {
  try {
    const canvas = document.createElement("canvas")
    canvas.width = 900
    canvas.height = 500
    const ctx = canvas.getContext("2d")
    if (!ctx) return ""

    const isBuy = a.signalType === "BUY"
    const accent = isBuy ? "#00D09C" : "#FF6B6B"
    const W = 900, H = 500

    // Background gradient (dark navy, like TradingView dark theme)
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, "#0B1B2E")
    bg.addColorStop(1, "#0A1929")
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Top accent bar
    ctx.fillStyle = accent
    ctx.fillRect(0, 0, W, 5)

    // Header: pair name + BUY/SELL pill
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "bold 32px Arial"
    ctx.fillText(pairLabel(a.symbol), 24, 48)

    const pillText = a.signalType
    ctx.font = "bold 20px Arial"
    const pillW = ctx.measureText(pillText).width + 32
    ctx.fillStyle = accent
    roundRect(ctx, W - pillW - 24, 22, pillW, 34, 17)
    ctx.fill()
    ctx.fillStyle = "#0A1929"
    ctx.fillText(pillText, W - pillW - 24 + 16, 44)

    // Live price label (top-right under pill)
    if (a.livePrice !== null) {
      ctx.fillStyle = "#8AA2B8"
      ctx.font = "12px Arial"
      ctx.fillText(`LIVE: ${formatPrice(a.symbol, a.livePrice)}`, W - 160, 76)
    }

    // Chart area geometry — candlesticks on left 2/3, price labels on right 1/3
    const chartLeft = 50
    const chartRight = 620
    const chartTop = 100
    const chartBottom = 430
    const chartW = chartRight - chartLeft
    const chartH = chartBottom - chartTop

    // ---- Compute price range: include candle highs/lows + Entry/SL/TP levels ----
    const entryNum = parseFloat(a.entry)
    const slNum = parseFloat(a.stopLoss)
    const tp1Num = parseFloat(a.tp1)
    const tp2Num = parseFloat(a.tp2)
    const tp3Num = parseFloat(a.tp3)
    const levelNums = [entryNum, slNum, tp1Num, tp2Num, tp3Num].filter((n) =>
      Number.isFinite(n),
    )

    const candleHighs = a.candles.map((c) => c.h)
    const candleLows = a.candles.map((c) => c.l)
    let minP = candleLows.length ? Math.min(...candleLows) : 0
    let maxP = candleHighs.length ? Math.max(...candleHighs) : 1
    for (const n of levelNums) {
      if (n < minP) minP = n
      if (n > maxP) maxP = n
    }
    if (!Number.isFinite(minP) || !Number.isFinite(maxP) || minP === maxP) {
      minP = (minP || 0) - 1
      maxP = (maxP || 1) + 1
    }
    const padP = (maxP - minP) * 0.1
    const lo = minP - padP
    const hi = maxP + padP
    const yFor = (v: number) =>
      chartBottom - ((v - lo) / (hi - lo)) * chartH

    // ---- Grid lines (horizontal, subtle) ----
    ctx.strokeStyle = "#152A42"
    ctx.lineWidth = 1
    const gridSteps = 5
    for (let i = 0; i <= gridSteps; i++) {
      const y = chartTop + (chartH / gridSteps) * i
      ctx.beginPath()
      ctx.moveTo(chartLeft, y)
      ctx.lineTo(chartRight, y)
      ctx.stroke()
      // Price axis label
      const priceAtY = hi - ((hi - lo) / gridSteps) * i
      ctx.fillStyle = "#3A5066"
      ctx.font = "10px Arial"
      ctx.fillText(formatPrice(a.symbol, priceAtY), chartRight + 6, y + 3)
    }

    // ---- Draw REAL candlesticks ----
    const candles = a.candles
    if (candles.length > 0) {
      const candleSpacing = chartW / candles.length
      const candleW = Math.max(3, Math.min(14, candleSpacing * 0.65))
      candles.forEach((c, i) => {
        const cx = chartLeft + candleSpacing * i + candleSpacing / 2
        const yO = yFor(c.o)
        const yC = yFor(c.c)
        const yH = yFor(c.h)
        const yL = yFor(c.l)
        const up = c.c >= c.o
        const color = up ? "#00D09C" : "#FF4D6D"

        // Wick (high-low line)
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cx, yH)
        ctx.lineTo(cx, yL)
        ctx.stroke()

        // Body (open-close rectangle)
        const bodyTop = Math.min(yO, yC)
        const bodyH = Math.max(2, Math.abs(yC - yO))
        ctx.fillStyle = color
        ctx.fillRect(cx - candleW / 2, bodyTop, candleW, bodyH)
      })

      // ---- SMA(20) — Simple Moving Average (orange line, like TradingView) ----
      const smaPeriod = 20
      const smaPoints: { x: number; y: number }[] = []
      for (let i = smaPeriod - 1; i < candles.length; i++) {
        let sum = 0
        for (let j = i - smaPeriod + 1; j <= i; j++) sum += candles[j].c
        const avg = sum / smaPeriod
        const cx = chartLeft + candleSpacing * i + candleSpacing / 2
        smaPoints.push({ x: cx, y: yFor(avg) })
      }
      if (smaPoints.length > 1) {
        ctx.strokeStyle = "#FF9800" // orange (TradingView default MA color)
        ctx.lineWidth = 1.8
        ctx.beginPath()
        ctx.moveTo(smaPoints[0].x, smaPoints[0].y)
        for (let i = 1; i < smaPoints.length; i++) {
          ctx.lineTo(smaPoints[i].x, smaPoints[i].y)
        }
        ctx.stroke()
      }

      // ---- Bollinger Bands (20, 2) — upper/lower bands (light blue) ----
      // BB uses SMA(20) as the middle band ± 2 standard deviations.
      const bbMult = 2
      const upperPoints: { x: number; y: number }[] = []
      const lowerPoints: { x: number; y: number }[] = []
      for (let i = smaPeriod - 1; i < candles.length; i++) {
        let sum = 0
        for (let j = i - smaPeriod + 1; j <= i; j++) sum += candles[j].c
        const mean = sum / smaPeriod
        let variance = 0
        for (let j = i - smaPeriod + 1; j <= i; j++) {
          variance += (candles[j].c - mean) ** 2
        }
        const sd = Math.sqrt(variance / smaPeriod)
        const cx = chartLeft + candleSpacing * i + candleSpacing / 2
        upperPoints.push({ x: cx, y: yFor(mean + bbMult * sd) })
        lowerPoints.push({ x: cx, y: yFor(mean - bbMult * sd) })
      }
      // Fill between bands (subtle) + draw upper/lower lines
      if (upperPoints.length > 1) {
        // Fill area
        ctx.fillStyle = "rgba(33, 150, 243, 0.06)"
        ctx.beginPath()
        ctx.moveTo(upperPoints[0].x, upperPoints[0].y)
        for (let i = 1; i < upperPoints.length; i++) ctx.lineTo(upperPoints[i].x, upperPoints[i].y)
        for (let i = lowerPoints.length - 1; i >= 0; i--) ctx.lineTo(lowerPoints[i].x, lowerPoints[i].y)
        ctx.closePath()
        ctx.fill()
        // Upper band
        ctx.strokeStyle = "rgba(33, 150, 243, 0.7)"
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(upperPoints[0].x, upperPoints[0].y)
        for (let i = 1; i < upperPoints.length; i++) ctx.lineTo(upperPoints[i].x, upperPoints[i].y)
        ctx.stroke()
        // Lower band
        ctx.beginPath()
        ctx.moveTo(lowerPoints[0].x, lowerPoints[0].y)
        for (let i = 1; i < lowerPoints.length; i++) ctx.lineTo(lowerPoints[i].x, lowerPoints[i].y)
        ctx.stroke()
      }

      // Indicator legend (top-left of chart area)
      ctx.fillStyle = "#8AA2B8"
      ctx.font = "10px Arial"
      ctx.fillText("MA(20)", chartLeft + 4, chartTop + 12)
      ctx.fillStyle = "rgba(33, 150, 243, 0.9)"
      ctx.fillText("BB(20, 2)", chartLeft + 50, chartTop + 12)
    } else {
      ctx.fillStyle = "#445566"
      ctx.font = "italic 14px Arial"
      ctx.fillText("Loading market data…", chartLeft + 10, chartTop + 30)
    }

    // ---- Draw Entry/SL/TP horizontal level lines (overlay on the chart) ----
    const drawLevel = (
      val: number, color: string, label: string, price: string,
    ) => {
      if (!Number.isFinite(val)) return
      const y = yFor(val)
      // Dashed horizontal line across the chart
      ctx.strokeStyle = color
      ctx.lineWidth = 1.8
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      ctx.moveTo(chartLeft, y)
      ctx.lineTo(chartRight, y)
      ctx.stroke()
      ctx.setLineDash([])
      // Label box on the right edge
      const labelText = `${label}: ${price}`
      ctx.font = "bold 11px Arial"
      const boxW = ctx.measureText(labelText).width + 12
      ctx.fillStyle = color
      roundRect(ctx, chartRight + 2, y - 9, boxW, 18, 4)
      ctx.fill()
      ctx.fillStyle = "#0A1929"
      ctx.fillText(labelText, chartRight + 8, y + 4)
    }

    drawLevel(slNum, "#FF4D6D", "SL", a.stopLoss)
    drawLevel(entryNum, "#FFFFFF", "ENTRY", a.entry)
    drawLevel(tp1Num, "#00D09C", "TP1", a.tp1)
    drawLevel(tp2Num, "#22D3EE", "TP2", a.tp2)
    drawLevel(tp3Num, "#3B82F6", "TP3", a.tp3)

    // Note
    if (a.note) {
      ctx.fillStyle = "#8AA2B8"
      ctx.font = "12px Arial"
      const trimmed = a.note.length > 90 ? a.note.slice(0, 87) + "…" : a.note
      ctx.fillText(`📝 ${trimmed}`, 24, 455)
    }

    // Branding footer
    ctx.fillStyle = "#445566"
    ctx.font = "11px Arial"
    ctx.fillText("TradeSeekho PK · LEARN TRADE GROW", 24, 482)
    const now = new Date().toLocaleString("en-GB", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    })
    ctx.fillText(now, W - 130, 482)

    // JPEG 0.85 — much smaller than PNG
    return canvas.toDataURL("image/jpeg", 0.85)
  } catch {
    return ""
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function SignalManager() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["admin-signals"], queryFn: fetchSignals })

  const [symbol, setSymbol] = useState("OANDA:XAUUSD")
  const [signalType, setSignalType] = useState("BUY")
  const [entry, setEntry] = useState("")
  const [stopLoss, setStopLoss] = useState("")
  const [tp1, setTp1] = useState("")
  const [tp2, setTp2] = useState("")
  const [tp3, setTp3] = useState("")
  const [note, setNote] = useState("")
  const [screenshot, setScreenshot] = useState("")
  const [busy, setBusy] = useState(false)

  // Live price state (BUG 1: auto-fill from live price).
  const [livePrice, setLivePrice] = useState<number | null>(null)
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceSource, setPriceSource] = useState<string>("")
  // Track whether we've auto-filled for this symbol so we don't re-trigger
  // on every focus. The Entry onFocus only fires once per symbol change.
  const [autoFilled, setAutoFilled] = useState(false)

  // Real OHLC candle data (fetched from /api/candles) for the chart screenshot.
  // Cached per symbol; refetched when the symbol changes.
  const [candles, setCandles] = useState<Candle[]>([])

  // TradingView chart container ref — the embed-widget-advanced-chart.js script
  // is injected here. This approach (vs the old widgetembed iframe) reliably
  // shows the LEFT DRAWING TOOLBAR (S/R lines, Trendline, Fibonacci) because
  // it uses the `hide_side_toolbar: false` config option.
  const tvChartRef = useRef<HTMLDivElement>(null)

  // Fullscreen chart overlay — when open, the chart renders in a full-viewport
  // overlay so the admin has maximum space to draw + zoom. Also fixes the
  // touch-scroll bug: the overlay container uses touch-action:none +
  // overscroll-behavior:contain so chart gestures (pan/zoom/draw) don't
  // scroll the parent page.
  const [chartFullscreen, setChartFullscreen] = useState(false)
  const fullscreenChartRef = useRef<HTMLDivElement>(null)

  // Uploaded real-chart screenshot (from TradingView's camera icon). When set,
  // this OVERRIDES the auto-generated canvas card — so the signal shows the
  // admin's ACTUAL drawings (SELL box, S/R lines, Fibonacci) + indicators.
  // TradingView's iframe is cross-origin, so we can't screenshot it via JS;
  // the only way to capture real drawings is: admin clicks the camera icon →
  // saves PNG → uploads it here.
  const [uploadedScreenshot, setUploadedScreenshot] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto Card availability: the auto-generated canvas card (candles + MA + BB +
  // Entry/SL/TP levels) is only applicable when we have real OHLC candle data
  // for the pair. If the /api/candles fetch fails (unsupported pair, market
  // closed, Yahoo down) we hide the Auto Card entirely — no blank/broken card.
  // Per the user's requirement: if autoCardData == null, hideAutoCard().
  const autoCardAvailable = candles.length >= 5 // need at least ~5 candles for a chart
  const autoCardStatus: "loading" | "available" | "no-data" = (() => {
    // While the first fetch hasn't completed we don't know yet.
    if (candles.length === 0 && symbol === "") return "loading"
    if (autoCardAvailable) return "available"
    return "no-data"
  })()

  // The final screenshot used for publish + preview:
  // uploaded real chart (with drawings) takes priority.
  // The auto canvas card is only used when it's available (candles present).
  const autoCardScreenshot = autoCardAvailable ? screenshot : ""
  const finalScreenshot = uploadedScreenshot || autoCardScreenshot

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/admin/signals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-signals"] })
      qc.invalidateQueries({ queryKey: ["signals"] })
      toast.success("Signal published!")
      setEntry(""); setStopLoss(""); setTp1(""); setTp2(""); setTp3(""); setNote(""); setScreenshot("")
      setUploadedScreenshot("")
      setAutoFilled(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/admin/signals?id=${id}`, { method: "DELETE" })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-signals"] })
      qc.invalidateQueries({ queryKey: ["signals"] })
      toast.success("Signal deleted")
    },
  })

  const hitMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: HitAction }) => {
      const res = await fetch(`/api/admin/signals?id=${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-signals"] })
      qc.invalidateQueries({ queryKey: ["signals"] })
      qc.invalidateQueries({ queryKey: ["notifications"] })
      const label = vars.action === "sl" ? "SL HIT" : `${vars.action.toUpperCase()} HIT`
      toast.success(`${label} marked — notification sent to all users 🔔`)
    },
    onError: () => toast.error("Failed to update signal"),
  })

  // ---------- BUG 1: live price fetch ----------
  const fetchPrice = useCallback(async (sym: string) => {
    setPriceLoading(true)
    try {
      const res = await fetch(`/api/price?symbol=${encodeURIComponent(sym)}`, { cache: "no-store" })
      if (!res.ok) throw new Error("price fetch failed")
      const d = (await res.json()) as { price: number; source: string; stale?: boolean }
      setLivePrice(d.price)
      setPriceSource(d.stale ? `${d.source} (fallback)` : d.source)
      return d.price
    } catch {
      setLivePrice(null)
      setPriceSource("")
      toast.error("Live price unavailable — enter manually")
      return null
    } finally {
      setPriceLoading(false)
    }
  }, [])

  // Fetch real OHLC candle data for the chart screenshot. Called on mount +
  // whenever the symbol changes. Data is cached server-side (60s) so repeated
  // captures are instant.
  const fetchCandles = useCallback(async (sym: string) => {
    try {
      const res = await fetch(
        `/api/candles?symbol=${encodeURIComponent(sym)}&interval=15m&range=1d`,
        { cache: "no-store" },
      )
      if (!res.ok) throw new Error("candle fetch failed")
      const d = (await res.json()) as { candles: Candle[] }
      setCandles(d.candles ?? [])
    } catch {
      // Non-fatal — screenshot will just show levels without candles.
      setCandles([])
    }
  }, [])

  // Auto-fetch live price + candles on mount + whenever the symbol changes.
  useEffect(() => {
    setAutoFilled(false)
    void fetchPrice(symbol)
    void fetchCandles(symbol)
  }, [symbol, fetchPrice, fetchCandles])

  // Helper: inject the TradingView advanced-chart widget into a given container.
  // Used by both the inline chart + the fullscreen overlay.
  const mountTradingView = useCallback((container: HTMLDivElement) => {
    container.innerHTML = ""

    const widgetContainer = document.createElement("div")
    widgetContainer.className = "tradingview-widget-container"
    widgetContainer.style.height = "100%"
    widgetContainer.style.width = "100%"

    const script = document.createElement("script")
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.async = true
    script.type = "text/javascript"
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "15",
      timezone: "Asia/Karachi",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      hide_side_toolbar: false, // ← LEFT DRAWING TOOLBAR (S/R, Trendline, Fibonacci)
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true, // camera icon → export PNG with drawings + indicators
      withdateranges: true,
      calendar: false,
      studies: ["STD;MA_Simple", "STD;Bollinger_Bands"], // MA(20) + BB on live chart
      support_host: "https://www.tradingview.com",
    })

    widgetContainer.appendChild(script)
    container.appendChild(widgetContainer)
  }, [symbol])

  // Mount/reload the inline chart whenever the symbol changes OR fullscreen
  // closes (the container ref re-attaches). When fullscreen is open we don't
  // mount the inline chart (it would be hidden anyway).
  useEffect(() => {
    if (chartFullscreen) return
    if (!tvChartRef.current) return
    const container = tvChartRef.current
    mountTradingView(container)
    return () => {
      container.innerHTML = ""
    }
  }, [symbol, chartFullscreen, mountTradingView])

  // Mount the chart in the fullscreen overlay when it opens.
  useEffect(() => {
    if (!chartFullscreen) return
    if (!fullscreenChartRef.current) return
    const container = fullscreenChartRef.current
    mountTradingView(container)
    return () => {
      container.innerHTML = ""
    }
  }, [chartFullscreen, mountTradingView])

  // Lock body scroll while fullscreen chart is open (prevents background scroll).
  useEffect(() => {
    if (chartFullscreen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [chartFullscreen])

  // Fill Entry/SL/TP from the live price using per-pair default offsets.
  // Returns the screenshot data URL so publish can use it synchronously.
  const applyLivePrice = useCallback(
    async (mode: "all" | "entryOnly" = "all"): Promise<string | null> => {
      const p = livePrice ?? (await fetchPrice(symbol))
      if (p === null) return null
      const levels = suggestLevels(
        symbol,
        signalType === "SELL" ? "SELL" : "BUY",
        p,
      )
      const newEntry = levels.entry
      const newSL = mode === "all" ? levels.stopLoss : stopLoss
      const newTp1 = mode === "all" ? levels.tp1 : tp1
      const newTp2 = mode === "all" ? levels.tp2 : tp2
      const newTp3 = mode === "all" ? levels.tp3 : tp3

      setEntry(newEntry)
      if (mode === "all") {
        setStopLoss(newSL)
        setTp1(newTp1)
        setTp2(newTp2)
        setTp3(newTp3)
      }
      setAutoFilled(true)
      toast.success(`Auto-filled from live price (${formatPrice(symbol, p)}) — edit as needed`)

      // Render screenshot synchronously with the NEW values (not stale state).
      const shot = renderSignalCard({
        symbol, signalType, entry: newEntry, stopLoss: newSL,
        tp1: newTp1, tp2: newTp2, tp3: newTp3, note, livePrice: p, candles,
      })
      setScreenshot(shot)
      return shot
    },
    [livePrice, symbol, signalType, fetchPrice, stopLoss, tp1, tp2, tp3, note, candles],
  )

  // BUG 3 FIX: Auto-fill Entry/SL/TP the moment the live price arrives — so
  // the admin sees filled fields immediately without clicking anything.
  // Only fires once per symbol (autoFilled guard) + only when fields are empty
  // (so manual edits are never overwritten).
  useEffect(() => {
    if (livePrice !== null && !autoFilled && !entry && !stopLoss && !tp1) {
      void applyLivePrice("all")
    }
  }, [livePrice, autoFilled, symbol, entry, stopLoss, tp1, applyLivePrice])

  // ---------- BUG 2: screenshot capture (thin wrapper around renderSignalCard) ----------
  const captureScreenshot = useCallback((): string => {
    const shot = renderSignalCard({
      symbol, signalType, entry, stopLoss, tp1, tp2, tp3, note, livePrice, candles,
    })
    setScreenshot(shot)
    return shot
  }, [symbol, signalType, entry, stopLoss, tp1, tp2, tp3, note, livePrice, candles])

  // Auto-capture whenever form values change (so screenshot is always fresh).
  useEffect(() => {
    if (entry || stopLoss || tp1) {
      const shot = renderSignalCard({
        symbol, signalType, entry, stopLoss, tp1, tp2, tp3, note, livePrice, candles,
      })
      setScreenshot(shot)
    }
  }, [entry, stopLoss, tp1, tp2, tp3, note, signalType, symbol, livePrice, candles])

  const publish = () => {
    if (!entry || !stopLoss) { toast.error("Entry and SL required"); return }
    // Priority: uploaded real-chart screenshot (with admin's drawings) > auto card.
    // The auto card is only valid when candle data is available for the pair.
    let shot = uploadedScreenshot
    if (!shot) {
      if (!autoCardAvailable) {
        toast.error("Auto Card not available for this pair. Please upload a chart screenshot (📷 camera icon → Upload Chart).")
        return
      }
      shot = captureScreenshot()
    }
    if (!shot) { toast.error("Could not capture chart image"); return }
    setBusy(true)
    createMutation.mutateAsync({
      symbol, signalType, entry, stopLoss,
      tp1: tp1 || null, tp2: tp2 || null, tp3: tp3 || null,
      note: note || null, screenshot: shot,
    }).finally(() => setBusy(false))
  }

  // Read an uploaded PNG/JPG (from TradingView's camera icon) and convert to a
  // base64 data URL. This becomes the signal's screenshot — showing the admin's
  // ACTUAL drawings (SELL box, S/R lines, Fibonacci) + indicators, not the
  // auto-generated canvas card.
  const handleChartUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG/JPG)")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setUploadedScreenshot(result)
      toast.success("Real chart screenshot uploaded — preview updated!")
    }
    reader.onerror = () => toast.error("Failed to read file")
    reader.readAsDataURL(file)
    // Reset the input so the same file can be re-uploaded
    e.target.value = ""
  }

  const signals = data?.signals ?? []
  const activeSignals = signals.filter((s) => s.status !== "closed")

  return (
    <div className="space-y-4">
      {/* Create Signal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-brand" /> Create Signal</CardTitle>
          <CardDescription>Tap Entry field to auto-fill live price. Draw on chart, publish to all users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {/* Symbol + Live Price chip + Get Live Price button */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="h-9 rounded-lg border border-border bg-card px-3 text-sm font-bold"
              >
                {SIGNAL_SYMBOLS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              {/* BUG 3 FIX: Live price chip is CLICKABLE — tapping it auto-fills
                  Entry/SL/TP. Also auto-fills on first price load (useEffect). */}
              <button
                type="button"
                onClick={() => applyLivePrice("all")}
                disabled={priceLoading || livePrice === null}
                title="Click to auto-fill Entry/SL/TP from this live price"
                className="flex items-center gap-1.5 rounded-lg border-2 border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 transition hover:border-emerald-500 hover:bg-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {priceLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                ) : livePrice !== null ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-extrabold text-emerald-500">{formatPrice(symbol, livePrice)}</span>
                    <Zap className="h-3 w-3 text-emerald-500" />
                  </>
                ) : (
                  <span className="text-[11px] text-muted-foreground">no price</span>
                )}
              </button>

              <Button
                size="sm"
                variant="default"
                className="gap-1.5 bg-brand font-bold text-brand-foreground hover:bg-brand/90"
                onClick={() => applyLivePrice("all")}
                disabled={priceLoading}
              >
                {priceLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                Auto-Fill
              </Button>

              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => fetchPrice(symbol)} disabled={priceLoading}>
                <RefreshCw className={`h-3.5 w-3.5 ${priceLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {priceSource && (
              <p className="text-[10px] text-muted-foreground">
                Price: {priceSource} · <span className="font-bold text-emerald-500">Tap the green live-price chip</span> to auto-fill Entry/SL/TP (fields auto-fill on load — editable).
              </p>
            )}

            {/* TradingView Advanced Chart widget — script-based embed.
                Left drawing toolbar (S/R, Trendline, Fibonacci) + MA/BB studies.
                Admin draws analysis here, then uses the camera icon to export a
                PNG, then uploads it via the "Upload Chart" button below.

                TOUCH-SCROLL FIX: touch-action:none + overscroll-behavior:contain
                on the wrapper so chart gestures (pan/zoom/draw) don't scroll the
                parent page. The Fullscreen button opens the chart in a
                full-viewport overlay for maximum drawing space. */}
            <div className="relative">
              <div
                className="overflow-hidden rounded-xl border border-border"
                style={{
                  height: "500px",
                  touchAction: "none",
                  overscrollBehavior: "contain",
                }}
              >
                <div ref={tvChartRef} style={{ height: "100%", width: "100%" }} />
              </div>
              {/* Fullscreen toggle button (top-right of chart) */}
              <button
                type="button"
                onClick={() => setChartFullscreen(true)}
                title="Open chart in fullscreen"
                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/80 text-foreground backdrop-blur transition hover:bg-background active:scale-95"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            {/* 3-STEP FLOW instructions — this IS the drawing-sync mechanism.
                TradingView's iframe is cross-origin so JS can't read drawings;
                the camera-icon → upload flow is how drawings reach the signal. */}
            <div className="rounded-lg border border-brand/30 bg-brand-muted/20 p-3">
              <p className="text-[11px] font-bold text-foreground">📤 Drawing Sync — apni drawings ko capture me laane ka tareeqa:</p>
              <ol className="mt-1.5 space-y-0.5 text-[10px] text-muted-foreground">
                <li><span className="font-bold text-brand">1.</span> Uper chart par left toolbar se Trendline, Horizontal (S/R), Triangle, Channel, Fibonacci draw karein</li>
                <li><span className="font-bold text-brand">2.</span> Chart ke top-right par <span className="font-bold">📷 camera icon</span> par click karein → PNG download ho jayegi (aapki drawings + MA + BB sab ke saath)</li>
                <li><span className="font-bold text-brand">3.</span> Niche <span className="font-bold text-brand">"Upload Chart"</span> button par click karein → wo PNG select karein → preview me foran aa jayegi!</li>
              </ol>
              <p className="mt-1.5 text-[9px] text-muted-foreground/80">
                ℹ TradingView drawings ko direct canvas me sync nahi kiya ja sakta (CORS). Upload hi drawing-sync ka tareeqa hai.
                {!autoCardAvailable && " • Is pair par Auto Card nahi ban raha — upload zaroori hai."}
              </p>
            </div>

            {/* Upload Chart button + hidden file input */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleChartUpload}
                className="hidden"
              />
              <Button
                size="sm"
                className="gap-1.5 bg-brand font-bold text-brand-foreground hover:bg-brand/90"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-3.5 w-3.5" /> Upload Chart
              </Button>
              {uploadedScreenshot && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => { setUploadedScreenshot(""); toast.success("Cleared — using auto card") }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove Upload
                </Button>
              )}
              <span className="text-[10px] text-muted-foreground">
                {uploadedScreenshot
                  ? <span className="font-bold text-emerald-500">✓ Real chart uploaded (with your drawings)</span>
                  : autoCardAvailable
                    ? "No upload — using auto card (candles + MA + BB + levels)"
                    : <span className="font-bold text-amber-500">⚠ Auto Card not available for this pair — upload required</span>}
              </span>
            </div>
          </div>

          {/* Screenshot preview — shows uploaded real chart if present,
              otherwise the auto-generated canvas card (only when available).
              If neither exists (no upload + no candle data), show a "No data"
              notice instead of a blank/broken card. */}
          {finalScreenshot ? (
            <div className="rounded-xl border-2 border-brand/40 overflow-hidden">
              <div className="bg-brand/10 px-3 py-1.5 text-[10px] font-bold text-brand">
                {uploadedScreenshot ? "📷 Real Chart (with your drawings)" : "📊 Auto Card (candles + MA + BB + levels)"}
              </div>
              <img src={finalScreenshot} alt="Chart screenshot" className="w-full" />
            </div>
          ) : !uploadedScreenshot && !autoCardAvailable ? (
            <div className="rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 p-6 text-center">
              <p className="text-sm font-bold text-amber-600">⚠ Auto Card not available for this pair</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Candle data for this pair nahi mila (market band ho sakta hai ya pair supported nahi).
                <br />
                Chart ke <span className="font-bold">📷 camera icon</span> se PNG save karein aur
                <span className="font-bold text-brand"> "Upload Chart"</span> button se upload karein.
              </p>
            </div>
          ) : null}

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Signal Type</Label>
              <div className="mt-1 flex gap-2">
                <button
                  onClick={() => setSignalType("BUY")}
                  className={`flex-1 rounded-lg border-2 py-2 text-sm font-bold ${signalType === "BUY" ? "border-brand bg-brand-muted text-brand" : "border-border"}`}
                >
                  <TrendingUp className="mr-1 inline h-4 w-4" /> BUY
                </button>
                <button
                  onClick={() => setSignalType("SELL")}
                  className={`flex-1 rounded-lg border-2 py-2 text-sm font-bold ${signalType === "SELL" ? "border-destructive bg-destructive/10 text-destructive" : "border-border"}`}
                >
                  <TrendingDown className="mr-1 inline h-4 w-4" /> SELL
                </button>
              </div>
            </div>

            {/* BUG 1 FIX: Entry field auto-fills live price on focus (tap). */}
            <div className="space-y-1">
              <Label className="text-xs flex items-center justify-between">
                <span className="flex items-center gap-1">
                  Entry Price
                  <span className="rounded bg-brand/10 px-1 py-0.5 text-[9px] font-bold text-brand">tap to auto-fill</span>
                </span>
                <button
                  onClick={() => applyLivePrice("entryOnly")}
                  className="text-[10px] font-bold text-brand hover:underline"
                  type="button"
                >
                  use live
                </button>
              </Label>
              <Input
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                onFocus={() => {
                  // BUG 1: tapping the Entry field auto-fills live price + SL + TP.
                  // Only fires when field is empty + hasn't auto-filled yet for this symbol.
                  if (!entry && !autoFilled) {
                    void applyLivePrice("all")
                  }
                }}
                placeholder="Tap to auto-fill from live price"
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Stop Loss</Label>
              <Input value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} placeholder="e.g. 2010.00" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">TP1</Label>
              <Input value={tp1} onChange={(e) => setTp1(e.target.value)} placeholder="e.g. 2035.00" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">TP2</Label>
              <Input value={tp2} onChange={(e) => setTp2(e.target.value)} placeholder="e.g. 2045.00" className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">TP3</Label>
              <Input value={tp3} onChange={(e) => setTp3(e.target.value)} placeholder="e.g. 2060.00" className="h-9" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Note (optional)</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Additional notes for users..." className="text-sm" />
            </div>
          </div>

          <Button className="h-10 w-full gap-2 bg-brand font-bold text-brand-foreground hover:bg-brand/90" onClick={publish} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Publish Signal
          </Button>
        </CardContent>
      </Card>

      {/* Active Signals — with TP/SL HIT buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand" />
            Active Signals ({activeSignals.length})
          </CardTitle>
          <CardDescription>
            Press a TP/SL HIT button to mark the result. A push notification is sent to all users instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : activeSignals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active signals. Publish one above.</p>
          ) : (
            activeSignals.map((s) => {
              const badge = STATUS_BADGE[s.status] ?? STATUS_BADGE.active
              const slDone = s.status === "sl_hit"
              const allTpDone = s.status === "tp3_hit"
              const tp1Done = ["tp1_hit", "tp2_hit", "tp3_hit"].includes(s.status)
              const tp2Done = ["tp2_hit", "tp3_hit"].includes(s.status)
              const tp3Done = s.status === "tp3_hit"

              return (
                <div key={s.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {s.screenshot && <img src={s.screenshot} alt="" className="h-10 w-14 shrink-0 rounded object-cover" />}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold">{pairLabel(s.symbol)}</span>
                          <Badge className={s.signalType === "BUY" ? "bg-brand text-brand-foreground text-[9px]" : "bg-destructive text-white text-[9px]"}>
                            {s.signalType}
                          </Badge>
                          <Badge className={`text-[9px] ${badge.cls}`}>{badge.label}</Badge>
                        </div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">
                          Entry: <span className="font-bold text-foreground">{s.entry}</span>
                          {" · "}SL: <span className="font-bold text-destructive">{s.stopLoss}</span>
                          {s.tp1 && <>{" · "}TP1: <span className="font-bold text-emerald-500">{s.tp1}</span></>}
                        </div>
                        {s.profitUsd !== null && (
                          <div className={`mt-0.5 text-[10px] font-bold ${s.profitUsd >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                            {s.profitUsd >= 0 ? `+$${s.profitUsd}` : `-$${Math.abs(s.profitUsd)}`} {s.profitUsd >= 0 ? "profit" : "loss"}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => deleteMutation.mutate(s.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    <HitButton label="TP1 HIT" color="emerald" disabled={tp1Done || slDone || hitMutation.isPending} onClick={() => hitMutation.mutate({ id: s.id, action: "tp1" })} />
                    <HitButton label="TP2 HIT" color="sky" disabled={tp2Done || slDone || allTpDone || hitMutation.isPending} onClick={() => hitMutation.mutate({ id: s.id, action: "tp2" })} />
                    <HitButton label="TP3 HIT" color="blue" disabled={tp3Done || slDone || hitMutation.isPending} onClick={() => hitMutation.mutate({ id: s.id, action: "tp3" })} />
                    <HitButton label="SL HIT" color="red" disabled={slDone || hitMutation.isPending} onClick={() => hitMutation.mutate({ id: s.id, action: "sl" })} />
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {signals.length > activeSignals.length && (
        <p className="text-center text-[10px] text-muted-foreground">
          {signals.length - activeSignals.length} closed signal(s) hidden.
        </p>
      )}

      {/* ─────────────────────────────────────────────────────────────
          FULLSCREEN CHART OVERLAY
          Opens when chartFullscreen = true. Renders the TradingView chart in
          a full-viewport overlay with touch-action:none so the admin can draw
          + zoom without the page scrolling. Body scroll is locked via the
          useEffect above. Exit via the X button (top-right) or the Exit button.
          ───────────────────────────────────────────────────────────── */}
      {chartFullscreen && (
        <div
          className="fixed inset-0 z-[300] flex flex-col bg-[#0A1929]"
          style={{ touchAction: "none", overscrollBehavior: "contain" }}
        >
          {/* Overlay header — pair name + exit */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#0B1B2E] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white">{pairLabel(symbol)}</span>
              {livePrice !== null && (
                <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-bold text-emerald-400">
                  <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                  {formatPrice(symbol, livePrice)}
                </span>
              )}
              <span className="text-[10px] text-white/40">Fullscreen · Draw freely, page won't scroll</span>
            </div>
            <button
              type="button"
              onClick={() => setChartFullscreen(false)}
              title="Exit fullscreen"
              className="flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/20 active:scale-95"
            >
              <Minimize2 className="h-4 w-4" /> Exit
            </button>
          </div>
          {/* Chart fills the rest of the overlay */}
          <div className="relative flex-1" style={{ minHeight: 0 }}>
            <div ref={fullscreenChartRef} style={{ height: "100%", width: "100%" }} />
          </div>
        </div>
      )}
    </div>
  )
}

function HitButton({
  label, color, disabled, onClick,
}: {
  label: string
  color: "emerald" | "sky" | "blue" | "red"
  disabled: boolean
  onClick: () => void
}) {
  const colorCls: Record<string, string> = {
    emerald: "bg-emerald-500 hover:bg-emerald-600 text-white",
    sky: "bg-sky-500 hover:bg-sky-600 text-white",
    blue: "bg-blue-800 hover:bg-blue-900 text-white",
    red: "bg-red-600 hover:bg-red-700 text-white",
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${colorCls[color]}`}
    >
      {disabled ? <CheckCircle2 className="h-3 w-3" /> : color === "red" ? <XCircle className="h-3 w-3" /> : null}
      {label}
    </button>
  )
}
