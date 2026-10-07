"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, BellRing, X, Trash2, Loader2, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react"
import { useStore } from "@/lib/store"
import { pairLabel, formatPrice } from "@/lib/signals"
import { toast } from "sonner"

interface WatchlistPair {
  symbol: string
  label: string
  pair: string
  category: string
  price: number
  change: number
  sell: number
  buy: number
  spread: number
  status: string
}

interface PriceAlert {
  id: string
  symbol: string
  targetPrice: number
  direction: string
  triggered: boolean
  createdAt: string
}

async function fetchWatchlist() {
  const res = await fetch("/api/watchlist", { cache: "no-store" })
  if (!res.ok) throw new Error("failed")
  return res.json() as Promise<{ pairs: WatchlistPair[] }>
}

async function fetchAlerts() {
  const res = await fetch("/api/price-alerts", { cache: "no-store" })
  if (!res.ok) throw new Error("failed")
  return res.json() as Promise<{ alerts: PriceAlert[] }>
}

const PAIR_ICONS: Record<string, string> = {
  "OANDA:XAUUSD": "🥇",
  "FX:EURUSD": "💶",
  "FX:GBPUSD": "💷",
  "BINANCE:BTCUSDT": "₿",
  "BINANCE:ETHUSDT": "Ξ",
  "TVC:USOIL": "🛢️",
}

