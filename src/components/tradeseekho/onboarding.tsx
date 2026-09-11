"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GraduationCap, BarChart3, Languages, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore, useT } from "@/lib/store"

const SLIDES = [
  { icon: GraduationCap, key: "onb.slide1Title", body: "onb.slide1Body", color: "var(--brand)" },
  { icon: BarChart3, key: "onb.slide2Title", body: "onb.slide2Body", color: "#00bfa5" },
  { icon: Languages, key: "onb.slide3Title", body: "onb.slide3Body", color: "var(--gold)" },
] as const

export function Onboarding() {
  const t = useT()
  const lang = useStore((s) => s.lang)
  const urduFont = lang === "ur" || lang === "ar"
  const seen = useStore((s) => s.onboardingSeen)
  const hasHydrated = useStore((s) => s.hasHydrated)
  const setSeen = useStore((s) => s.setOnboardingSeen)
  const [i, setI] = useState(0)
  const last = i === SLIDES.length - 1

  // Never render during SSR / before the persisted store rehydrates — avoids
  // both a hydration mismatch and a flash for returning users.
  if (!hasHydrated || seen) return null

  const close = () => setSeen(true)
  const next = () => (last ? close() : setI((v) => v + 1))
  const slide = SLIDES[i]
  const Icon = slide.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8"
      >
        <button
          onClick={close}
          className="absolute end-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-muted-foreground hover:bg-muted"
        >
          {t("action.skip")}
        </button>

        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <span
                className="inline-flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{ background: slide.color }}
              >
                <Icon className="h-8 w-8" />
              </span>
              <h2 className={`mt-5 text-2xl font-extrabold tracking-tight text-foreground ${urduFont ? "font-urdu" : ""}`}>
                {t(slide.key)}
              </h2>
              <p className={`mt-2 text-sm text-muted-foreground ${urduFont ? "font-urdu" : ""}`}>
                {t(slide.body)}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="mt-6 flex items-center gap-1.5">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={`h-1.5 rounded-full transition-all ${idx === i ? "w-7 bg-brand" : "w-1.5 bg-muted-foreground/30"}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={() => setI(Math.max(0, i - 1))}
              className={`text-sm font-semibold text-muted-foreground ${i === 0 ? "invisible" : ""}`}
            >
              ‹ Prev
            </button>
            <Button
              className="gap-2 bg-brand font-bold text-brand-foreground hover:bg-brand/90"
              onClick={next}
            >
              {last ? (
                <>
                  {t("action.finish")} <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  {t("action.next")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
