"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Sprout, LineChart, Trophy, CheckCircle2, Award, BookOpen, Crown, ArrowRight, Lock, BarChart3, ChevronRight, Bell } from "lucide-react"
import { useStore } from "@/lib/store"
import type { Lang } from "@/lib/i18n"
import { useLessonsBundle, useProMe, useCurrentUser } from "@/components/tradeseekho/use-data"
import { useAlertChecker } from "@/components/tradeseekho/use-alert-checker"
import { Header } from "@/components/tradeseekho/header"
import { Footer } from "@/components/tradeseekho/footer"
import { BrokerAdBanner } from "@/components/tradeseekho/broker-ad-banner"
import { AffiliateAdBanner } from "@/components/tradeseekho/affiliate-ad-banner"
import { SignalList } from "@/components/tradeseekho/signal-list"
import { PriceAlertSheet } from "@/components/tradeseekho/price-alert-sheet"
import { MarketGaugeSheet } from "@/components/tradeseekho/market-gauge-sheet"
import { BottomNav } from "@/components/tradeseekho/bottom-nav"
import { LessonReader } from "@/components/tradeseekho/lesson-reader"
import { BookmarksSheet } from "@/components/tradeseekho/bookmarks-sheet"
import { CertificateSheet } from "@/components/tradeseekho/certificate-sheet"
import { LoginDialog } from "@/components/tradeseekho/login-dialog"
import { LeaderboardSheet } from "@/components/tradeseekho/leaderboard-sheet"
import { SettingsSheet } from "@/components/tradeseekho/settings-sheet"
import { NotificationsSheet } from "@/components/tradeseekho/notifications-sheet"
import { SearchDialog } from "@/components/tradeseekho/search-dialog"
import { EditProfileDialog } from "@/components/tradeseekho/edit-profile-dialog"
import { ProDialog } from "@/components/tradeseekho/pro-dialog"
import { AdminPanel } from "@/components/tradeseekho/admin-panel"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type { CategoryDTO, LessonListItemDTO } from "@/lib/types"
import type { LucideIcon } from "lucide-react"

const LEVEL_ICONS: Record<string, LucideIcon> = { Sprout, LineChart, Trophy }

