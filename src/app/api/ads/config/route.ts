import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// GET /api/ads/config — returns which ad network to use based on User-Agent
// AdMob = native app (APK/Play Store) | AdSense = web (PC/Mobile Browser/iPhone)
export async function GET(req: Request) {
  let s = await db.adSettings.findUnique({ where: { id: "singleton" } })
  if (!s) {
    s = await db.adSettings.create({ data: { id: "singleton" } })
  }

  // Detect platform from User-Agent
  const userAgent = req.headers.get("user-agent") || ""
  const isAndroidApp = /Android.*wv|Android.*WebView/i.test(userAgent) // APK WebView
  const isIOSApp = /iPhone.*wv|iPad.*wv/i.test(userAgent) // iOS WebView
  const isNativeApp = isAndroidApp || isIOSApp

  // Determine which ad network to use
  let network: "admob" | "adsense" | "none" = "none"
  if (isNativeApp && s.admobEnabled) {
    network = "admob"
  } else if (!isNativeApp && s.adsenseEnabled) {
    network = "adsense"
  }

  // Auto mode: if both enabled, prefer based on platform
  if (s.autoMode) {
    if (isNativeApp) {
      network = s.admobEnabled ? "admob" : (s.adsenseEnabled ? "adsense" : "none")
    } else {
      network = s.adsenseEnabled ? "adsense" : (s.admobEnabled ? "admob" : "none")
    }
  }

  return NextResponse.json({
    network,
    isNativeApp,
    admobEnabled: s.admobEnabled,
    adsenseEnabled: s.adsenseEnabled,
    autoMode: s.autoMode,
    adFrequency: s.adFrequency,
    bannerUnitId: s.bannerUnitId,
    interstitialUnitId: s.interstitialUnitId,
  })
}
