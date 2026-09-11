import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import type { QuestionDTO, QuizDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

// GET full quiz (with answers) for the admin editor
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const guard = await requireAdmin()
  if (guard) return guard
  const { lessonId } = await params
  const quiz = await db.quiz.findUnique({
    where: { lessonId },
    include: { questions: { orderBy: { createdAt: "asc" } } },
  })
  if (!quiz) return NextResponse.json({ quiz: null })
  const dto: QuizDTO = {
    id: quiz.id,
    lessonId: quiz.lessonId,
    passMark: quiz.passMark,
    questions: quiz.questions.map((q) => {
      const opts: { en: string; ur: string; hi: string; ar: string }[] = [
        { en: q.option1En, ur: q.option1Ur, hi: q.option1Hi, ar: q.option1Ar },
        { en: q.option2En, ur: q.option2Ur, hi: q.option2Hi, ar: q.option2Ar },
      ]
      if (q.option3En) opts.push({ en: q.option3En, ur: q.option3Ur!, hi: q.option3Hi!, ar: q.option3Ar! })
      if (q.option4En) opts.push({ en: q.option4En, ur: q.option4Ur!, hi: q.option4Hi!, ar: q.option4Ar! })
      return {
        id: q.id,
        type: q.type as "MCQ" | "TF",
        prompt: { en: q.promptEn, ur: q.promptUr, hi: q.promptHi, ar: q.promptAr },
        options: opts,
        correctIndex: q.correctIndex,
        explanation: {
          en: q.explanationEn ?? "",
          ur: q.explanationUr ?? "",
          hi: q.explanationHi ?? "",
          ar: q.explanationAr ?? "",
        },
      }
    }),
  }
  return NextResponse.json({ quiz: dto })
}

// PUT upsert the whole quiz + questions for a lesson (replace strategy)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const guard = await requireAdmin()
  if (guard) return guard
  const { lessonId } = await params
  const body = (await req.json()) as { passMark?: number; questions: QuestionDTO[] }

  // delete existing quiz + questions, recreate
  const existing = await db.quiz.findUnique({ where: { lessonId } })
  if (existing) {
    await db.quiz.delete({ where: { id: existing.id } })
  }
  const quiz = await db.quiz.create({
    data: {
      lessonId,
      passMark: body.passMark ?? 3,
      questions: {
        create: body.questions.map((q) => ({
          type: q.type,
          promptEn: q.prompt.en, promptUr: q.prompt.ur, promptHi: q.prompt.hi, promptAr: q.prompt.ar,
          option1En: q.options[0]?.en ?? "", option1Ur: q.options[0]?.ur ?? "", option1Hi: q.options[0]?.hi ?? "", option1Ar: q.options[0]?.ar ?? "",
          option2En: q.options[1]?.en ?? "", option2Ur: q.options[1]?.ur ?? "", option2Hi: q.options[1]?.hi ?? "", option2Ar: q.options[1]?.ar ?? "",
          option3En: q.options[2]?.en ?? null, option3Ur: q.options[2]?.ur ?? null, option3Hi: q.options[2]?.hi ?? null, option3Ar: q.options[2]?.ar ?? null,
          option4En: q.options[3]?.en ?? null, option4Ur: q.options[3]?.ur ?? null, option4Hi: q.options[3]?.hi ?? null, option4Ar: q.options[3]?.ar ?? null,
          correctIndex: q.correctIndex,
          explanationEn: q.explanation.en || null, explanationUr: q.explanation.ur || null,
          explanationHi: q.explanation.hi || null, explanationAr: q.explanation.ar || null,
        })),
      },
    },
    include: { questions: true },
  })

  // refresh AppStats
  await db.appStats.upsert({
    where: { id: "singleton" },
    update: { totalLessons: await db.lesson.count(), totalQuizzes: await db.quiz.count(), updatedAt: new Date() },
    create: { id: "singleton", totalLessons: await db.lesson.count(), totalQuizzes: await db.quiz.count() },
  })

  return NextResponse.json({ quiz })
}
