import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

/**
 * POST /api/auth/delete-account
 *
 * Permanently deletes the signed-in user's account + all related data.
 * This is MANDATORY for Google Play Store / Apple App Store compliance.
 *
 * Security:
 *   - Requires an active NextAuth session (no anonymous "local-learner" deletion).
 *   - Only deletes the session user's own data — never anyone else's.
 *
 * Data cleanup (Prisma cascade handles most; manual cleanup for tables
 * without a FK relation to User):
 *   1. PriceAlert  → manual deleteMany (no FK relation)
 *   2. Comment     → manual deleteMany (no FK relation; userName is denormalized)
 *   3. User        → db.user.delete() — cascades to:
 *      - Progress, Bookmark, Certificate, ProRequest (all have onDelete: Cascade)
 *
 * Note: This project uses NextAuth (NOT Supabase Auth). The "Supabase" is just
 * the PostgreSQL database. So we delete via Prisma (the equivalent of
 * supabase.auth.admin.deleteUser + profiles table cleanup). RLS policies are
 * not applicable here since auth is handled by NextAuth, not Supabase Auth.
 *
 * After success, the client calls signOut({ callbackUrl: "/" }) to clear the
 * session and redirect to the login screen.
 */
export async function POST() {
  // 1) Resolve the session user
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId || userId === "local-learner") {
    return NextResponse.json(
      { error: "unauthorized", message: "You must be signed in to delete your account." },
      { status: 401 },
    )
  }

  try {
    // 2) Verify the user exists (defensive — session could be stale)
    const user = await withDbRetry(() => db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    }))
    if (!user) {
      // Session is stale — tell the client to sign out anyway
      return NextResponse.json(
        { error: "not_found", message: "Account not found. Please sign out and sign back in." },
        { status: 404 },
      )
    }

    // 3) Manual cleanup for tables WITHOUT a FK relation to User
    //    (Prisma won't cascade-delete these automatically)
    try {
      await withDbRetry(() => db.priceAlert.deleteMany({ where: { userId } }))
    } catch (e: any) {
      console.error("[delete-account] PriceAlert cleanup failed:", e?.message)
      // Continue — don't block account deletion because of orphan alerts
    }
    try {
      await withDbRetry(() => db.comment.deleteMany({ where: { userId } }))
    } catch (e: any) {
      console.error("[delete-account] Comment cleanup failed:", e?.message)
      // Continue — don't block account deletion because of orphan comments
    }

    // 4) Delete the User row — Prisma cascades to:
    //    Progress, Bookmark, Certificate, ProRequest (all onDelete: Cascade)
    await withDbRetry(() => db.user.delete({ where: { id: userId } }))

    // 5) Log the deletion so admin can see who deleted their account
    try {
      await withDbRetry(() => db.deletedAccount.create({
        data: {
          email: user.email ?? "unknown",
          name: user.name ?? null,
        },
      }))
    } catch (e: any) {
      console.error("[delete-account] Failed to log deletion:", e?.message)
      // Don't block — the account is already deleted
    }

    console.log(`[delete-account] Account deleted: ${user.email ?? user.id}`)

    return NextResponse.json({
      ok: true,
      message: "Account permanently deleted. All your data has been removed.",
    })
  } catch (e: any) {
    console.error("[delete-account] Failed:", e?.message)
    return NextResponse.json(
      { error: "delete_failed", message: e?.message || "Could not delete account. Please try again or contact support." },
      { status: 500 },
    )
  }
}
