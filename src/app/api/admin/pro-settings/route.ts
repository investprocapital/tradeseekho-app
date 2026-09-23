import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

// GET /api/admin/pro-settings — admin-only: get Pro payment settings
export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard
  let s = await db.proSettings.findUnique({ where: { id: "singleton" } })
  if (!s) {
    s = await db.proSettings.create({ data: { id: "singleton" } })
  }
  return NextResponse.json({
    usdPrice: s.usdPrice,
    pkrRate: s.pkrRate,
    jazzcashNumber: s.jazzcashNumber,
    easypaisaNumber: s.easypaisaNumber,
    cardEnabled: s.cardEnabled,
    cardInstructions: s.cardInstructions,
  })
}

// PUT /api/admin/pro-settings — admin-only: update Pro payment settings
export async function PUT(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if ("usdPrice" in body) data.usdPrice = Number(body.usdPrice) || 5
  if ("pkrRate" in body) data.pkrRate = Number(body.pkrRate) || 280
  if ("jazzcashNumber" in body) data.jazzcashNumber = String(body.jazzcashNumber)
  if ("easypaisaNumber" in body) data.easypaisaNumber = String(body.easypaisaNumber)
  if ("cardEnabled" in body) data.cardEnabled = !!body.cardEnabled
  if ("cardInstructions" in body) data.cardInstructions = String(body.cardInstructions)

  const updated = await db.proSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...(data as any) },
  })
  return NextResponse.json({
    usdPrice: updated.usdPrice,
    pkrRate: updated.pkrRate,
    jazzcashNumber: updated.jazzcashNumber,
    easypaisaNumber: updated.easypaisaNumber,
    cardEnabled: updated.cardEnabled,
    cardInstructions: updated.cardInstructions,
  })
}
