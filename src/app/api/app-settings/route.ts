import { NextResponse } from "next/server"
import { getAppSettings } from "@/lib/app-settings"

export const dynamic = "force-dynamic"

/**
 * GET /api/app-settings — PUBLIC (no auth).
 * Returns the current App Mode + Maintenance Mode so the client can:
 *   1. Show a maintenance banner if maintenanceMode = true
 *   2. Know the effective app URL for share links
 *
 * This is safe to expose publicly — no secrets here.
 */
export async function GET() {
  const s = await getAppSettings()
  return NextResponse.json({
    appMode: s.appMode,
    // The effective URL based on appMode (for share links, etc.)
    appUrl: s.appMode === "custom" ? s.customDomain : s.vercelUrl,
    vercelUrl: s.vercelUrl,
    customDomain: s.customDomain,
    maintenanceMode: s.maintenanceMode,
    maintenanceMessage: s.maintenanceMessage,
  })
}
