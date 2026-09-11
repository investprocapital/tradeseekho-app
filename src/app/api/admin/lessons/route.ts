import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import type { LessonListItemDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

// GET all lessons (incl. drafts) for the admin table
export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard

  const userId = "local-learner"
  const [lessons, progress, bookmarks] = await Promise.all([
    db.lesson.findMany({
      include: { category: true, quiz: true },
      orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    }),
    db.progress.findMany({ where: { userId } }),
    db.bookmark.findMany({ where: { userId }, select: { lessonId: true } }),
  ])
  const bm = new Set(bookmarks.map((b) => b.lessonId))

  const dto: LessonListItemDTO[] = lessons.map((l) => {
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
      orderInCategory: l.order,
      isPublished: l.isPublished,
      hasQuiz: !!l.quiz,
      passed: prog?.passed ?? false,
      completed: prog?.completed ?? false,
      bookmarked: bm.has(l.id),
    }
  })
  return NextResponse.json({ lessons: dto })
}

// POST create a new lesson (draft by default)
export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const body = await req.json()
  const {
    categoryId,
    titleEn, titleUr, titleHi, titleAr,
    summaryEn, summaryUr, summaryHi, summaryAr,
    contentEn, contentUr, contentHi, contentAr,
    imageUrl, durationMin, order, isPublished, isFree,
  } = body
  if (!categoryId || !titleEn) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 })
  }
  const lesson = await db.lesson.create({
    data: {
      categoryId,
      titleEn, titleUr: titleUr ?? titleEn, titleHi: titleHi ?? titleEn, titleAr: titleAr ?? titleEn,
      summaryEn: summaryEn ?? null, summaryUr: summaryUr ?? null, summaryHi: summaryHi ?? null, summaryAr: summaryAr ?? null,
      contentEn: contentEn ?? "", contentUr: contentUr ?? contentEn ?? "", contentHi: contentHi ?? contentEn ?? "", contentAr: contentAr ?? contentEn ?? "",
      imageUrl: imageUrl ?? null,
      durationMin: Number(durationMin ?? 5),
      order: Number(order ?? 0),
      isPublished: !!isPublished,
      isFree: isFree ?? true,
    },
  })
  return NextResponse.json({ lesson })
}
