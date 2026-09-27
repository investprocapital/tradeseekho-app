import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// GET /api/signals — public: list active signals
export async function GET() {
  const signals = await db.signal.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    take: 20,
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
      createdAt: s.createdAt.toISOString(),
    })),
  })
}
