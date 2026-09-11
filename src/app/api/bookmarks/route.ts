import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { LessonListItemDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

const userId = "local-learner"

// GET bookmarks for the local learner (full lesson DTOs, published only)
export async function GET() {
  const bookmarks = await db.bookmark.findMany({
    where: { userId },
    include: { lesson: { include: { category: true, quiz: true } } },
    orderBy: { createdAt: "desc" },
  })
  const [progress] = await Promise.all([
    db.progress.findMany({ where: { userId } }),
  ])
  const dto: LessonListItemDTO[] = bookmarks
    .filter((b) => b.lesson?.isPublished)
    .map((b) => {
      const l = b.lesson
      const prog = progress.find((p) => p.lessonId === l.id)
      return {
        id: l.id,
        categoryId: l.categoryId,
        categorySlug: l.category.slug,
        categoryColor: l.category.color,
        categoryIcon: l.category.icon,
        title: { en: l.titleEn, ur: l.titleUr, hi: l.titleHi, ar: l.titleAr },
        summary: {
          en: l.summaryEn ?? "",
          ur: l.summaryUr ?? "",
          hi: l.summaryHi ?? "",
          ar: l.summaryAr ?? "",
        },
        imageUrl: l.imageUrl,
        durationMin: l.durationMin,
        order: l.order,
        orderInCategory: 1,
        isPublished: l.isPublished,
        hasQuiz: !!l.quiz,
        passed: prog?.passed ?? false,
        completed: prog?.completed ?? false,
        bookmarked: true,
      }
    })
  return NextResponse.json({ bookmarks: dto })
}

// POST add a bookmark { lessonId }
export async function POST(req: Request) {
  const { lessonId } = await req.json()
  if (!lessonId) return NextResponse.json({ error: "bad_body" }, { status: 400 })
  await db.bookmark.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {},
    create: { userId, lessonId },
  })
  return NextResponse.json({ ok: true })
}

// DELETE remove a bookmark ?lessonId=
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const lessonId = searchParams.get("lessonId")
  if (!lessonId) return NextResponse.json({ error: "bad_body" }, { status: 400 })
  await db.bookmark.deleteMany({ where: { userId, lessonId } })
  return NextResponse.json({ ok: true })
}
