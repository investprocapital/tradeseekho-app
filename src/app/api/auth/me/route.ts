import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

// GET /api/auth/me — returns the signed-in user's profile (including the avatar
// image which is NOT in the JWT/session cookie to avoid bloat). Client uses
// this to render the header avatar.
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const uid = (session?.user as { id?: string } | undefined)?.id
    if (!uid) return NextResponse.json({ user: null })
    const u = await withDbRetry(() => db.user.findUnique({
      where: { id: uid },
      select: { id: true, email: true, name: true, image: true, role: true, proStatus: true, preferredLang: true },
    }))
    if (!u) return NextResponse.json({ user: null })
    return NextResponse.json({ user: u })
  } catch (e: any) {
    console.error("[auth/me] DB unreachable:", e?.message)
    return NextResponse.json({ user: null })
  }
}
