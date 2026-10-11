import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ensureProSettingsSchema } from "@/lib/ensure-schema"

export const dynamic = "force-dynamic"

// GET /api/pro/settings — public: get Pro payment settings for display
// Wrapped in try/catch to surface errors on Vercel (instead of silent 500)
export async function GET() {
  try {
    // Ensure BEP20 columns exist in the DB before querying (Vercel auto-migrate)
    await ensureProSettingsSchema()
    let s = await db.proSettings.findUnique({ where: { id: "singleton" } })
    if (!s) {
      s = await db.proSettings.create({ data: { id: "singleton" } })
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
    // Return the error details so we can diagnose Vercel deployment issues
    return NextResponse.json({
      error: "pro_settings_failed",
      message: e?.message || String(e),
      stack: process.env.NODE_ENV === "production" ? undefined : e?.stack,
      code: e?.code,
      meta: e?.meta,
    }, { status: 500 })
  }
}
