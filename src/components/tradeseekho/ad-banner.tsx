"use client"

import { motion } from "framer-motion"
import { Megaphone } from "lucide-react"
import { useAdSettings } from "./use-data"
import { useStore } from "@/lib/store"

/**
 * AdMob-style banner ad — shows on Home + Lesson Reader when the admin has
 * enabled banner ads (toggle in Admin → Ads). Same component renders on web
 * and (via Flutter's AdWidget) on mobile/iOS.
 */
export function AdBanner({ compact = false }: { compact?: boolean }) {
  const { data: ads } = useAdSettings()
  const setProOpen = useStore((s) => s.setProOpen)
  const enabled = ads?.bannerEnabled ?? true

  if (!enabled) return null

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 border-y border-border bg-muted/40 px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <Megaphone className="h-3.5 w-3.5 shrink-0 text-gold" />
          <span className="truncate text-[10px] font-bold text-muted-foreground">Ad · TradeSeekho PK Pro — unlock all lessons</span>
        </div>
        <button onClick={() => setProOpen(true)} className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold text-brand-foreground">
          Get Pro
        </button>
      </div>
    )
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto w-full max-w-6xl px-4 py-3"
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
              {ads?.bannerUnitId?.startsWith("ca-app-pub-") ? "AdMob Banner" : "Sponsored"} · tap to upgrade
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
