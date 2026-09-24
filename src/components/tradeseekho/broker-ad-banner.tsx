"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Megaphone, ExternalLink } from "lucide-react"

interface BrokerAd {
  id: string
  slot: number
  name: string
  text: string
  btnText: string
  link: string
  enabled: boolean
}

async function fetchBrokerAds(): Promise<{ ads: BrokerAd[] }> {
  const res = await fetch("/api/ads/broker")
  if (!res.ok) throw new Error("failed")
  return res.json()
}

const AD_COLORS = [
  { bg: "from-[#00B14F]/15 via-card to-brand-muted/20", border: "border-[#00B14F]/30", icon: "bg-[#00B14F]/20 text-[#00B14F]" },
  { bg: "from-[#00A3E0]/15 via-card to-brand-muted/20", border: "border-[#00A3E0]/30", icon: "bg-[#00A3E0]/20 text-[#00A3E0]" },
  { bg: "from-[#F7941D]/15 via-card to-brand-muted/20", border: "border-[#F7941D]/30", icon: "bg-[#F7941D]/20 text-[#F7941D]" },
]

export function BrokerAdBanner({ fixed = false }: { fixed?: boolean }) {
  const { data } = useQuery<{ ads: BrokerAd[] }>({
    queryKey: ["broker-ads"],
    queryFn: fetchBrokerAds,
    staleTime: 60_000,
  })

  const ads = (data?.ads ?? []).filter((a) => a.enabled)
  const [currentIdx, setCurrentIdx] = useState(0)

  // Auto-rotate every 10 seconds
  useEffect(() => {
    if (ads.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % ads.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [ads.length])

  if (ads.length === 0) return null

  const ad = ads[currentIdx] ?? ads[0]
  const colors = AD_COLORS[(ad.slot - 1) % AD_COLORS.length]

  return (
    <div
      className={`${fixed ? "shrink-0" : "mx-auto w-full max-w-6xl px-4 py-2"}`}
      aria-label="Sponsored"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={ad.id + "-" + currentIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className={`flex items-center justify-between gap-3 overflow-hidden rounded-2xl border ${colors.border} bg-gradient-to-r ${colors.bg} p-2.5`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}>
              <Megaphone className="h-4 w-4" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-bold text-foreground">{ad.text}</p>
              <p className="truncate text-[10px] text-muted-foreground">Sponsored · {ad.name}</p>
            </div>
          </div>
          <a
            href={ad.link}
            target={ad.link === "#" ? undefined : "_blank"}
            rel={ad.link === "#" ? undefined : "noopener noreferrer"}
            className="flex shrink-0 items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-[11px] font-bold text-brand-foreground shadow-sm transition hover:bg-brand/90"
            onClick={(e) => ad.link === "#" && e.preventDefault()}
          >
            {ad.btnText}
            {ad.link !== "#" && <ExternalLink className="h-3 w-3" />}
          </a>
        </motion.div>
      </AnimatePresence>

      {/* Dots indicator */}
      {ads.length > 1 && (
        <div className="mt-1 flex justify-center gap-1">
          {ads.map((_, i) => (
            <span
              key={i}
              className={`h-1 w-1 rounded-full transition-colors ${
                i === currentIdx ? "bg-brand" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
