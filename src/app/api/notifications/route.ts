import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth"

export const dynamic = "force-dynamic"

type Notification = {
  id: string
  type: "welcome" | "quiz_passed" | "new_lesson" | "signal"
  title: string
  body: string
  deepLink?: string
  createdAt: string
}

// GET /api/notifications — a feed for the signed-in user that merges:
//   1. Broadcast signal notifications stored in the DB (created when admin
//      presses a TP/SL HIT button — Phase 1 manual push system).
//   2. Synthetic per-user notifications (recent quiz passes, new lessons,
//      welcome message) computed on the fly.
export async function GET() {
  const userId = await getCurrentUserId()
  const out: Notification[] = []

  // 1) Broadcast signal notifications (TP/SL hits + future system alerts).
  //    Limited to the 15 most recent to keep the feed fresh.
  const broadcasts = await db.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 15,
  })
  for (const b of broadcasts) {
    out.push({
      id: `bc_${b.id}`,
      type: "signal",
      title: b.title,
      body: b.body,
      deepLink: b.deepLink ?? undefined,
      createdAt: b.createdAt.toISOString(),
    })
  }

  // 2) Recent quiz passes (last 5) — synthetic, per-user.
  const recentProgress = await db.progress.findMany({
    where: { userId, passed: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: { lesson: { select: { titleEn: true } } },
  })
  for (const p of recentProgress) {
    out.push({
      id: `quiz_${p.id}`,
      type: "quiz_passed",
      title: "Quiz passed 🎉",
      body: `You scored ${p.score}/${p.total} on “${p.lesson?.titleEn ?? "a lesson"}”. Next lesson unlocked!`,
      createdAt: p.updatedAt.toISOString(),
    })
  }

  // 3) Newly published lessons (last 14 days, max 4) — synthetic.
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  const fresh = await db.lesson.findMany({
    where: { isPublished: true, createdAt: { gte: twoWeeksAgo } },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { id: true, titleEn: true, createdAt: true, category: { select: { slug: true } } },
  })
  for (const l of fresh) {
    out.push({
      id: `new_${l.id}`,
      type: "new_lesson",
      title: "New lesson published 📚",
      body: `“${l.titleEn}” is now available in ${l.category.slug}.`,
      createdAt: l.createdAt ? l.createdAt.toISOString() : new Date().toISOString(),
    })
  }

  // 4) Welcome if no activity.
  if (recentProgress.length === 0) {
    out.push({
      id: "welcome",
      type: "welcome",
      title: "Welcome to TradeSeekho PK 👋",
      body: "Start with the Beginner level and pass the first quiz to unlock the next lesson.",
      createdAt: new Date().toISOString(),
    })
  }

  // sort newest first
  out.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  return NextResponse.json({ notifications: out })
}
