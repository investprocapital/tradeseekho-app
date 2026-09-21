"use client"

import { useMemo, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bookmark, X, ArrowRight, BarChart3, Lock, CheckCircle2, BookOpen } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore, useT } from "@/lib/store"
import { useLessonDetail, useToggleBookmark } from "./use-data"
import { usePick } from "./localize"
import { QuizContent } from "./quiz-modal"
import { AdBanner } from "./ad-banner"
import { TradingViewChart } from "./tradingview-chart"
import { toast } from "sonner"
import { useState, useRef, useEffect } from "react"
import { LANG_ORDER, LANGS } from "@/lib/i18n"

export function LessonReader() {
  const t = useT()
  const pick = usePick()
  const lang = useStore((s) => s.lang)
  const setLang = useStore((s) => s.setLang)
  
  
  const rtlFont = lang === "ur" ? "font-urdu" : lang === "ar" ? "font-arabic" : ""
  const [zoomImage, setZoomImage] = useState<string | null>(null)
  const activeLessonId = useStore((s) => s.activeLessonId)
  const quizOpenFor = useStore((s) => s.quizOpenFor)
  const closeLesson = useStore((s) => s.closeLesson)
  const closeQuiz = useStore((s) => s.closeQuiz)
  const openQuiz = useStore((s) => s.openQuiz)
  const openLesson = useStore((s) => s.openLesson)
  const bookmarks = useStore((s) => s.bookmarks)
  const toggleBookmark = useStore((s) => s.toggleBookmark)
  const mutBm = useToggleBookmark()
  const { data, isLoading } = useLessonDetail(activeLessonId)

  const lesson = data?.lesson
  const quiz = data?.quiz
  const open = !!activeLessonId
  const showQuiz = !!activeLessonId && quizOpenFor === activeLessonId && !!quiz

  const mdComponents = useMemo(
    () => ({
      h2: ({ node, ...props }: any) => <h2 className="mt-6 text-xl font-extrabold text-foreground" {...props} />,
      h3: ({ node, ...props }: any) => <h3 className="mt-5 text-lg font-bold text-foreground" {...props} />,
      p: ({ node, ...props }: any) => <p className="mt-3 leading-7 text-foreground/90" {...props} />,
      ul: ({ node, ...props }: any) => <ul className="mt-3 list-disc space-y-1.5 ps-5" {...props} />,
      ol: ({ node, ...props }: any) => <ol className="mt-3 list-decimal space-y-1.5 ps-5" {...props} />,
      li: ({ node, ...props }: any) => <li className="leading-7 text-foreground/90" {...props} />,
      blockquote: ({ node, ...props }: any) => (
        <blockquote className="mt-4 rounded-r-lg border-s-4 border-brand bg-brand-muted/40 ps-4 pe-3 py-3 text-sm font-medium text-foreground" {...props} />
      ),
      code: ({ node, ...props }: any) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-[0.85em] font-mono text-brand" {...props} />
      ),
      table: ({ node, ...props }: any) => (
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm" {...props} />
        </div>
      ),
      th: ({ node, ...props }: any) => <th className="bg-muted px-3 py-2 text-start font-bold" {...props} />,
      td: ({ node, ...props }: any) => <td className="border-t border-border px-3 py-2" {...props} />,
      strong: ({ node, ...props }: any) => <strong className="font-bold text-foreground" {...props} />,
    }),
    [],
  )

  return (
    <Sheet open={open} onOpenChange={(v) => !v && closeLesson()}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-2xl lg:max-w-3xl"
        onContextMenu={(e) => e.preventDefault()}
      >
        {lesson ? (
          <>
            {/* Header */}
            <SheetHeader className="flex flex-row items-start justify-between gap-3 border-b border-border p-5 pr-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge style={{ background: lesson.category.color || "var(--brand)" }} className="text-white">
                    {pick(lesson.category.name)}
                  </Badge>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {t("lesson.lessonNofM", { n: lesson.orderInCategory, m: lesson.totalInCategory })}
                  </span>
                </div>
                <SheetTitle className={`mt-2 pr-8 text-2xl font-extrabold leading-tight ${rtlFont}`}>
                  {pick(lesson.title)}
                </SheetTitle>
                <SheetDescription className={`mt-1 ${rtlFont}`}>
                  {pick(lesson.summary)}
                </SheetDescription>
                {/* Language switcher buttons */}
                <div className="mt-3 flex gap-1.5">
                  {LANG_ORDER.map((code) => (
                    <button
                      key={code}
                      onClick={() => setLang(code)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                        lang === code
                          ? "bg-brand text-brand-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      } ${LANGS[code].dir === "rtl" ? "font-urdu text-xs" : ""}`}
                    >
                      {LANGS[code].native}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  aria-label={t("nav.bookmarks")}
                  onClick={() => {
                    toggleBookmark(lesson.id)
                    mutBm.mutate({ lessonId: lesson.id, add: !bookmarks.includes(lesson.id) })
                    toast(bookmarks.includes(lesson.id) ? t("toast.unbookmarked") : t("toast.bookmarked"))
                  }}
                >
                  <Bookmark className={`h-5 w-5 ${bookmarks.includes(lesson.id) ? "fill-gold text-gold" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={closeLesson} aria-label={t("action.close")}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </SheetHeader>

            {showQuiz && quiz ? (
              <QuizContent lesson={lesson} quiz={quiz} />
            ) : (
            <>
            {/* Progress bar */}
            <div className="border-b border-border bg-muted/40 px-5 py-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                <span>{t("lesson.lessonNofM", { n: lesson.orderInCategory, m: lesson.totalInCategory })}</span>
                <span>{Math.round((lesson.orderInCategory / Math.max(1, lesson.totalInCategory)) * 100)}%</span>
              </div>
              <Progress
                value={(lesson.orderInCategory / Math.max(1, lesson.totalInCategory)) * 100}
                className="mt-2 h-1.5"
              />
            </div>

            {/* Body — read-only, non-selectable, scrollable */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ WebkitOverflowScrolling: "touch", minHeight: 0 }}
              onContextMenu={(e) => e.preventDefault()}
            >
              <div
                className={`no-select mx-auto max-w-2xl px-5 py-6 ${rtlFont}`}
                style={lang === "ur" ? { fontFamily: "var(--font-noto-nastaliq), var(--font-poppins), serif" } : lang === "ar" ? { fontFamily: "var(--font-noto-naskh-arabic), serif" } : undefined}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
              >
                {lesson.imageUrl && (
                  <div
                    className="relative mb-5 overflow-hidden rounded-xl cursor-zoom-in"
                    onClick={() => setZoomImage(lesson.imageUrl!)}
                    onDoubleClick={() => setZoomImage(lesson.imageUrl!)}
                  >
                    <img src={lesson.imageUrl} alt="" className="h-48 w-full object-cover no-select" draggable={false} />
                    <div className="absolute bottom-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">🔍 Tap or double-click to zoom</div>
                  </div>
                )}
                {pick(lesson.content).trim() ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="prose-tradeseekho text-[15px] leading-7"
                  >
                    <ReactMarkdown components={mdComponents}>
                      {pick(lesson.content)}
                    </ReactMarkdown>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-muted text-brand">
                      <BookOpen className="h-8 w-8" />
                    </span>
                    <h3 className="text-lg font-extrabold">Coming Soon</h3>
                    <p className="max-w-xs text-sm text-muted-foreground">
                      This lesson's content is being prepared. Check back soon — our team is writing it!
                    </p>
                  </div>
                )}

                <Separator className="my-6" />

                {lesson.passed && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-brand-muted/50 p-3 text-sm font-bold text-brand">
                    <CheckCircle2 className="h-5 w-5" /> {t("quiz.passed")}
                  </div>
                )}

                {/* TradingView EUR/USD live chart (300px, interactive) */}
                <TradingViewChart height={300} />

                {/* AdMob banner inside the reader (web + mobile + iOS) */}
                <div className="mt-4">
                  <AdBanner compact />
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="border-t border-border bg-background p-4">
              {quiz ? (
                lesson.locked ? (
                  <Button className="h-12 w-full gap-2 text-base font-bold" variant="secondary" disabled>
                    <Lock className="h-5 w-5" /> {t("lesson.locked")} — {t("lesson.unlockHint")}
                  </Button>
                ) : (
                  <Button
                    className="h-12 w-full gap-2 bg-brand text-base font-bold text-brand-foreground shadow-lg shadow-brand/30 hover:bg-brand/90"
                    onClick={() => openQuiz(lesson.id)}
                  >
                    <BarChart3 className="h-5 w-5" />
                    {t("action.takeQuiz")}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Button>
                )
              ) : lesson.nextLessonId ? (
                <Button
                  className="h-12 w-full gap-2 text-base font-bold"
                  variant="outline"
                  onClick={() => openLesson(lesson.nextLessonId!)}
                >
                  {t("action.nextLesson")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              ) : (
                <Button className="h-12 w-full text-base font-bold" variant="secondary" onClick={closeLesson}>
                  {t("action.backToHome")}
                </Button>
              )}
            </div>
            </>
            )}
          </>
        ) : null}
        {isLoading && (
          <div className="flex flex-1 items-center justify-center p-10">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
            </div>
          </div>
        )}
        {!lesson && !isLoading && (
          <div className="flex flex-1 items-center justify-center p-10 text-sm text-muted-foreground">
            Lesson not found. Please try again.
          </div>
        )}
      </SheetContent>

      {/* Image zoom lightbox — pinch zoom + double tap + swipe to close */}
      <AnimatePresence>
        {zoomImage && (
          <ZoomLightbox src={zoomImage} onClose={() => setZoomImage(null)} />
        )}
      </AnimatePresence>
    </Sheet>
  )
}

/* ---------- Pinch-zoom + double-tap + swipe-to-close lightbox ---------- */
function ZoomLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const lastTapRef = useRef(0)
  const pinchRef = useRef({ startDist: 0, startScale: 1 })
  const panRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0, isPanning: false })
  const swipeRef = useRef({ startY: 0, isSwiping: false })

  // Use refs for current values inside event listeners (avoids stale closures)
  const scaleRef = useRef(1)
  const posRef = useRef({ x: 0, y: 0 })

  const updateScale = (s: number) => {
    const clamped = Math.max(1, Math.min(5, s))
    scaleRef.current = clamped
    setScale(clamped)
  }

  const updatePos = (p: { x: number; y: number }) => {
    posRef.current = p
    setPos(p)
  }

  // Native touch handlers via useEffect (more reliable than React synthetic events)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch start
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        pinchRef.current.startDist = Math.sqrt(dx * dx + dy * dy)
        pinchRef.current.startScale = scaleRef.current
        panRef.current.isPanning = false
      } else if (e.touches.length === 1) {
        const t = e.touches[0]
        // Double tap detection
        const now = Date.now()
        if (now - lastTapRef.current < 300) {
          updateScale(scaleRef.current > 1 ? 1 : 2.5)
          updatePos({ x: 0, y: 0 })
          lastTapRef.current = 0
        } else {
          lastTapRef.current = now
        }
        // Pan start
        panRef.current.startX = t.clientX
        panRef.current.startY = t.clientY
        panRef.current.startPosX = posRef.current.x
        panRef.current.startPosY = posRef.current.y
        panRef.current.isPanning = scaleRef.current > 1
        // Swipe start
        swipeRef.current.startY = t.clientY
        swipeRef.current.isSwiping = scaleRef.current === 1
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.touches.length === 2 && pinchRef.current.startDist > 0) {
        // Pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const ratio = dist / pinchRef.current.startDist
        updateScale(pinchRef.current.startScale * ratio)
      } else if (e.touches.length === 1) {
        const t = e.touches[0]
        if (panRef.current.isPanning) {
          // Pan when zoomed in
          const dx = t.clientX - panRef.current.startX
          const dy = t.clientY - panRef.current.startY
          updatePos({
            x: panRef.current.startPosX + dx,
            y: panRef.current.startPosY + dy,
          })
        } else if (swipeRef.current.isSwiping) {
          // Swipe down to close
          const dy = t.clientY - swipeRef.current.startY
          if (dy > 100) onClose()
        }
      }
    }

    const handleTouchEnd = () => {
      pinchRef.current.startDist = 0
      panRef.current.isPanning = false
      swipeRef.current.isSwiping = false
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.2 : 0.2
      updateScale(scaleRef.current + delta)
    }

    // Use passive: false so we can call preventDefault
    el.addEventListener("touchstart", handleTouchStart, { passive: false })
    el.addEventListener("touchmove", handleTouchMove, { passive: false })
    el.addEventListener("touchend", handleTouchEnd, { passive: false })
    el.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      el.removeEventListener("touchstart", handleTouchStart)
      el.removeEventListener("touchmove", handleTouchMove)
      el.removeEventListener("touchend", handleTouchEnd)
      el.removeEventListener("wheel", handleWheel)
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      ref={containerRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95"
      style={{ touchAction: "none" }}
    >
      {/* Close button */}
      <button
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Hint text */}
      {scale === 1 && (
        <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-xs text-white/40">
          <p>Pinch to zoom · Double tap · Swipe down to close</p>
        </div>
      )}

      {/* Zoomable image */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        className="max-h-[90vh] max-w-full rounded-lg object-contain"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          transformOrigin: "center center",
          willChange: "transform",
          userSelect: "none",
          WebkitUserSelect: "none",
          pointerEvents: "none",
        }}
        draggable={false}
      />
    </motion.div>
  )
}
