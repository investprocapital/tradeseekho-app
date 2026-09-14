import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export const dynamic = "force-dynamic"

// POST /api/auth/signup  body: { email, password, name? }
// Creates an email/password user (the "Gmail sign-up" option). Password is bcrypt-hashed.
export async function POST(req: Request) {
  let body: { email?: string; password?: string; name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 })
  }
  const email = body.email?.trim().toLowerCase()
  const password = body.password ?? ""
  const name = body.name?.trim() || null
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "bad_email" }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "weak_password" }, { status: 400 })
  }
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "exists" }, { status: 409 })
  }
  const hash = await hashPassword(password)
  await db.user.create({
    data: { email, name, password: hash },
  })
  return NextResponse.json({ ok: true })
}