export default function Home() {
  const { data: session, status } = useSession()
  const setLoginOpen = useStore((s) => s.setLoginOpen)
  const loginOpen = useStore((s) => s.loginOpen)
  const activeCategory = useStore((s) => s.activeCategorySlug)
  const showAdmin = useStore((s) => s.showAdmin)
  const setShowAdmin = useStore((s) => s.setShowAdmin)
  const lang = useStore((s) => s.lang)
  const setLang = useStore((s) => s.setLang)
  const bottomTab = useStore((s) => s.bottomTab)
  const openLesson = useStore((s) => s.openLesson)
  const setBottomTab = useStore((s) => s.setBottomTab)
  const setActiveCategory = useStore((s) => s.setActiveCategory)
  const setProOpen = useStore((s) => s.setProOpen)
  const setProPlan = useStore((s) => s.setProPlan)
  const { data: proMe } = useProMe()
  // Check SPECIFIC plans — not just proStatus.
  // proStatus="active" is set when ANY plan is approved, but each feature
  // should only unlock if the user has the corresponding plan.
  const hasLessonsPro = proMe?.proPlans?.includes("lessons") ?? false
  const hasAlertsPro = proMe?.proPlans?.includes("alerts") ?? false
  const hasSignalsPro = proMe?.proPlans?.includes("signals") ?? false
  // For lesson/quiz locking: only "lessons" plan unlocks all lessons
  const isPro = hasLessonsPro

  // Save email to localStorage when user is authenticated (for auto-fill next login)
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      try { localStorage.setItem("last_email", session.user.email) } catch {}
    }
  }, [status, session])
  const { data: userData } = useCurrentUser()

  // Auto-apply user's saved preferred language from Supabase on login.
  // This ensures the language persists across devices — even if localStorage
  // is cleared, the user's language preference is restored from their profile.
  useEffect(() => {
    if (status === "authenticated" && userData?.user?.preferredLang) {
      const savedLang = userData.user.preferredLang as Lang
      if (["en", "ur", "hi", "ar"].includes(savedLang) && savedLang !== lang) {
        setLang(savedLang)
      }
    }
  }, [status, userData, lang, setLang])
  const { data, isLoading } = useLessonsBundle("all")

  // Global price alert checker — polls every 20s, shows toast when target hit.
  // Also creates a DB notification (shows in the bell) + browser notification.
  useAlertChecker()

  // Auth gate: if user is not logged in, show Login dialog automatically.
  // BUT: don't open if onboarding is still showing (onboarding has its own
  // "Get Started" button that opens login).
  const onboardingSeen = useStore((s) => s.onboardingSeen)
  useEffect(() => {
    if (status === "unauthenticated" && !loginOpen && onboardingSeen) {
      setLoginOpen(true)
    }
  }, [status, loginOpen, setLoginOpen, onboardingSeen])

  // ROLE-GATED ADMIN PANEL: showAdmin is persisted in localStorage, but it
  // MUST only be active when the logged-in user's role is actually "admin".
  // This prevents the admin panel from showing on client dashboards if the
  // persisted flag is stale (e.g. admin logged out + a client logged in on
  // the same device, or the admin's role was changed). We auto-CLEAR showAdmin
  // if the user is not an admin. We do NOT auto-SET it (the admin chooses to
  // enter via login) so that "Exit Admin" still works.
  useEffect(() => {
    if (showAdmin && status === "authenticated") {
      const role = userData?.user?.role
      if (role && role !== "admin") {
        // User is NOT an admin — force-clear the admin panel
        setShowAdmin(false)
      }
    }
    if (showAdmin && status === "unauthenticated") {
      // Not logged in at all — force-clear
      setShowAdmin(false)
    }
  }, [showAdmin, status, userData, setShowAdmin])

  const lessons = data?.lessons ?? []
  const categories = data?.categories ?? []
  const visibleLessons = activeCategory === "all" ? lessons : lessons.filter((l) => l.categorySlug === activeCategory)
  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name[lang] || categories.find((c) => c.slug === activeCategory)?.name.en || "All Lessons"
  const completedCount = lessons.filter((l) => l.passed).length
  const totalLessons = lessons.length
  // Lessons that have a quiz
  const quizLessons = lessons.filter((l) => l.hasQuiz)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4" style={{ WebkitOverflowScrolling: "touch", minHeight: 0 }}>
        {showAdmin ? (
          <AdminPanel />
        ) : bottomTab === "home" ? (
          <>
            {/* Progress strip */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 grid grid-cols-3 gap-2">
              <ProgressMini icon={CheckCircle2} value={`${completedCount}/${totalLessons}`} label={lang === "ur" || lang === "ar" ? "مکمل" : lang === "hi" ? "पूर्ण" : "Passed"} color="var(--brand)" />
              <ProgressMini icon={Award} value={`${Math.round(totalLessons ? (completedCount / totalLessons) * 100 : 0)}%`} label={lang === "ur" || lang === "ar" ? "پیش رفت" : lang === "hi" ? "प्रगति" : "Progress"} color="var(--gold)" />
              <ProgressMini icon={BookOpen} value={`${totalLessons}`} label={lang === "ur" || lang === "ar" ? "اسباق" : lang === "hi" ? "पाठ" : "Lessons"} color="#00bfa5" />
            </motion.div>

            {/* Live Signals */}
            <SignalList />

            {/* Price Alerts — card below Live Signals */}
            <PriceAlertCard />

            {/* Market Gauge — card below Price Alerts */}
            <MarketGaugeCard />

            {/* Choose Your Level */}
            <section className="mb-4">
              <h2 className="mb-2 px-1 text-base font-black tracking-tight text-foreground">
                {lang === "ur" || lang === "ar" ? "اپنا لیول منتخب کریں" : lang === "hi" ? "अपना स्तर चुनें" : "Choose Your Level"}
              </h2>
              {isLoading ? (
                <div className="grid grid-cols-2 gap-2.5">
                  <Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" />
                </div>
              ) : categories.length >= 3 ? (
                <>
                  {/* Row 1: Beginner + Intermediate side-by-side (50/50) */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {categories.slice(0, 2).map((c, i) => (
                      <LevelBox key={c.id} category={c} index={i} compact lessons={lessons.filter((l) => l.categoryId === c.id)} onOpen={() => { setActiveCategory(c.slug); setBottomTab("lessons") }} />
                    ))}
                  </div>
                  {/* Row 2: Advanced full width */}
                  <div className="mt-2.5">
                    {categories.slice(2).map((c, i) => (
                      <LevelBox key={c.id} category={c} index={i + 2} lessons={lessons.filter((l) => l.categoryId === c.id)} onOpen={() => { setActiveCategory(c.slug); setBottomTab("lessons") }} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {categories.map((c, i) => (
                    <LevelBox key={c.id} category={c} index={i} compact lessons={lessons.filter((l) => l.categoryId === c.id)} onOpen={() => { setActiveCategory(c.slug); setBottomTab("lessons") }} />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : bottomTab === "lessons" ? (
          <>
            {/* Lessons list */}
            <section className="mt-2">
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-base font-extrabold tracking-tight text-foreground">
                  {activeCategory === "all" ? (lang === "ur" || lang === "ar" ? "تمام اسباق" : lang === "hi" ? "सभी पाठ" : "All Lessons") : activeCategoryName}
                </h2>
                <button onClick={() => { setBottomTab("home"); setActiveCategory("all") }} className="text-xs font-bold text-brand">← Levels</button>
              </div>
              {/* Category filter chips */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                <button onClick={() => setActiveCategory("all")} className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${activeCategory === "all" ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"}`}>
                  {lang === "ur" || lang === "ar" ? "سب" : "All"}
                </button>
                {categories.map((c) => (
                  <button key={c.id} onClick={() => setActiveCategory(c.slug)} className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${activeCategory === c.slug ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"}`}>
                    {c.name[lang] || c.name.en}
                  </button>
                ))}
              </div>
              <div className="grid gap-2.5">
                {isLoading ? (
                  <><Skeleton className="h-14 rounded-xl" /><Skeleton className="h-14 rounded-xl" /><Skeleton className="h-14 rounded-xl" /></>
                ) : visibleLessons.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No lessons yet.</p>
                ) : (
                  visibleLessons.map((l, i) => (
                    <LessonRow key={l.id} lesson={l} lang={lang} isPro={isPro} seqLocked={!isPro && i > 0 && !visibleLessons[i - 1].passed} onOpen={() => openLesson(l.id)} onPro={() => { setProPlan("lessons"); setProOpen(true) }} />
                  ))
                )}
              </div>
              {/* Affiliate ad banner — at bottom of lessons list. Admin-controlled. */}
              <AffiliateAdBanner />
            </section>
          </>
        ) : bottomTab === "quiz" ? (
          <>
            {/* Quiz list — lessons that have quizzes */}
            <section className="mt-2">
              <h2 className="mb-2 px-1 text-base font-extrabold tracking-tight text-foreground">
                {lang === "ur" || lang === "ar" ? "کئز" : lang === "hi" ? "प्रश्नोत्तरी" : "Quizzes"}
              </h2>
              <p className="mb-3 px-1 text-xs text-muted-foreground">
                {lang === "ur" || lang === "ar" ? "کئز دیں اور اگلا سبق کھلیں۔ 3/5 پاس کرنا ضروری ہے۔" : "Take a quiz to unlock the next lesson. Pass 3/5 to continue."}
              </p>
              <div className="grid gap-2.5">
                {isLoading ? (
                  <><Skeleton className="h-14 rounded-xl" /><Skeleton className="h-14 rounded-xl" /></>
                ) : quizLessons.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No quizzes available yet.</p>
                ) : (
                  quizLessons.map((l, i) => {
                    const lessonIdx = lessons.indexOf(l)
                    const seqLocked = !isPro && lessonIdx > 0 && !lessons[lessonIdx - 1].passed
                    return <QuizRow key={l.id} lesson={l} lang={lang} isPro={isPro} seqLocked={seqLocked} onOpen={() => openLesson(l.id)} onPro={() => { setProPlan("lessons"); setProOpen(true) }} />
                  })
                )}
              </div>
            </section>
          </>
        ) : null}
        {/* Footer removed from dashboard — About Us / Privacy Policy / Contact Us
            are now in Settings > Support section. Keeps the dashboard clean. */}

        {/* ─── What Students Say — swipeable review cards ─── */}
        {!showAdmin && <ReviewsSection />}

        {/* Broker Ad Banner — only in client mode (not admin) */}
        {!showAdmin && (
          <div className="shrink-0 mb-2 border-t border-border/50 bg-background/95 px-2 py-1.5" style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}>
            <BrokerAdBanner fixed />
          </div>
        )}
      </main>

      {/* Bottom Nav — HIDDEN in admin mode. Admin panel has its own tab nav.
          This prevents the admin from accidentally exiting to client pages. */}
      {!showAdmin && <BottomNav />}

      {/* Overlays */}
      <LessonReader />
      <BookmarksSheet />
      <CertificateSheet />
      <PriceAlertSheet />
      <MarketGaugeSheet />
      <LoginDialog />
      <LeaderboardSheet />
      <SettingsSheet />
      <NotificationsSheet />
      <SearchDialog />
      <EditProfileDialog />
      <ProDialog />
    </div>
  )
}

// Market Gauge card — shown on home dashboard below Price Alerts.
// Opens a sheet with searchable TradingView technical analysis gauge.
function MarketGaugeCard() {
  const setMarketGaugeOpen = useStore((s) => s.setMarketGaugeOpen)
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setMarketGaugeOpen(true)}
      className="mt-2 flex w-full items-center gap-3 rounded-xl border-2 border-sky-500/30 bg-gradient-to-r from-sky-500/5 to-transparent p-3 text-start transition hover:border-sky-500/60 hover:from-sky-500/10 active:scale-[0.99]"
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white">
        <BarChart3 className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black text-foreground">Market Gauge</span>
          <span className="rounded-full bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-bold text-sky-500">
            📊 Live
          </span>
        </div>
        <div className="mt-0.5 truncate text-[11px] font-bold text-muted-foreground">
          Strong Buy / Sell — Search any pair (GOLD, BTC, EURUSD)
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-sky-500" />
    </motion.button>
  )
}

// Price Alert card — shown on home dashboard below Live Signals.
// Shows a summary of active alerts + opens the Price Alert sheet on click.
function PriceAlertCard() {
  const setPriceAlertsOpen = useStore((s) => s.setPriceAlertsOpen)
  // Fetch ad settings to check if Price Alerts is enabled
  const { data: adSettings } = useQuery<{ priceAlertsEnabled?: boolean }>({
    queryKey: ["ad-settings"],
    queryFn: async () => {
      const res = await fetch("/api/ads/config", { cache: "no-store" })
      if (!res.ok) return { priceAlertsEnabled: true }
      return res.json()
    },
    staleTime: 60_000,
  })
  // If admin has disabled Price Alerts, hide the card entirely
  if (adSettings?.priceAlertsEnabled === false) return null
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setPriceAlertsOpen(true)}
      className="mt-2 flex w-full items-center gap-3 rounded-xl border-2 border-gold/30 bg-gradient-to-r from-gold/5 to-transparent p-3 text-start transition hover:border-gold/60 hover:from-gold/10 active:scale-[0.99]"
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold text-white">
        <Bell className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black text-foreground">Price Alerts</span>
          <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold text-gold">
            🔔 Live
          </span>
        </div>
        <div className="mt-0.5 truncate text-[11px] font-bold text-muted-foreground">
          GOLD · BTC · EURUSD · OIL — tap to set alerts
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-gold" />
    </motion.button>
  )
}

function ProgressMini({ icon: Icon, value, label, color }: { icon: any; value: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-card px-2 py-2">
      <Icon className="h-4 w-4" style={{ color }} />
      <span className="mt-0.5 text-sm font-black leading-none">{value}</span>
      <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  )
}

function LevelBox({
  category, index, lessons, onOpen, compact = false,
}: {
  category: CategoryDTO; index: number; lessons: { id: string; passed: boolean; orderInCategory: number; title: { en: string; ur: string; hi: string; ar: string } }[]; onOpen: () => void; compact?: boolean
}) {
  const lang = useStore((s) => s.lang)
  const Icon = LEVEL_ICONS[category.icon || ""] || BookOpen
  const total = lessons.length
  const done = lessons.filter((l) => l.passed).length
  const pct = total ? Math.round((done / total) * 100) : 0

  if (compact) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.06 }}
        onClick={onOpen}
        className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border-2 p-3 text-center transition-all hover:-translate-y-0.5"
        style={{ borderColor: `${category.color || "#00c853"}80`, background: `linear-gradient(135deg, ${category.color || "#00c853"}25, ${category.color || "#00c853"}08)` }}
      >
        {/* Colored top accent bar */}
        <div className="absolute left-0 right-0 top-0 h-1" style={{ background: category.color || "#00c853" }} />
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow" style={{ background: category.color || "#00c853" }}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="w-full">
          <h3 className={`text-sm font-black leading-tight ${lang === "ur" || lang === "ar" ? "font-urdu" : ""}`}>{category.name[lang] || category.name.en}</h3>
          <span className="mt-0.5 inline-block rounded-full bg-background/70 px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">{done}/{total}</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: category.color || "var(--brand)" }} />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black text-white shadow-sm transition group-hover:scale-105" style={{ background: category.color || "var(--brand)" }}>
          {done > 0 ? "Continue" : "Start"}
          <ArrowRight className="h-3 w-3 rtl:rotate-180" />
        </span>
      </motion.button>
    )
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.06 }}
      onClick={onOpen}
      className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 p-3 text-start transition-all hover:-translate-y-0.5"
      style={{ borderColor: `${category.color || "#00c853"}80`, background: `linear-gradient(135deg, ${category.color || "#00c853"}25, ${category.color || "#00c853"}08)` }}
    >
      {/* Colored top accent bar */}
      <div className="absolute left-0 right-0 top-0 h-1.5" style={{ background: category.color || "#00c853" }} />
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow" style={{ background: category.color || "#00c853" }}>
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className={`text-base font-black ${lang === "ur" || lang === "ar" ? "font-urdu" : ""}`}>{category.name[lang] || category.name.en}</h3>
          <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">{done}/{total}</span>
        </div>
        <p className={`mt-0.5 line-clamp-2 text-xs font-semibold text-muted-foreground ${lang === "ur" || lang === "ar" ? "font-urdu" : ""}`}>{category.description[lang] || category.description.en}</p>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: category.color || "var(--brand)" }} />
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black text-white shadow-sm transition group-hover:scale-105" style={{ background: category.color || "var(--brand)" }}>
        {done > 0 ? "Continue" : "Start"}
        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
      </span>
    </motion.button>
  )
}

