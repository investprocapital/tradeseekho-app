import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth"

export const dynamic = "force-dynamic"

// GET /api/leaderboard — top learners by lessons passed + total correct answers,
// with a rough "weekly active" streak (distinct days with a passed quiz this week).
export async function GET() {
  const meId = await getCurrentUserId()
  const passed = await db.progress.findMany({
    where: { passed: true },
    select: { userId: true, score: true, total: true, createdAt: true },
  })
  const users = await db.user.findMany({ select: { id: true, name: true, email: true, image: true } })
  const userMap = new Map(users.map((u) => [u.id, u]))

  // aggregate per user
  const agg = new Map<string, { lessonsPassed: number; scoreSum: number; scoreTotal: number; activeDays: Set<string> }>()
  for (const p of passed) {
    const a = agg.get(p.userId) ?? { lessonsPassed: 0, scoreSum: 0, scoreTotal: 0, activeDays: new Set<string>() }
    a.lessonsPassed += 1
    a.scoreSum += p.score
    a.scoreTotal += p.total
    const d = new Date(p.createdAt)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    if (d.getTime() >= weekAgo) a.activeDays.add(d.toISOString().slice(0, 10))
    agg.set(p.userId, a)
  }

  const rows = [...agg.entries()]
    .map(([userId, a]) => {
      const u = userMap.get(userId)
      const name = u?.name || (u?.email ? u.email.split("@")[0] : "Learner")
      return {
        userId,
        name,
        image: u?.image ?? null,
        lessonsPassed: a.lessonsPassed,
        scoreSum: a.scoreSum,
        scoreTotal: a.scoreTotal,
        streak: a.activeDays.size, // active days this week
        isMe: userId === meId,
      }
    })
    .sort((x, y) => y.lessonsPassed - x.lessonsPassed || y.scoreSum - x.scoreSum)
    .slice(0, 20)

  // assign ranks
  const ranked = rows.map((r, i) => ({ rank: i + 1, ...r }))
  return NextResponse.json({ leaderboard: ranked, totalLearners: agg.size })
}
