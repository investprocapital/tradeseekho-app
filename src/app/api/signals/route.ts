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
      stopLoss: s.stopLoss,
      tp1: s.tp1,
      tp2: s.tp2,
      tp3: s.tp3,
      note: s.note,
      screenshot: s.screenshot,
      status: s.status,
      // ISO timestamps for each hit (null if not yet hit)
      tp1HitAt: s.tp1HitAt?.toISOString() ?? null,
      tp2HitAt: s.tp2HitAt?.toISOString() ?? null,
      tp3HitAt: s.tp3HitAt?.toISOString() ?? null,
      slHitAt: s.slHitAt?.toISOString() ?? null,
      profitUsd: s.profitUsd,
      createdAt: s.createdAt.toISOString(),
    })),
  })
}
