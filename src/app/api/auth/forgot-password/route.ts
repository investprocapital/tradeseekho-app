import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import crypto from "crypto"

export const dynamic = "force-dynamic"

// POST /api/auth/forgot-password
// Body: { email }
// Generates a reset token, stores in DB, returns reset link directly
// (No external email service needed — shows link on screen)
export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Check if user exists in our DB
    const user = await db.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      // Don't reveal if email exists (security)
      return NextResponse.json({ ok: true, message: "If this email exists, a reset link has been sent." })
    }

    // Generate a secure reset token
    const token = crypto.randomBytes(32).toString("hex")
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry

    // Store token in DB
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    })

    // Build reset link
    const baseUrl = process.env.NEXTAUTH_URL || "https://tradeseekho-app.vercel.app"
    const resetLink = `${baseUrl}/reset-password?token=${token}`

    // Try to send email via Google Identity Toolkit if API key is set
    const apiKey = process.env.GOOGLE_IDENTITY_API_KEY
    if (apiKey) {
      try {
        await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestType: "PASSWORD_RESET",
            email: normalizedEmail,
          }),
        })
      } catch (e) {
        console.error("Email send failed, showing link directly:", e)
      }
    }

    // Return the reset link directly (works even without email service)
    return NextResponse.json({
      ok: true,
      message: "Reset link generated.",
      resetLink,
    })
  } catch (e) {
    console.error("Forgot password error:", e)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
