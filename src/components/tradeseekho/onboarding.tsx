"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { GraduationCap, TrendingUp, Crown, ArrowRight, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

const SLIDES = [
  {
    icon: GraduationCap,
    titleUr: "سیکھو ٹریڈنگ صفر سے",
    titleEn: "Learn Trading From Zero",
    subUr: "Beginner سے Advanced تک 43+ Lessons اردو میں",
    subEn: "43+ Lessons in Urdu — Beginner to Advanced",
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
  const touchStartX = useRef(0)

  // Show onboarding ONLY for users who:
  // 1. Store has hydrated (localStorage loaded)
  // 2. Haven't seen onboarding yet (onboardingSeen = false)
  // 3. Are NOT currently authenticated (so new visitors see it, returning logged-in users don't)
  if (!hasHydrated) return null
  if (seen) return null
  if (status === "authenticated") return null

  const close = () => setSeen(true)

  // On last screen "Get Started" → mark seen + open login
  const getStarted = () => {
    setSeen(true)
    setLoginOpen(true)
  }

  const next = () => (last ? getStarted() : setI((v) => v + 1))
  const slide = SLIDES[i]
  const Icon = slide.icon

  // Swipe support
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -50 && i < SLIDES.length - 1) setI((v) => v + 1) // swipe left → next
    if (dx > 50 && i > 0) setI((v) => v - 1) // swipe right → prev
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#070F2B]">
      {/* Skip button — top right */}
      <button
        onClick={close}
        className="absolute right-4 top-4 z-10 inline-flex h-9 items-center gap-1 rounded-full bg-white/5 px-4 text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
      >
        Skip <X className="h-3.5 w-3.5" />
      </button>

      {/* Background glow */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${slide.bg}`} />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full opacity-10 blur-[80px] transition-colors"
        style={{ background: slide.color }}
      />

      {/* Slide content — swipeable */}
      <div
        className="flex flex-1 flex-col items-center justify-center px-8"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
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
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-8" : "w-2 bg-white/20"}`}
              style={idx === i ? { background: slide.color } : {}}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Get Started / Next button */}
        <Button
          className="h-13 w-full gap-2 py-3.5 text-base font-bold text-white shadow-lg transition active:scale-[0.98]"
          style={{ background: slide.color }}
          onClick={next}
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
        </Button>
      </div>
    </div>
  )
}
