import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { withDbRetry } from "@/lib/db-retry"
import { invalidateAppSettingsCache } from "@/lib/app-settings"

export const dynamic = "force-dynamic"

/**
 * GET /api/admin/app-settings — admin-only: get App Mode + Maintenance Mode.
 * PUT /api/admin/app-settings — admin-only: update settings.
 *
 * Saved in DB (AppSettings singleton). No Vercel env changes needed.
 */

export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard

  let s = await withDbRetry(() => db.appSettings.findUnique({ where: { id: "singleton" } }))
  if (!s) {
    s = await withDbRetry(() => db.appSettings.create({ data: { id: "singleton" } }))
  }

  return NextResponse.json({
    appMode: s.appMode,
    vercelUrl: s.vercelUrl,
    customDomain: s.customDomain,
    maintenanceMode: s.maintenanceMode,
    maintenanceMessage: s.maintenanceMessage,
  })
}

export async function PUT(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const body = await req.json().catch(() => ({} as Record<string, unknown>))
  const data: Record<string, unknown> = {}

  if (typeof body.appMode === "string") {
    data.appMode = body.appMode === "custom" ? "custom" : "vercel"
  }
  if (typeof body.vercelUrl === "string") {
    data.vercelUrl = body.vercelUrl.trim() || "https://tradeseekhopk.vercel.app"
  }
  if (typeof body.customDomain === "string") {
    data.customDomain = body.customDomain.trim() || "https://tradeseekhopk.com"
  }
  if (typeof body.maintenanceMode === "boolean") {
    data.maintenanceMode = body.maintenanceMode
  }
  if (typeof body.maintenanceMessage === "string") {
    data.maintenanceMessage = body.maintenanceMessage.trim()
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 })
  }

  try {
    const updated = await withDbRetry(() =>
      db.appSettings.upsert({
        where: { id: "singleton" },
        update: data,
        create: { id: "singleton", ...(data as any) },
      }),
    )
    // Invalidate cache so the new settings take effect immediately.
    invalidateAppSettingsCache()

    return NextResponse.json({
      ok: true,
      appMode: updated.appMode,
      vercelUrl: updated.vercelUrl,
      customDomain: updated.customDomain,
      maintenanceMode: updated.maintenanceMode,
      maintenanceMessage: updated.maintenanceMessage,
    })
  } catch (e: any) {
    console.error("[admin/app-settings PUT]", e?.message)
    return NextResponse.json({ error: "db_error", message: e?.message }, { status: 500 })
  }
}
