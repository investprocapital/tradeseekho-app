import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { withDbRetry } from "@/lib/db-retry"

// Edge cache 5 min — broker ads rarely change.
export const revalidate = 300
export const dynamic = "force-dynamic"

// GET /api/ads/broker — public: returns all enabled broker ads (for rotating banners)
//
// BANDWIDTH OPTIMIZATION: First checks the global `brokerAdsEnabled` toggle in
// AdSettings. When OFF, returns an empty array immediately — no BrokerAd rows
// are fetched from the DB (bandwidth save). When ON, fetches only enabled ads.
export async function GET() {
  try {
    // ─── Global toggle check ───
    // If brokerAdsEnabled is false, return empty array immediately.
    // No BrokerAd rows fetched → zero bandwidth waste.
    const settings = await withDbRetry(() => db.adSettings.findUnique({
      where: { id: "singleton" },
      select: { brokerAdsEnabled: true },
    }))
    if (settings && settings.brokerAdsEnabled === false) {
      return NextResponse.json({ ads: [] })
    }

    let ads = await withDbRetry(() => db.brokerAd.findMany({
      where: { enabled: true },
      orderBy: { slot: "asc" },
    }))

    // Seed defaults if empty
    if (ads.length === 0) {
      const defaults = [
        { slot: 1, name: "Exness", text: "Trade with Exness - Instant Deposit & Withdrawal", btnText: "Open Account", link: "#", enabled: true },
        { slot: 2, name: "XM", text: "$30 No Deposit Bonus", btnText: "Claim Bonus", link: "#", enabled: true },
        { slot: 3, name: "OctaFX", text: "50% Deposit Bonus", btnText: "Get Bonus", link: "#", enabled: true },
      ]
      for (const d of defaults) {
        await withDbRetry(() => db.brokerAd.upsert({
          where: { slot: d.slot },
          update: {},
          create: d,
        }))
      }
      ads = await withDbRetry(() => db.brokerAd.findMany({
        where: { enabled: true },
        orderBy: { slot: "asc" },
      }))
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
  } catch (e: any) {
    console.error("[ads/broker GET]", e?.message)
    // On DB error, return empty array (lenient — never break the home page)
    return NextResponse.json({ ads: [] })
  }
}
