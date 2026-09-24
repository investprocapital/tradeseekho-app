import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

// GET /api/admin/broker-ads — admin: get all broker ads (including disabled)
export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard

  let ads = await db.brokerAd.findMany({ orderBy: { slot: "asc" } })

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
    ads = await db.brokerAd.findMany({ orderBy: { slot: "asc" } })
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

// PUT /api/admin/broker-ads — admin: update all broker ads at once
export async function PUT(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const body = await req.json()
  const { ads } = body as {
    ads: Array<{
      id?: string
      slot: number
      name: string
      text: string
      btnText: string
      link: string
      enabled: boolean
    }>
  }

  if (!Array.isArray(ads)) {
    return NextResponse.json({ error: "ads array required" }, { status: 400 })
  }

  for (const ad of ads) {
    await db.brokerAd.upsert({
      where: { slot: ad.slot },
      update: {
        name: ad.name,
        text: ad.text,
        btnText: ad.btnText,
        link: ad.link,
        enabled: ad.enabled,
      },
      create: {
        slot: ad.slot,
        name: ad.name,
        text: ad.text,
        btnText: ad.btnText,
        link: ad.link,
        enabled: ad.enabled,
      },
    })
  }

  const updated = await db.brokerAd.findMany({ orderBy: { slot: "asc" } })
  return NextResponse.json({
    ads: updated.map((a) => ({
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
