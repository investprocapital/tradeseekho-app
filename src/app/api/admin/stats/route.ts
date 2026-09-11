import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard
  let s = await db.appStats.findUnique({ where: { id: "singleton" } })
  if (!s) {
    s = await db.appStats.create({ data: { id: "singleton" } })
  }
  const [lessonCount, quizCount, userCount] = await Promise.all([
    db.lesson.count({ where: { isPublished: true } }),
    db.quiz.count(),
    db.user.count(),
  ])
  return NextResponse.json({
    totalDownloads: s.totalDownloads,
    activeUsers: s.activeUsers,
    totalLessons: lessonCount,
    totalQuizzes: quizCount,
    totalUsers: userCount,
  })
}

// PUT allows admin to tweak download/active counters
export async function PUT(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard
  const body = await req.json()
  const data: Record<string, unknown> = {}
  for (const k of ["totalDownloads", "activeUsers"]) {
    if (k in body) data[k] = Number(body[k])
  }
  const updated = await db.appStats.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...(data as any) },
  })
  return NextResponse.json({
    totalDownloads: updated.totalDownloads,
    activeUsers: updated.activeUsers,
    totalLessons: updated.totalLessons,
    totalQuizzes: updated.totalQuizzes,
  })
}
