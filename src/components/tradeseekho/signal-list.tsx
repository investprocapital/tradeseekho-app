"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, TrendingDown, X, Copy, BarChart3, ChevronRight, CheckCircle2, XCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { pairLabel } from "@/lib/signals"

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
  status: string // active | tp1_hit | tp2_hit | tp3_hit | sl_hit
  tp1HitAt: string | null
  tp2HitAt: string | null
  tp3HitAt: string | null
  slHitAt: string | null
  profitUsd: number | null
  createdAt: string
}

async function fetchSignals() {
  const res = await fetch("/api/signals")
  if (!res.ok) throw new Error("failed")
  return res.json() as Promise<{ signals: Signal[] }>
}

// Client-side status badge (mirrors the admin config).
const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  active: { label: "ACTIVE", cls: "bg-brand text-brand-foreground" },
  tp1_hit: { label: "TP1 HIT ✅", cls: "bg-emerald-500 text-white" },
  tp2_hit: { label: "TP2 HIT ✅", cls: "bg-sky-500 text-white" },
  tp3_hit: { label: "TP3 HIT ✅", cls: "bg-blue-800 text-white" },
  sl_hit: { label: "SL HIT ❌", cls: "bg-red-600 text-white" },
}

export function SignalList() {
  const { data, isLoading } = useQuery({ queryKey: ["signals"], queryFn: fetchSignals, staleTime: 30_000 })
  const [selected, setSelected] = useState<Signal | null>(null)
  const [showChart, setShowChart] = useState(false)

  const signals = data?.signals ?? []

  const copyTrade = (s: Signal) => {
    const text = `${s.signalType} ${pairLabel(s.symbol)}\nEntry: ${s.entry}\nSL: ${s.stopLoss}${s.tp1 ? `\nTP1: ${s.tp1}` : ""}${s.tp2 ? `\nTP2: ${s.tp2}` : ""}${s.tp3 ? `\nTP3: ${s.tp3}` : ""}${s.note ? `\nNote: ${s.note}` : ""}\n\n— TradeSeekho PK`
    navigator.clipboard?.writeText(text)
    toast.success("Signal copied!")
  }

  const shareSignal = (s: Signal) => {
    const text = `${s.signalType} ${pairLabel(s.symbol)}\nEntry: ${s.entry}\nSL: ${s.stopLoss}${s.tp1 ? `\nTP1: ${s.tp1}` : ""}${s.tp2 ? `\nTP2: ${s.tp2}` : ""}${s.tp3 ? `\nTP3: ${s.tp3}` : ""}\n\n— TradeSeekho PK\nhttps://tradeseekho-app.vercel.app`
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
          {signals.map((s) => {
            const badge = STATUS_BADGE[s.status] ?? STATUS_BADGE.active
            const isLoss = s.status === "sl_hit"
            return (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelected(s)}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-start transition hover:border-brand/50"
              >
                {s.screenshot && <img src={s.screenshot} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" draggable={false} />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold">{pairLabel(s.symbol)}</span>
                    <Badge className={s.signalType === "BUY" ? "bg-brand text-brand-foreground text-[9px]" : "bg-destructive text-white text-[9px]"}>
                      {s.signalType === "BUY" ? <TrendingUp className="mr-0.5 h-2.5 w-2.5" /> : <TrendingDown className="mr-0.5 h-2.5 w-2.5" />}
                      {s.signalType}
                    </Badge>
                    {/* TP/SL HIT badge — the key Phase-1 feature */}
                    {s.status !== "active" && (
                      <Badge className={`text-[9px] ${badge.cls}`}>{badge.label}</Badge>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    Entry: <span className="font-bold text-foreground">{s.entry}</span>
                    {" · "}SL: <span className="font-bold text-destructive">{s.stopLoss}</span>
                    {s.tp1 && <span>{" · "}TP: <span className="font-bold text-brand">{s.tp1}</span></span>}
                  </div>
                  {/* Profit/loss line when a hit has occurred */}
                  {s.profitUsd !== null && (
                    <div className={`mt-0.5 text-[10px] font-bold ${s.profitUsd >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                      {isLoss ? "❌ " : "✅ "}{s.profitUsd >= 0 ? `+$${s.profitUsd}` : `-$${Math.abs(s.profitUsd)}`} {s.profitUsd >= 0 ? "Profit" : "Loss"}
                    </div>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </motion.button>
            )
          })}
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
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={selected.signalType === "BUY" ? "bg-brand text-brand-foreground" : "bg-destructive text-white"}>
                    {selected.signalType}
                  </Badge>
                  <span className="text-lg font-extrabold">{pairLabel(selected.symbol)}</span>
                  {selected.status !== "active" && (
                    <Badge className={`text-[10px] ${(STATUS_BADGE[selected.status] ?? STATUS_BADGE.active).cls}`}>
                      {(STATUS_BADGE[selected.status] ?? STATUS_BADGE.active).label}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelected(null); setShowChart(false) }}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Screenshot */}
              {selected.screenshot && (
                <div className="relative">
                  <img src={selected.screenshot} alt="Chart" className="w-full" draggable={false} />
                  {/* Entry/SL/TP labels overlay — highlight the hit ones */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="rounded bg-brand/90 px-2 py-0.5 text-[10px] font-bold text-white">Entry: {selected.entry}</span>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold text-white ${selected.slHitAt ? "bg-red-600" : "bg-destructive/90"}`}>
                      SL: {selected.stopLoss} {selected.slHitAt && "❌"}
                    </span>
                    {selected.tp1 && (
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold text-white ${selected.tp1HitAt ? "bg-emerald-500" : "bg-brand/90"}`}>
                        TP1: {selected.tp1} {selected.tp1HitAt && "✅"}
                      </span>
                    )}
                    {selected.tp2 && (
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold text-white ${selected.tp2HitAt ? "bg-sky-500" : "bg-brand/80"}`}>
                        TP2: {selected.tp2} {selected.tp2HitAt && "✅"}
                      </span>
                    )}
                    {selected.tp3 && (
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold text-white ${selected.tp3HitAt ? "bg-blue-800" : "bg-brand/70"}`}>
                        TP3: {selected.tp3} {selected.tp3HitAt && "✅"}
                      </span>
                    )}
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
                  <div className={`rounded-lg p-2.5 ${selected.slHitAt ? "bg-red-500/15 ring-1 ring-red-500/40" : "bg-destructive/10"}`}>
                    <div className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                      Stop Loss {selected.slHitAt && <XCircle className="h-3 w-3 text-destructive" />}
                    </div>
                    <div className="text-sm font-bold text-destructive">{selected.stopLoss}</div>
                  </div>
                  <div className={`rounded-lg p-2.5 ${selected.tp1HitAt ? "bg-emerald-500/15 ring-1 ring-emerald-500/40" : "bg-brand-muted/40"}`}>
                    <div className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                      TP1 {selected.tp1HitAt && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                    </div>
                    <div className="text-sm font-bold text-brand">{selected.tp1 ?? "—"}</div>
                  </div>
                  <div className={`rounded-lg p-2.5 ${selected.tp2HitAt ? "bg-sky-500/15 ring-1 ring-sky-500/40" : "bg-brand-muted/40"}`}>
                    <div className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                      TP2 {selected.tp2HitAt && <CheckCircle2 className="h-3 w-3 text-sky-500" />}
                    </div>
                    <div className="text-sm font-bold text-brand">{selected.tp2 ?? "—"}</div>
                  </div>
                  <div className={`col-span-2 rounded-lg p-2.5 ${selected.tp3HitAt ? "bg-blue-800/15 ring-1 ring-blue-800/40" : "bg-brand-muted/40"}`}>
                    <div className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                      TP3 {selected.tp3HitAt && <CheckCircle2 className="h-3 w-3 text-blue-800" />}
                    </div>
                    <div className="text-sm font-bold text-brand">{selected.tp3 ?? "—"}</div>
                  </div>
                </div>

                {/* Profit banner when a hit has occurred */}
                {selected.profitUsd !== null && (
                  <div className={`rounded-lg p-3 text-center ${selected.profitUsd >= 0 ? "bg-emerald-500/10" : "bg-destructive/10"}`}>
                    <div className={`text-xl font-extrabold ${selected.profitUsd >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                      {selected.profitUsd >= 0 ? `+$${selected.profitUsd}` : `-$${Math.abs(selected.profitUsd)}`}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {selected.profitUsd >= 0 ? "Realized Profit" : "Realized Loss"}
                    </div>
                  </div>
                )}

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
