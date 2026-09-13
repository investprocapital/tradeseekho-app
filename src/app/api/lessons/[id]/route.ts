import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth"
import type { LessonDetailDTO, PublicQuizDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

// GET /api/lessons/[id] -> lesson detail (with lock + next lesson) + quiz (without answers)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const userId = await getCurrentUserId()

  const lesson = await db.lesson.findUnique({
    where: { id },
    include: { category: true, quiz: { include: { questions: { orderBy: { createdAt: "asc" } } } } },
  })
  if (!lesson || !lesson.isPublished) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  // siblings (same category, published, ordered) for unlock + next
  const siblings = await db.lesson.findMany({
    where: { categoryId: lesson.categoryId, isPublished: true },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  })
  const idx = siblings.findIndex((s) => s.id === lesson.id)
  const prevSibling = idx > 0 ? siblings[idx - 1] : null
  const nextSibling = idx < siblings.length - 1 ? siblings[idx + 1] : null

  // Lock rule: a lesson is locked if it has a previous sibling whose quiz has NOT been passed.
  let locked = false
  if (prevSibling) {
    const prevQuiz = await db.quiz.findUnique({ where: { lessonId: prevSibling.id } })
    if (prevQuiz) {
      const prevProg = await db.progress.findUnique({
        where: { userId_lessonId: { userId, lessonId: prevSibling.id } },
      })
      if (!prevProg?.passed) locked = true
    }
  }

  const [prog, bm] = await Promise.all([
    db.progress.findUnique({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
    }),
    db.bookmark.findUnique({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
    }),
  ])

  const detail: LessonDetailDTO = {
    id: lesson.id,
    categoryId: lesson.categoryId,
    category: {
      id: lesson.category.id,
      slug: lesson.category.slug,
      name: {
        en: lesson.category.nameEn,
        ur: lesson.category.nameUr,
        hi: lesson.category.nameHi,
        ar: lesson.category.nameAr,
      },
      description: {
        en: lesson.category.descriptionEn ?? "",
        ur: lesson.category.descriptionUr ?? "",
        hi: lesson.category.descriptionHi ?? "",
        ar: lesson.category.descriptionAr ?? "",
      },
      icon: lesson.category.icon,
      color: lesson.category.color,
      order: lesson.category.order,
    },
    title: { en: lesson.titleEn, ur: lesson.titleUr, hi: lesson.titleHi, ar: lesson.titleAr },
    summary: {
      en: lesson.summaryEn ?? "",
      ur: lesson.summaryUr ?? "",
      hi: lesson.summaryHi ?? "",
      ar: lesson.summaryAr ?? "",
    },
    content: {
      en: lesson.contentEn,
      ur: lesson.contentUr,
      hi: lesson.contentHi,
      ar: lesson.contentAr,
    },
    imageUrl: lesson.imageUrl,
    durationMin: lesson.durationMin,
    order: lesson.order,
    orderInCategory: idx + 1,
    totalInCategory: siblings.length,
    isPublished: lesson.isPublished,
    locked,
    nextLessonId: nextSibling?.id ?? null,
    bookmarked: !!bm,
    passed: prog?.passed ?? false,
    completed: prog?.completed ?? false,
  }

  // Quiz WITHOUT correct answers — client must submit to learn correctness (security)
  let quiz: PublicQuizDTO | null = null
  if (lesson.quiz) {
    quiz = {
      id: lesson.quiz.id,
      lessonId: lesson.id,
      passMark: lesson.quiz.passMark,
      questions: lesson.quiz.questions.map((q) => {
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
        }
      }),
    }
  }

  return NextResponse.json({ lesson: detail, quiz })
}