export function PriceAlertSheet() {
  const open = useStore((s) => s.priceAlertsOpen)
  const setOpen = useStore((s) => s.setPriceAlertsOpen)
  const { data: session } = useSession()
  const qc = useQueryClient()

  const [selectedSymbol, setSelectedSymbol] = useState("OANDA:XAUUSD")
  const [targetPrice, setTargetPrice] = useState("")
  const [direction, setDirection] = useState<"above" | "below">("above")

  // Fetch watchlist (auto-refresh every 15s)
  const { data: watchData, isLoading: watchLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: fetchWatchlist,
    staleTime: 10_000,
    refetchInterval: 15_000,
  })

  // Fetch user's alerts
  const { data: alertsData } = useQuery({
    queryKey: ["price-alerts"],
    queryFn: fetchAlerts,
    staleTime: 10_000,
  })

  const createMutation = useMutation({
    mutationFn: async (data: { symbol: string; targetPrice: number; direction: string }) => {
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to set alert")
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["price-alerts"] })
      toast.success("Price alert set! 🔔")
      setTargetPrice("")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/price-alerts?id=${id}`, { method: "DELETE" })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["price-alerts"] })
      toast.success("Alert deleted")
    },
  })

  const pairs = watchData?.pairs ?? []
  const alerts = alertsData?.alerts ?? []
  const selectedPair = pairs.find((p) => p.symbol === selectedSymbol)

  // Auto-fill target price with current price when symbol changes.
  // We use the "adjust-during-render" pattern (same as admin-panel) to avoid
  // the setState-in-effect lint error.
  const [prevSymbol, setPrevSymbol] = useState(selectedSymbol)
  if (prevSymbol !== selectedSymbol) {
    setPrevSymbol(selectedSymbol)
    if (selectedPair) {
      setTargetPrice(String(selectedPair.price))
    }
  }

  const onSetAlert = () => {
    const price = parseFloat(targetPrice)
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Please enter a valid target price")
      return
    }
    createMutation.mutate({ symbol: selectedSymbol, targetPrice: price, direction })
  }

  const activeAlertSymbols = alerts.filter((a) => !a.triggered).map((a) => a.symbol)
  const summaryText = activeAlertSymbols.length > 0
    ? `${activeAlertSymbols.length} Active: ${activeAlertSymbols.slice(0, 4).map((s) => pairLabel(s)).join(", ")}`
    : "No active alerts"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="flex items-center gap-2 text-xl font-extrabold">
            <BellRing className="h-5 w-5 text-gold" /> Price Alerts
          </SheetTitle>
          <SheetDescription>
            Set alerts for your favorite pairs. Get notified when price hits your target.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable content — uses native overflow-y-auto for reliable
            touch scrolling on mobile. Radix ScrollArea can sometimes fail
            to scroll on mobile WebViews, so we use a plain div with
            overflow-y-auto + -webkit-overflow-scrolling for smooth touch. */}
        <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: "touch", minHeight: 0 }}>
          <div className="p-4 space-y-3">
            {/* Live Price Section (selected pair) — COMPACT */}
            {selectedPair && (
              <div className="rounded-xl border border-gold/30 bg-gradient-to-br from-gold/5 to-transparent p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{PAIR_ICONS[selectedPair.symbol] || "📊"}</span>
                    <div>
                      <div className="text-sm font-extrabold">{selectedPair.label}</div>
                      <div className="text-[9px] text-muted-foreground">{selectedPair.category}</div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-bold text-emerald-500">
                    <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-center gap-3">
                  <div className="text-2xl font-extrabold text-foreground">
                    {formatPrice(selectedPair.symbol, selectedPair.price)}
                  </div>
                  <div className={`text-xs font-bold ${selectedPair.change >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                    {selectedPair.change >= 0 ? "▲" : "▼"} {Math.abs(selectedPair.change).toFixed(2)}%
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                  <div className="rounded-lg bg-destructive/10 p-1.5">
                    <div className="text-[8px] uppercase text-muted-foreground">Sell</div>
                    <div className="text-xs font-bold text-destructive">{formatPrice(selectedPair.symbol, selectedPair.sell)}</div>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-1.5">
                    <div className="text-[8px] uppercase text-muted-foreground">Spread</div>
                    <div className="text-xs font-bold text-foreground">{selectedPair.spread.toFixed(2)}</div>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 p-1.5">
                    <div className="text-[8px] uppercase text-muted-foreground">Buy</div>
                    <div className="text-xs font-bold text-emerald-500">{formatPrice(selectedPair.symbol, selectedPair.buy)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Set Alert Section — COMPACT */}
            <div className="rounded-xl border border-border bg-card p-3 space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Set Price Alert</Label>

              {/* Symbol selector */}
              <div className="flex flex-wrap gap-1.5">
                {pairs.map((p) => (
                  <button
                    key={p.symbol}
                    onClick={() => { setSelectedSymbol(p.symbol); setTargetPrice("") }}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                      selectedSymbol === p.symbol ? "bg-gold text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Direction toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setDirection("above")}
                  className={`flex-1 rounded-lg border-2 py-2 text-xs font-bold transition ${
                    direction === "above" ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "border-border"
                  }`}
                >
                  <TrendingUp className="mr-1 inline h-3.5 w-3.5" /> Above
                </button>
                <button
                  onClick={() => setDirection("below")}
                  className={`flex-1 rounded-lg border-2 py-2 text-xs font-bold transition ${
                    direction === "below" ? "border-destructive bg-destructive/10 text-destructive" : "border-border"
                  }`}
                >
                  <TrendingDown className="mr-1 inline h-3.5 w-3.5" /> Below
                </button>
              </div>

              {/* Target price input */}
              <div className="space-y-1">
                <Label className="text-xs">Target Price</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="e.g. 4120.50"
                    className="h-9 pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gold">USD</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  You'll be notified when {selectedPair?.label} goes {direction} {targetPrice || "..."}
                </p>
              </div>

              <Button
                className="h-10 w-full gap-2 bg-gold font-bold text-white hover:bg-gold/90"
                onClick={onSetAlert}
                disabled={createMutation.isPending || !targetPrice}
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                Set Price Alert
              </Button>
            </div>

            {/* My Active Alerts — always shown (even when empty, shows a hint) */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <BellRing className="h-4 w-4 text-gold" />
                <h3 className="text-sm font-extrabold text-foreground">
                  My Active Alerts ({alerts.filter(a => !a.triggered).length})
                </h3>
              </div>
              {alerts.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground">
                  No alerts yet. Set a target price above to get started.
                </p>
              ) : (
                alerts.map((a) => (
                  <div key={a.id} className={`flex items-center justify-between rounded-xl border p-3 ${
                    a.triggered
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : a.direction === "above"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-red-500/30 bg-red-500/5"
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{PAIR_ICONS[a.symbol] || "📊"}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold">{pairLabel(a.symbol)}</span>
                          <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                            a.direction === "above"
                              ? "bg-emerald-500/20 text-emerald-500"
                              : "bg-red-500/20 text-red-500"
                          }`}>
                            {a.direction === "above" ? "▲ ABOVE" : "▼ BELOW"}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Target: <span className="font-bold text-foreground">{a.targetPrice}</span> USD
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.triggered ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-500">
                          <CheckCircle2 className="h-3 w-3" /> Triggered
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[9px] font-bold text-gold">
                          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" /> Active
                        </span>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(a.id)}
                        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete alert"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Watchlist */}
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-foreground">Watchlist</h3>
              {watchLoading ? (
                <p className="text-center text-xs text-muted-foreground py-4">Loading prices...</p>
              ) : (
                pairs.map((p) => {
                  const hasAlert = alerts.some((a) => a.symbol === p.symbol && !a.triggered)
                  return (
                    <button
                      key={p.symbol}
                      onClick={() => { setSelectedSymbol(p.symbol); setTargetPrice("") }}
                      className={`flex w-full items-center justify-between rounded-xl border p-3 transition ${
                        selectedSymbol === p.symbol ? "border-gold/40 bg-gold/5" : "border-border bg-card hover:border-gold/20"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{PAIR_ICONS[p.symbol] || "📊"}</span>
                        <div className="text-start">
                          <div className="text-sm font-bold">{p.label}</div>
                          <div className="text-[10px] text-muted-foreground">{p.category}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-end">
                          <div className="text-sm font-bold">{formatPrice(p.symbol, p.price)}</div>
                          <div className={`text-[10px] font-bold ${p.change >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                            {p.change >= 0 ? "▲" : "▼"} {Math.abs(p.change).toFixed(2)}%
                          </div>
                        </div>
                        {hasAlert && <BellRing className="h-4 w-4 text-gold" />}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
