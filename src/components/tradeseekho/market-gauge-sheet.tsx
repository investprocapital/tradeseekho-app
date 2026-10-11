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
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
