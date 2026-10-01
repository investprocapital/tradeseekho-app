import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// GET /api/signals — public: list signals that are still "in play".
// We return active + tp1_hit + tp2_hit + tp3_hit + sl_hit so the client can
// show TP/SL HIT badges. Only "closed" signals are hidden.
export async function GET() {
  const signals = await db.signal.findMany({
    where: { status: { not: "closed" } },
    orderBy: { createdAt: "desc" },
    take: 30,
  })
  return NextResponse.json({
    signals: signals.map((s) => ({
      id: s.id,
      symbol: s.symbol,
      signalType: s.signalType,
      entry: s.entry,
      entry2: s.entry2,
      stopLoss: s.stopLoss,
      tp1: s.tp1,
      tp2: s.tp2,
      tp3: s.tp3,
      note: s.note,
      screenshot: s.screenshot,
      // Aliases for mobile/Flutter clients that expect different field names.
      // All three point to the same base64 data URL so any client can render
      // the captured chart image. Never null (empty string fallback) so image
      // widgets don't crash.
      chart_image_url: s.screenshot ?? "",
      chart_snapshot_url: s.screenshot ?? "",
      status: s.status,
      // ISO timestamps for each hit (null if not yet hit)
      tp1HitAt: s.tp1HitAt?.toISOString() ?? null,
      tp2HitAt: s.tp2HitAt?.toISOString() ?? null,
      tp3HitAt: s.tp3HitAt?.toISOString() ?? null,
      slHitAt: s.slHitAt?.toISOString() ?? null,
      profitUsd: s.profitUsd,
      // When true, the client hides Entry/SL/TP values — only shows chart image.
      hideLevels: s.hideLevels,
      createdAt: s.createdAt.toISOString(),
    })),
  })
}
