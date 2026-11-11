import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth"
import { withDbRetry } from "@/lib/db-retry"
import type { QuizSubmitResult } from "@/lib/types"

export const dynamic = "force-dynamic"

// POST /api/quiz/submit  body: { lessonId, answers: number[] }
// Computes score, persists Progress (with DB retry for Neon resilience),
// returns correctness + explanations + unlock info.
export async function POST(req: Request) {
  const userId = await getCurrentUserId()
  let body: { lessonId?: string; answers?: number[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 })
  }
  const { lessonId, answers } = body
  if (!lessonId || !Array.isArray(answers)) {
    return NextResponse.json({ error: "bad_body" }, { status: 400 })
  }

  try {
    const lesson = await withDbRetry(() => db.lesson.findUnique({
      where: { id: lessonId },
      include: { quiz: { include: { questions: { orderBy: { createdAt: "asc" } } } }, category: true },
    }))
    if (!lesson || !lesson.quiz) {
      return NextResponse.json({ error: "not_found" }, { status: 404 })
    }

    const questions = lesson.quiz.questions
    const total = questions.length
    if (answers.length !== total) {
      return NextResponse.json({ error: "answers_length" }, { status: 400 })
    }

    const correctFlags: boolean[] = []
    const correctIndices: number[] = []
    let score = 0
    questions.forEach((q, i) => {
      const correct = answers[i] === q.correctIndex
      correctFlags.push(correct)
      correctIndices.push(q.correctIndex)
      if (correct) score++
    })

    const passed = score >= lesson.quiz.passMark

    // Was this lesson already passed before? (first-pass detection)
    const prev = await withDbRetry(() => db.progress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    }))
    const isFirstPass = passed && !(prev?.passed)

    // Persist progress (upsert) — CRITICAL: must use withDbRetry so Neon
    // connection drops don't silently lose the progress write. Without this,
    // the quiz returns passed=true (computed in memory) but the DB write fails
    // → next lesson stays locked (bug: "quiz pass but next lesson still locked").
    await withDbRetry(() => db.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { score, total, passed, completed: true },
      create: { userId, lessonId, score, total, passed, completed: true },
    }))

    // Verify the write actually persisted by reading it back.
    const verifyProg = await withDbRetry(() => db.progress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
      select: { passed: true },
    }))

    // Increment cumulative lessonsCompleted on a first pass
    let lessonsCompleted = 0
    if (isFirstPass) {
      try {
        await withDbRetry(() => db.user.update({
          where: { id: userId },
          data: { lessonsCompleted: { increment: 1 } },
        }))
      } catch {
        // User row might not exist — create it then increment
        try {
          await withDbRetry(() => db.user.upsert({
            where: { id: userId },
            update: { lessonsCompleted: { increment: 1 } },
            create: { id: userId, role: "student", lessonsCompleted: 1 },
          }))
        } catch {}
      }
    }

    const user = await withDbRetry(() => db.user.findUnique({ where: { id: userId } }))
    lessonsCompleted = user?.lessonsCompleted ?? 0

    // Ad interstitial
    const ads = await withDbRetry(() => db.adSettings.findUnique({ where: { id: "singleton" } }))
    const adFrequency = ads?.adFrequency ?? 4
    const interstitialEnabled = ads?.interstitialEnabled ?? true
    const showInterstitial = interstitialEnabled && isFirstPass && lessonsCompleted >= adFrequency && lessonsCompleted % adFrequency === 0

    // Certificate: if this lesson's level is now fully passed, issue one (idempotent)
    let certificateId: string | null = null
    let certificateSlug: string | null = null
    if (passed) {
      const siblings = await withDbRetry(() => db.lesson.findMany({
        where: { categoryId: lesson.categoryId, isPublished: true },
        orderBy: { order: "asc" },
        select: { id: true },
      }))
      const progressRows = await withDbRetry(() => db.progress.findMany({
        where: { userId, lessonId: { in: siblings.map((s) => s.id) } },
      }))
      const allPassed = siblings.every((s) => progressRows.find((p) => p.lessonId === s.id && p.passed))
      if (allPassed) {
        const scoreSum = progressRows.reduce((acc, p) => acc + (p.passed ? p.score : 0), 0)
        const scoreTotal = progressRows.reduce((acc, p) => acc + p.total, 0)
        const userRow = await withDbRetry(() => db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }))
        const certUserName = userRow?.name || userRow?.email?.split("@")[0] || "TradeSeekho PK Learner"
        const cert = await withDbRetry(() => db.certificate.upsert({
          where: { userId_categorySlug: { userId, categorySlug: lesson.category.slug } },
          update: {
            userName: certUserName,
            lessonsPassed: siblings.length,
            totalLessons: siblings.length,
            scoreSum,
            scoreTotal,
          },
          create: {
            userId,
            categorySlug: lesson.category.slug,
            userName: certUserName,
            lessonsPassed: siblings.length,
            totalLessons: siblings.length,
            scoreSum,
            scoreTotal,
            verificationId: genVerificationId(),
          },
        }))
        certificateId = cert.id
        certificateSlug = cert.categorySlug
      }
    }

    // Next lesson in same level
    const siblingsForNext = await withDbRetry(() => db.lesson.findMany({
      where: { categoryId: lesson.categoryId, isPublished: true },
      orderBy: { order: "asc" },
      select: { id: true, order: true },
    }))
    const idx = siblingsForNext.findIndex((s) => s.id === lesson.id)
    const nextSibling = idx < siblingsForNext.length - 1 ? siblingsForNext[idx + 1] : null

    const result: QuizSubmitResult = {
      lessonId,
      score,
      total,
      passMark: lesson.quiz.passMark,
      passed,
      correctFlags,
      correctIndices,
      explanations: questions.map((q) => ({
        en: q.explanationEn ?? "",
        ur: q.explanationUr ?? "",
        hi: q.explanationHi ?? "",
        ar: q.explanationAr ?? "",
      })),
      nextLessonId: nextSibling?.id ?? null,
      unlockedNext: passed && !!nextSibling,
      showInterstitial,
      certificateId,
      certificateSlug,
    }

    return NextResponse.json(result)
  } catch (e: any) {
    console.error("[quiz/submit] error:", e?.message)
    return NextResponse.json(
      { error: "db_error", message: e?.message || "Failed to submit quiz" },
      { status: 500 },
    )
  }
}

function genVerificationId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let s = ""
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return `TS-${s}`
}
