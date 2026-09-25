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
    <footer className="mt-6 border-t border-border bg-card">
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
                <p className="truncate text-[11px] font-bold text-foreground">TradeSeekho PK Pro</p>
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

      {/* Links + Copyright */}
      <div className="px-3 py-3 text-center">
        <div className="mb-2 flex items-center justify-center gap-3 text-[10px]">
          <a href="/about-us" className="font-bold text-brand hover:underline">About Us</a>
          <span className="text-muted-foreground">|</span>
          <a href="/privacy-policy" className="font-bold text-brand hover:underline">Privacy Policy</a>
          <span className="text-muted-foreground">|</span>
          <a href="/contact-us" className="font-bold text-brand hover:underline">Contact Us</a>
        </div>
        <p className="text-[9px] text-muted-foreground">
          © {new Date().getFullYear()} TradeSeekho PK · Made in Pakistan · Serving Worldwide
        </p>
        <p className="mt-0.5 text-[9px] text-muted-foreground">
          Email: <a href="mailto:tradeseekhopk@gmail.com" className="text-brand hover:underline">tradeseekhopk@gmail.com</a>
        </p>
      </div>
    </footer>
  )
}
