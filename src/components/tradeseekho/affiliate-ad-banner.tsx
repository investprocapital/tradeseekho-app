"use client"

import { useQuery } from "@tanstack/react-query"
import { ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

// ─── Types ───
interface AffiliateAd {
  title: string
  description: string
  buttonText: string
  logoUrl: string
  bannerUrl: string
  combinedAdImage: string
  link: string
}

async function fetchAffiliateAd(): Promise<{ ad: AffiliateAd | null }> {
  const res = await fetch("/api/ads/affiliate")
  if (!res.ok) return { ad: null }
  return res.json()
}

/**
 * AffiliateAdBanner — Custom affiliate ad banner shown at the bottom of the
 * Lessons page and the Live Signals page.
 *
 * TWO LAYOUT MODES:
 *
 * 1. COMBINED IMAGE MODE (when combinedAdImage is set):
 *    ┌──────────────────────────────────────────┐
 *    │                                          │
 *    │         FULL IMAGE (600x300)             │
 *    │                                          │
 *    │                                      [AD]│
 *    └──────────────────────────────────────────┘
 *    Shows ONLY the uploaded combined image (logo + banner split is hidden).
 *    Useful for ready-made ad creatives.
 *
 * 2. SPLIT LAYOUT (default — when combinedAdImage is NOT set):
 *    ┌────────────────────────┬──────────────────┐
 *    │  [LOGO]                │                  │
 *    │  Title                 │   BANNER IMAGE   │
 *    │  Short description...  │  (contain, no cut)│
 *    │  [ RED DOWNLOAD BTN ]  │              [AD]│
 *    └────────────────────────┴──────────────────┘
 *    - Left: white bg, logo + title + description + red CTA button
 *    - Right: banner image with object-contain (NOT cut) + padding 5px
 *
 * - "AD" tag at bottom-right (semi-transparent, white text)
 * - Click anywhere → opens affiliate link in new tab
 * - Hidden completely when admin toggle is OFF (API returns ad: null)
 */
export function AffiliateAdBanner() {
  const { data } = useQuery({
    queryKey: ["affiliate-ad"],
    queryFn: fetchAffiliateAd,
    staleTime: 60_000, // cache for 1 min
  })

  const ad = data?.ad
  if (!ad) return null

  // If link is "#" or empty, don't make it clickable
  const hasLink = ad.link && ad.link !== "#"
  const Wrapper: any = hasLink ? motion.a : motion.div
  const wrapperProps = hasLink
    ? {
        href: ad.link,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {}

  // ─── Mode 1: Combined Image (full-width single image) ───
  if (ad.combinedAdImage) {
    return (
      <Wrapper
        {...wrapperProps}
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.3 }}
        className="group relative mt-3 block overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-zinc-900"
        aria-label={`Affiliate ad: ${ad.title}`}
      >
        <img
          src={ad.combinedAdImage}
          alt={`${ad.title} advertisement`}
          className="block h-auto w-full object-contain"
          loading="lazy"
          style={{ maxHeight: "160px" }}
        />
        {/* "AD" tag at bottom-right */}
        <span
          className="pointer-events-none absolute bottom-1.5 right-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm"
          aria-label="Advertisement"
        >
          AD
        </span>
      </Wrapper>
    )
  }

  // ─── Mode 2: Split Layout (logo + banner) ───
  return (
    <Wrapper
      {...wrapperProps}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.3 }}
      className="group relative mt-3 flex overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-zinc-900"
      aria-label={`Affiliate ad: ${ad.title}`}
    >
      {/* ─── LEFT SIDE: logo + title + description + red CTA button ─── */}
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 p-3 text-center sm:p-4">
        {/* Logo */}
        {ad.logoUrl ? (
          <img
            src={ad.logoUrl}
            alt={`${ad.title} logo`}
            className="h-7 w-auto max-w-[120px] object-contain"
            loading="lazy"
          />
        ) : (
          <span className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {ad.title}
          </span>
        )}

        {/* Title (only show if logo is separate) */}
        {ad.logoUrl && ad.title && (
          <span className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {ad.title}
          </span>
        )}

        {/* Short description */}
        {ad.description && (
          <p className="line-clamp-2 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400 sm:text-xs">
            {ad.description}
          </p>
        )}

        {/* Red Download button */}
        {ad.buttonText && (
          <span
            className="mt-1 inline-flex items-center gap-1 rounded-lg bg-red-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition group-hover:bg-red-600 group-active:scale-95"
            style={{ backgroundColor: "#ef4444" }}
          >
            {ad.buttonText}
            <ExternalLink className="h-3 w-3" />
          </span>
        )}
      </div>

      {/* ─── RIGHT SIDE: banner image (contain, NOT cut) ───
          Per user fix: changed from object-cover to object-contain +
          object-position: center left + padding 5px so the image is NOT
          cut off on the right side. */}
      <div className="relative w-[42%] shrink-0 overflow-hidden bg-zinc-950 p-[5px] sm:w-[45%]">
        {ad.bannerUrl ? (
          <img
            src={ad.bannerUrl}
            alt={`${ad.title} promotion`}
            className="absolute inset-[5px] h-[calc(100%-10px)] w-[calc(100%-10px)] object-contain"
            style={{ objectPosition: "center left" }}
            loading="lazy"
          />
        ) : (
          // Placeholder when no banner image uploaded yet
          <div className="absolute inset-[5px] flex items-center justify-center rounded bg-gradient-to-br from-zinc-800 to-zinc-950">
            <span className="px-2 text-center text-[10px] font-medium text-zinc-400">
              Banner Image
            </span>
          </div>
        )}
      </div>

      {/* ─── "AD" TAG at bottom-right ─── */}
      <span
        className="pointer-events-none absolute bottom-1.5 right-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm"
        aria-label="Advertisement"
      >
        AD
      </span>
    </Wrapper>
  )
}
