import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

// GET /api/admin/deleted-accounts — list recently deleted accounts (newest first)
export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    const accounts = await withDbRetry(() => db.deletedAccount.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }))
    return NextResponse.json({
      accounts: accounts.map((a) => ({
        id: a.id,
        email: a.email,
        name: a.name,
        createdAt: a.createdAt.toISOString(),
      })),
    })
  } catch (e: any) {
    console.error("[admin/deleted-accounts GET]", e?.message)
    return NextResponse.json({ accounts: [] })
  }
}

// DELETE /api/admin/deleted-accounts?id=X — dismiss a deleted account record
// DELETE /api/admin/deleted-accounts?all=true — dismiss ALL records
export async function DELETE(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  const all = searchParams.get("all") === "true"

  try {
    if (all) {
      await withDbRetry(() => db.deletedAccount.deleteMany({}))
      return NextResponse.json({ ok: true, deleted: "all" })
    }
    if (id) {
      await withDbRetry(() => db.deletedAccount.delete({ where: { id } }))
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: "id or all required" }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: "db_error" }, { status: 500 })
  }
}
