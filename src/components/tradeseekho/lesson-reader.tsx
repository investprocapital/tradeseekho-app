"use client"

import { useMemo } from "react"
import ReactMarkdown from "react-markdown"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bookmark, X, ArrowRight, BarChart3, Lock, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { useStore, useT } from "@/lib/store"
import { useLessonDetail, useToggleBookmark } from "./use-data"
import { usePick } from "./localize"
import { QuizContent } from "./quiz-modal"
import { AdBanner } from "./ad-banner"
import { toast } from "sonner"

export function LessonReader() {
  const t = useT()
  const pick = usePick()
  const lang = useStore((s) => s.lang)
  const urduFont = lang === "ur" || lang === "ar"
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
        side="end"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl lg:max-w-3xl"
        onContextMenu={(e) => e.preventDefault()}
      >
        {lesson && (
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
                <SheetTitle className={`mt-2 pr-8 text-2xl font-extrabold leading-tight ${urduFont ? "font-urdu" : ""}`}>
                  {pick(lesson.title)}
                </SheetTitle>
                <SheetDescription className={`mt-1 ${urduFont ? "font-urdu" : ""}`}>
                  {pick(lesson.summary)}
                </SheetDescription>
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

            {/* Body — read-only, non-selectable */}
            <ScrollArea className="ts-scroll flex-1">
              <div
                className={`no-select mx-auto max-w-2xl px-5 py-6 ${urduFont ? "font-urdu" : ""}`}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
              >
                {lesson.imageUrl && (
                  <div className="relative mb-5 overflow-hidden rounded-xl">
                    <img src={lesson.imageUrl} alt="" className="h-44 w-full object-cover no-select" draggable={false} />
                  </div>
                )}
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

                <Separator className="my-6" />

                {lesson.passed && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-brand-muted/50 p-3 text-sm font-bold text-brand">
                    <CheckCircle2 className="h-5 w-5" /> {t("quiz.passed")}
                  </div>
                )}

                {/* AdMob banner inside the reader (web + mobile + iOS) */}
                <div className="mt-2">
                  <AdBanner compact />
                </div>
              </div>
            </ScrollArea>

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
        )}
        {isLoading && (
          <div className="flex flex-1 items-center justify-center p-10 text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
