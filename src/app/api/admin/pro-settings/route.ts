import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { ensureProSettingsSchema } from "@/lib/ensure-schema"

export const dynamic = "force-dynamic"

// GET /api/admin/pro-settings — admin-only: get Pro payment settings
export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard
  await ensureProSettingsSchema()
  let s = await db.proSettings.findUnique({ where: { id: "singleton" } })
  if (!s) {
    s = await db.proSettings.create({ data: { id: "singleton" } })
  }
  return NextResponse.json({
    usdPrice: s.usdPrice,
    pkrRate: s.pkrRate,
    jazzcashNumber: s.jazzcashNumber,
    jazzcashEnabled: s.jazzcashEnabled,
    easypaisaNumber: s.easypaisaNumber,
    easypaisaEnabled: s.easypaisaEnabled,
    cardEnabled: s.cardEnabled,
    cardInstructions: s.cardInstructions,
    sadapayEnabled: s.sadapayEnabled,
    sadapayName: s.sadapayName,
    sadapayNumber: s.sadapayNumber,
    sadapayIban: s.sadapayIban,
    usdtEnabled: s.usdtEnabled,
    usdtAddress: s.usdtAddress,
    bep20Enabled: s.bep20Enabled,
    bep20Address: s.bep20Address,
    payoneerEnabled: s.payoneerEnabled,
    payoneerEmail: s.payoneerEmail,
    payoneerInstructions: s.payoneerInstructions,
    // QR code image URLs (admin-uploaded from Binance/Bitget/any exchange)
    jazzcashQrUrl: s.jazzcashQrUrl,
    easypaisaQrUrl: s.easypaisaQrUrl,
    sadapayQrUrl: s.sadapayQrUrl,
    usdtQrUrl: s.usdtQrUrl,
    bep20QrUrl: s.bep20QrUrl,
    payoneerQrUrl: s.payoneerQrUrl,
  })
}

// PUT /api/admin/pro-settings — admin-only: update Pro payment settings
export async function PUT(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard
  await ensureProSettingsSchema()
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if ("usdPrice" in body) data.usdPrice = Number(body.usdPrice) || 5
  if ("pkrRate" in body) data.pkrRate = Number(body.pkrRate) || 280
  if ("jazzcashNumber" in body) data.jazzcashNumber = String(body.jazzcashNumber)
  if ("jazzcashEnabled" in body) data.jazzcashEnabled = !!body.jazzcashEnabled
  if ("easypaisaNumber" in body) data.easypaisaNumber = String(body.easypaisaNumber)
  if ("easypaisaEnabled" in body) data.easypaisaEnabled = !!body.easypaisaEnabled
  if ("cardEnabled" in body) data.cardEnabled = !!body.cardEnabled
  if ("cardInstructions" in body) data.cardInstructions = String(body.cardInstructions)
  // SadaPay
  if ("sadapayEnabled" in body) data.sadapayEnabled = !!body.sadapayEnabled
  if ("sadapayName" in body) data.sadapayName = String(body.sadapayName)
  if ("sadapayNumber" in body) data.sadapayNumber = String(body.sadapayNumber)
  if ("sadapayIban" in body) data.sadapayIban = String(body.sadapayIban)
  // USDT TRC20
  if ("usdtEnabled" in body) data.usdtEnabled = !!body.usdtEnabled
  if ("usdtAddress" in body) data.usdtAddress = String(body.usdtAddress)
  // USDT BEP20 (BSC)
  if ("bep20Enabled" in body) data.bep20Enabled = !!body.bep20Enabled
  if ("bep20Address" in body) data.bep20Address = String(body.bep20Address)
  // Payoneer
  if ("payoneerEnabled" in body) data.payoneerEnabled = !!body.payoneerEnabled
  if ("payoneerEmail" in body) data.payoneerEmail = String(body.payoneerEmail)
  if ("payoneerInstructions" in body) data.payoneerInstructions = String(body.payoneerInstructions)
  // QR code image URLs (admin-uploaded). Empty string → null (clears QR).
  if ("jazzcashQrUrl" in body) data.jazzcashQrUrl = body.jazzcashQrUrl || null
  if ("easypaisaQrUrl" in body) data.easypaisaQrUrl = body.easypaisaQrUrl || null
  if ("sadapayQrUrl" in body) data.sadapayQrUrl = body.sadapayQrUrl || null
  if ("usdtQrUrl" in body) data.usdtQrUrl = body.usdtQrUrl || null
  if ("bep20QrUrl" in body) data.bep20QrUrl = body.bep20QrUrl || null
  if ("payoneerQrUrl" in body) data.payoneerQrUrl = body.payoneerQrUrl || null

  const updated = await db.proSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...(data as any) },
  })
  return NextResponse.json({
    usdPrice: updated.usdPrice,
    pkrRate: updated.pkrRate,
    jazzcashNumber: updated.jazzcashNumber,
    jazzcashEnabled: updated.jazzcashEnabled,
    easypaisaNumber: updated.easypaisaNumber,
    easypaisaEnabled: updated.easypaisaEnabled,
    cardEnabled: updated.cardEnabled,
    cardInstructions: updated.cardInstructions,
    sadapayEnabled: updated.sadapayEnabled,
    sadapayName: updated.sadapayName,
    sadapayNumber: updated.sadapayNumber,
    sadapayIban: updated.sadapayIban,
    usdtEnabled: updated.usdtEnabled,
    usdtAddress: updated.usdtAddress,
    bep20Enabled: updated.bep20Enabled,
    bep20Address: updated.bep20Address,
    payoneerEnabled: updated.payoneerEnabled,
    payoneerEmail: updated.payoneerEmail,
    payoneerInstructions: updated.payoneerInstructions,
    jazzcashQrUrl: updated.jazzcashQrUrl,
    easypaisaQrUrl: updated.easypaisaQrUrl,
    sadapayQrUrl: updated.sadapayQrUrl,
    usdtQrUrl: updated.usdtQrUrl,
    bep20QrUrl: updated.bep20QrUrl,
    payoneerQrUrl: updated.payoneerQrUrl,
  })
}
