import { cookies } from "next/headers"
import crypto from "crypto"

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

/** Helper used by every admin API route. Returns true if allowed. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies()
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value)
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
