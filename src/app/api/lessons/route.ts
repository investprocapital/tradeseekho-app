import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { CategoryDTO, LessonListItemDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category") // slug or "all"
  const userId = "local-learner"

  const [categories, lessons] = await Promise.all([
    db.category.findMany({ orderBy: { order: "asc" } }),
    db.lesson.findMany({
      where: { isPublished: true, ...(category && category !== "all" ? { category: { slug: category } } : {}) },
      include: { category: true, quiz: true },
      orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    }),
  ])

  const [progress, bookmarks] = await Promise.all([
    db.progress.findMany({ where: { userId } }),
    db.bookmark.findMany({ where: { userId }, select: { lessonId: true } }),
  ])
  const bm = new Set(bookmarks.map((b) => b.lessonId))

  const dto: LessonListItemDTO[] = lessons.map((l) => {
    const prog = progress.find((p) => p.lessonId === l.id)
    const orderInCategory = lessons.filter((x) => x.categoryId === l.categoryId).indexOf(l) + 1
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
      orderInCategory: Math.max(1, orderInCategory),
      isPublished: l.isPublished,
      hasQuiz: !!l.quiz,
      passed: prog?.passed ?? false,
      completed: prog?.completed ?? false,
      bookmarked: bm.has(l.id),
    }
  })

  const catDto: CategoryDTO[] = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: { en: c.nameEn, ur: c.nameUr, hi: c.nameHi, ar: c.nameAr },
    description: {
      en: c.descriptionEn ?? "",
      ur: c.descriptionUr ?? "",
      hi: c.descriptionHi ?? "",
      ar: c.descriptionAr ?? "",
    },
    icon: c.icon,
    color: c.color,
    order: c.order,
  }))

  return NextResponse.json({ categories: catDto, lessons: dto })
}
