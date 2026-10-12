import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

// GET /api/signals — public: list signals that are still "in play".
export async function GET() {
  try {
    const signals = await withDbRetry(() => db.signal.findMany({
      where: { status: { not: "closed" } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }))
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
        chart_image_url: s.screenshot ?? "",
        chart_snapshot_url: s.screenshot ?? "",
        status: s.status,
        tp1HitAt: s.tp1HitAt?.toISOString() ?? null,
        tp2HitAt: s.tp2HitAt?.toISOString() ?? null,
        tp3HitAt: s.tp3HitAt?.toISOString() ?? null,
        slHitAt: s.slHitAt?.toISOString() ?? null,
        profitUsd: s.profitUsd,
        hideLevels: s.hideLevels,
        createdAt: s.createdAt.toISOString(),
      })),
    })
  } catch (e: any) {
    console.error("[signals] DB unreachable:", e?.message)
    return NextResponse.json({ signals: [] })
  }
}
