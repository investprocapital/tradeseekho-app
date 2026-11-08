"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { Lock, CheckCircle2, Clock, Bookmark, ChevronRight, CircleDot, BarChart3 } from "lucide-react"
import { useStore, useT } from "@/lib/store"
import { usePick } from "./localize"
import { CategoryIcon } from "./icons"
import { SectionHeading } from "./category-cards"
import { useToggleBookmark } from "./use-data"
import { toast } from "sonner"
import type { LessonListItemDTO } from "@/lib/types"

export function LessonGrid({ lessons }: { lessons: LessonListItemDTO[] }) {
  const t = useT()
  const activeCategory = useStore((s) => s.activeCategorySlug)

  // Total published lessons per category (for the "Lesson N of M" hint on cards)
  const totalsByCategory = lessons.reduce<Record<string, number>>((acc, l) => {
    acc[l.categorySlug] = (acc[l.categorySlug] ?? 0) + 1
    return acc
  }, {})

  return (
    <section id="lessons" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10">
      <SectionHeading
        title={activeCategory === "all" ? t("home.featuredTitle") : `${t("nav.lessons")}`}
        subtitle={t("home.featuredSubtitle")}
      />
      {lessons.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">{t("common.empty")}</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((l, i) => (
            <LessonCard key={l.id} lesson={l} index={i} totalInCategory={totalsByCategory[l.categorySlug] ?? l.orderInCategory} />
          ))}
        </div>
      )}
    </section>
  )
}

function LessonCard({ lesson, index, totalInCategory }: { lesson: LessonListItemDTO; index: number; totalInCategory: number }) {
  const t = useT()
  const pick = usePick()
  const lang = useStore((s) => s.lang)
  const rtlFont = lang === "ur" ? "font-urdu" : lang === "ar" ? "font-arabic" : ""
  const openLesson = useStore((s) => s.openLesson)
  const toggleBm = useStore((s) => s.toggleBookmark)
  const isBookmarked = useStore((s) => s.bookmarks.includes(lesson.id))
  const mutBookmark = useToggleBookmark()
  // Pro-lesson flow: if user clicks a Pro-locked lesson (Intermediate/Advanced
  // lesson 2+), we intercept. Not logged in → Signup popup first (then Pro
  // payment popup auto-opens after login). Logged in but not Pro → Pro payment
  // popup directly. Beginner lessons (1-12) are always free, no login needed.
  const { data: session } = useSession()
  const setLoginOpen = useStore((s) => s.setLoginOpen)
  const setProOpen = useStore((s) => s.setProOpen)
  const setProPlan = useStore((s) => s.setProPlan)
  const setPendingProAfterLogin = useStore((s) => s.setPendingProAfterLogin)
  const setLoginReason = useStore((s) => s.setLoginReason)

  const locked = !lesson.passed && lesson.orderInCategory > 1 && !lesson.completed
  // Pro paywall: Intermediate/Advanced lessons 2+ require Pro (Beginner = all free).
  // Matches the server-side paywall in /api/lessons/[id]/route.ts (isPremiumLocked).
  // Note: we DON'T check lesson.isFree here because that field is true for all
  // lessons by default in the DB — the real gate is category + orderInCategory.
  const isProLocked =
    (lesson.categorySlug === "intermediate" || lesson.categorySlug === "advanced") &&
    lesson.orderInCategory > 1

  const handleLessonClick = () => {
    if (isProLocked) {
      // Pro-locked lesson clicked.
      if (!session?.user) {
        // Not logged in → open Signup popup first. After login, the pendingProAfterLogin
        // flag (persisted) triggers the Pro payment popup automatically.
        setLoginReason("pro_lesson")
        setPendingProAfterLogin(true)
        setProPlan("lessons")
        setLoginOpen(true)
        return
      }
      // Logged in but not Pro → open Pro payment popup directly.
      setProPlan("lessons")
      setProOpen(true)
      return
    }
    // Free lesson (Beginner 1-12, or Intermediate/Advanced lesson 1 preview) → open normally.
    openLesson(lesson.id)
  }

  const onBookmark = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleBm(lesson.id)
    mutBookmark.mutate({ lessonId: lesson.id, add: !isBookmarked })
    toast(isBookmarked ? t("toast.unbookmarked") : t("toast.bookmarked"))
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      className={`ts-card-sheen group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10 ${
        locked ? "opacity-80 border-border hover:border-brand/40" : "border-border hover:border-brand/50"
      }`}
    >
      {/* Full-card click target (covers the whole card, sits above content but
          below the bookmark button so taps work on mobile + web) */}
      <button
        type="button"
        onClick={handleLessonClick}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer"
        aria-label={`${t("action.readLesson")}: ${pick(lesson.title)}`}
      />
      {/* Thumbnail — Next.js Image with quality=75 + lazy loading + WebP */}
      <div className="relative h-32 overflow-hidden">
        {lesson.imageUrl ? (
          <Image
            src={lesson.imageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="h-full w-full object-cover no-select"
            draggable={false}
            quality={75}
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${lesson.categoryColor || "#00c853"}22, ${lesson.categoryColor || "#00c853"}08)` }}
          >
            <CategoryIcon name={lesson.categoryIcon} className="h-10 w-10" style={{ color: lesson.categoryColor || "var(--brand)" }} />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow"
            style={{ background: lesson.categoryColor || "var(--brand)" }}
          >
            {pick({ en: lesson.categorySlug, ur: "", hi: "", ar: "" }) || lesson.categorySlug}
          </span>
          {lesson.hasQuiz && (
            <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-bold text-foreground shadow">
              <BarChart3 className="h-3 w-3" /> {t("quiz.title")}
            </span>
          )}
        </div>
        <button
          onClick={onBookmark}
          aria-label={t("nav.bookmarks")}
          className="absolute end-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow transition hover:scale-110"
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-gold text-gold" : "text-muted-foreground"}`} />
        </button>
        {locked && (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-start bg-gradient-to-t from-background/80 via-background/10 to-transparent p-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/90 px-2.5 py-1 text-[10px] font-bold text-background">
              <Lock className="h-3 w-3" /> {t("lesson.locked")}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-bold text-brand">{t("lesson.lessonNofM", { n: lesson.orderInCategory, m: totalInCategory })}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{t("lesson.duration", { n: lesson.durationMin })}</span>
        </div>
        <h3 className={`line-clamp-2 text-base font-bold leading-snug text-foreground ${rtlFont}`}>
          {pick(lesson.title)}
        </h3>
        <p className={`mt-1 line-clamp-2 text-sm text-muted-foreground ${rtlFont}`}>
          {pick(lesson.summary)}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <StatusPill lesson={lesson} />
          <span className="inline-flex items-center gap-1 text-sm font-bold text-brand">
            {t("action.readLesson")}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
          </span>
        </div>
      </div>
    </motion.article>
  )
}

function StatusPill({ lesson }: { lesson: LessonListItemDTO }) {
  const t = useT()
  if (lesson.passed) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-muted px-2 py-0.5 text-[11px] font-bold text-brand">
        <CheckCircle2 className="h-3.5 w-3.5" /> {t("lesson.complete")}
      </span>
    )
  }
  if (lesson.completed) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-bold text-gold-foreground">
        <CircleDot className="h-3.5 w-3.5" /> {t("lesson.inProgress")}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
      <CircleDot className="h-3.5 w-3.5" /> New
    </span>
  )
}
