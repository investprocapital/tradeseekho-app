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
  showTitle: boolean
  showButton: boolean
  showDescription: boolean
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
 *    Shows a full-width single image. Optionally overlays text on top:
 *      - showTitle → Ad Title appears at top-left
 *      - showDescription → Description appears below title
 *      - showButton → Red Download button appears at bottom-left
 *    When all 3 toggles are OFF → only the image shows (clean ad creative).
 *
 * 2. SPLIT LAYOUT (default — when combinedAdImage is NOT set):
 *    Left: logo + title + description + red button
 *    Right: banner image (object-contain, NOT cut, 5px padding)
 *
 * - "AD" tag at bottom-right always visible
 * - Click anywhere → opens affiliate link in new tab
 * - Hidden completely when admin toggle is OFF
 */
export function AffiliateAdBanner() {
  const { data } = useQuery({
    queryKey: ["affiliate-ad"],
    queryFn: fetchAffiliateAd,
    staleTime: 60_000,
  })

  const ad = data?.ad
  if (!ad) return null

  const hasLink = ad.link && ad.link !== "#"
  const Wrapper: any = hasLink ? motion.a : motion.div
  const wrapperProps = hasLink
    ? { href: ad.link, target: "_blank", rel: "noopener noreferrer" }
    : {}

  // ─── Mode 1: Combined Image (full-width single image + optional text overlay) ───
  if (ad.combinedAdImage) {
    // Check if any text overlay is enabled
    const hasOverlay = ad.showTitle || ad.showButton || ad.showDescription
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
        {/* ─── Text overlay (only when any toggle is ON) ─── */}
        {hasOverlay && (
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3">
            {/* Top: Title + Description */}
            <div className="space-y-1">
              {ad.showTitle && ad.title && (
                <span className="inline-block rounded bg-black/60 px-2 py-0.5 text-sm font-extrabold text-white backdrop-blur-sm">
                  {ad.title}
                </span>
              )}
              {ad.showDescription && ad.description && (
                <p className="line-clamp-2 max-w-[70%] rounded bg-black/50 px-2 py-0.5 text-[10px] font-medium leading-snug text-white backdrop-blur-sm">
                  {ad.description}
                </p>
              )}
            </div>
            {/* Bottom: Download button */}
            {ad.showButton && ad.buttonText && (
              <span className="pointer-events-none inline-flex w-fit items-center gap-1 rounded-lg bg-red-500 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                {ad.buttonText}
                <ExternalLink className="h-3 w-3" />
              </span>
            )}
          </div>
        )}
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
        {ad.logoUrl && ad.title && (
          <span className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {ad.title}
          </span>
        )}
        {ad.description && (
          <p className="line-clamp-2 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400 sm:text-xs">
            {ad.description}
          </p>
        )}
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

      {/* ─── RIGHT SIDE: banner image (contain, NOT cut) ─── */}
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
