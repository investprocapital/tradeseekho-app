import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

// GET /api/ads/affiliate — public: returns the active affiliate ad banner.
// Returns { ad: null } when the ad is disabled OR the DB is unreachable.
// This is intentionally lenient — a failed DB call should never break the
// lessons/signals page for a client. Pro users still see the ad (the ad is
// an affiliate link, not related to the Pro subscription).
export async function GET() {
  try {
    const row = await withDbRetry(() => db.affiliateAd.findUnique({ where: { id: "singleton" } }))
    if (!row || !row.enabled) {
      return NextResponse.json({ ad: null })
    }
    return NextResponse.json({
      ad: {
        title: row.title,
        description: row.description,
        buttonText: row.buttonText,
        logoUrl: row.logoUrl ?? "",
        bannerUrl: row.bannerUrl ?? "",
        combinedAdImage: row.combinedAdImage ?? "",
        link: row.link,
      },
    })
  } catch (e: any) {
    console.error("[ads/affiliate GET]", e?.message)
    return NextResponse.json({ ad: null })
  }
}
