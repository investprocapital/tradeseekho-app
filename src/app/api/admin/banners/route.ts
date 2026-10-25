import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

// GET /api/admin/banners — list ALL banners (including inactive) for admin
export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    const banners = await withDbRetry(() => db.promotion.findMany({
      orderBy: { sortOrder: "asc" },
    }))
    return NextResponse.json({
      banners: banners.map((b) => ({
        id: b.id,
        imageUrl: b.imageUrl,
        title: b.title ?? "",
        linkUrl: b.linkUrl,
        isActive: b.isActive,
        sortOrder: b.sortOrder,
        createdAt: b.createdAt.toISOString(),
      })),
    })
  } catch (e: any) {
    console.error("[admin/banners GET]", e?.message)
    return NextResponse.json({ banners: [], error: "db_unreachable" })
  }
}

// POST /api/admin/banners — create a new banner
// Body: { imageUrl, title?, linkUrl, isActive, sortOrder }
export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  let body: any = {}
  try { body = await req.json() } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }) }

  const imageUrl = String(body.imageUrl ?? "").slice(0, 2000)
  if (!imageUrl) return NextResponse.json({ error: "image_required" }, { status: 400 })

  try {
    const banner = await withDbRetry(() => db.promotion.create({
      data: {
        imageUrl,
        title: String(body.title ?? "").slice(0, 200) || null,
        linkUrl: String(body.linkUrl ?? "#").slice(0, 2000) || "#",
        isActive: body.isActive !== false,
        sortOrder: Number(body.sortOrder) || 0,
      },
    }))
    return NextResponse.json({ ok: true, banner })
  } catch (e: any) {
    console.error("[admin/banners POST]", e?.message)
    return NextResponse.json({ error: "db_error", message: e?.message }, { status: 500 })
  }
}

// PUT /api/admin/banners?id=X — update a banner
// Body: { imageUrl?, title?, linkUrl?, isActive?, sortOrder? }
export async function PUT(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  let body: any = {}
  try { body = await req.json() } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }) }

  const data: Record<string, unknown> = {}
  if (body.imageUrl !== undefined) data.imageUrl = String(body.imageUrl).slice(0, 2000)
  if (body.title !== undefined) data.title = String(body.title).slice(0, 200) || null
  if (body.linkUrl !== undefined) data.linkUrl = String(body.linkUrl).slice(0, 2000) || "#"
  if (body.isActive !== undefined) data.isActive = !!body.isActive
  if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0

  try {
    const banner = await withDbRetry(() => db.promotion.update({ where: { id }, data }))
    return NextResponse.json({ ok: true, banner })
  } catch (e: any) {
    console.error("[admin/banners PUT]", e?.message)
    return NextResponse.json({ error: "db_error", message: e?.message }, { status: 500 })
  }
}

// DELETE /api/admin/banners?id=X — delete a banner
export async function DELETE(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  try {
    await withDbRetry(() => db.promotion.delete({ where: { id } }))
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[admin/banners DELETE]", e?.message)
    return NextResponse.json({ error: "db_error", message: e?.message }, { status: 500 })
  }
}
