import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// GET /api/pro/settings — public: get Pro payment settings for display
export async function GET() {
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
  })
}
