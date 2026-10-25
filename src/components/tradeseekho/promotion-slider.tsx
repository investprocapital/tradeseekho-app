"use client"

import { useQuery } from "@tanstack/react-query"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import Link from "next/link"

// Import Swiper styles
import "swiper/css"
import "swiper/css/pagination"

interface Banner {
  id: string
  imageUrl: string
  title: string | null
  linkUrl: string
}

async function fetchBanners(): Promise<{ banners: Banner[] }> {
  const res = await fetch("/api/banners?active=true")
  if (!res.ok) return { banners: [] }
  return res.json()
}

/**
 * PromotionSlider — rotating banner slider on the Home page.
 * Placed between Gold Price card and Lessons section.
 *
 * Features:
 * - Swiper.js with autoplay (4s), loop, dots indicator
 * - Simple slide transition (no zoom effect)
 * - Banner images shown with object-contain (no text cut)
 * - Clickable banners (link URL)
 * - Auto-hides when no active banners
 * - DB-level filter: only active banners fetched (zero bandwidth when empty)
 * - 10 min client cache (staleTime) — prevents re-fetching on every navigation
 */
export function PromotionSlider() {
  const { data } = useQuery({
    queryKey: ["promotion-banners"],
    queryFn: fetchBanners,
    staleTime: 10 * 60 * 1000, // 10 min cache (was 5 min)
    refetchOnWindowFocus: false, // don't re-fetch when tab regains focus
    refetchOnMount: false, // don't re-fetch when component remounts
  })

  const banners = data?.banners ?? []

  // Auto-hide when no active banners — no empty space
  if (banners.length === 0) return null

  return (
    <div className="mt-3 px-0">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 4000, disableOnInteraction: false }} // 4 seconds
        loop={banners.length > 1}
        pagination={{ clickable: true }} // dots indicator (clickable)
        spaceBetween={8}
        slidesPerView={1}
        speed={600} // smooth slide transition (no zoom)
        className="promotion-slider !pb-8" // extra bottom padding for dots
      >
        {banners.map((banner) => {
          const isExternal = banner.linkUrl.startsWith("http")
          const linkProps = isExternal
            ? { href: banner.linkUrl, target: "_blank", rel: "noopener noreferrer" }
            : { href: banner.linkUrl }

          const content = (
            <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-card">
              {/* Banner image — object-contain so nothing gets cut.
                  Fixed height (120px mobile, 160px desktop) keeps it compact. */}
              <img
                src={banner.imageUrl}
                alt={banner.title || "Promotion"}
                className="block w-full"
                style={{ height: "140px", objectFit: "contain" }}
                loading="lazy"
              />
              {/* Title overlay — full width, no truncation, bottom-aligned */}
              {banner.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 py-2">
                  <p className="text-xs font-bold leading-tight text-white">{banner.title}</p>
                </div>
              )}
            </div>
          )

          return (
            <SwiperSlide key={banner.id}>
              {banner.linkUrl && banner.linkUrl !== "#" ? (
                <Link {...linkProps}>{content}</Link>
              ) : (
                content
              )}
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}
