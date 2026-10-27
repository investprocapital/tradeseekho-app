"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import { Star, Shield, ArrowDown, ExternalLink } from "lucide-react"
import Link from "next/link"

import "swiper/css"
import "swiper/css/pagination"

interface Broker {
  name: string
  logo: string
  logoBg: string
  rating: number
  traders: string
  features: string
  link: string
  topPick?: boolean
}

const BROKERS: Broker[] = [
  {
    name: "XM",
    logo: "XM",
    logoBg: "#0066CC",
    rating: 4.9,
    traders: "120k+ traders",
    features: "Regulated • MT4/MT5 • Low Spreads",
    link: "https://www.xmwebsite.net/referral?token=U-F1EIZcmcug6NKlILwrnA",
    topPick: true,
  },
  {
    name: "Exness",
    logo: "EX",
    logoBg: "#00B14F",
    rating: 4.8,
    traders: "98k+ traders",
    features: "Regulated • Zero Fees • Fast Withdrawal",
    link: "https://exness.com/join",
  },
  {
    name: "IC Markets",
    logo: "IC",
    logoBg: "#1A3A5C",
    rating: 4.7,
    traders: "75k+ traders",
    features: "Raw Spreads • Low Fees • ECN",
    link: "https://icmarkets.com/join",
  },
  {
    name: "FBS",
    logo: "FBS",
    logoBg: "#FF6B00",
    rating: 4.6,
    traders: "64k+ traders",
    features: "Bonus up to $100 • CopyTrade",
    link: "https://fbs.com/join",
  },
  {
    name: "OctaFX",
    logo: "OCTA",
    logoBg: "#F7941D",
    rating: 4.5,
    traders: "52k+ traders",
    features: "Cashback • Low Deposits • Mobile App",
    link: "https://octasl.click/iZp7FIYLJ7U",
  },
  {
    name: "Pepperstone",
    logo: "PEP",
    logoBg: "#00529B",
    rating: 4.6,
    traders: "38k+ traders",
    features: "Global • MT4/MT5 • Secure",
    link: "https://pepperstone.com/join",
  },
]

export function BrokerComparison() {
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

      {/* Main container with gold border */}
      <div className="rounded-2xl border-2 border-gold/40 bg-[#0a0a0a] p-3 shadow-lg shadow-gold/5">
        {/* Header inside container */}
        <div className="mb-3 flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-gold" />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold">
            Forex Broker Comparison
          </span>
        </div>

        {/* Broker cards slider */}
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
          {BROKERS.map((broker) => (
            <SwiperSlide key={broker.name}>
              <div
                className={`relative flex h-full flex-col items-center rounded-xl p-3 ${
                  broker.topPick
                    ? "border-2 border-gold bg-gradient-to-b from-gold/10 to-[#1a1a1a] shadow-lg shadow-gold/20"
                    : "border border-white/10 bg-[#1a1a1a]"
                }`}
              >
                {/* TOP PICK badge */}
                {broker.topPick && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-gold px-2 py-0.5 text-[8px] font-bold text-black shadow">
                    ⭐ TOP PICK
                  </div>
                )}

                {/* Logo */}
                <div
                  className="mt-2 flex h-10 w-10 items-center justify-center rounded-lg text-xs font-black text-white shadow"
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
                  href={broker.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-gradient-to-b from-gold to-amber-600 px-3 py-1.5 text-[10px] font-bold text-black shadow-sm transition hover:from-amber-500 hover:to-amber-700"
                >
                  Join Now
                </Link>

                {/* URL */}
                <p className="mt-1.5 flex items-center gap-0.5 text-[8px] text-white/30">
                  <ExternalLink className="h-2.5 w-2.5" />
                  {broker.link.replace("https://", "").replace("www.", "").split("/")[0]}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Bottom text */}
      <p className="mt-3 text-center text-[10px] font-medium text-gold/70">
        Compare • Review • Join Trusted Brokers
      </p>
    </div>
  )
}
