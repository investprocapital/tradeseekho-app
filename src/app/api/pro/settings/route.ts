import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ensureProSettingsSchema } from "@/lib/ensure-schema"

export const dynamic = "force-dynamic"

// Default settings used as fallback if the DB is unreachable (e.g. Neon cold start)
const DEFAULT_SETTINGS = {
  usdPrice: 5,
  pkrRate: 280,
  pkrPrice: 1400,
  jazzcashNumber: "03XX-XXXXXXX",
  easypaisaNumber: "03XX-XXXXXXX",
  cardEnabled: true,
  cardInstructions: "Contact admin on WhatsApp for card payment link",
  sadapayEnabled: true,
  sadapayName: "TradeSeekho PK",
  sadapayNumber: "03XX-XXXXXXX",
  sadapayIban: "PK36SAPK0000000000000000",
  usdtEnabled: true,
  usdtAddress: "Paste your TRC20 wallet address here",
  bep20Enabled: true,
  bep20Address: "0xaa889030e6e69ef3eb55a2e94f1226628a8a19c3",
}

// Retry wrapper — Neon free tier sleeps after inactivity. First connection
// attempt fails; retry after a short delay gives Neon time to wake up.
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 3000): Promise<T> {
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
      msg.includes("ETIMEDOUT")
    if (retries > 0 && isConnectionError) {
      console.log(`[retry] DB connection failed, retrying in ${delayMs}ms... (${retries} left)`)
      await new Promise((r) => setTimeout(r, delayMs))
      return withRetry(fn, retries - 1, delayMs)
    }
    throw e
  }
}

// GET /api/pro/settings — public: get Pro payment settings for display
export async function GET() {
  try {
    // Ensure BEP20 columns exist (Vercel auto-migrate via raw SQL)
    await withRetry(() => ensureProSettingsSchema())

    let s = await withRetry(() => db.proSettings.findUnique({ where: { id: "singleton" } }))
    if (!s) {
      s = await withRetry(() => db.proSettings.create({ data: { id: "singleton" } }))
    }
    return NextResponse.json({
      usdPrice: s.usdPrice,
      pkrRate: s.pkrRate,
      pkrPrice: Math.round(s.usdPrice * s.pkrRate),
      jazzcashNumber: s.jazzcashNumber,
      easypaisaNumber: s.easypaisaNumber,
      cardEnabled: s.cardEnabled,
      cardInstructions: s.cardInstructions,
      sadapayEnabled: s.sadapayEnabled,
      sadapayName: s.sadapayName,
      sadapayNumber: s.sadapayNumber,
      sadapayIban: s.sadapayIban,
      usdtEnabled: s.usdtEnabled,
      usdtAddress: s.usdtAddress,
      bep20Enabled: s.bep20Enabled,
      bep20Address: s.bep20Address,
    })
  } catch (e: any) {
    // DB unreachable (Neon sleeping/suspended) — return defaults so the app
    // still works. The Pro dialog will show default payment methods including
    // BEP20 with the correct address.
    console.error("[pro/settings] DB unreachable, returning defaults:", e?.message)
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}
