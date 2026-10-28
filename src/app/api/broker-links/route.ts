import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { withDbRetry } from "@/lib/db-retry"

export const revalidate = 300 // 5 min edge cache

// GET /api/broker-links — public: returns broker referral links for the
// Broker Comparison section on the home page.
export async function GET() {
  try {
    const row = await withDbRetry(() => db.brokerLinks.findUnique({ where: { id: "singleton" } }))
    if (!row) {
      return NextResponse.json({
        links: {
          xmLink: "https://www.xmwebsite.net/referral?token=U-F1EIZcmcug6NKlILwrnA",
          exnessLink: "https://exness.com/join",
          icmarketsLink: "https://icmarkets.com/join",
          fbsLink: "https://fbs.com/join",
          octafxLink: "https://octasl.click/iZp7FIYLJ7U",
          pepperstoneLink: "https://pepperstone.com/join",
        },
      })
    }
    const res = NextResponse.json({
      links: {
        xmLink: row.xmLink,
        exnessLink: row.exnessLink,
        icmarketsLink: row.icmarketsLink,
        fbsLink: row.fbsLink,
        octafxLink: row.octafxLink,
        pepperstoneLink: row.pepperstoneLink,
      },
    })
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
    return res
  } catch (e: any) {
    console.error("[broker-links GET]", e?.message)
    return NextResponse.json({
      links: {
        xmLink: "https://www.xmwebsite.net/referral?token=U-F1EIZcmcug6NKlILwrnA",
        exnessLink: "https://exness.com/join",
        icmarketsLink: "https://icmarkets.com/join",
        fbsLink: "https://fbs.com/join",
        octafxLink: "https://octasl.click/iZp7FIYLJ7U",
        pepperstoneLink: "https://pepperstone.com/join",
      },
    })
  }
}
