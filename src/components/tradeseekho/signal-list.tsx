"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, TrendingDown, X, Copy, BarChart3, ChevronRight, CheckCircle2, XCircle, Radio } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { useStore, useT } from "@/lib/store"
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
  // Aliases returned by the API for mobile/Flutter clients that expect
  // different field names. All point to the same base64 data URL.
  chart_image_url?: string
  chart_snapshot_url?: string
  status: string // active | tp1_hit | tp2_hit | tp3_hit | sl_hit
  tp1HitAt: string | null
  tp2HitAt: string | null
  tp3HitAt: string | null
  slHitAt: string | null
  profitUsd: number | null
  // When true, the client hides Entry/SL/TP values — only shows chart image.
  hideLevels?: boolean
  createdAt: string
}

async function fetchSignals() {
  const res = await fetch("/api/signals")
  if (!res.ok) throw new Error("failed")
  return res.json() as Promise<{ signals: Signal[] }>
}

// Resolve the chart image URL. Checks all three field names the API returns
// (screenshot / chart_image_url / chart_snapshot_url) so any client — web or
// Flutter — gets the captured chart image. Returns "" when none exist.
function chartImage(s: Signal): string {
  return s.screenshot || s.chart_image_url || s.chart_snapshot_url || ""
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
  const signalsOpen = useStore((s) => s.signalsOpen)
  const setSignalsOpen = useStore((s) => s.setSignalsOpen)
  const t = useT()
  const lang = useStore((s) => s.lang)
  const rtlFont = lang === "ur" ? "font-urdu" : lang === "ar" ? "font-arabic" : ""

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

  // Summary box content:
  // - 1 signal → show "PAIR - BUY/SELL" (e.g. "OIL - BUY")
  // - multiple signals → show "N Active: GOLD, BTC, EURUSD" (max 4 names)
  const pairNames = signals.map((s) => pairLabel(s.symbol))
  const summaryText =
    signals.length === 1
      ? `${pairNames[0]} - ${signals[0].signalType}`
      : `${signals.length} Active: ${pairNames.slice(0, 4).join(", ")}${pairNames.length > 4 ? "…" : ""}`

  return (
    <>
      <section className="mt-2">
        {/* Clickable summary box — opens the full signals list in a Sheet.
            Single signal → "OIL - BUY". Multiple → "3 Active: GOLD, BTC, EURUSD". */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setSignalsOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl border-2 border-brand/30 bg-gradient-to-r from-brand/5 to-transparent p-3 text-start transition hover:border-brand/60 hover:from-brand/10 active:scale-[0.99]"
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
            <Radio className="h-5 w-5 animate-pulse" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-foreground">Live Signals</span>
              <span className="rounded-full bg-brand/15 px-1.5 py-0.5 text-[9px] font-bold text-brand">
                {signals.length} active
              </span>
            </div>
            <div className="mt-0.5 truncate text-[11px] font-black text-muted-foreground">
              {summaryText}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-brand" />
        </motion.button>
      </section>

      {/* Full signals list — opens in a right-side Sheet when the summary box
          is clicked. Shows all active signals as individual cards. */}
      <Sheet open={signalsOpen} onOpenChange={setSignalsOpen}>
        <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border p-5">
            <SheetTitle className="flex items-center gap-2 text-xl font-black">
              <Radio className="h-5 w-5 text-brand animate-pulse" /> Live Signals
            </SheetTitle>
            <SheetDescription>
              {signals.length} active signal{signals.length !== 1 ? "s" : ""} · tap any to view details
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="ts-scroll flex-1">
            <div className="p-4">
              <div className="grid gap-2.5">
                {signals.map((s) => {
                  const badge = STATUS_BADGE[s.status] ?? STATUS_BADGE.active
                  const isLoss = s.status === "sl_hit"
                  return (
                    <motion.button
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => { setSelected(s); setSignalsOpen(false) }}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-start transition hover:border-brand/50"
                    >
                      {chartImage(s) ? (
                        <img src={chartImage(s)} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" draggable={false} />
                      ) : (
                        <div className="flex h-12 w-16 shrink-0 flex-col justify-center rounded-lg bg-gradient-to-br from-[#0B1B2E] to-[#0A1929] px-1.5">
                          <span className="text-[8px] font-bold text-white">{pairLabel(s.symbol)}</span>
                          <span className={`text-[8px] font-bold ${s.signalType === "BUY" ? "text-emerald-400" : "text-red-400"}`}>{s.signalType}</span>
                          {!s.hideLevels && <span className="text-[7px] text-white/60">{s.entry}</span>}
                          {s.hideLevels && <span className="text-[7px] text-gold/80">🔒</span>}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold">{pairLabel(s.symbol)}</span>
                          <Badge className={s.signalType === "BUY" ? "bg-brand text-brand-foreground text-[9px]" : "bg-destructive text-white text-[9px]"}>
                            {s.signalType === "BUY" ? <TrendingUp className="mr-0.5 h-2.5 w-2.5" /> : <TrendingDown className="mr-0.5 h-2.5 w-2.5" />}
                            {s.signalType}
                          </Badge>
                          {s.status !== "active" && (
                            <Badge className={`text-[9px] ${badge.cls}`}>{badge.label}</Badge>
                          )}
                          {s.hideLevels && (
                            <Badge className="text-[9px] bg-gold/20 text-gold-foreground">CHART ONLY</Badge>
                          )}
                        </div>
                        {!s.hideLevels && (
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            Entry: <span className="font-bold text-foreground">{s.entry}</span>
                            {" · "}SL: <span className="font-bold text-destructive">{s.stopLoss}</span>
                            {s.tp1 && <span>{" · "}TP: <span className="font-bold text-brand">{s.tp1}</span></span>}
                          </div>
                        )}
                        {s.hideLevels && (
                          <div className={`mt-0.5 text-[11px] text-muted-foreground italic ${rtlFont}`}>
                            {t("signal.chartOnlyTap")}
                          </div>
                        )}
                        {!s.hideLevels && s.profitUsd !== null && (
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
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

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

              {/* Chart image — captured screenshot, or a styled fallback card.
                  When hideLevels is true, the Entry/SL/TP overlay labels on top
                  of the chart are ALSO hidden (per user requirement). Only the
                  raw chart image + the admin's drawings (S/R, Trendline) show. */}
              {chartImage(selected) ? (
                <div className="relative">
                  <img src={chartImage(selected)} alt="Chart" className="w-full" draggable={false} />
                  {/* Entry/SL/TP labels overlay — HIDDEN when hideLevels is true.
                      Only show when levels are meant to be visible. */}
                  {!selected.hideLevels && (
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
                  )}
                  {/* Watermark: "TradeSeekho PK" diagonally across the chart center.
                      Low opacity so it doesn't obscure the chart, but visible on
                      all shared chart images. Pointer-events:none so it doesn't
                      block chart interaction. */}
                  <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    style={{ opacity: 0.12 }}
                  >
                    <span
                      className="select-none text-2xl font-extrabold text-white"
                      style={{ transform: "rotate(-15deg)" }}
                    >
                      TradeSeekho PK
                    </span>
                  </div>
                </div>
              ) : selected.hideLevels ? (
                // No chart image + hideLevels=true → show a simple placeholder.
                <div
                  className="flex w-full items-center justify-center"
                  style={{ background: "linear-gradient(180deg,#0B1B2E 0%,#0A1929 100%)", height: 200 }}
                >
                  <span className={`text-sm text-white/40 ${rtlFont}`}>🔒 {t("signal.chartOnlyTitle")}</span>
                </div>
              ) : (
                // Fallback: a styled signal-card "chart" built from the levels
                // so the client never shows an empty dark box.
                <FallbackSignalCard s={selected} />
              )}

              {/* Signal details */}
              <div className="p-4 space-y-3">
                {/* Entry/SL/TP grid — HIDDEN when hideLevels is true.
                    Chart image always shows above; only the level values are hidden. */}
                {selected.hideLevels ? (
                  <div className="rounded-lg border border-gold/30 bg-gold/5 p-3 text-center">
                    <div className={`text-sm font-bold text-gold-foreground ${rtlFont}`}>🔒 {t("signal.chartOnlyTitle")}</div>
                    <div className={`mt-0.5 text-[11px] text-muted-foreground ${rtlFont}`}>
                      {t("signal.chartOnlyBody")}
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
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

/**
 * Fallback "chart" shown in the detail modal when a signal has no captured
 * screenshot image (chart_image_url was null). Renders a styled signal-card
 * with the price-level ladder so the client never shows an empty dark box.
 */
function FallbackSignalCard({ s }: { s: Signal }) {
  const isBuy = s.signalType === "BUY"
  const accent = isBuy ? "#00D09C" : "#FF6B6B"
  const nums = [
    { label: "SL", val: parseFloat(s.stopLoss), color: "#FF6B6B", hit: !!s.slHitAt },
    { label: "ENTRY", val: parseFloat(s.entry), color: "#FFFFFF", hit: false },
    { label: "TP1", val: s.tp1 ? parseFloat(s.tp1) : NaN, color: "#00D09C", hit: !!s.tp1HitAt },
    { label: "TP2", val: s.tp2 ? parseFloat(s.tp2) : NaN, color: "#22D3EE", hit: !!s.tp2HitAt },
    { label: "TP3", val: s.tp3 ? parseFloat(s.tp3) : NaN, color: "#3B82F6", hit: !!s.tp3HitAt },
  ].filter((n) => Number.isFinite(n.val))

  const min = Math.min(...nums.map((n) => n.val))
  const max = Math.max(...nums.map((n) => n.val))
  const range = Math.max(max - min, 1e-6)
  const pad = range * 0.15
  const lo = min - pad
  const hi = max + pad
  const pct = (v: number) => `${((hi - v) / (hi - lo)) * 100}%`

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ background: "linear-gradient(180deg,#0B1B2E 0%,#0A1929 100%)" }}
    >
      <div style={{ height: 4, background: accent }} />
      <div className="p-4">
        {/* Header: pair + BUY/SELL pill */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-extrabold text-white">{pairLabel(s.symbol)}</span>
          <span
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{ background: accent, color: "#0A1929" }}
          >
            {s.signalType}
          </span>
        </div>
        {/* Ladder */}
        <div className="relative mt-4 mb-2" style={{ height: 200 }}>
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-[#1E3A5F]" />
          {nums.map((n) => (
            <div
              key={n.label}
              className="absolute flex items-center"
              style={{ top: pct(n.val), left: 0, right: 0 }}
            >
              <div className="h-0.5 flex-1" style={{ background: n.color }} />
              <div
                className="ms-auto me-3 rounded px-2 py-0.5 text-[11px] font-bold"
                style={{ background: n.color, color: "#0A1929" }}
              >
                {n.label}: {n.val} {n.hit ? "✅" : ""}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1 text-center text-[10px] text-white/40">
          TradeSeekho PK · LEARN TRADE GROW
        </div>
      </div>
    </div>
  )
}
