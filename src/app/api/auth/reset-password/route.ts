import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

// POST /api/auth/reset-password
// Body: { oobCode, newPassword } — Google Identity Toolkit flow
// OR: { email, newPassword } — direct reset (fallback)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { oobCode, newPassword, email } = body

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_IDENTITY_API_KEY

    // If oobCode provided, use Google Identity Toolkit
    if (oobCode && apiKey) {
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oobCode,
          newPassword,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return NextResponse.json({ 
          error: err?.error?.message || "Invalid or expired reset code" 
        }, { status: 400 })
      }

      const data = await res.json()
      // Also update our DB password (so NextAuth login works)
      if (data?.email) {
        const normalizedEmail = data.email.toLowerCase()
        const hash = await bcrypt.hash(newPassword, 10)
        await db.user.updateMany({
          where: { email: normalizedEmail },
          data: { password: hash },
        })
      }

      return NextResponse.json({ ok: true, message: "Password reset successful!" })
    }

    // Fallback: direct reset by email (no oobCode needed)
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

    return NextResponse.json({ error: "oobCode or email required" }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
