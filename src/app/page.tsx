"use client"

import { motion } from "framer-motion"
import { Sprout, LineChart, Trophy, CheckCircle2, Award, BookOpen, Crown, ArrowRight, Lock } from "lucide-react"
import { useStore } from "@/lib/store"
import { useLessonsBundle } from "@/components/tradeseekho/use-data"
import { Header } from "@/components/tradeseekho/header"
import { Footer } from "@/components/tradeseekho/footer"
import { AdBanner } from "@/components/tradeseekho/ad-banner"
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
import type { CategoryDTO } from "@/lib/types"
import type { LucideIcon } from "lucide-react"

const LEVEL_ICONS: Record<string, LucideIcon> = { Sprout, LineChart, Trophy }

export default function Home() {
  const activeCategory = useStore((s) => s.activeCategorySlug)
  const showAdmin = useStore((s) => s.showAdmin)
  const lang = useStore((s) => s.lang)
  const bottomTab = useStore((s) => s.bottomTab)
  const openLesson = useStore((s) => s.openLesson)
  const setBottomTab = useStore((s) => s.setBottomTab)
  const setActiveCategory = useStore((s) => s.setActiveCategory)
  const { data, isLoading } = useLessonsBundle("all")

  const lessons = data?.lessons ?? []
  const categories = data?.categories ?? []
  // Filter by selected category when on lessons tab; show all on home
  const visibleLessons = activeCategory === "all" ? lessons : lessons.filter((l) => l.categorySlug === activeCategory)
  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name[lang] || categories.find((c) => c.slug === activeCategory)?.name.en || "All Lessons"
  const completedCount = lessons.filter((l) => l.passed).length
  const totalLessons = lessons.length

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-4 sm:px-4">
        {showAdmin ? (
          <AdminPanel />
        ) : (
          <>
            {/* Progress strip (compact, top) */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 grid grid-cols-3 gap-2"
            >
              <ProgressMini icon={CheckCircle2} value={`${completedCount}/${totalLessons}`} label={lang === "ur" || lang === "ar" ? "مکمل" : lang === "hi" ? "पूर्ण" : "Passed"} color="var(--brand)" />
              <ProgressMini icon={Award} value={`${Math.round(totalLessons ? (completedCount / totalLessons) * 100 : 0)}%`} label={lang === "ur" || lang === "ar" ? "پیش رفت" : lang === "hi" ? "प्रगति" : "Progress"} color="var(--gold)" />
              <ProgressMini icon={BookOpen} value={`${totalLessons}`} label={lang === "ur" || lang === "ar" ? "اسباق" : lang === "hi" ? "पाठ" : "Lessons"} color="#00bfa5" />
            </motion.div>

            {/* Choose Your Level — 3 boxes, top priority */}
            <section className="mb-4">
              <h2 className="mb-2 px-1 text-base font-extrabold tracking-tight text-foreground">
                {lang === "ur" || lang === "ar" ? "اپنا لیول منتخب کریں" : lang === "hi" ? "अपना स्तर चुनें" : "Choose Your Level"}
              </h2>
              <div className="grid gap-2.5">
                {isLoading ? (
                  <>
                    <Skeleton className="h-20 rounded-2xl" />
                    <Skeleton className="h-20 rounded-2xl" />
                    <Skeleton className="h-20 rounded-2xl" />
                  </>
                ) : (
                  categories.map((c, i) => (
                    <LevelBox key={c.id} category={c} index={i} lessons={lessons.filter((l) => l.categoryId === c.id)} onOpen={() => { setActiveCategory(c.slug); setBottomTab("lessons") }} />
                  ))
                )}
              </div>
            </section>

            {/* Get Pro banner (compact) */}
            <AdBanner />

            {/* Lessons tab content (shown when bottom tab = lessons) */}
            {bottomTab === "lessons" && (
              <section className="mt-6">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h2 className="text-base font-extrabold tracking-tight text-foreground">
                    {activeCategory === "all" ? (lang === "ur" || lang === "ar" ? "تمام اسباق" : lang === "hi" ? "सभी पाठ" : "All Lessons") : activeCategoryName}
                  </h2>
                  <button onClick={() => { setBottomTab("home"); setActiveCategory("all") }} className="text-xs font-bold text-brand">← Levels</button>
                </div>
                <div className="grid gap-2.5">
                  {visibleLessons.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => openLesson(l.id)}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-start transition hover:border-brand/50"
                    >
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: l.categoryColor || "var(--brand)" }}>
                        <span className="text-xs font-extrabold">{l.orderInCategory}</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold">{l.title[lang] || l.title.en}</div>
                        <div className="text-[11px] text-muted-foreground">{l.categorySlug} · {l.durationMin} min</div>
                      </div>
                      {l.passed ? <CheckCircle2 className="h-4 w-4 text-brand" /> : l.orderInCategory > 1 && !l.passed ? <Lock className="h-4 w-4 text-muted-foreground" /> : null}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
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
  category,
  index,
  lessons,
  onOpen,
}: {
  category: CategoryDTO
  index: number
  lessons: { id: string; passed: boolean; orderInCategory: number; title: { en: string; ur: string; hi: string; ar: string } }[]
  onOpen: () => void
}) {
  const lang = useStore((s) => s.lang)
  const Icon = LEVEL_ICONS[category.icon || ""] || BookOpen
  const total = lessons.length
  const done = lessons.filter((l) => l.passed).length
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
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
        {/* progress bar */}
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
