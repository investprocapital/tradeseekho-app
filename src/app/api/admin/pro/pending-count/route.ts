import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isAdmin } from "@/lib/admin-auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

// GET /api/admin/pro/pending-count — lightweight endpoint that returns ONLY
// the count of pending Pro payment requests. Used to render the red badge on
// the Pro Payments nav button + the header Bell icon without fetching the
// full list (which can be heavy when there are many requests).
//
// IMPORTANT: This endpoint is also called from the public Header component
// (which renders for ALL users, including non-admins). To avoid 401 errors
// spamming the console for every client user, we return { pending: 0 } for
// non-admins instead of a 401. This is safe — non-admins always see 0 (no
// badge) and cannot tell whether there are actually pending requests.
export async function GET() {
  let admin = false
  try {
    admin = await isAdmin()
  } catch {
    admin = false
  }
  if (!admin) {
    return NextResponse.json({ pending: 0 })
  }

  try {
    const pending = await withDbRetry(() => db.proRequest.count({
      where: { status: "pending" },
    }))
    return NextResponse.json({ pending })
  } catch (e: any) {
    console.error("[admin/pro/pending-count]", e?.message)
    // On DB error return 0 so the badge never gets stuck visible
    return NextResponse.json({ pending: 0, error: "db_unreachable" })
  }
}
