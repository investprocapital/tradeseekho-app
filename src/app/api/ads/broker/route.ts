import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// GET /api/ads/broker — public: returns all enabled broker ads (for rotating banners)
export async function GET() {
  let ads = await db.brokerAd.findMany({
    where: { enabled: true },
    orderBy: { slot: "asc" },
  })

  // Seed defaults if empty
  if (ads.length === 0) {
    const defaults = [
      { slot: 1, name: "Exness", text: "Trade with Exness - Instant Deposit & Withdrawal", btnText: "Open Account", link: "#", enabled: true },
      { slot: 2, name: "XM", text: "$30 No Deposit Bonus", btnText: "Claim Bonus", link: "#", enabled: true },
      { slot: 3, name: "OctaFX", text: "50% Deposit Bonus", btnText: "Get Bonus", link: "#", enabled: true },
    ]
    for (const d of defaults) {
      await db.brokerAd.upsert({
        where: { slot: d.slot },
        update: {},
        create: d,
      })
    }
    ads = await db.brokerAd.findMany({
      where: { enabled: true },
      orderBy: { slot: "asc" },
    })
  }

  return NextResponse.json({
    ads: ads.map((a) => ({
      id: a.id,
      slot: a.slot,
      name: a.name,
      text: a.text,
      btnText: a.btnText,
      link: a.link,
      enabled: a.enabled,
    })),
  })
}
