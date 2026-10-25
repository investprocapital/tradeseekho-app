import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId, isUserProForPlan } from "@/lib/auth"
import type { CategoryDTO, LessonListItemDTO } from "@/lib/types"

// ─── EDGE CACHING ───
// Cache lesson list at Vercel edge for 5 minutes (s-maxage=300).
// Lessons change rarely (admin adds/edits), so 5 min cache is safe.
// This reduces Fast Origin Transfer significantly — 51KB response is cached
// at edge, served to all users without hitting the origin serverless function.
export const revalidate = 300
export const dynamic = "force-dynamic"

// Retry wrapper — Neon free tier sleeps after inactivity. First connection
// attempt fails; retry after a short delay gives Neon time to wake up.
async function withRetry<T>(fn: () => Promise<T>, retries = 5, delayMs = 3000): Promise<T> {
  try {
    return await fn()
  } catch (e: any) {
    const msg = e?.message || ""
    const isConnectionError =
      msg.includes("Can't reach database") ||
      msg.includes("Timed out") ||
      msg.includes("Connection terminated") ||
      msg.includes("Connection refused") ||
      msg.includes("ECONNRESET") ||
      msg.includes("ETIMEDOUT") ||
      msg.includes("connect ECONNREFUSED") ||
      msg.includes("getaddrinfo ENOTFOUND")
    if (retries > 0 && isConnectionError) {
      console.log(`[retry] DB connection failed, retrying in ${delayMs}ms... (${retries} left)`)
      await new Promise((r) => setTimeout(r, delayMs))
      return withRetry(fn, retries - 1, delayMs)
    }
    throw e
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category") // slug or "all"
    const userId = await getCurrentUserId()
    const pro = await isUserProForPlan("lessons")

    const [categories, lessons] = await withRetry(() => Promise.all([
      db.category.findMany({ orderBy: { order: "asc" } }),
      db.lesson.findMany({
        where: { isPublished: true, ...(category && category !== "all" ? { category: { slug: category } } : {}) },
        include: { category: true, quiz: true },
        orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
      }),
    ]))

    const [progress, bookmarks] = await withRetry(() => Promise.all([
      db.progress.findMany({ where: { userId } }),
      db.bookmark.findMany({ where: { userId }, select: { lessonId: true } }),
    ]))
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
        isFree: pro ? true : l.isFree,
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

    const res = NextResponse.json({ categories: catDto, lessons: dto })
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
    return res
  } catch (e: any) {
    console.error("[lessons] DB unreachable:", e?.message)
    return NextResponse.json({ categories: [], lessons: [], dbError: true })
  }
}
