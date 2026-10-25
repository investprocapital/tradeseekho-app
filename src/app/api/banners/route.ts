import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { withDbRetry } from "@/lib/db-retry"

// Edge cache 10 min — banners rarely change, long cache is safe.
export const revalidate = 600
export const dynamic = "force-dynamic"

// GET /api/banners?active=true — public: returns active promotion banners
// for the home page slider. Only fetches isActive=true banners (DB-level filter
// = zero bandwidth when no banners active). Ordered by sortOrder asc.
//
// Returns { banners: [] } when:
//   - No active banners exist (slider auto-hides)
//   - DB unreachable (lenient — never breaks the home page)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const activeOnly = searchParams.get("active") === "true"

  try {
    const banners = await withDbRetry(() => db.promotion.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        imageUrl: true,
        title: true,
        linkUrl: true,
      },
      take: 20, // max 20 banners — keeps payload small
    }))

    return NextResponse.json({ banners })
  } catch (e: any) {
    console.error("[banners GET]", e?.message)
    return NextResponse.json({ banners: [] })
  }
}
