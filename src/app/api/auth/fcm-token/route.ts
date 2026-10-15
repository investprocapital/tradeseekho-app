import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

/**
 * POST /api/auth/fcm-token
 * Body: { token: string }
 *
 * Registers the client's Firebase Cloud Messaging (FCM) token so the server
 * can send push notifications when the app is closed (via the cron job).
 *
 * The token is stored on the User record. Each device/browser has a unique
 * token. If a user logs in on multiple devices, the last registered token
 * wins (simple approach — for multi-device support, store tokens in a
 * separate table later).
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { token } = await req.json()
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "token required" }, { status: 400 })
    }

    await withDbRetry(() => db.user.update({
      where: { id: userId },
      data: { fcmToken: token },
    }))

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[fcm-token] error:", e?.message)
    return NextResponse.json({ error: "failed", message: e?.message }, { status: 500 })
  }
}

/**
 * DELETE /api/auth/fcm-token
 * Clears the FCM token (e.g. on logout).
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    await withDbRetry(() => db.user.update({
      where: { id: userId },
      data: { fcmToken: null },
    }))

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[fcm-token delete] error:", e?.message)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
