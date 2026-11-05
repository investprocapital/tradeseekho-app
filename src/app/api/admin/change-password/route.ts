import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isAdmin, adminPassword } from "@/lib/admin-auth"
import { withDbRetry } from "@/lib/db-retry"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * POST /api/admin/change-password
 *
 * Lets the admin change their own password. Works for BOTH auth methods:
 *
 * 1. Demo password admin (logged in via ADMIN_PASSWORD env var):
 *    - Verifies current demo password
 *    - Since demo password is an env var (can't change at runtime), we
 *      instead update the admin USER's password in the DB (if an admin
 *      user exists with ADMIN_EMAIL). This way the admin can use email+password
 *      login with the new password.
 *
 * 2. Email + password admin (logged in via NextAuth):
 *    - Verifies current password against DB
 *    - Updates with new hashed password
 *
 * Body: { currentPassword, newPassword }
 */
export async function POST(req: Request) {
  const guard = await isAdmin()
  if (!guard) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { currentPassword, newPassword } = await req.json()

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }

  // Try to find the admin user via session
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  if (userId) {
    // Email+password admin — verify current password + update
    try {
      const user = await withDbRetry(() => db.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true, email: true },
      }))

      if (!user || !user.password) {
        return NextResponse.json({ error: "Account has no password set (Google login). Use Set Password first." }, { status: 400 })
      }

      // Verify current password
      const ok = await bcrypt.compare(currentPassword || "", user.password)
      if (!ok) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      // Update with new password
      const hash = await bcrypt.hash(newPassword, 10)
      await withDbRetry(() => db.user.update({
        where: { id: user.id },
        data: { password: hash },
      }))

      return NextResponse.json({ ok: true, message: "Password changed successfully!" })
    } catch (e: any) {
      console.error("[admin/change-password]", e?.message)
      return NextResponse.json({ error: "db_error", message: e?.message }, { status: 500 })
    }
  }

  // Demo password admin — check if ADMIN_EMAIL user exists, update their password
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase()
  if (adminEmail) {
    try {
      const adminUser = await withDbRetry(() => db.user.findUnique({
        where: { email: adminEmail },
        select: { id: true, password: true },
      }))

      if (adminUser) {
        // If admin has a password set, verify current password
        if (adminUser.password) {
          const ok = await bcrypt.compare(currentPassword || "", adminUser.password)
          if (!ok) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
          }
        } else {
          // No password set yet — verify demo password instead
          if (currentPassword !== adminPassword()) {
            return NextResponse.json({ error: "Current demo password is incorrect" }, { status: 400 })
          }
        }

        // Update password
        const hash = await bcrypt.hash(newPassword, 10)
        await withDbRetry(() => db.user.update({
          where: { id: adminUser.id },
          data: { password: hash },
        }))

        return NextResponse.json({ ok: true, message: "Password changed! Use email + new password to login next time." })
      }
    } catch (e: any) {
      console.error("[admin/change-password] demo admin", e?.message)
    }
  }

  return NextResponse.json({ error: "Could not change password. No admin account found." }, { status: 400 })
}
