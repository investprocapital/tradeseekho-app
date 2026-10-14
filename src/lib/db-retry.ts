/**
 * Shared DB retry + fallback helper.
 *
 * Neon free tier sleeps after ~5 min of inactivity. The first connection attempt
 * from a Vercel serverless function fails (connection timeout). We retry a few
 * times with delays to give Neon time to wake up.
 *
 * Usage:
 *   import { withDbRetry } from "@/lib/db-retry"
 *   const data = await withDbRetry(() => db.user.findMany())
 *
 * If all retries fail, throws the last error — caller should catch and return
 * a safe fallback (empty array / defaults).
 */

export async function withDbRetry<T>(
  fn: () => Promise<T>,
  retries = 5,
  delayMs = 3000
): Promise<T> {
  try {
    return await fn()
  } catch (e: any) {
    const msg = e?.message || ""
    const isConnectionError =
      msg.includes("Can't reach database") ||
      msg.includes("Timed out") ||
      msg.includes("Connection terminated") ||
      msg.includes("Connection refused") ||
      msg.includes("ECONNRESET") ||
      msg.includes("ETIMEDOUT") ||
      msg.includes("connect ECONNREFUSED") ||
      msg.includes("getaddrinfo ENOTFOUND") ||
      msg.includes("prepared statement") ||
      msg.includes("relation") && msg.includes("does not exist")
    if (retries > 0 && isConnectionError) {
      console.log(`[db-retry] DB connection failed, retrying in ${delayMs}ms... (${retries} left)`)
      await new Promise((r) => setTimeout(r, delayMs))
      return withDbRetry(fn, retries - 1, delayMs)
    }
    throw e
  }
}
