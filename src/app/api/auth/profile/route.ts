import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { authOptions, getCurrentUserId } from "@/lib/auth"
import { getServerSession } from "next-auth"

export const dynamic = "force-dynamic"

// PUT /api/auth/profile  body: { name?, currentPassword?, newPassword? }
// Update the signed-in user's name and/or password. For email/password users,
// changing the password requires the current password. Google users (no password)
// can set one without currentPassword.
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id
  // Must be signed in to edit a profile (no local-learner profile editing).
  if (!sessionUserId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  let body: { name?: string; currentPassword?: string; newPassword?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { id: sessionUserId } })
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 })

  const data: { name?: string | null; password?: string } = {}

  // name update
  if (typeof body.name === "string" && body.name.trim().length > 0) {
    data.name = body.name.trim().slice(0, 80)
  }

  // password update
  if (body.newPassword && body.newPassword.length >= 6) {
    if (user.password) {
      // email/password user: verify current password
      if (!body.currentPassword || !(await bcrypt.compare(body.currentPassword, user.password))) {
        return NextResponse.json({ error: "wrong_current_password" }, { status: 400 })
      }
    }
    data.password = await bcrypt.hash(body.newPassword, 10)
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no_changes" }, { status: 400 })
  }

  await db.user.update({ where: { id: sessionUserId }, data })
  return NextResponse.json({ ok: true })
}

// Re-export for the helper (avoids unused import warning in some setups)
export { getCurrentUserId }
