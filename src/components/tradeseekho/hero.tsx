"use client"

import { motion } from "framer-motion"
import { ArrowRight, PlayCircle, Sparkles, Users, BookOpen, Globe, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useStore, useT } from "@/lib/store"
import { LANGS } from "@/lib/i18n"

export function Hero() {
  const t = useT()
  const lang = useStore((s) => s.lang)
  const urduFont = lang === "ur" || lang === "ar"

  return (
    <section className="relative overflow-hidden">
      <div className="hero-grid absolute inset-0 opacity-60" />
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
      <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:py-20 lg:grid-cols-2">
        {/* Copy */}
        <div className={urduFont ? "font-urdu" : ""}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="secondary" className="gap-1.5 border-brand/30 bg-brand-muted text-brand">
              <Sparkles className="h-3.5 w-3.5" /> {t("home.heroBadge")}
            </Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            {t("app.tagline")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            {t("app.subtitle")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Button size="lg" className="h-12 gap-2 bg-brand px-6 text-base font-bold text-brand-foreground shadow-lg shadow-brand/30 hover:bg-brand/90" asChild>
              <a href="#lessons">
                {t("home.heroCta")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="h-12 gap-2 px-6 text-base font-semibold">
              <PlayCircle className="h-5 w-5 text-brand" />
              {t("home.heroSecondary")}
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}
            className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            <Stat icon={Users} value="1.8k+" label={t("home.statsUsers")} />
            <Stat icon={BookOpen} value="6+" label={t("home.statsLessons")} />
            <Stat icon={Globe} value="4" label={t("home.statsLanguages")} />
            <Stat icon={Star} value="4.9" label={t("home.statsRating")} />
          </motion.div>
        </div>

        {/* Visual: candlestick card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }}
          className="relative hidden lg:block"
        >
          <div className="ts-card-sheen relative rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-brand/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-foreground font-bold">₸</span>
                <div>
                  <div className="text-sm font-bold">EUR/USD</div>
                  <div className="text-[11px] text-muted-foreground">Live demo</div>
                </div>
              </div>
              <Badge className="bg-brand-muted text-brand">▲ +0.42%</Badge>
            </div>
            <div className="mt-4 h-44 w-full">
              <CandlestickChart />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Mini label="Open" value="1.1000" />
              <Mini label="High" value="1.1045" accent="brand" />
              <Mini label="Low" value="1.0988" accent="gold" />
            </div>
          </div>
          <div className="absolute -right-3 -top-3 rotate-6 rounded-2xl border border-border bg-background px-3 py-2 text-xs font-semibold shadow-lg ts-float">
            📈 Pip: 0.0001
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Stat({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card/60 px-3 py-2.5">
      <Icon className="h-5 w-5 text-brand" />
      <div className="leading-tight">
        <div className="text-lg font-extrabold text-foreground">{value}</div>
        <div className="text-[11px] text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: "brand" | "gold" }) {
  return (
    <div className="rounded-lg bg-muted/60 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-sm font-bold ${accent === "brand" ? "text-brand" : accent === "gold" ? "text-gold-foreground" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  )
}

function CandlestickChart() {
  // Decorative SVG candlesticks
  const candles = [
    { o: 60, h: 30, l: 90, c: 50, up: true },
    { o: 50, h: 25, l: 80, c: 40, up: true },
    { o: 40, h: 20, l: 70, c: 55, up: false },
    { o: 55, h: 18, l: 75, c: 35, up: true },
    { o: 35, h: 15, l: 60, c: 28, up: false },
    { o: 28, h: 12, l: 50, c: 22, up: true },
    { o: 22, h: 10, l: 45, c: 30, up: false },
    { o: 30, h: 14, l: 55, c: 24, up: true },
    { o: 24, h: 8, l: 38, c: 18, up: true },
    { o: 18, h: 6, l: 30, c: 26, up: false },
  ]
  const W = 320, H = 176, pad = 8, cw = (W - pad * 2) / candles.length
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="grid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.04" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="url(#grid)" className="text-brand" />
      {[0.25, 0.5, 0.75].map((p) => (
        <line key={p} x1={0} x2={W} y1={H * p} y2={H * p} className="stroke-border" strokeWidth="1" strokeDasharray="3 4" />
      ))}
      {candles.map((c, i) => {
        const x = pad + i * cw + cw / 2
        const top = Math.min(c.o, c.c)
        const bottom = Math.max(c.o, c.c)
        const color = c.up ? "var(--brand)" : "#ef5350"
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={c.h} y2={c.l} stroke={color} strokeWidth="2" />
            <rect
              x={x - cw * 0.28}
              y={top}
              width={cw * 0.56}
              height={Math.max(2, bottom - top)}
              rx="2"
              fill={color}
            />
          </g>
        )
      })}
    </svg>
  )
}
