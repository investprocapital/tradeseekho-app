"use client"

import { Crown } from "lucide-react"
import { useStore } from "@/lib/store"
import { useAdSettings, useProMe } from "./use-data"

export function Footer() {
  const setProOpen = useStore((s) => s.setProOpen)
  const { data: ads } = useAdSettings()
  const showBanner = ads?.bannerEnabled ?? true
  const { data: proMe } = useProMe()
  const isPro = proMe?.proStatus === "active"
  const isPending = proMe?.proStatus === "pending"

  if (!showBanner) return null

  return (
    <footer className="mt-auto border-t border-border bg-card">
      {/* Pro CTA / status banner */}
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-gold/10 to-brand-muted/20 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gold/20 text-gold">
            <Crown className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 leading-tight">
            {isPro ? (
              <>
                <p className="truncate text-[11px] font-bold text-foreground">You're Pro 🎉</p>
                <p className="truncate text-[9px] text-muted-foreground">Unlimited access</p>
              </>
            ) : isPending ? (
              <>
                <p className="truncate text-[11px] font-bold text-foreground">Pro under review ⏳</p>
                <p className="truncate text-[9px] text-muted-foreground">Activates within 24h</p>
              </>
            ) : (
              <>
                <p className="truncate text-[11px] font-bold text-foreground">TradeSeekho Pro</p>
                <p className="truncate text-[9px] text-muted-foreground">JazzCash / Easypaisa</p>
              </>
            )}
          </div>
        </div>
        {!isPro && (
          <button onClick={() => setProOpen(true)} className="shrink-0 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold text-brand-foreground">
            {isPending ? "View" : "Get Pro"}
          </button>
        )}
      </div>
    </footer>
  )
}
