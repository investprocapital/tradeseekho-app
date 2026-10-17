import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"
import { uploadImage } from "@/lib/blob-upload"
import { compressImage } from "@/lib/image-compress"
import {
  buildHitNotification,
  actionToStatus,
  type HitAction,
} from "@/lib/signals"

export const dynamic = "force-dynamic"

// GET /api/admin/signals — admin: list all signals (newest first)
export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard
  const signals = await db.signal.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ signals })
}

// POST /api/admin/signals — admin: create (publish) a new signal.
// The screenshot is AUTO-COMPRESSED (resize 800px + WebP + quality 75) then
// uploaded to Vercel Blob CDN. Only the URL is stored in Neon.
export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard
  const body = await req.json()
  const { symbol, signalType, entry, entry2, stopLoss, tp1, tp2, tp3, note, screenshot, hideLevels } = body
  if (!symbol || !signalType || !entry || !stopLoss || !screenshot) {
    return NextResponse.json(
      { error: "symbol, signalType, entry, stopLoss, screenshot required" },
      { status: 400 },
    )
  }

  // ─── AUTO-COMPRESS screenshot if it's a base64 data URL ───
  // The canvas-generated screenshot is JPEG (already compressed at 0.85),
  // but we convert to WebP + resize 800px for even smaller size + CDN delivery.
  let finalScreenshot = screenshot
  if (screenshot.startsWith("data:")) {
    try {
      const compressed = await compressImage(Buffer.from(screenshot.split(",")[1], "base64"))
      // Convert compressed buffer back to data URL for uploadImage (which handles Blob upload)
      finalScreenshot = `data:${compressed.mimeType};base64,${compressed.buffer.toString("base64")}`
    } catch (e) {
      // Compression failed — use original (uploadImage will handle it)
      console.error("[admin/signals] screenshot compression failed:", e?.message)
    }
  }

  // Upload to Vercel Blob CDN (falls back to base64 if Blob not configured)
  const { url: screenshotUrl } = await uploadImage(finalScreenshot, "signals", `sig_${Date.now()}`)
  const signal = await db.signal.create({
    data: {
      symbol,
      signalType,
      entry,
      entry2: entry2 || null,
      stopLoss,
      tp1: tp1 || null,
      tp2: tp2 || null,
      tp3: tp3 || null,
      note: note || null,
      screenshot: screenshotUrl || finalScreenshot,
      status: "active",
      hideLevels: hideLevels === true,
    },
  })
  return NextResponse.json({ ok: true, signal })
}

// PATCH /api/admin/signals?id=X — admin: mark a TP/SL hit on a signal.
// Body: { action: "tp1" | "tp2" | "tp3" | "sl" }
//
// On hit:
//   1. Updates the signal status + the relevant *HitAt timestamp + profitUsd snapshot.
//   2. Creates a broadcast Notification row (seen by all users via /api/notifications).
//      The notification carries a deep link `app://signal/{id}` for the Flutter app.
//
// Phase 1 = manual button. Phase 2 will add automatic price-based detection.
export async function PATCH(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const body = await req.json()
  const action = body?.action as HitAction | undefined
  if (!action || !["tp1", "tp2", "tp3", "sl"].includes(action)) {
    return NextResponse.json({ error: "action must be tp1|tp2|tp3|sl" }, { status: 400 })
  }

  const signal = await db.signal.findUnique({ where: { id } })
  if (!signal) return NextResponse.json({ error: "signal not found" }, { status: 404 })

  const newStatus = actionToStatus(action)
  const now = new Date()

  // Determine the target price used to compute profit, and the timestamp field.
  let targetPrice: string | null = null
  const data: Record<string, unknown> = { status: newStatus, updatedAt: now }
  switch (action) {
    case "tp1":
      targetPrice = signal.tp1
      data.tp1HitAt = now
      break
    case "tp2":
      targetPrice = signal.tp2
      data.tp2HitAt = now
      break
    case "tp3":
      targetPrice = signal.tp3
      data.tp3HitAt = now
      break
    case "sl":
      targetPrice = signal.stopLoss
      data.slHitAt = now
      break
  }

  // Snapshot the estimated profit/loss at hit time (for display in notifications/badges).
  if (targetPrice) {
    const e = parseFloat(signal.entry)
    const t = parseFloat(targetPrice)
    if (Number.isFinite(e) && Number.isFinite(t)) {
      const mult =
        signal.symbol === "OANDA:XAUUSD"
          ? 10
          : signal.symbol === "BINANCE:BTCUSDT"
            ? 0.1
            : signal.symbol === "TVC:USOIL"
              ? 100
              : 100000 // EURUSD / GBPUSD
      const diff = signal.signalType === "SELL" ? e - t : t - e
      data.profitUsd = Math.round(diff * mult)
    }
  }

  const updated = await db.signal.update({ where: { id }, data })

  // Build + persist the broadcast notification (Phase 1 manual push).
  const { title, body: notifBody } = buildHitNotification(
    action,
    signal.symbol,
    signal.signalType,
    signal.entry,
    targetPrice,
  )
  await db.notification.create({
    data: {
      type: "signal",
      title,
      body: notifBody,
      deepLink: `app://signal/${signal.id}`,
      signalId: signal.id,
    },
  })

  return NextResponse.json({ ok: true, signal: updated })
}

// DELETE /api/admin/signals?id=X — admin: delete a signal
export async function DELETE(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  await db.signal.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