function LessonRow({ lesson, lang, isPro, onOpen, onPro, seqLocked }: { lesson: LessonListItemDTO; lang: string; isPro: boolean; onOpen: () => void; onPro: () => void; seqLocked?: boolean }) {
  const proLocked = !lesson.isFree && !isPro
  const isLocked = proLocked || seqLocked
  // Show a blurred placeholder title for Pro-locked lessons so the user can't
  // read the lesson name without upgrading. (Per requirement: blur titles.)
  const titleText = lesson.title[lang] || lesson.title.en
  const blurredTitle = proLocked ? "Locked — Upgrade to Pro to unlock" : titleText
  return (
    <button
      onClick={() => {
        if (proLocked) { onPro(); return }
        if (seqLocked) {
          toast(lang === "ur" || lang === "ar" ? "براہ کرم پہلا سبق مکمل کریں" : lang === "hi" ? "कृपया पिछला पाठ पूर्ण करें" : "Please complete the previous lesson first")
          return
        }
        onOpen()
      }}
      className={`flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-start transition ${proLocked ? "border-gold/30 opacity-90" : isLocked ? "opacity-60" : "hover:border-brand/50"}`}
    >
      <span
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${proLocked ? "bg-gold/80" : ""}`}
        style={proLocked ? {} : { background: lesson.categoryColor || "var(--brand)" }}
      >
        {proLocked ? <Lock className="h-4 w-4" /> : <span className="text-xs font-extrabold">{lesson.orderInCategory}</span>}
      </span>
      <div className="min-w-0 flex-1">
        <div className={`truncate text-sm font-bold ${proLocked ? "select-none blur-[3px]" : ""}`}>{blurredTitle}</div>
        <div className="text-[11px] text-muted-foreground">
          {lesson.categorySlug} · {lesson.durationMin} min
          {proLocked && <span className="font-bold text-gold-foreground"> · PRO</span>}
          {!proLocked && !lesson.isFree && " · PRO"}
          {seqLocked && " · Locked"}
        </div>
      </div>
      {proLocked ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold-foreground">
          <Crown className="h-3 w-3" /> PRO
        </span>
      ) : lesson.passed ? <CheckCircle2 className="h-4 w-4 text-brand" /> : seqLocked ? <Lock className="h-4 w-4 text-muted-foreground" /> : null}
    </button>
  )
}

function QuizRow({ lesson, lang, isPro, seqLocked, onOpen, onPro }: { lesson: LessonListItemDTO; lang: string; isPro: boolean; seqLocked?: boolean; onOpen: () => void; onPro: () => void }) {
  const proLocked = !lesson.isFree && !isPro
  const isLocked = proLocked || seqLocked
  return (
    <button
      onClick={() => {
        if (proLocked) { onPro(); return }
        if (seqLocked) {
          toast(lang === "ur" || lang === "ar" ? "براہ کرم پہلا سبق مکمل کریں" : lang === "hi" ? "कृपया पिछला पाठ पूर्ण करें" : "Please complete the previous lesson first")
          return
        }
        onOpen()
      }}
      className={`flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-start transition ${isLocked ? "opacity-60" : "hover:border-brand/50"}`}
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: lesson.categoryColor || "var(--brand)" }}>
        <BarChart3 className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">{lesson.title[lang] || lesson.title.en}</div>
        <div className="text-[11px] text-muted-foreground">
          {lesson.passed ? "✓ Passed" : proLocked ? "PRO" : seqLocked ? "Locked" : "Ready"}
        </div>
      </div>
      {proLocked ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold-foreground">
          <Crown className="h-3 w-3" /> PRO
        </span>
      ) : lesson.passed ? <CheckCircle2 className="h-4 w-4 text-brand" /> : seqLocked ? <Lock className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-brand" />}
    </button>
  )
}

/* ─── What Students Say — swipeable dark review cards ─── */
const REVIEWS = [
  { stars: 5, text: "Best app for beginners, 4 languages me samjhata hai, bht easy hai", name: "Ahmed", city: "Lahore" },
  { stars: 5, text: "Live signals are very accurate, daily profit ho raha hai", name: "Ali Raza", city: "Karachi" },
  { stars: 5, text: "Market Gauge feature is amazing, beginner se pro ban gaya", name: "Usman Khan", city: "Islamabad" },
  { stars: 5, text: "Trading Seekho ne meri life change kar di, highly recommended", name: "Bilal", city: "Multan" },
  { stars: 5, text: "Brilliant app! Learned forex in Urdu, now trading confidently in London", name: "James", city: "London, UK" },
  { stars: 5, text: "हिंदी में समझाता है, बहुत आसान है। मैंने पहले ही प्रॉफिट कमाना शुरू कर दिया", name: "Rajesh", city: "Mumbai, India" },
  { stars: 5, text: "Best trading education app,Market Gauge is a game changer for me", name: "Abdullah", city: "Dubai, UAE" },
  { stars: 5, text: "Simple, effective and multilingual. Highly recommended for all traders", name: "Sarah", city: "Manchester, UK" },
]

function ReviewsSection() {
  const [reviewIdx, setReviewIdx] = useState(0)
  const touchStartX = useRef(0)

  // Check if reviews are enabled in admin settings
  const { data: adSettings } = useQuery<{ reviewsEnabled?: boolean }>({
    queryKey: ["ad-settings-reviews"],
    queryFn: async () => {
      const res = await fetch("/api/ads/config", { cache: "no-store" })
      if (!res.ok) return { reviewsEnabled: true }
      return res.json()
    },
    staleTime: 60_000,
  })
  // If admin has disabled reviews, hide the section entirely
  if (adSettings?.reviewsEnabled === false) return null

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -40) setReviewIdx((v) => Math.min(REVIEWS.length - 1, v + 1))
    if (dx > 40) setReviewIdx((v) => Math.max(0, v - 1))
  }

  const r = REVIEWS[reviewIdx]

  return (
    <section className="mb-4">
      <h2 className="mb-2 px-1 text-base font-black tracking-tight text-foreground">
        What Students Say
      </h2>
      <div
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-4"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <motion.div
          key={reviewIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-2"
        >
          {/* Stars */}
          <div className="flex gap-0.5">
            {Array.from({ length: r.stars }).map((_, i) => (
              <span key={i} className="text-sm text-amber-400">★</span>
            ))}
          </div>
          {/* Review text */}
          <p className="text-sm leading-relaxed text-foreground">
            "{r.text}"
          </p>
          {/* Name + City */}
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-muted text-xs font-bold text-brand">
              {r.name.charAt(0)}
            </span>
            <span className="text-xs font-bold text-foreground">{r.name}</span>
            <span className="text-xs text-muted-foreground">· {r.city}</span>
          </div>
        </motion.div>

        {/* Dots */}
        <div className="mt-3 flex items-center gap-1.5">
          {REVIEWS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setReviewIdx(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === reviewIdx ? "w-6 bg-brand" : "w-1.5 bg-muted-foreground/30"}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
