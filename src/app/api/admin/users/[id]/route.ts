import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

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
