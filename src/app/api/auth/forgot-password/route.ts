import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// POST /api/auth/forgot-password
// Body: { email }
// Sends password reset email via Google Identity Toolkit (Firebase Auth REST API)
// Requires GOOGLE_IDENTITY_API_KEY env var (Google Cloud > Credentials > API Key)
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

    const apiKey = process.env.GOOGLE_IDENTITY_API_KEY

    if (apiKey) {
      // Use Google Identity Toolkit to send reset email
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "PASSWORD_RESET",
          email: normalizedEmail,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error("Identity Toolkit error:", err)
        // Still return success for security (don't reveal errors)
      }
    }
    // If no API key, the email won't actually be sent — but we still return success
    // Admin needs to set GOOGLE_IDENTITY_API_KEY on Vercel

    return NextResponse.json({ 
      ok: true, 
      message: "If this email exists, a reset link has been sent." 
    })
  } catch (e) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
