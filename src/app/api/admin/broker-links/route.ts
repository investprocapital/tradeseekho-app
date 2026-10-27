import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

// GET /api/admin/broker-links — admin: get broker referral links
export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    let row = await withDbRetry(() => db.brokerLinks.findUnique({ where: { id: "singleton" } }))
    if (!row) {
      row = await withDbRetry(() => db.brokerLinks.create({ data: { id: "singleton" } }))
    }
    return NextResponse.json({
      links: {
        xmLink: row.xmLink,
        exnessLink: row.exnessLink,
        icmarketsLink: row.icmarketsLink,
        fbsLink: row.fbsLink,
        octafxLink: row.octafxLink,
        pepperstoneLink: row.pepperstoneLink,
      },
    })
  } catch (e: any) {
    console.error("[admin/broker-links GET]", e?.message)
    return NextResponse.json({
      links: {
        xmLink: "https://www.xmwebsite.net/referral?token=U-F1EIZcmcug6NKlILwrnA",
        exnessLink: "https://exness.com/join",
        icmarketsLink: "https://icmarkets.com/join",
        fbsLink: "https://fbs.com/join",
        octafxLink: "https://octasl.click/iZp7FIYLJ7U",
        pepperstoneLink: "https://pepperstone.com/join",
      },
      error: "db_unreachable",
    })
  }
}

// PUT /api/admin/broker-links — admin: update broker referral links
export async function PUT(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  let body: any = {}
  try { body = await req.json() } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }) }

  const data = {
    xmLink: String(body.xmLink ?? "").slice(0, 2000),
    exnessLink: String(body.exnessLink ?? "").slice(0, 2000),
    icmarketsLink: String(body.icmarketsLink ?? "").slice(0, 2000),
    fbsLink: String(body.fbsLink ?? "").slice(0, 2000),
    octafxLink: String(body.octafxLink ?? "").slice(0, 2000),
    pepperstoneLink: String(body.pepperstoneLink ?? "").slice(0, 2000),
  }

  try {
    const row = await withDbRetry(() => db.brokerLinks.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    }))
    return NextResponse.json({
      links: {
        xmLink: row.xmLink,
        exnessLink: row.exnessLink,
        icmarketsLink: row.icmarketsLink,
        fbsLink: row.fbsLink,
        octafxLink: row.octafxLink,
        pepperstoneLink: row.pepperstoneLink,
      },
    })
  } catch (e: any) {
    console.error("[admin/broker-links PUT]", e?.message)
    return NextResponse.json({ error: "db_error", message: e?.message }, { status: 500 })
  }
}
