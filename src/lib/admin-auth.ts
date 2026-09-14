import { cookies } from "next/headers"
import { getServerSession } from "next-auth"
import crypto from "crypto"
import { authOptions } from "./auth"
import { db } from "./db"

export const ADMIN_COOKIE = "ts_admin"
const TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function secret(): string {
  return process.env.ADMIN_PASSWORD_SECRET || "tradeseekho-dev-secret-change-me"
}

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "tradeseekho"
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex")
}

/** Create a signed session token (exp.timestamp . hmac(exp)) */
export function createAdminToken(): string {
  const exp = Date.now() + TTL_MS
  return `${exp}.${sign(String(exp))}`
}

/** Verify a token from the cookie. Returns true if valid + not expired. */
export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false
  const [expStr, sig] = token.split(".")
  if (!expStr || !sig) return false
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || Date.now() > exp) return false
  const expected = sign(expStr)
  // constant-time compare
  if (sig.length !== expected.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  } catch {
    return false
  }
}

/**
 * Admin access is granted if EITHER:
 *  (a) the password-gate cookie `ts_admin` is valid, OR
 *  (b) the signed-in NextAuth user has `role === "admin"` in the DB.
 * This lets the owner log in via the normal email/password (or Google) and
 * reach the admin panel without the separate password gate.
 */
export async function isAdmin(): Promise<boolean> {
  // (a) password-gate cookie
  const store = await cookies()
  if (verifyAdminToken(store.get(ADMIN_COOKIE)?.value)) return true
  // (b) NextAuth session + admin role
  try {
    const session = await getServerSession(authOptions)
    const uid = (session?.user as { id?: string } | undefined)?.id
    if (uid) {
      const u = await db.user.findUnique({ where: { id: uid }, select: { role: true } })
      if (u?.role === "admin") return true
    }
  } catch {
    // ignore — fall through to false
  }
  return false
}

/** Throws-style guard: returns null when ok, or a 401 Response. */
export async function requireAdmin(): Promise<Response | null> {
  const ok = await isAdmin()
  if (ok) return null
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json" },
  })
}
