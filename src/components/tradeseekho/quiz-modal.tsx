"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, X, Trophy, RefreshCw, ArrowRight, Sparkles, Megaphone, Award } from "lucide-react"
import { useStore, useT } from "@/lib/store"
import { useSubmitQuiz } from "./use-data"
import { usePick } from "./localize"
import type { LessonDetailDTO, PublicQuizDTO, QuizSubmitResult } from "@/lib/types"
import { toast } from "sonner"

export function QuizContent({ lesson, quiz }: { lesson: LessonDetailDTO; quiz: PublicQuizDTO }) {
  const t = useT()
  const pick = usePick()
  const lang = useStore((s) => s.lang)
  const rtlFont = lang === "ur" ? "font-urdu" : lang === "ar" ? "font-arabic" : ""
  const urduFont = lang === "ur" || lang === "ar"
  const openLesson = useStore((s) => s.openLesson)
  const closeQuiz = useStore((s) => s.closeQuiz)
  const setCertOpen = useStore((s) => s.setCertOpen)
  const submit = useSubmitQuiz()

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<QuizSubmitResult | null>(null)
  const [showAd, setShowAd] = useState(false)

  const total = quiz.questions.length
  const answered = quiz.questions.filter((q) => answers[q.id] !== undefined).length
  const allAnswered = total > 0 && answered === total
  const urduFontClass = lang === "ur" ? "font-urdu" : lang === "ar" ? "font-arabic" : ""
  const urduLineStyle = lang === "ur" || lang === "ar" ? { lineHeight: 2.2, wordBreak: "break-word", overflowWrap: "break-word" } : undefined

  const onSubmit = async () => {
    if (!allAnswered) return
    const arr = quiz.questions.map((q) => answers[q.id])
    try {
      const res = await submit.mutateAsync({ lessonId: quiz.lessonId, answers: arr })
      setResult(res)
      if (res.showInterstitial) {
        setShowAd(true)
      } else {
        toast(res.passed ? t("toast.quizPassed") : t("toast.quizFailed"))
      }
      if (res.certificateId) {
        toast.success("🏆 Certificate earned!", { description: `You completed the ${res.certificateSlug} level.` })
      }
    } catch (err: any) {
      toast.error("Quiz submit failed. Please try again.")
    }
  }

  const onRetry = () => {
    setResult(null)
    setAnswers({})
    setShowAd(false)
  }

  const onNext = () => {
    closeQuiz()
    if (result?.nextLessonId) openLesson(result.nextLessonId)
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* Interstitial ad */}
      <AnimatePresence>
        {showAd && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-foreground/95 p-6 text-center"
          >
            <Megaphone className="h-10 w-10 text-gold" />
            <p className="text-background/80 text-sm">{t("footer.ad")} · AdMob</p>
            <Button variant="secondary" size="sm" className="mt-2" onClick={() => setShowAd(false)}>
              {t("action.skip")} →
            </Button>
            {result?.passed && <span className="text-[11px] text-brand">🎉 {t("toast.quizPassed")}</span>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b border-border p-5">
        <div className="flex items-center gap-2">
          <Badge className="bg-gold/20 text-gold-foreground">
            <Trophy className="h-3.5 w-3.5" /> {t("quiz.title")}
          </Badge>
          <span className="text-xs font-semibold text-muted-foreground">
            {total} {t("quiz.title")} · pass ≥ {quiz.passMark}
          </span>
        </div>
        <h2 className={`mt-2 text-xl font-extrabold leading-tight ${rtlFont}`}>
          {pick(lesson.title)}
        </h2>
      </div>

      {/* Progress */}
      <div className="border-b border-border bg-muted/40 px-5 py-2.5">
        <Progress value={total ? (answered / total) * 100 : 0} className="h-1.5" />
        <div className="mt-1.5 text-[11px] font-semibold text-muted-foreground">
          {answered} / {total}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-5" style={{ WebkitOverflowScrolling: "touch", minHeight: 0 }}>
        {result ? (
          <QuizResults quiz={quiz} result={result} urduFont={urduFont} />
        ) : (
          <div className="space-y-6">
            {quiz.questions.map((q, i) => (
              <div key={q.id} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-3 flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-brand px-1.5 text-xs font-bold text-brand-foreground">
                    {i + 1}
                  </span>
                  <p className={`flex-1 text-[15px] font-semibold leading-snug text-foreground ${urduFontClass}`} style={urduLineStyle}>
                    {pick(q.prompt)}
                  </p>
                </div>
                <div className="grid gap-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[q.id] === oi
                    return (
                      <button
                        key={oi}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                        className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-start text-sm transition ${
                          selected
                            ? "border-brand bg-brand-muted text-foreground"
                            : "border-border bg-background hover:border-brand/50 hover:bg-muted/40"
                        }`}
                      >
                        <span
                          className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                            selected ? "border-brand bg-brand text-brand-foreground" : "border-muted-foreground/40 text-muted-foreground"
                          }`}
                        >
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className={`flex-1 ${urduFontClass}`} style={urduLineStyle}>{pick(opt)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        {result ? (
          <>
            <ScoreBanner result={result} urduFont={urduFont} />
            {result.certificateId && (
              <button
                onClick={() => { closeQuiz(); setCertOpen(true) }}
                className="mt-3 flex w-full items-center gap-3 rounded-xl border-2 border-gold/50 bg-gradient-to-r from-gold/15 to-brand-muted/30 p-3 text-start transition hover:from-gold/25"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-gold-foreground shadow">
                  <Award className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-foreground">🏆 Certificate earned!</div>
                  <div className="text-xs text-muted-foreground">You completed the {result.certificateSlug} level — tap to view.</div>
                </div>
                <ArrowRight className="h-4 w-4 text-gold-foreground rtl:rotate-180" />
              </button>
            )}
            <div className="mt-3 flex gap-2">
              <Button variant="outline" className="h-11 flex-1 gap-2 font-bold" onClick={onRetry}>
                <RefreshCw className="h-4 w-4" /> {t("action.retryQuiz")}
              </Button>
              {result.passed && result.nextLessonId ? (
                <Button className="h-11 flex-1 gap-2 bg-brand font-bold text-brand-foreground hover:bg-brand/90" onClick={onNext}>
                  {t("action.nextLesson")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              ) : (
                <Button className="h-11 flex-1 font-bold" variant="secondary" onClick={closeQuiz}>
                  {t("action.close")}
                </Button>
              )}
            </div>
          </>
        ) : (
          <Button
            className="h-12 w-full gap-2 bg-brand text-base font-bold text-brand-foreground shadow-lg shadow-brand/30 hover:bg-brand/90 disabled:opacity-50"
            disabled={!allAnswered || submit.isPending}
            onClick={onSubmit}
          >
            {submit.isPending ? t("common.loading") : t("action.submit")}
          </Button>
        )}
      </div>
    </div>
  )
}

function ScoreBanner({ result, urduFont }: { result: QuizSubmitResult; urduFont: boolean }) {
  const t = useT()
  const lang = useStore((s) => s.lang)
  const rtlFont = lang === "ur" ? "font-urdu" : lang === "ar" ? "font-arabic" : ""
  const pct = Math.round((result.score / result.total) * 100)
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-4 rounded-xl p-4 ${result.passed ? "bg-brand-muted/60" : "bg-gold/15"}`}
    >
      <div className={`relative inline-flex h-14 w-14 items-center justify-center rounded-full ${
        result.passed ? "bg-brand text-brand-foreground" : "bg-gold text-gold-foreground"
      }`}>
        <span className="text-lg font-extrabold">{pct}%</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-base font-extrabold ${result.passed ? "text-brand" : "text-gold-foreground"}`}>
          {result.passed ? "🎉 " + t("quiz.passed") : t("quiz.failed", { need: result.passMark })}
        </div>
        <div className={`text-sm text-muted-foreground ${rtlFont}`}>
          {t("quiz.scored", { score: result.score, total: result.total })}
        </div>
      </div>
      {result.unlockedNext && <Sparkles className="h-5 w-5 text-brand" />}
    </motion.div>
  )
}

function QuizResults({
  quiz, result, urduFont,
}: {
  quiz: PublicQuizDTO
  result: QuizSubmitResult
  urduFont: boolean
}) {
  const t = useT()
  const pick = usePick()
  const lang = useStore((s) => s.lang)
  const urduFontClass = lang === "ur" ? "font-urdu" : lang === "ar" ? "font-arabic" : ""
  const urduLineStyle = lang === "ur" || lang === "ar" ? { lineHeight: 2.2, wordBreak: "break-word", overflowWrap: "break-word" } : undefined
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("quiz.reviewAnswers")}
      </p>
      {quiz.questions.map((q, i) => {
        const correct = result.correctFlags[i]
        const correctIdx = result.correctIndices[i]
        const expl = result.explanations[i]
        return (
          <div key={q.id} className={`rounded-xl border-2 bg-card p-4 ${correct ? "border-brand/50" : "border-destructive/50"}`}>
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-md ${
                correct ? "bg-brand" : "bg-destructive"
              }`}>
                {correct ? <Check className="h-5 w-5" strokeWidth={3} /> : <X className="h-5 w-5" strokeWidth={3} />}
              </span>
              <p className={`flex-1 text-[15px] font-semibold leading-snug text-foreground ${urduFontClass}`} style={urduLineStyle}>
                {pick(q.prompt)}
              </p>
            </div>
            <div className="mt-3 space-y-1.5 ps-11">
              <div className={`text-sm ${urduFontClass}`} style={urduLineStyle}>
                <span className="text-muted-foreground">{t("quiz.correctAnswer")}: </span>
                <span className="font-bold text-brand">
                  {String.fromCharCode(65 + correctIdx)}. {pick(q.options[correctIdx])}
                </span>
              </div>
              {expl && (expl.en || expl.ur || expl.hi || expl.ar) && (
                <div className={`rounded-lg bg-muted/60 p-2.5 text-sm text-muted-foreground ${urduFontClass}`} style={urduLineStyle}>
                  <span className="font-semibold text-foreground">{t("quiz.explanation")}: </span>
                  {pick(expl)}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
