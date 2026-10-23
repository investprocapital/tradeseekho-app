import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

// GET /api/ads/affiliate — public: returns the active affiliate ad banner.
//
// BANDWIDTH OPTIMIZATION: The DB query filters `enabled: true` at the database
// level (equivalent to Supabase `.eq('is_enabled', true)`). When the ad is OFF,
// the DB returns null directly — no ad data (title/description/images/links) is
// fetched or transferred. This prevents bandwidth waste when the ad is disabled.
//
// We also use `select` to fetch ONLY the fields the public API needs (no id,
// no enabled, no updatedAt) — minimizing the payload size.
//
// Returns { ad: null } when:
//   - The ad is disabled (enabled: false) — DB returns null
//   - The DB is unreachable — caught by try/catch
export async function GET() {
  try {
    const row = await withDbRetry(() => db.affiliateAd.findFirst({
      where: { id: "singleton", enabled: true },
      select: {
        title: true,
        description: true,
        buttonText: true,
        logoUrl: true,
        bannerUrl: true,
        combinedAdImage: true,
        showTitle: true,
        showButton: true,
        showDescription: true,
        link: true,
      },
    }))
    // When enabled is false, the DB query returns null — no data fetched.
    if (!row) {
      return NextResponse.json({ ad: null })
    }
    return NextResponse.json({ ad: row })
  } catch (e: any) {
    console.error("[ads/affiliate GET]", e?.message)
    return NextResponse.json({ ad: null })
  }
}
