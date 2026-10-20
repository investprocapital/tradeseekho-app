"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { GraduationCap, TrendingUp, Crown, ArrowRight, Check, X } from "lucide-react"
import { useStore } from "@/lib/store"

const SLIDES = [
  {
    icon: GraduationCap,
    titleUr: "سیکھو ٹریڈنگ صفر سے",
    titleEn: "Learn Trading From Zero",
    subUr: "43+ Lessons - 4 Languages me: Hindi, Urdu, English, Arabic",
    subEn: "43+ Lessons in 4 Languages - Hindi, Urdu, English, Arabic",
    color: "#00D09C",
    bg: "from-[#00D09C]/20 to-transparent",
  },
  {
    icon: TrendingUp,
    titleUr: "Live Signals & Alerts",
    titleEn: "Live Signals & Alerts",
    subUr: "BTC، GOLD، EURUSD کے Live Signals اور Price Alerts",
    subEn: "Live Signals & Price Alerts for BTC, GOLD, EURUSD",
    color: "#0072FF",
    bg: "from-[#0072FF]/20 to-transparent",
  },
  {
    icon: Crown,
    titleUr: "بنو Pro Trader",
    titleEn: "Become a Pro Trader",
    subUr: "Quiz پاس کرو، Market Gauge سمجھو اور confident trading شروع کرو",
    subEn: "Pass quizzes, learn Market Gauge & start confident trading",
    color: "#F3BA2F",
    bg: "from-[#F3BA2F]/20 to-transparent",
  },
] as const

export function Onboarding() {
  const { status } = useSession()
  const seen = useStore((s) => s.onboardingSeen)
  const hasHydrated = useStore((s) => s.hasHydrated)
  const setSeen = useStore((s) => s.setOnboardingSeen)
  const setLoginOpen = useStore((s) => s.setLoginOpen)
  const [i, setI] = useState(0)
  const last = i === SLIDES.length - 1

  // Show onboarding ONLY for users who:
  // 1. Store has hydrated (localStorage loaded)
  // 2. Haven't seen onboarding yet (onboardingSeen = false)
  // 3. Are NOT currently authenticated (so new visitors see it, returning logged-in users don't)
  if (!hasHydrated) return null
  if (seen) return null
  if (status === "authenticated") return null

  // Skip → go to Login page (mark seen + open login)
  const close = () => {
    setSeen(true)
    setLoginOpen(true)
  }

  // On last screen "Get Started" → mark seen + open login
  const getStarted = () => {
    setSeen(true)
    setLoginOpen(true)
  }

  // Next → go to next screen (or Get Started if last)
  const next = () => {
    if (last) {
      getStarted()
    } else {
      setI((v) => v + 1)
    }
  }
  const slide = SLIDES[i]
  const Icon = slide.icon

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#070F2B]">
      {/* Skip button — top right → goes to Login */}
      <button
        type="button"
        onClick={() => close()}
        className="absolute right-4 top-4 z-30 inline-flex h-9 items-center gap-1 rounded-full bg-white/5 px-4 text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
      >
        Skip <X className="h-3.5 w-3.5" />
      </button>

      {/* Background glow */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${slide.bg}`} />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full opacity-10 blur-[80px] transition-colors"
        style={{ background: slide.color }}
      />

      {/* Slide content */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon */}
            <span
              className="inline-flex h-24 w-24 items-center justify-center rounded-3xl text-white shadow-2xl"
              style={{ background: slide.color }}
            >
              <Icon className="h-12 w-12" />
            </span>

            {/* Title — Urdu + English */}
            <h2 className="mt-8 text-2xl font-extrabold leading-tight text-white font-urdu">
              {slide.titleUr}
            </h2>
            <p className="mt-1 text-sm font-semibold text-white/40">
              {slide.titleEn}
            </p>

            {/* Subtitle — Urdu + English */}
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60 font-urdu">
              {slide.subUr}
            </p>
            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-white/30">
              {slide.subEn}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section: dots + button */}
      <div className="shrink-0 px-8 pb-10 pt-4">
        {/* Dots indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-8" : "w-2 bg-white/20"}`}
              style={idx === i ? { background: slide.color } : {}}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Get Started / Next button — plain button (not Button component) */}
        <div className="flex gap-2">
          {i > 0 && (
            <button
              type="button"
              className="flex h-14 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 text-sm font-bold text-white/60 transition active:scale-[0.98]"
              onClick={() => setI((v) => v - 1)}
            >
              ‹ Back
            </button>
          )}
          <button
            type="button"
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-lg py-4 text-base font-bold text-white shadow-lg transition active:scale-[0.98]"
            style={{ background: slide.color, minHeight: "56px" }}
            onClick={() => next()}
          >
            {last ? (
              <>
                Get Started <Check className="h-5 w-5" />
              </>
            ) : (
              <>
                Next <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
