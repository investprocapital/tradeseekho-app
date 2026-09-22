import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth"

export const dynamic = "force-dynamic"

type Notification = {
  id: string
  type: "welcome" | "quiz_passed" | "new_lesson" | "signal"
  title: string
  body: string
  createdAt: string
}

// GET /api/notifications — a synthetic feed for the signed-in user:
// welcome (if no progress yet), recent quiz passes, newly published lessons,
// and a sample "market signal". Real-time/push delivery is a future update.
export async function GET() {
  const userId = await getCurrentUserId()
  const out: Notification[] = []

  // Recent quiz passes (last 5)
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

  // Newly published lessons (last 14 days, max 4)
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  const fresh = await db.lesson.findMany({
    where: { isPublished: true, createdAt: { gte: twoWeeksAgo } },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { id: true, titleEn: true, category: { select: { slug: true } } },
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

  // Always-on sample signal
  out.push({
    id: "signal_daily",
    type: "signal",
    title: "Daily market signal 📈",
    body: "EUR/USD holding above 1.1000 support — watch for a breakout. (Demo signal)",
    createdAt: new Date().toISOString(),
  })

  // Welcome if no activity
  if (recentProgress.length === 0) {
    out.push({
      id: "welcome",
      type: "welcome",
      title: "Welcome to TradeSeekho 👋",
      body: "Start with the Beginner level and pass the first quiz to unlock the next lesson.",
      createdAt: new Date().toISOString(),
    })
  }

  // sort newest first
  out.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  return NextResponse.json({ notifications: out })
}
