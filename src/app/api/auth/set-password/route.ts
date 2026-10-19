import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

/**
 * POST /api/auth/set-password
 * Body: { password: string }
 *
 * For Google users who don't have a password set. Lets them set a password
 * so they can use email/password login (which triggers browser "Save password?"
 * popup) in addition to Google login.
 *
 * Auth: requires active session (user must be logged in via Google).
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { password } = await req.json()
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "weak_password", message: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if user already has a password
    const user = await withDbRetry(() => db.user.findUnique({ where: { id: userId }, select: { password: true, email: true } }))
    if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 })
    if (user.password) {
      return NextResponse.json({ error: "already_set", message: "Password already set. Use change password instead." }, { status: 400 })
    }

    // Set password for this Google user
    const hash = await bcrypt.hash(password, 10)
    await withDbRetry(() => db.user.update({
      where: { id: userId },
      data: { password: hash },
    }))

    return NextResponse.json({ ok: true, email: user.email })
  } catch (e: any) {
    console.error("[set-password] error:", e?.message)
    return NextResponse.json({ error: "failed", message: e?.message }, { status: 500 })
  }
}
