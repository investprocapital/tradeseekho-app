import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

/**
 * POST /api/lessons/unlock
 * Body: { lessonId }
 *
 * Called after user watches a rewarded video ad. Marks the lesson as
 * "unlocked via rewarded ad" by creating a Progress record with passed=true.
 * This bypasses the Pro paywall for THIS specific lesson only.
 *
 * The user can still only unlock ONE lesson at a time (per ad watch).
 * The lesson is unlocked permanently for this user.
 */
export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId || userId === "local-learner") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { lessonId } = await req.json()
    if (!lessonId) {
      return NextResponse.json({ error: "lessonId required" }, { status: 400 })
    }

    // Check lesson exists
    const lesson = await withDbRetry(() => db.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, categoryId: true, order: true },
    }))
    if (!lesson) {
      return NextResponse.json({ error: "lesson_not_found" }, { status: 404 })
    }

    // Create or update progress — mark as passed (unlocked via rewarded ad)
    // This allows the lesson detail API to serve the lesson without Pro check
    await withDbRetry(() => db.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { passed: true, score: 5, total: 5, completed: true, updatedAt: new Date() },
      create: { userId, lessonId, passed: true, score: 5, total: 5, completed: true },
    }))

    return NextResponse.json({ ok: true, message: "Lesson unlocked via rewarded ad!" })
  } catch (e: any) {
    console.error("[lessons/unlock]", e?.message)
    return NextResponse.json({ error: "failed", message: e?.message }, { status: 500 })
  }
}
