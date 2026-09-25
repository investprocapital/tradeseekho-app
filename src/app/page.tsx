"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Sprout, LineChart, Trophy, CheckCircle2, Award, BookOpen, Crown, ArrowRight, Lock, BarChart3, ChevronRight } from "lucide-react"
import { useStore } from "@/lib/store"
import { useLessonsBundle, useProMe } from "@/components/tradeseekho/use-data"
import { Header } from "@/components/tradeseekho/header"
import { Footer } from "@/components/tradeseekho/footer"
import { BrokerAdBanner } from "@/components/tradeseekho/broker-ad-banner"
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
  const lang = useStore((s) => s.lang)
  const bottomTab = useStore((s) => s.bottomTab)
  const openLesson = useStore((s) => s.openLesson)
  const setBottomTab = useStore((s) => s.setBottomTab)
  const setActiveCategory = useStore((s) => s.setActiveCategory)
  const setProOpen = useStore((s) => s.setProOpen)
  const { data: proMe } = useProMe()
  const isPro = proMe?.proStatus === "active"
  const { data, isLoading } = useLessonsBundle("all")

  // Auth gate: if user is not logged in, show Login dialog automatically
  useEffect(() => {
    if (status === "unauthenticated" && !loginOpen) {
      setLoginOpen(true)
    }
  }, [status, loginOpen, setLoginOpen])

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

            {/* Choose Your Level */}
            <section className="mb-4">
              <h2 className="mb-2 px-1 text-base font-extrabold tracking-tight text-foreground">
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
                    <LessonRow key={l.id} lesson={l} lang={lang} isPro={isPro} seqLocked={!isPro && i > 0 && !visibleLessons[i - 1].passed} onOpen={() => openLesson(l.id)} onPro={() => setProOpen(true)} />
                  ))
                )}
              </div>
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
                    return <QuizRow key={l.id} lesson={l} lang={lang} isPro={isPro} seqLocked={seqLocked} onOpen={() => openLesson(l.id)} onPro={() => setProOpen(true)} />
                  })
                )}
              </div>
            </section>
          </>
        ) : null}
        <Footer />

        {/* Broker Ad Banner — fixed above bottom nav (rotates every 10s: Exness → XM → OctaFX) */}
        <div className="shrink-0 mb-2 border-t border-border/50 bg-background/95 px-2 py-1.5">
          <BrokerAdBanner fixed />
        </div>
      </main>

      <BottomNav />

      {/* Overlays */}
      <LessonReader />
      <BookmarksSheet />
      <CertificateSheet />
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

function ProgressMini({ icon: Icon, value, label, color }: { icon: any; value: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-card px-2 py-2">
      <Icon className="h-4 w-4" style={{ color }} />
      <span className="mt-0.5 text-sm font-extrabold leading-none">{value}</span>
      <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</span>
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
        className="group flex flex-col items-center gap-2 overflow-hidden rounded-2xl border-2 p-3 text-center transition-all hover:-translate-y-0.5"
        style={{ borderColor: `${category.color || "#00c853"}40`, background: `linear-gradient(135deg, ${category.color || "#00c853"}10, transparent)` }}
      >
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow" style={{ background: category.color || "#00c853" }}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="w-full">
          <h3 className={`text-sm font-extrabold leading-tight ${lang === "ur" || lang === "ar" ? "font-urdu" : ""}`}>{category.name[lang] || category.name.en}</h3>
          <span className="mt-0.5 inline-block rounded-full bg-background/70 px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">{done}/{total}</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: category.color || "var(--brand)" }} />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-sm transition group-hover:scale-105" style={{ background: category.color || "var(--brand)" }}>
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
      style={{ borderColor: `${category.color || "#00c853"}40`, background: `linear-gradient(135deg, ${category.color || "#00c853"}10, transparent)` }}
    >
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow" style={{ background: category.color || "#00c853" }}>
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className={`text-base font-extrabold ${lang === "ur" || lang === "ar" ? "font-urdu" : ""}`}>{category.name[lang] || category.name.en}</h3>
          <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">{done}/{total}</span>
        </div>
        <p className={`mt-0.5 line-clamp-1 text-xs text-muted-foreground ${lang === "ur" || lang === "ar" ? "font-urdu" : ""}`}>{category.description[lang] || category.description.en}</p>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: category.color || "var(--brand)" }} />
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm transition group-hover:scale-105" style={{ background: category.color || "var(--brand)" }}>
        {done > 0 ? "Continue" : "Start"}
        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
      </span>
    </motion.button>
  )
}

function LessonRow({ lesson, lang, isPro, onOpen, onPro, seqLocked }: { lesson: LessonListItemDTO; lang: string; isPro: boolean; onOpen: () => void; onPro: () => void; seqLocked?: boolean }) {
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
        <span className="text-xs font-extrabold">{lesson.orderInCategory}</span>
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">{lesson.title[lang] || lesson.title.en}</div>
        <div className="text-[11px] text-muted-foreground">{lesson.categorySlug} · {lesson.durationMin} min{!lesson.isFree && " · PRO"}{seqLocked && " · Locked"}</div>
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
