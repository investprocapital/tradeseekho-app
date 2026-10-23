import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

// GET /api/admin/notifications — list ALL broadcast notifications (newest first)
export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    const rows = await withDbRetry(() => db.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    }))
    return NextResponse.json({
      notifications: rows.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        deepLink: n.deepLink ?? "",
        signalId: n.signalId ?? "",
        createdAt: n.createdAt.toISOString(),
      })),
    })
  } catch (e: any) {
    console.error("[admin/notifications GET]", e?.message)
    return NextResponse.json({ notifications: [], error: "db_unreachable" })
  }
}

// POST /api/admin/notifications — create a new broadcast notification
// Body: { title, body, type?, deepLink? }
export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const title = (body.title ?? "").toString().trim()
  const text = (body.body ?? "").toString().trim()
  if (!title || !text) {
    return NextResponse.json({ error: "title_and_body_required" }, { status: 400 })
  }

  const type = ["signal", "system"].includes(body.type) ? body.type : "system"
  const deepLink = (body.deepLink ?? "").toString().trim() || null

  try {
    const created = await withDbRetry(() => db.notification.create({
      data: { type, title, body: text, deepLink },
    }))
    return NextResponse.json({ ok: true, id: created.id })
  } catch (e: any) {
    console.error("[admin/notifications POST]", e?.message)
    return NextResponse.json({ error: "db_error", message: e?.message }, { status: 500 })
  }
}

// DELETE /api/admin/notifications?id=X  → delete a single notification
// DELETE /api/admin/notifications?all=true → delete ALL broadcast notifications
// DELETE /api/admin/notifications?olderThanDays=N → delete notifications older than N days
export async function DELETE(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  const all = searchParams.get("all") === "true"
  const olderThanDays = Number(searchParams.get("olderThanDays") || "0")

  try {
    if (id) {
      await withDbRetry(() => db.notification.delete({ where: { id } }))
      return NextResponse.json({ ok: true, deleted: 1 })
    }
    if (all) {
      const r = await withDbRetry(() => db.notification.deleteMany({}))
      return NextResponse.json({ ok: true, deleted: r.count })
    }
    if (olderThanDays > 0) {
      const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
      const r = await withDbRetry(() => db.notification.deleteMany({
        where: { createdAt: { lt: cutoff } },
      }))
      return NextResponse.json({ ok: true, deleted: r.count })
    }
    return NextResponse.json({ error: "id | all | olderThanDays required" }, { status: 400 })
  } catch (e: any) {
    console.error("[admin/notifications DELETE]", e?.message)
    return NextResponse.json({ error: "db_error", message: e?.message }, { status: 500 })
  }
}
