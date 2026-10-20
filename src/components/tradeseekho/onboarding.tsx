"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
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
  },
  {
    icon: TrendingUp,
    // Screen 2: Only ONE title, then Roman Urdu, then English
    titleUr: "Live Signals & Alerts",
    titleEn: "BTC, GOLD, EURUSD ke Live Signals aur Price Alerts",
    subUr: "Live Signals & Price Alerts for BTC, GOLD, EURUSD",
    subEn: "",
    color: "#0072FF",
  },
  {
    icon: Crown,
    // Screen 3: Roman Urdu title → Urdu title → English title → Roman Urdu desc → Urdu desc → English desc
    titleUr: "Bano Pro Trader",
    titleEn: "بنو پرو ٹریڈر",
    subUr: "Become a Pro Trader",
    subEn: "Quiz pass karo, Market Gauge samjho aur confident trading shuru karo",
    color: "#F3BA2F",
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

  if (!hasHydrated) return null
  if (seen) return null
  if (status === "authenticated") return null

  const goLogin = () => {
    setSeen(true)
    setLoginOpen(true)
  }

  const next = () => {
    if (last) {
      goLogin()
    } else {
      setI(i + 1)
    }
  }

  const slide = SLIDES[i]
  const Icon = slide.icon

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", backgroundColor: "#070F2B" }}>
      {/* Skip button */}
      <button
        type="button"
        onClick={goLogin}
        style={{ position: "absolute", right: 16, top: 16, zIndex: 30, display: "inline-flex", height: 36, alignItems: "center", gap: 4, borderRadius: 999, background: "rgba(255,255,255,0.05)", padding: "0 16px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", border: "none", cursor: "pointer" }}
      >
        Skip <X size={14} />
      </button>

      {/* Background glow */}
      <div style={{ position: "absolute", left: "50%", top: "33%", width: 288, height: 288, transform: "translateX(-50%)", borderRadius: 999, opacity: 0.1, filter: "blur(80px)", background: slide.color, pointerEvents: "none" }} />

      {/* Slide content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px", textAlign: "center" }}>
        {/* Icon */}
        <div style={{ display: "inline-flex", width: 96, height: 96, alignItems: "center", justifyContent: "center", borderRadius: 24, background: slide.color, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
          <Icon size={48} color="#fff" />
        </div>

        {/* Screen 1: Urdu title → English → Roman Urdu → English */}
        {i === 0 && (
          <>
            <h2 style={{ marginTop: 32, fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "var(--font-noto-nastaliq), serif" }}>
              {slide.titleUr}
            </h2>
            <p style={{ marginTop: 4, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>
              {slide.titleEn}
            </p>
            <p style={{ marginTop: 16, maxWidth: 320, fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.6)" }}>
              {slide.subUr}
            </p>
            <p style={{ marginTop: 6, maxWidth: 320, fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.3)" }}>
              {slide.subEn}
            </p>
          </>
        )}

        {/* Screen 2: Single title → Roman Urdu → English (no duplicate) */}
        {i === 1 && (
          <>
            <h2 style={{ marginTop: 32, fontSize: 24, fontWeight: 800, color: "#fff" }}>
              {slide.titleUr}
            </h2>
            <p style={{ marginTop: 12, maxWidth: 320, fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.6)" }}>
              {slide.titleEn}
            </p>
            <p style={{ marginTop: 6, maxWidth: 320, fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.3)" }}>
              {slide.subUr}
            </p>
          </>
        )}

        {/* Screen 3: Roman Urdu → Urdu → English → Roman Urdu desc → Urdu desc → English desc */}
        {i === 2 && (
          <>
            <h2 style={{ marginTop: 32, fontSize: 24, fontWeight: 800, color: "#fff" }}>
              {slide.titleUr}
            </h2>
            <h3 style={{ marginTop: 6, fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "var(--font-noto-nastaliq), serif" }}>
              {slide.titleEn}
            </h3>
            <p style={{ marginTop: 4, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>
              {slide.subUr}
            </p>
            <p style={{ marginTop: 16, maxWidth: 320, fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.6)" }}>
              {slide.subEn}
            </p>
            <p style={{ marginTop: 8, maxWidth: 320, fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-noto-nastaliq), serif" }}>
              کوئز پاس کرو، مارکیٹ گیج سمجھو اور کانفیڈنٹ ٹریڈنگ شروع کرو
            </p>
            <p style={{ marginTop: 6, maxWidth: 320, fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.3)" }}>
              Pass quizzes, learn Market Gauge &amp; start confident trading
            </p>
          </>
        )}
      </div>

      {/* Bottom: dots + buttons */}
      <div style={{ flexShrink: 0, padding: "16px 32px 40px" }}>
        {/* Dots */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              style={{
                height: 8,
                width: idx === i ? 32 : 8,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                background: idx === i ? slide.color : "rgba(255,255,255,0.2)",
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          {i > 0 && (
            <button
              type="button"
              onClick={() => setI(i - 1)}
              style={{ height: 56, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", padding: "0 24px", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)", cursor: "pointer" }}
            >
              ‹ Back
            </button>
          )}
          <button
            type="button"
            onClick={next}
            style={{ height: 56, flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 8, border: "none", background: slide.color, fontSize: 16, fontWeight: 700, color: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", cursor: "pointer" }}
          >
            {last ? (
              <>Get Started <Check size={20} /></>
            ) : (
              <>Next <ArrowRight size={20} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
