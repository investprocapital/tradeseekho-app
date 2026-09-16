import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

export const dynamic = "force-dynamic"

// GET /api/auth/me — returns the signed-in user's profile (including the avatar
// image which is NOT in the JWT/session cookie to avoid bloat). Client uses
// this to render the header avatar.
export async function GET() {
  const session = await getServerSession(authOptions)
  const uid = (session?.user as { id?: string } | undefined)?.id
  if (!uid) return NextResponse.json({ user: null })
  const u = await db.user.findUnique({
    where: { id: uid },
    select: { id: true, email: true, name: true, image: true, role: true, proStatus: true },
  })
  if (!u) return NextResponse.json({ user: null })
  return NextResponse.json({ user: u })
}
