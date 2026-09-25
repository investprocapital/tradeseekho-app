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
    admobEnabled: s.admobEnabled,
    adsenseEnabled: s.adsenseEnabled,
    autoMode: s.autoMode,
    adFrequency: s.adFrequency,
  })
}

export async function PUT(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard
  const body = await req.json()
  const data: Record<string, unknown> = {}

  // Handle new ad network switches with auto-mode logic
  const autoMode = body.autoMode ?? true
  data.autoMode = !!autoMode

  if ("admobEnabled" in body) {
    const admobEnabled = !!body.admobEnabled
    data.admobEnabled = admobEnabled
    // Auto mode: if AdMob ON, turn OFF AdSense (one network at a time)
    if (autoMode && admobEnabled) {
      data.adsenseEnabled = false
    }
  }

  if ("adsenseEnabled" in body) {
    const adsenseEnabled = !!body.adsenseEnabled
    data.adsenseEnabled = adsenseEnabled
    // Auto mode: if AdSense ON, turn OFF AdMob (one network at a time)
    if (autoMode && adsenseEnabled) {
      data.admobEnabled = false
    }
  }

  if ("adFrequency" in body) {
    data.adFrequency = Number(body.adFrequency) || 4
  }

  // Legacy fields
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
    admobEnabled: updated.admobEnabled,
    adsenseEnabled: updated.adsenseEnabled,
    autoMode: updated.autoMode,
    adFrequency: updated.adFrequency,
  })
}
