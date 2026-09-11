"use client"

import { motion } from "framer-motion"
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
  const urduFont = lang === "ur" || lang === "ar"
  const openLesson = useStore((s) => s.openLesson)
  const toggleBm = useStore((s) => s.toggleBookmark)
  const isBookmarked = useStore((s) => s.bookmarks.includes(lesson.id))
  const mutBookmark = useToggleBookmark()

  const locked = !lesson.passed && lesson.orderInCategory > 1 && !lesson.completed

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
      onClick={() => !locked && openLesson(lesson.id)}
      className={`ts-card-sheen group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10 ${
        locked ? "opacity-70" : "border-border hover:border-brand/50"
      }`}
    >
      {/* Thumbnail */}
      <div className="relative h-32 overflow-hidden">
        {lesson.imageUrl ? (
          <img src={lesson.imageUrl} alt="" className="h-full w-full object-cover no-select" draggable={false} />
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
          className="absolute end-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow transition hover:scale-110"
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-gold text-gold" : "text-muted-foreground"}`} />
        </button>
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/90 px-3 py-1 text-xs font-bold text-background">
              <Lock className="h-3.5 w-3.5" /> {t("lesson.locked")}
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
        <h3 className={`line-clamp-2 text-base font-bold leading-snug text-foreground ${urduFont ? "font-urdu" : ""}`}>
          {pick(lesson.title)}
        </h3>
        <p className={`mt-1 line-clamp-2 text-sm text-muted-foreground ${urduFont ? "font-urdu" : ""}`}>
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
