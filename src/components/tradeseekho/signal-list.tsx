"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, TrendingDown, X, ArrowRight, Copy, BarChart3, ChevronRight } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Signal {
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
  createdAt: string
}

async function fetchSignals() {
  const res = await fetch("/api/signals")
  if (!res.ok) throw new Error("failed")
  return res.json() as Promise<{ signals: Signal[] }>
}

export function SignalList() {
  const { data, isLoading } = useQuery({ queryKey: ["signals"], queryFn: fetchSignals, staleTime: 30_000 })
  const [selected, setSelected] = useState<Signal | null>(null)
  const [showChart, setShowChart] = useState(false)

  const signals = data?.signals ?? []

  const symbolLabel = (s: string) => s.split(":")[1] || s

  const copyTrade = (s: Signal) => {
    const text = `${s.signalType} ${symbolLabel(s.symbol)}\nEntry: ${s.entry}\nSL: ${s.stopLoss}${s.tp1 ? `\nTP1: ${s.tp1}` : ""}${s.tp2 ? `\nTP2: ${s.tp2}` : ""}${s.tp3 ? `\nTP3: ${s.tp3}` : ""}${s.note ? `\nNote: ${s.note}` : ""}\n\n— TradeSeekho PK`
    navigator.clipboard?.writeText(text)
    toast.success("Signal copied!")
  }

  const shareSignal = (s: Signal) => {
    const text = `${s.signalType} ${symbolLabel(s.symbol)}\nEntry: ${s.entry}\nSL: ${s.stopLoss}${s.tp1 ? `\nTP1: ${s.tp1}` : ""}${s.tp2 ? `\nTP2: ${s.tp2}` : ""}${s.tp3 ? `\nTP3: ${s.tp3}` : ""}\n\n— TradeSeekho PK\nhttps://tradeseekho-app.vercel.app`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  if (isLoading) return null
  if (signals.length === 0) return null

  return (
    <>
      <section className="mt-2">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-base font-extrabold tracking-tight text-foreground flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-brand" />
            Live Signals
          </h2>
          <span className="text-[10px] font-bold text-muted-foreground">{signals.length} active</span>
        </div>
        <div className="grid gap-2.5">
          {signals.map((s) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelected(s)}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-start transition hover:border-brand/50"
            >
              {s.screenshot && <img src={s.screenshot} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" draggable={false} />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{symbolLabel(s.symbol)}</span>
                  <Badge className={s.signalType === "BUY" ? "bg-brand text-brand-foreground text-[9px]" : "bg-destructive text-white text-[9px]"}>
                    {s.signalType === "BUY" ? <TrendingUp className="mr-0.5 h-2.5 w-2.5" /> : <TrendingDown className="mr-0.5 h-2.5 w-2.5" />}
                    {s.signalType}
                  </Badge>
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  Entry: <span className="font-bold text-foreground">{s.entry}</span>
                  {" · "}SL: <span className="font-bold text-destructive">{s.stopLoss}</span>
                  {s.tp1 && <span>{" · "}TP: <span className="font-bold text-brand">{s.tp1}</span></span>}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Signal Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/70"
            onClick={() => { setSelected(null); setShowChart(false) }}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-background border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur p-4">
                <div className="flex items-center gap-2">
                  <Badge className={selected.signalType === "BUY" ? "bg-brand text-brand-foreground" : "bg-destructive text-white"}>
                    {selected.signalType}
                  </Badge>
                  <span className="text-lg font-extrabold">{symbolLabel(selected.symbol)}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelected(null); setShowChart(false) }}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Screenshot */}
              {selected.screenshot && (
                <div className="relative">
                  <img src={selected.screenshot} alt="Chart" className="w-full" draggable={false} />
                  {/* Entry/SL/TP labels overlay */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="rounded bg-brand/90 px-2 py-0.5 text-[10px] font-bold text-white">Entry: {selected.entry}</span>
                    <span className="rounded bg-destructive/90 px-2 py-0.5 text-[10px] font-bold text-white">SL: {selected.stopLoss}</span>
                    {selected.tp1 && <span className="rounded bg-brand/90 px-2 py-0.5 text-[10px] font-bold text-white">TP1: {selected.tp1}</span>}
                    {selected.tp2 && <span className="rounded bg-brand/80 px-2 py-0.5 text-[10px] font-bold text-white">TP2: {selected.tp2}</span>}
                    {selected.tp3 && <span className="rounded bg-brand/70 px-2 py-0.5 text-[10px] font-bold text-white">TP3: {selected.tp3}</span>}
                  </div>
                </div>
              )}

              {/* Signal details */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-muted/40 p-2.5">
                    <div className="text-[10px] uppercase text-muted-foreground">Entry</div>
                    <div className="text-sm font-bold text-foreground">{selected.entry}</div>
                  </div>
                  <div className="rounded-lg bg-destructive/10 p-2.5">
                    <div className="text-[10px] uppercase text-muted-foreground">Stop Loss</div>
                    <div className="text-sm font-bold text-destructive">{selected.stopLoss}</div>
                  </div>
                  {selected.tp1 && (
                    <div className="rounded-lg bg-brand-muted/40 p-2.5">
                      <div className="text-[10px] uppercase text-muted-foreground">TP1</div>
                      <div className="text-sm font-bold text-brand">{selected.tp1}</div>
                    </div>
                  )}
                  {selected.tp2 && (
                    <div className="rounded-lg bg-brand-muted/40 p-2.5">
                      <div className="text-[10px] uppercase text-muted-foreground">TP2</div>
                      <div className="text-sm font-bold text-brand">{selected.tp2}</div>
                    </div>
                  )}
                  {selected.tp3 && (
                    <div className="rounded-lg bg-brand-muted/40 p-2.5">
                      <div className="text-[10px] uppercase text-muted-foreground">TP3</div>
                      <div className="text-sm font-bold text-brand">{selected.tp3}</div>
                    </div>
                  )}
                </div>

                {selected.note && (
                  <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                    {selected.note}
                  </div>
                )}

                {/* Live Chart */}
                {showChart && (
                  <div className="overflow-hidden rounded-xl border border-border" style={{ height: "350px" }}>
                    <iframe
                      src={`https://s.tradingview.com/widgetembed/?frameElementId=tvchart&symbol=${encodeURIComponent(selected.symbol)}&interval=15&theme=dark&style=1&timezone=Asia%2FKarachi&hidesidetoolbar=0&toolbarbg=f1f3f6&studies=[]&hideideas=1`}
                      style={{ width: "100%", height: "100%", border: "none" }}
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1 gap-2 bg-brand font-bold text-brand-foreground hover:bg-brand/90"
                    onClick={() => setShowChart(!showChart)}
                  >
                    <BarChart3 className="h-4 w-4" /> {showChart ? "Hide Chart" : "View Live Chart"}
                  </Button>
                  <Button variant="outline" className="gap-2 font-bold" onClick={() => copyTrade(selected)}>
                    <Copy className="h-4 w-4" /> Copy
                  </Button>
                  <Button variant="outline" className="gap-2 font-bold" onClick={() => shareSignal(selected)}>
                    Share
                  </Button>
                </div>

                <p className="text-center text-[10px] text-muted-foreground">
                  Signal by TradeSeekho PK · {new Date(selected.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
