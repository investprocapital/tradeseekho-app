import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { QuizSubmitResult } from "@/lib/types"

export const dynamic = "force-dynamic"

// POST /api/quiz/submit  body: { lessonId, answers: number[] }
// Computes score, persists Progress, returns correctness + explanations + unlock info.
// Also: increments the learner's lessonsCompleted counter on a FIRST pass,
// gates the AdMob interstitial to "every 2 completed lessons", and issues a
// Certificate when the learner passes the final lesson of a level.
export async function POST(req: Request) {
  const userId = "local-learner"
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

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { quiz: { include: { questions: { orderBy: { createdAt: "asc" } } } }, category: true },
  })
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
  const prev = await db.progress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  })
  const isFirstPass = passed && !(prev?.passed)

  // Persist progress (upsert)
  await db.progress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { score, total, passed, completed: true },
    create: { userId, lessonId, score, total, passed, completed: true },
  })

  // Increment cumulative lessonsCompleted on a first pass
  let lessonsCompleted = prev?.passed ? 0 : 0 // placeholder; real value from user row
  if (isFirstPass) {
    await db.user.update({
      where: { id: userId },
      data: { lessonsCompleted: { increment: 1 } },
    })
  }
  const user = await db.user.findUnique({ where: { id: userId } })
  lessonsCompleted = user?.lessonsCompleted ?? 0

  // AdMob interstitial cadence: every 2 newly-completed lessons (and only if enabled)
  const ads = await db.adSettings.findUnique({ where: { id: "singleton" } })
  const interstitialEnabled = ads?.interstitialEnabled ?? true
  const showInterstitial = interstitialEnabled && isFirstPass && lessonsCompleted > 0 && lessonsCompleted % 2 === 0

  // Certificate: if this lesson's level is now fully passed, issue one (idempotent)
  let certificateId: string | null = null
  let certificateSlug: string | null = null
  if (passed) {
    const siblings = await db.lesson.findMany({
      where: { categoryId: lesson.categoryId, isPublished: true },
      orderBy: { order: "asc" },
      select: { id: true },
    })
    const progressRows = await db.progress.findMany({
      where: { userId, lessonId: { in: siblings.map((s) => s.id) } },
    })
    const allPassed = siblings.every((s) => progressRows.find((p) => p.lessonId === s.id && p.passed))
    if (allPassed) {
      // compute score snapshot
      const scoreSum = progressRows.reduce((acc, p) => acc + (p.passed ? p.score : 0), 0)
      const scoreTotal = progressRows.reduce((acc, p) => acc + p.total, 0)
      const cert = await db.certificate.upsert({
        where: { userId_categorySlug: { userId, categorySlug: lesson.category.slug } },
        update: {
          lessonsPassed: siblings.length,
          totalLessons: siblings.length,
          scoreSum,
          scoreTotal,
        },
        create: {
          userId,
          categorySlug: lesson.category.slug,
          userName: "TradeSeekho Learner",
          lessonsPassed: siblings.length,
          totalLessons: siblings.length,
          scoreSum,
          scoreTotal,
          verificationId: genVerificationId(),
        },
      })
      certificateId = cert.id
      certificateSlug = cert.categorySlug
    }
  }

  // Next lesson in same level
  const siblingsForNext = await db.lesson.findMany({
    where: { categoryId: lesson.categoryId, isPublished: true },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  })
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
}

function genVerificationId(): string {
  // TS-XXXXXX alphanumeric, collision-resistant enough for a demo
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let s = ""
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return `TS-${s}`
}
