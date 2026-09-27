import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

// GET /api/admin/signals — admin: list all signals
export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard
  const signals = await db.signal.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ signals })
}

// POST /api/admin/signals — admin: create new signal
export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard
  const body = await req.json()
  const { symbol, signalType, entry, stopLoss, tp1, tp2, tp3, note, screenshot } = body
  if (!symbol || !signalType || !entry || !stopLoss || !screenshot) {
    return NextResponse.json({ error: "symbol, signalType, entry, stopLoss, screenshot required" }, { status: 400 })
  }
  const signal = await db.signal.create({
    data: {
      symbol,
      signalType,
      entry,
      stopLoss,
      tp1: tp1 || null,
      tp2: tp2 || null,
      tp3: tp3 || null,
      note: note || null,
      screenshot,
    },
  })
  return NextResponse.json({ ok: true, signal })
}

// DELETE /api/admin/signals — admin: delete signal
export async function DELETE(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  await db.signal.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
