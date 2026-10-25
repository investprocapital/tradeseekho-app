"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useStore } from "@/lib/store"
import { MarketGaugeScreen } from "./market-gauge-screen"
import { BarChart3 } from "lucide-react"

/**
 * MarketGaugeSheet — right-side sheet opened from the home dashboard
 * "Market Gauge" card. Contains the searchable MarketGaugeScreen.
 */
export function MarketGaugeSheet() {
  const open = useStore((s) => s.marketGaugeOpen)
  const setOpen = useStore((s) => s.setMarketGaugeOpen)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-md" style={{ overflow: "hidden" }}>
        <SheetHeader className="shrink-0 border-b border-border p-5">
          <SheetTitle className="flex items-center gap-2 text-xl font-extrabold">
            <BarChart3 className="h-5 w-5 text-sky-500" /> Market Gauge
          </SheetTitle>
          <SheetDescription>
            Search any pair and see live technical analysis (Strong Buy → Strong Sell).
          </SheetDescription>
        </SheetHeader>

        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch", minHeight: 0, touchAction: "pan-y" }}
        >
          <div className="p-4">
            <MarketGaugeScreen
              defaultSymbol="OANDA:XAUUSD"
              title="Live Market Gauge"
              height={450}
            />
            {/* ⚠️ Legal disclaimer — required for Google/YouTube ads + Play Store.
                Educational purpose + technical indicator warning. Small font, visible. */}
            <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground/70">
              <b>Disclaimer:</b> Market Gauge is based on technical indicators and market analysis for education only. It is not a guaranteed buy/sell call.<br />
              <span className="text-muted-foreground/60">Source: Data may include TradingView.</span>
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
