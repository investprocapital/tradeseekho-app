"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Save, Trash2, Loader2, TrendingUp, TrendingDown, Camera,
  CheckCircle2, XCircle, Bell,
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { SIGNAL_SYMBOLS, pairLabel, type HitAction } from "@/lib/signals"

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

  const captureScreenshot = () => {
    // Generate a visual representation of the signal as a chart screenshot.
    const canvas = document.createElement("canvas")
    canvas.width = 800
    canvas.height = 400
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#0A1929"
    ctx.fillRect(0, 0, 800, 400)

    ctx.fillStyle = "#00D09C"
    ctx.font = "bold 24px Arial"
    ctx.fillText(pairLabel(symbol), 20, 35)

    ctx.fillStyle = signalType === "BUY" ? "#00D09C" : "#FF6B6B"
    ctx.font = "bold 20px Arial"
    ctx.fillText(signalType, 700, 35)

    ctx.fillStyle = "#FFFFFF"
    ctx.font = "14px Arial"
    let y = 70
    if (entry) { ctx.fillText(`Entry: ${entry}`, 20, y); y += 25 }
    if (stopLoss) { ctx.fillStyle = "#FF6B6B"; ctx.fillText(`SL: ${stopLoss}`, 20, y); y += 25 }
    ctx.fillStyle = "#00D09C"
    if (tp1) { ctx.fillText(`TP1: ${tp1}`, 20, y); y += 25 }
    if (tp2) { ctx.fillText(`TP2: ${tp2}`, 20, y); y += 25 }
    if (tp3) { ctx.fillText(`TP3: ${tp3}`, 20, y); y += 25 }
    if (note) { ctx.fillStyle = "#888"; ctx.font = "12px Arial"; ctx.fillText(`Note: ${note.slice(0, 60)}`, 20, y) }

    ctx.fillStyle = "#444"
    ctx.font = "10px Arial"
    ctx.fillText("TradeSeekho PK · LEARN TRADE GROW", 20, 385)

    setScreenshot(canvas.toDataURL("image/png"))
    toast.success("Screenshot captured!")
  }

  const publish = () => {
    if (!entry || !stopLoss) { toast.error("Entry and SL required"); return }
    if (!screenshot) { toast.error("Click 'Capture Chart' first"); return }
    setBusy(true)
    createMutation.mutateAsync({
      symbol, signalType, entry, stopLoss,
      tp1: tp1 || null, tp2: tp2 || null, tp3: tp3 || null,
      note: note || null, screenshot,
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
          <CardDescription>Draw on chart, fill details, publish to all users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="h-9 rounded-lg border border-border bg-card px-3 text-sm font-bold"
              >
                {SIGNAL_SYMBOLS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={captureScreenshot}>
                <Camera className="h-3.5 w-3.5" /> Capture Chart
              </Button>
            </div>
            <div className="overflow-hidden rounded-xl border border-border" style={{ height: "400px" }}>
              <iframe
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tvchart&symbol=${encodeURIComponent(symbol)}&interval=15&theme=dark&style=1&timezone=Asia%2FKarachi&hidesidetoolbar=0&toolbarbg=f1f3f6&studies=[]&hideideas=1&saveimage=1`}
                style={{ width: "100%", height: "100%", border: "none" }}
                allowFullScreen
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Use TradingView drawing tools (left toolbar) to draw S/R, Trendlines, Fibonacci. Then click "Capture Chart".
            </p>
          </div>

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
              <Label className="text-xs">Entry Price</Label>
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
              // Once SL is hit, the trade is over — disable TP buttons.
              // Once TP3 is hit, all targets done — disable further TP buttons.
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
