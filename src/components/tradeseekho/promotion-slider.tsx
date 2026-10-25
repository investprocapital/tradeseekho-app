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
  const res = await fetch("/api/banners?active=true", { cache: "no-store" })
  if (!res.ok) return { banners: [] }
  return res.json()
}

/**
 * PromotionSlider — rotating banner slider on the Home page.
 * Placed between Gold Price card and Lessons section.
 *
 * Features:
 * - Swiper.js with autoplay (3s), loop, dots indicator
 * - next/image for optimization + lazy loading
 * - Clickable banners (link URL)
 * - Auto-hides when no active banners
 * - DB-level filter: only active banners fetched (zero bandwidth when empty)
 */
export function PromotionSlider() {
  const { data } = useQuery({
    queryKey: ["promotion-banners"],
    queryFn: fetchBanners,
    staleTime: 5 * 60 * 1000, // cache 5 min
  })

  const banners = data?.banners ?? []

  // Auto-hide when no active banners — no empty space
  if (banners.length === 0) return null

  return (
    <div className="mt-3 px-0">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={banners.length > 1}
        pagination={{ clickable: true }}
        spaceBetween={8}
        slidesPerView={1}
        className="promotion-slider !pb-6"
      >
        {banners.map((banner) => {
          const isExternal = banner.linkUrl.startsWith("http")
          const linkProps = isExternal
            ? { href: banner.linkUrl, target: "_blank", rel: "noopener noreferrer" }
            : { href: banner.linkUrl }

          const content = (
            <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-card">
              <img
                src={banner.imageUrl}
                alt={banner.title || "Promotion"}
                className="block w-full"
                style={{ aspectRatio: "3 / 1", objectFit: "cover" }}
                loading="lazy"
              />
              {banner.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="truncate text-xs font-bold text-white">{banner.title}</p>
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
