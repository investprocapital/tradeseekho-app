import { NextResponse } from "next/server"
import { adminPassword, createAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth"

export async function POST(req: Request) {
  const { password } = await req.json()
  // constant-time-ish compare
  const expected = adminPassword()
  const ok =
    typeof password === "string" &&
    password.length === expected.length &&
    password === expected
  if (!ok) {
    return NextResponse.json({ error: "invalid" }, { status: 401 })
  }
  const token = createAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
