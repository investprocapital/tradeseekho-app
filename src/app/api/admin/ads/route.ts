import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export async function GET() {
  let s = await db.adSettings.findUnique({ where: { id: "singleton" } })
  if (!s) {
    s = await db.adSettings.create({ data: { id: "singleton" } })
  }
  return NextResponse.json({
    bannerEnabled: s.bannerEnabled,
    interstitialEnabled: s.interstitialEnabled,
    bannerUnitId: s.bannerUnitId,
    interstitialUnitId: s.interstitialUnitId,
  })
}

export async function PUT(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard
  const body = await req.json()
  const data: Record<string, unknown> = {}
  for (const k of ["bannerEnabled", "interstitialEnabled", "bannerUnitId", "interstitialUnitId"]) {
    if (k in body) {
      data[k] = k.endsWith("Enabled") ? !!body[k] : String(body[k])
    }
  }
  const updated = await db.adSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...(data as any) },
  })
  return NextResponse.json({
    bannerEnabled: updated.bannerEnabled,
    interstitialEnabled: updated.interstitialEnabled,
    bannerUnitId: updated.bannerUnitId,
    interstitialUnitId: updated.interstitialUnitId,
  })
}
