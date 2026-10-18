import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

/**
 * POST /api/auth/check-email
 * Body: { email: string }
 *
 * Checks if an email is registered and how (Google vs password).
 * Used by the login dialog to show the right message:
 *   - If user exists with no password → "Google user, use Continue with Google"
 *   - If user exists with password → "password user, enter password"
 *   - If user doesn't exist → "not registered"
 *
 * This fixes the confusion where Google users try the email/password form
 * and see "Invalid email or password" — they think their account doesn't exist.
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email required" }, { status: 400 })
    }
    const normalizedEmail = email.trim().toLowerCase()

    const user = await withDbRetry(() => db.user.findUnique({
      where: { email: normalizedEmail },
      select: { password: true, name: true, image: true },
    }))

    if (!user) {
      return NextResponse.json({ exists: false, authMethod: null })
    }

    // User exists — check if they have a password (email/password) or not (Google)
    const isGoogleUser = !user.password
    return NextResponse.json({
      exists: true,
      authMethod: isGoogleUser ? "google" : "password",
      name: user.name || null,
      hasPassword: !!user.password,
    })
  } catch (e: any) {
    console.error("[check-email] error:", e?.message)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
