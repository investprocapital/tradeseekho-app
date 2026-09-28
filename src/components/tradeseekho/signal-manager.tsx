"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Save, Trash2, Loader2, TrendingUp, TrendingDown, Camera,
  CheckCircle2, XCircle, Bell, Zap, RefreshCw,
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
  status: string // active | tp1_hit | tp2_hit | tp3_hit | sl_hit | closed
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

// Status badge config for a signal row.
const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  active: { label: "ACTIVE", cls: "bg-brand text-brand-foreground" },
  tp1_hit: { label: "TP1 HIT ✅", cls: "bg-emerald-500 text-white" },
  tp2_hit: { label: "TP2 HIT ✅", cls: "bg-sky-500 text-white" },
  tp3_hit: { label: "TP3 HIT ✅", cls: "bg-blue-800 text-white" },
  sl_hit: { label: "SL HIT ❌", cls: "bg-red-600 text-white" },
  closed: { label: "CLOSED", cls: "bg-muted text-muted-foreground" },
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

  // Live price state (BUG 2: auto-fill Entry/SL/TP from TradingView live price).
  const [livePrice, setLivePrice] = useState<number | null>(null)
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceSource, setPriceSource] = useState<string>("")

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

  // PATCH a TP/SL hit. Updates status + broadcasts a notification to all users.
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

  // ---------- BUG 2: Live price auto-fill ----------
  // Fetches the live mid price from /api/price (Yahoo Finance, server-side).
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

  // Auto-fetch live price on mount + whenever the symbol changes.
  useEffect(() => {
    void fetchPrice(symbol)
  }, [symbol, fetchPrice])

  // Fill Entry/SL/TP from the live price using per-pair default offsets.
  // Fields stay fully editable afterwards.
  const applyLivePrice = useCallback(
    async (mode: "all" | "entryOnly" = "all") => {
      const p = livePrice ?? (await fetchPrice(symbol))
      if (p === null) return
      const levels = suggestLevels(
        symbol,
        signalType === "SELL" ? "SELL" : "BUY",
        p,
      )
      setEntry(levels.entry)
      if (mode === "all") {
        setStopLoss(levels.stopLoss)
        setTp1(levels.tp1)
        setTp2(levels.tp2)
        setTp3(levels.tp3)
      }
      toast.success(
        `Auto-filled from live price (${formatPrice(symbol, p)}) — edit as needed`,
      )
      // Regenerate the screenshot so it reflects the new levels.
      setTimeout(() => captureScreenshot(), 0)
    },
    [livePrice, symbol, signalType, fetchPrice],
  )

  // ---------- BUG 1: professional signal-card screenshot ----------
  // We can't screenshot the cross-origin TradingView iframe, so we render a
  // clean, branded signal card to canvas. This is what the client shows as the
  // "chart image". Auto-regenerates whenever levels change so it's never stale.
  const captureScreenshot = useCallback(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 900
    canvas.height = 500
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const isBuy = signalType === "BUY"
    const accent = isBuy ? "#00D09C" : "#FF6B6B"
    const W = 900, H = 500

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, "#0B1B2E")
    bg.addColorStop(1, "#0A1929")
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Top accent bar
    ctx.fillStyle = accent
    ctx.fillRect(0, 0, W, 5)

    // Header row: pair name (big) + BUY/SELL pill
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "bold 38px Arial"
    ctx.fillText(pairLabel(symbol), 30, 60)

    // BUY/SELL pill
    const pillText = signalType
    ctx.font = "bold 22px Arial"
    const pillW = ctx.measureText(pillText).width + 36
    ctx.fillStyle = accent
    roundRect(ctx, W - pillW - 30, 32, pillW, 38, 19)
    ctx.fill()
    ctx.fillStyle = "#0A1929"
    ctx.fillText(pillText, W - pillW - 30 + 18, 58)

    // Live price line (top-right under pill)
    if (livePrice !== null) {
      ctx.fillStyle = "#8AA2B8"
      ctx.font = "13px Arial"
      ctx.fillText(`LIVE: ${formatPrice(symbol, livePrice)}`, W - 180, 92)
    }

    // Price-level visualization (the "chart" part)
    // A vertical ladder: SL (red, bottom for BUY) -> Entry (white) -> TP1/2/3 (green, top)
    const ladderX = 60
    const ladderTop = 120
    const ladderBottom = 420
    const ladderH = ladderBottom - ladderTop

    const entryNum = parseFloat(entry)
    const slNum = parseFloat(stopLoss)
    const tp1Num = parseFloat(tp1)
    const tp2Num = parseFloat(tp2)
    const tp3Num = parseFloat(tp3)

    // Compute price range across all levels
    const nums = [entryNum, slNum, tp1Num, tp2Num, tp3Num].filter((n) => Number.isFinite(n))
    if (nums.length >= 2) {
      const min = Math.min(...nums)
      const max = Math.max(...nums)
      const range = Math.max(max - min, 1e-6)
      const pad = range * 0.15
      const lo = min - pad
      const hi = max + pad
      const yFor = (v: number) => ladderBottom - ((v - lo) / (hi - lo)) * ladderH

      // Vertical axis line
      ctx.strokeStyle = "#1E3A5F"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(ladderX, ladderTop)
      ctx.lineTo(ladderX, ladderBottom)
      ctx.stroke()

      // Draw each level as a horizontal line + label
      const drawLevel = (
        val: number, color: string, label: string, price: string, x: number,
      ) => {
        if (!Number.isFinite(val)) return
        const y = yFor(val)
        ctx.strokeStyle = color
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(x - 8, y)
        ctx.lineTo(x + 380, y)
        ctx.stroke()
        // Label box
        ctx.fillStyle = color
        roundRect(ctx, x + 390, y - 14, 150, 28, 6)
        ctx.fill()
        ctx.fillStyle = "#0A1929"
        ctx.font = "bold 13px Arial"
        ctx.fillText(`${label}: ${price}`, x + 400, y + 5)
      }

      // Order: for BUY, SL at bottom then Entry then TPs going up.
      drawLevel(slNum, "#FF6B6B", "SL", stopLoss, ladderX)
      drawLevel(entryNum, "#FFFFFF", "ENTRY", entry, ladderX)
      drawLevel(tp1Num, "#00D09C", "TP1", tp1, ladderX)
      drawLevel(tp2Num, "#22D3EE", "TP2", tp2, ladderX)
      drawLevel(tp3Num, "#3B82F6", "TP3", tp3, ladderX)
    } else {
      // Not enough data — show a hint
      ctx.fillStyle = "#445566"
      ctx.font = "italic 16px Arial"
      ctx.fillText("Fill Entry + SL + TP levels to render the chart", 60, 270)
    }

    // Note (if any)
    if (note) {
      ctx.fillStyle = "#8AA2B8"
      ctx.font = "14px Arial"
      const trimmed = note.length > 80 ? note.slice(0, 77) + "…" : note
      ctx.fillText(`📝 ${trimmed}`, 30, 455)
    }

    // Branding footer
    ctx.fillStyle = "#445566"
    ctx.font = "11px Arial"
    ctx.fillText("TradeSeekho PK · LEARN TRADE GROW", 30, 482)
    const now = new Date().toLocaleString("en-GB", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    })
    ctx.fillText(now, W - 130, 482)

    setScreenshot(canvas.toDataURL("image/png"))
  }, [symbol, signalType, entry, stopLoss, tp1, tp2, tp3, note, livePrice])

  // Auto-capture whenever the form values change (so screenshot is always fresh
  // + never null at publish time — fixes the "chart_image_url null" bug).
  useEffect(() => {
    if (entry || stopLoss || tp1) {
      captureScreenshot()
    }
  }, [entry, stopLoss, tp1, tp2, tp3, note, signalType, captureScreenshot])

  const publish = () => {
    if (!entry || !stopLoss) { toast.error("Entry and SL required"); return }
    // Ensure a screenshot exists — auto-capture if missing.
    let finalShot = screenshot
    if (!finalShot) {
      captureScreenshot()
      finalShot = screenshot
    }
    if (!finalShot) { toast.error("Could not capture chart image"); return }
    setBusy(true)
    createMutation.mutateAsync({
      symbol, signalType, entry, stopLoss,
      tp1: tp1 || null, tp2: tp2 || null, tp3: tp3 || null,
      note: note || null, screenshot: finalShot,
    }).finally(() => setBusy(false))
  }

  const signals = data?.signals ?? []
  // "Active" = still in play (not closed). These show the 4 hit buttons.
  const activeSignals = signals.filter((s) => s.status !== "closed")

  return (
    <div className="space-y-4">
      {/* Create Signal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-brand" /> Create Signal</CardTitle>
          <CardDescription>Draw on chart, fetch live price, publish to all users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {/* Symbol + Live Price + Get Live Price button */}
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

              {/* Live price chip */}
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5">
                {priceLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                ) : livePrice !== null ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-bold text-emerald-500">{formatPrice(symbol, livePrice)}</span>
                  </>
                ) : (
                  <span className="text-[11px] text-muted-foreground">no price</span>
                )}
              </div>

              {/* Get Live Price button — auto-fills Entry/SL/TP */}
              <Button
                size="sm"
                variant="default"
                className="gap-1.5 bg-brand font-bold text-brand-foreground hover:bg-brand/90"
                onClick={() => applyLivePrice("all")}
                disabled={priceLoading}
              >
                {priceLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                Get Live Price
              </Button>

              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => fetchPrice(symbol)} disabled={priceLoading}>
                <RefreshCw className={`h-3.5 w-3.5 ${priceLoading ? "animate-spin" : ""}`} />
              </Button>

              <Button size="sm" variant="outline" className="gap-1.5" onClick={captureScreenshot}>
                <Camera className="h-3.5 w-3.5" /> Capture
              </Button>
            </div>

            {priceSource && (
              <p className="text-[10px] text-muted-foreground">
                Price source: {priceSource} · Click <span className="font-bold text-brand">Get Live Price</span> to auto-fill Entry/SL/TP (editable).
              </p>
            )}

            {/* TradingView chart with draw tools */}
            <div className="overflow-hidden rounded-xl border border-border" style={{ height: "400px" }}>
              <iframe
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tvchart&symbol=${encodeURIComponent(symbol)}&interval=15&theme=dark&style=1&timezone=Asia%2FKarachi&hidesidetoolbar=0&toolbarbg=f1f3f6&studies=[]&hideideas=1&saveimage=1`}
                style={{ width: "100%", height: "100%", border: "none" }}
                allowFullScreen
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Use TradingView drawing tools (left toolbar) to draw S/R, Trendlines, Fibonacci. The chart image preview below auto-updates as you fill levels.
            </p>
          </div>

          {/* Screenshot preview — auto-generated signal card */}
          {screenshot && (
            <div className="rounded-xl border border-border overflow-hidden">
              <img src={screenshot} alt="Chart screenshot" className="w-full" />
            </div>
          )}

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
            <div className="space-y-1">
              <Label className="text-xs flex items-center justify-between">
                Entry Price
                <button
                  onClick={() => applyLivePrice("entryOnly")}
                  className="text-[10px] font-bold text-brand hover:underline"
                  type="button"
                >
                  use live
                </button>
              </Label>
              <Input value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="e.g. 2025.50" className="h-9" />
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
                  {/* Row 1: signal info + status badge + delete */}
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

                  {/* Row 2: the 4 TP/SL HIT buttons */}
                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    <HitButton
                      label="TP1 HIT"
                      color="emerald"
                      disabled={tp1Done || slDone || hitMutation.isPending}
                      onClick={() => hitMutation.mutate({ id: s.id, action: "tp1" })}
                    />
                    <HitButton
                      label="TP2 HIT"
                      color="sky"
                      disabled={tp2Done || slDone || allTpDone || hitMutation.isPending}
                      onClick={() => hitMutation.mutate({ id: s.id, action: "tp2" })}
                    />
                    <HitButton
                      label="TP3 HIT"
                      color="blue"
                      disabled={tp3Done || slDone || hitMutation.isPending}
                      onClick={() => hitMutation.mutate({ id: s.id, action: "tp3" })}
                    />
                    <HitButton
                      label="SL HIT"
                      color="red"
                      disabled={slDone || hitMutation.isPending}
                      onClick={() => hitMutation.mutate({ id: s.id, action: "sl" })}
                    />
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Closed/historical signals count */}
      {signals.length > activeSignals.length && (
        <p className="text-center text-[10px] text-muted-foreground">
          {signals.length - activeSignals.length} closed signal(s) hidden.
        </p>
      )}
    </div>
  )
}

// Helper: rounded-rectangle path for the canvas screenshot.
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// A colored TP/SL HIT button. When already hit, shows a checkmark and is disabled.
function HitButton({
  label,
  color,
  disabled,
  onClick,
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
