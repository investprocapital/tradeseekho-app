import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import type { LessonDetailDTO, QuizDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

// GET full lesson (incl. draft) + full quiz (with answers) for the admin editor
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin()
  if (guard) return guard

  const { id } = await params
  const lesson = await db.lesson.findUnique({
    where: { id },
    include: { category: true, quiz: { include: { questions: { orderBy: { createdAt: "asc" } } } } },
  })
  if (!lesson) return NextResponse.json({ error: "not_found" }, { status: 404 })

  const detail: LessonDetailDTO = {
    id: lesson.id,
    categoryId: lesson.categoryId,
    category: {
      id: lesson.category.id,
      slug: lesson.category.slug,
      name: { en: lesson.category.nameEn, ur: lesson.category.nameUr, hi: lesson.category.nameHi, ar: lesson.category.nameAr },
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
    orderInCategory: lesson.order,
    totalInCategory: 0,
    isPublished: lesson.isPublished,
    locked: false,
    nextLessonId: null,
    bookmarked: false,
    passed: false,
    completed: false,
  }

  let quiz: QuizDTO | null = null
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
  }
  return NextResponse.json({ lesson: detail, quiz })
}

// PUT update a lesson (incl. publish toggle)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin()
  if (guard) return guard
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  for (const k of [
    "categoryId", "titleEn", "titleUr", "titleHi", "titleAr",
    "summaryEn", "summaryUr", "summaryHi", "summaryAr",
    "contentEn", "contentUr", "contentHi", "contentAr",
    "imageUrl", "durationMin", "order", "isPublished", "isFree",
  ]) {
    if (k in body) {
      // @ts-expect-error dynamic assign
      data[k] = k === "durationMin" || k === "order" ? Number(body[k]) : k === "isPublished" || k === "isFree" ? !!body[k] : body[k]
    }
  }
  const lesson = await db.lesson.update({ where: { id }, data })
  return NextResponse.json({ lesson })
}

// DELETE a lesson (cascades to quiz + questions)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin()
  if (guard) return guard
  const { id } = await params
  await db.lesson.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
