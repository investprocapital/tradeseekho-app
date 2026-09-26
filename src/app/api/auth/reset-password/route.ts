import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

// POST /api/auth/reset-password
// Body: { token, newPassword } — token-based reset (from forgot password link)
// OR: { email, newPassword } — direct reset (fallback)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, newPassword, email } = body

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Token-based reset (primary flow)
    if (token) {
      const user = await db.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: { gt: new Date() }, // token not expired
        },
      })

      if (!user) {
        return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })
      }

      const hash = await bcrypt.hash(newPassword, 10)
      await db.user.update({
        where: { id: user.id },
        data: {
          password: hash,
          resetToken: null, // clear token
          resetTokenExpiry: null,
        },
      })

      return NextResponse.json({ ok: true, message: "Password reset successful!" })
    }

    // Fallback: direct reset by email (no token needed)
    if (email) {
      const normalizedEmail = email.trim().toLowerCase()
      const user = await db.user.findUnique({ where: { email: normalizedEmail } })
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const hash = await bcrypt.hash(newPassword, 10)
      await db.user.update({
        where: { id: user.id },
        data: { password: hash },
      })

      return NextResponse.json({ ok: true, message: "Password reset successful!" })
    }

    return NextResponse.json({ error: "Token or email required" }, { status: 400 })
  } catch (e) {
    console.error("Reset password error:", e)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
