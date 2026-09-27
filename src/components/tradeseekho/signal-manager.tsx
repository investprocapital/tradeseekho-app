"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Save, Trash2, Loader2, TrendingUp, TrendingDown, Camera } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

const SYMBOLS = [
  { value: "OANDA:XAUUSD", label: "Gold (XAU/USD)" },
  { value: "BINANCE:BTCUSDT", label: "Bitcoin (BTC/USDT)" },
  { value: "FX:EURUSD", label: "EUR/USD" },
  { value: "FX:GBPUSD", label: "GBP/USD" },
]

async function fetchSignals() {
  const res = await fetch("/api/admin/signals")
  if (!res.ok) throw new Error("failed")
  return res.json()
}

export function SignalManager() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["admin-signals"], queryFn: fetchSignals })
  const chartRef = useRef<HTMLDivElement>(null)

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
      toast.success("Signal deleted")
    },
  })

  const captureScreenshot = () => {
    // Use TradingView's built-in screenshot via the chart's save_image feature
    // We'll use the chart iframe's content as a screenshot
    // Since we can't directly screenshot an iframe due to CORS, we'll use a different approach:
    // Generate a visual representation of the signal
    const canvas = document.createElement("canvas")
    canvas.width = 800
    canvas.height = 400
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Dark background
    ctx.fillStyle = "#0A1929"
    ctx.fillRect(0, 0, 800, 400)

    // Symbol text
    ctx.fillStyle = "#00D09C"
    ctx.font = "bold 24px Arial"
    ctx.fillText(symbol.split(":")[1] || symbol, 20, 35)

    // Signal type
    ctx.fillStyle = signalType === "BUY" ? "#00D09C" : "#FF6B6B"
    ctx.font = "bold 20px Arial"
    ctx.fillText(signalType, 700, 35)

    // Signal details
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

    // Branding
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

  return (
    <div className="space-y-4">
      {/* Create Signal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-brand" /> Create Signal</CardTitle>
          <CardDescription>Draw on chart, fill details, publish to all users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chart + Symbol selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="h-9 rounded-lg border border-border bg-card px-3 text-sm font-bold"
              >
                {SYMBOLS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={captureScreenshot}>
                <Camera className="h-3.5 w-3.5" /> Capture Chart
              </Button>
            </div>
            {/* TradingView chart with draw tools */}
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

          {/* Screenshot preview */}
          {screenshot && (
            <div className="rounded-xl border border-border overflow-hidden">
              <img src={screenshot} alt="Chart screenshot" className="w-full" />
            </div>
          )}

          <Separator />

          {/* Signal fields */}
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

      {/* Existing Signals */}
      <Card>
        <CardHeader>
          <CardTitle>Published Signals ({signals.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : signals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No signals yet.</p>
          ) : (
            signals.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  {s.screenshot && <img src={s.screenshot} alt="" className="h-10 w-14 rounded object-cover" />}
                  <div>
                    <div className="text-sm font-bold">{s.symbol.split(":")[1]}</div>
                    <div className="flex items-center gap-1.5">
                      <Badge className={s.signalType === "BUY" ? "bg-brand text-brand-foreground text-[9px]" : "bg-destructive text-white text-[9px]"}>{s.signalType}</Badge>
                      <span className="text-[10px] text-muted-foreground">Entry: {s.entry}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(s.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
