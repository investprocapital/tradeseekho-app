"use client"

import { useQuery } from "@tanstack/react-query"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import { Star, Shield, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useAdSettings } from "./use-data"

import "swiper/css"
import "swiper/css/pagination"

interface BrokerLinks {
  xmLink: string
  exnessLink: string
  icmarketsLink: string
  fbsLink: string
  octafxLink: string
  pepperstoneLink: string
}

// ─── 7-day localStorage cache for broker links ───
// Fetches broker links from API, caches in localStorage for 7 days.
// After 7 days OR if admin force-updates (brokerAdsUpdatedAt changes),
// re-fetches from API. This reduces data usage to near-zero.
const CACHE_KEY = "broker-links-cache"
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

interface CachedData {
  links: BrokerLinks
  cachedAt: number
  serverUpdatedAt: string | null
}

function getCachedLinks(): { links: BrokerLinks; serverUpdatedAt: string | null } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cached: CachedData = JSON.parse(raw)
    // Check 7-day expiry
    if (Date.now() - cached.cachedAt > CACHE_TTL) return null
    return { links: cached.links, serverUpdatedAt: cached.serverUpdatedAt }
  } catch {
    return null
  }
}

function setCachedLinks(links: BrokerLinks, serverUpdatedAt: string | null) {
  try {
    const data: CachedData = { links, cachedAt: Date.now(), serverUpdatedAt }
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {}
}

const DEFAULT_LINKS: BrokerLinks = {
  xmLink: "https://www.xmwebsite.net/referral?token=U-F1EIZcmcug6NKlILwrnA",
  exnessLink: "https://exness.com/join",
  icmarketsLink: "https://icmarkets.com/join",
  fbsLink: "https://fbs.com/join",
  octafxLink: "https://octasl.click/iZp7FIYLJ7U",
  pepperstoneLink: "https://pepperstone.com/join",
}

async function fetchBrokerLinks(): Promise<{ links: BrokerLinks; serverUpdatedAt: string | null }> {
  // Step 1: Check localStorage cache (7-day expiry)
  const cached = getCachedLinks()
  if (cached) {
    // Step 2: Check if admin force-updated (compare timestamps)
    // We fetch the lightweight ads/config to get brokerAdsUpdatedAt
    try {
      const cfgRes = await fetch("/api/ads/config")
      if (cfgRes.ok) {
        const cfg = await cfgRes.json()
        const serverTs = cfg.brokerAdsUpdatedAt ?? null
        // If server timestamp is newer than cached → re-fetch broker links
        if (serverTs && cached.serverUpdatedAt && serverTs !== cached.serverUpdatedAt) {
          // Force refresh — admin clicked "Clear All Users Cache"
          const res = await fetch("/api/broker-links")
          if (res.ok) {
            const data = await res.json()
            setCachedLinks(data.links, serverTs)
            return { links: data.links, serverUpdatedAt: serverTs }
          }
        }
        // Cache is valid — return cached data (zero API bandwidth)
        return cached
      }
    } catch {
      // Config fetch failed — return cache anyway
      return cached
    }
    return cached
  }

  // Step 3: No cache — fetch from API
  const res = await fetch("/api/broker-links")
  if (!res.ok) return { links: DEFAULT_LINKS, serverUpdatedAt: null }
  const data = await res.json()

  // Also fetch server timestamp for future force-update checks
  let serverTs: string | null = null
  try {
    const cfgRes = await fetch("/api/ads/config")
    if (cfgRes.ok) {
      const cfg = await cfgRes.json()
      serverTs = cfg.brokerAdsUpdatedAt ?? null
    }
  } catch {}

  setCachedLinks(data.links, serverTs)
  return { links: data.links, serverUpdatedAt: serverTs }
}

interface Broker {
  name: string
  logo: string
  logoBg: string
  rating: number
  traders: string
  features: string
  linkKey: keyof BrokerLinks
  topPick?: boolean
}

const BROKERS: Broker[] = [
  { name: "XM", logo: "XM", logoBg: "#0066CC", rating: 4.9, traders: "120k+ traders", features: "Regulated • MT4/MT5 • Low Spreads", linkKey: "xmLink", topPick: true },
  { name: "Exness", logo: "EX", logoBg: "#00B14F", rating: 4.8, traders: "98k+ traders", features: "Regulated • Zero Fees • Fast Withdrawal", linkKey: "exnessLink" },
  { name: "IC Markets", logo: "IC", logoBg: "#1A3A5C", rating: 4.7, traders: "75k+ traders", features: "Raw Spreads • Low Fees • ECN", linkKey: "icmarketsLink" },
  { name: "FBS", logo: "FBS", logoBg: "#FF6B00", rating: 4.6, traders: "64k+ traders", features: "Bonus up to $100 • CopyTrade", linkKey: "fbsLink" },
  { name: "OctaFX", logo: "OCTA", logoBg: "#F7941D", rating: 4.5, traders: "52k+ traders", features: "Cashback • Low Deposits • Mobile App", linkKey: "octafxLink" },
  { name: "Pepperstone", logo: "PEP", logoBg: "#00529B", rating: 4.6, traders: "38k+ traders", features: "Global • MT4/MT5 • Secure", linkKey: "pepperstoneLink" },
]

export function BrokerComparison() {
  // Hooks must be called before any conditional return (Rules of Hooks).
  // Check if admin has enabled the Broker Comparison section
  const { data: ads } = useAdSettings()
  const showBrokerAds = ads?.showBrokerAds ?? true

  // Fetch broker links with 7-day localStorage caching
  const { data } = useQuery({
    queryKey: ["broker-links"],
    queryFn: fetchBrokerLinks,
    staleTime: 60 * 60 * 1000, // 1 hour React Query cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: showBrokerAds, // only fetch when section is visible
  })

  // Hide entire section when admin disables it
  if (!showBrokerAds) return null

  const links = data?.links ?? DEFAULT_LINKS

  return (
    <div className="mt-4 px-2">
      {/* Top text + red arrow */}
      <div className="flex flex-col items-center mb-3">
        <h2 className="text-center text-base font-extrabold tracking-tight sm:text-lg">
          World&apos;s Top Broker <span className="text-gold">Here</span>
        </h2>
        <svg
          className="mt-1 h-6 w-6 animate-bounce"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ef4444"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      </div>

      {/* Main container with gold border.
          overflow: visible so the TOP PICK badge (positioned above the card)
          is NOT clipped. margin-top gives room for the badge. */}
      <div className="rounded-2xl border-2 border-gold/40 bg-[#0a0a0a] p-3 shadow-lg shadow-gold/5" style={{ overflow: "visible" }}>
        {/* Header inside container */}
        <div className="mb-3 flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-gold" />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold">
            Forex Broker Comparison
          </span>
        </div>

        {/* Broker cards slider — overflow visible + margin-top for badge */}
        <div style={{ overflow: "visible", marginTop: "15px" }}>
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={true}
            pagination={{ clickable: true }}
            spaceBetween={10}
            slidesPerView={1.2}
            breakpoints={{
              480: { slidesPerView: 2.2 },
              768: { slidesPerView: 3.2 },
              1024: { slidesPerView: 6 },
            }}
            className="broker-slider !pb-8"
          >
            {BROKERS.map((broker) => {
              const link = links[broker.linkKey] || "#"
              return (
                <SwiperSlide key={broker.name}>
                  <div
                    className={`relative flex h-full flex-col items-center rounded-xl p-3 ${
                      broker.topPick
                        ? "border-2 border-gold bg-gradient-to-b from-gold/10 to-[#1a1a1a] shadow-lg shadow-gold/20"
                        : "border border-white/10 bg-[#1a1a1a]"
                    }`}
                  >
                    {/* TOP PICK badge — above the card, no clip (overflow visible) */}
                    {broker.topPick && (
                      <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-gold px-2.5 py-0.5 text-[8px] font-bold text-black shadow-md">
                        ⭐ TOP PICK
                      </div>
                    )}

                    {/* Logo */}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-black text-white shadow ${broker.topPick ? "mt-3" : "mt-0"}`}
                      style={{ backgroundColor: broker.logoBg }}
                    >
                      {broker.logo}
                    </div>

                    {/* Broker name */}
                    <h3 className="mt-2 text-xs font-bold text-white">{broker.name}</h3>

                    {/* 5 Stars */}
                    <div className="mt-1 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-2.5 w-2.5 fill-gold text-gold" />
                      ))}
                    </div>

                    {/* Rating + traders */}
                    <p className="mt-1 text-[10px] font-bold text-white">
                      {broker.rating} <span className="text-white/50">• {broker.traders}</span>
                    </p>

                    {/* Features */}
                    <p className="mt-1.5 text-center text-[9px] leading-tight text-white/50">
                      {broker.features}
                    </p>

                    {/* Join Now button */}
                    <Link
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-gradient-to-b from-gold to-amber-600 px-3 py-1.5 text-[10px] font-bold text-black shadow-sm transition hover:from-amber-500 hover:to-amber-700"
                    >
                      Join Now
                    </Link>

                    {/* URL */}
                    <p className="mt-1.5 flex items-center gap-0.5 text-[8px] text-white/30">
                      <ExternalLink className="h-2.5 w-2.5" />
                      {link.replace("https://", "").replace("www.", "").split("/")[0]}
                    </p>
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </div>
      </div>

      {/* Bottom text */}
      <p className="mt-3 text-center text-[10px] font-medium text-gold/70">
        Compare • Review • Join Trusted Brokers
      </p>
    </div>
  )
}
