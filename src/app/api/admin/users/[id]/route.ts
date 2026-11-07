import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

/**
 * PATCH /api/admin/users/[id]  body: { adsEnabled: boolean }
 * (also accepts ?id=X query for backward compat)
 *
 * Toggle per-user Ads ON/OFF from the admin Users tab.
 * - Ads ON  → user sees an AdMob video interstitial at the start of each lesson.
 * - Ads OFF → no ads shown to that user.
 * - Pro users (proStatus === "active") are ALWAYS ad-free: attempting to turn
 *   Ads ON for a Pro user is rejected (returns 400) so the admin UI stays honest.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin()
  if (guard) return guard

  const { id: pathId } = await params
  const { searchParams } = new URL(req.url)
  const id = pathId || searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const body = await req.json().catch(() => ({} as { adsEnabled?: boolean }))
  if (typeof body.adsEnabled !== "boolean") {
    return NextResponse.json({ error: "adsEnabled (boolean) required" }, { status: 400 })
  }

  try {
    const user = await withDbRetry(() => db.user.findUnique({
      where: { id },
      select: { id: true, proStatus: true, adsEnabled: true },
    }))

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Pro users can never have ads enabled — enforce server-side too.
    if (body.adsEnabled && user.proStatus === "active") {
      return NextResponse.json(
        { error: "Pro users are always ad-free. Ads cannot be enabled for a Pro client." },
        { status: 400 },
      )
    }

    await withDbRetry(() => db.user.update({
      where: { id },
      data: { adsEnabled: body.adsEnabled as boolean },
    }))

    return NextResponse.json({
      ok: true,
      adsEnabled: body.adsEnabled,
      adsEffective: body.adsEnabled && user.proStatus !== "active",
    })
  } catch (e: any) {
    console.error("[admin/users PATCH]", e?.message)
    return NextResponse.json({ error: "db_error", message: e?.message }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/users?id=X
 *
 * Admin can permanently delete any client account.
 * - Cannot delete admin accounts (protected)
 * - Cascades: Progress, Bookmark, Certificate, ProRequest (FK cascade)
 * - Manual cleanup: PriceAlert, Comment (no FK)
 * - Logs to DeletedAccount table (same as self-delete)
 */
export async function DELETE(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  try {
    // Find the user
    const user = await withDbRetry(() => db.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true },
    }))

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Protect admin accounts from deletion
    if (user.role === "admin") {
      return NextResponse.json({ error: "Cannot delete admin account" }, { status: 403 })
    }

    // Manual cleanup for tables without FK relation
    try { await withDbRetry(() => db.priceAlert.deleteMany({ where: { userId: id } })) } catch {}
    try { await withDbRetry(() => db.comment.deleteMany({ where: { userId: id } })) } catch {}

    // Delete user (cascades to Progress, Bookmark, Certificate, ProRequest)
    await withDbRetry(() => db.user.delete({ where: { id } }))

    // Log to DeletedAccount table
    try {
      await withDbRetry(() => db.deletedAccount.create({
        data: {
          email: user.email ?? "unknown",
          name: user.name ?? null,
        },
      }))
    } catch {}

    console.log(`[admin/users DELETE] Admin deleted account: ${user.email}`)

    return NextResponse.json({ ok: true, message: `Account deleted: ${user.email}` })
  } catch (e: any) {
    console.error("[admin/users DELETE]", e?.message)
    return NextResponse.json({ error: "db_error", message: e?.message }, { status: 500 })
  }
}
