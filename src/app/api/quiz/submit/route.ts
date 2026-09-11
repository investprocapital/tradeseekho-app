import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { QuizSubmitResult } from "@/lib/types"

export const dynamic = "force-dynamic"

// POST /api/quiz/submit  body: { lessonId, answers: number[] (chosen option index per question) }
// Computes score, persists Progress, returns correctness + explanations + unlock info.
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

  // Persist progress (upsert)
  await db.progress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { score, total, passed, completed: true },
    create: { userId, lessonId, score, total, passed, completed: true },
  })

  // Determine next lesson in same category
  const siblings = await db.lesson.findMany({
    where: { categoryId: lesson.categoryId, isPublished: true },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  })
  const idx = siblings.findIndex((s) => s.id === lesson.id)
  const nextSibling = idx < siblings.length - 1 ? siblings[idx + 1] : null

  // Did passing this quiz unlock the next lesson? (next was locked because this quiz wasn't passed)
  const unlockedNext = passed && !!nextSibling

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
    unlockedNext,
  }

  return NextResponse.json(result)
}
