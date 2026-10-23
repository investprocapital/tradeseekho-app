import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

// GET /api/admin/affiliate-ads — admin: get the affiliate ad config (singleton).
// Auto-creates a default row if none exists yet (first run).
export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    let row = await withDbRetry(() => db.affiliateAd.findUnique({ where: { id: "singleton" } }))
    if (!row) {
      row = await withDbRetry(() => db.affiliateAd.create({ data: { id: "singleton" } }))
    }
    return NextResponse.json({
      ad: {
        id: row.id,
        enabled: row.enabled,
        title: row.title,
        description: row.description,
        buttonText: row.buttonText,
        logoUrl: row.logoUrl ?? "",
        bannerUrl: row.bannerUrl ?? "",
        combinedAdImage: row.combinedAdImage ?? "",
        showTitle: row.showTitle,
        showButton: row.showButton,
        showDescription: row.showDescription,
        link: row.link,
        updatedAt: row.updatedAt.toISOString(),
      },
    })
  } catch (e: any) {
    console.error("[admin/affiliate-ads GET]", e?.message)
    return NextResponse.json({
      ad: {
        id: "singleton",
        enabled: false,
        title: "Mexc",
        description: "Make your first deposit and Futures trade to unlock rewards",
        buttonText: "Download",
        logoUrl: "",
        bannerUrl: "",
        combinedAdImage: "",
        showTitle: false,
        showButton: false,
        showDescription: false,
        link: "#",
        updatedAt: new Date().toISOString(),
      },
      error: "db_unreachable",
    })
  }
}

// PUT /api/admin/affiliate-ads — admin: update the affiliate ad config.
export async function PUT(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const data = {
    enabled: !!body.enabled,
    title: String(body.title ?? "").slice(0, 100),
    description: String(body.description ?? "").slice(0, 300),
    buttonText: String(body.buttonText ?? "Download").slice(0, 30),
    logoUrl: String(body.logoUrl ?? "").slice(0, 2000) || null,
    bannerUrl: String(body.bannerUrl ?? "").slice(0, 2000) || null,
    combinedAdImage: String(body.combinedAdImage ?? "").slice(0, 2000) || null,
    showTitle: !!body.showTitle,
    showButton: !!body.showButton,
    showDescription: !!body.showDescription,
    link: String(body.link ?? "#").slice(0, 2000) || "#",
  }

  try {
    const row = await withDbRetry(() => db.affiliateAd.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    }))
    return NextResponse.json({
      ad: {
        id: row.id,
        enabled: row.enabled,
        title: row.title,
        description: row.description,
        buttonText: row.buttonText,
        logoUrl: row.logoUrl ?? "",
        bannerUrl: row.bannerUrl ?? "",
        combinedAdImage: row.combinedAdImage ?? "",
        showTitle: row.showTitle,
        showButton: row.showButton,
        showDescription: row.showDescription,
        link: row.link,
        updatedAt: row.updatedAt.toISOString(),
      },
    })
  } catch (e: any) {
    console.error("[admin/affiliate-ads PUT]", e?.message)
    return NextResponse.json({ error: "db_error", message: e?.message }, { status: 500 })
  }
}
