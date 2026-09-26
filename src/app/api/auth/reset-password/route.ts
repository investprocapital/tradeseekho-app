import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

// POST /api/auth/reset-password
// Body: { email, newPassword }
// Resets the password for the given email
export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json()
    if (!email || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Email and password (min 6 chars) required" }, { status: 400 })
    }

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

    return NextResponse.json({ ok: true, message: "Password reset successful. You can now login." })
  } catch (e) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
