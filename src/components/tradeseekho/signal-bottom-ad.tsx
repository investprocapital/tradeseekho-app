"use client"

import { motion } from "framer-motion"
import { Megaphone } from "lucide-react"
import { useAdSettings, useProMe } from "./use-data"
import { useStore } from "@/lib/store"

/**
 * SignalBottomAd — responsive banner ad shown at the bottom of the Signal List
 * (below all signals). Uses AdSense for web (PC/Mobile Browser) and AdMob for
 * native app (Flutter WebView). Premium users see NO ads.
 *
 * Rules:
 *   - Only ONE banner at the bottom (no interstitial, no in-list ads)
 *   - Premium users: hidden (if isPro → return null)
 *   - Admin toggle: signalBottomAd ON/OFF
 *   - Ad unit ID editable from admin config
 */
export function SignalBottomAd() {
  const { data: ads } = useAdSettings()
  const { data: proMe } = useProMe()
  const setProOpen = useStore((s) => s.setProOpen)

  // Premium users see NO ads
  const isPro = proMe?.proStatus === "active"
  if (isPro) return null

  // Admin toggle — if signalBottomAd is OFF, hide
  if (ads?.signalBottomAd === false) return null

  const unitId = ads?.signalBottomAdUnitId || "ca-app-pub-DEMO/SIGNAL_BANNER"
  const isAdMob = unitId.startsWith("ca-app-pub-")
  const isAdSense = unitId.startsWith("ca-") && !isAdMob

  return (
    <motion.aside
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3"
      aria-label="Advertisement"
    >
      <div className="flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/8 via-card to-brand-muted/20 p-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-gold">
            <Megaphone className="h-5 w-5" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold text-foreground">TradeSeekho PK Pro — ad-free + all lessons</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {isAdMob ? "AdMob Banner" : isAdSense ? "AdSense Banner" : "Sponsored"} · tap to upgrade
            </p>
          </div>
        </div>
        <button
          onClick={() => setProOpen(true)}
          className="shrink-0 rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-brand-foreground shadow-sm transition hover:bg-brand/90"
        >
          Get Pro
        </button>
      </div>
    </motion.aside>
  )
}
