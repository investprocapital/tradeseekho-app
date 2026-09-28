// Shared helpers for the Trading Signal system (Phase 1: manual TP/SL hit buttons).
// Used by both the admin API (to compute notification title/body) and the client
// (to render status badges). Keeping the logic in one place avoids drift.

export type SignalStatus =
  | "active"
  | "tp1_hit"
  | "tp2_hit"
  | "tp3_hit"
  | "sl_hit"
  | "closed"

export type HitAction = "tp1" | "tp2" | "tp3" | "sl"

// TradingView symbols supported by the manual signal system.
// Each symbol carries:
//   - pair:  short display label (GOLD / BTC / OIL / EURUSD / GBPUSD)
//   - yahoo: Yahoo Finance ticker used server-side to fetch the LIVE price
//            (kept here so the admin "Get Live Price" button + the price API
//             stay in sync with the symbol dropdown).
export const SIGNAL_SYMBOLS = [
  { value: "OANDA:XAUUSD", label: "Gold (XAU/USD)", pair: "GOLD", yahoo: "GC=F" },
  { value: "BINANCE:BTCUSDT", label: "Bitcoin (BTC/USDT)", pair: "BTC", yahoo: "BTC-USD" },
  { value: "TVC:USOIL", label: "Crude Oil (USOIL)", pair: "OIL", yahoo: "CL=F" },
  { value: "FX:EURUSD", label: "EUR/USD", pair: "EURUSD", yahoo: "EURUSD=X" },
  { value: "FX:GBPUSD", label: "GBP/USD", pair: "GBPUSD", yahoo: "GBPUSD=X" },
] as const

// Display label for a symbol, e.g. "OANDA:XAUUSD" -> "GOLD"
export function pairLabel(symbol: string): string {
  const found = SIGNAL_SYMBOLS.find((s) => s.value === symbol)
  if (found) return found.pair
  return symbol.split(":")[1] ?? symbol
}

// Yahoo Finance ticker for a TradingView symbol (used by /api/price).
export function yahooTicker(symbol: string): string | null {
  const found = SIGNAL_SYMBOLS.find((s) => s.value === symbol)
  return found?.yahoo ?? null
}

// Decimal places to display per symbol (drives price formatting + offsets).
//   Gold  -> 2 decimals (4208.90)
//   BTC   -> 2 decimals (83274.39)
//   Oil   -> 2 decimals (94.28)
//   Forex -> 4 decimals (1.1383) — 1 pip = 0.0001
const DECIMALS: Record<string, number> = {
  "OANDA:XAUUSD": 2,
  "BINANCE:BTCUSDT": 2,
  "TVC:USOIL": 2,
  "FX:EURUSD": 4,
  "FX:GBPUSD": 4,
}

/** Format a raw price to the symbol's display precision. */
export function formatPrice(symbol: string, price: number): string {
  const d = DECIMALS[symbol] ?? 2
  return price.toFixed(d)
}

/**
 * Default Entry/SL/TP offsets (in price units) used by the admin "Get Live
 * Price" auto-fill. Sensible per-pair defaults so the admin can publish fast
 * and then tweak. For BUY: SL below entry, TPs above. (SELL mirrors at fill time.)
 *   Gold   -> SL -20, TP1 +15, TP2 +30, TP3 +50  (in $)
 *   BTC    -> SL -1500, TP1 +1000, TP2 +2500, TP3 +4000 (in $)
 *   Oil    -> SL -1.5, TP1 +1, TP2 +2, TP3 +3.5 (in $)
 *   EURUSD -> SL -0.0030, TP1 +0.0020, TP2 +0.0040, TP3 +0.0060 (30/20/40/60 pips)
 */
export interface Offsets {
  sl: number
  tp1: number
  tp2: number
  tp3: number
}
const DEFAULT_OFFSETS: Record<string, Offsets> = {
  "OANDA:XAUUSD": { sl: 20, tp1: 15, tp2: 30, tp3: 50 },
  "BINANCE:BTCUSDT": { sl: 1500, tp1: 1000, tp2: 2500, tp3: 4000 },
  "TVC:USOIL": { sl: 1.5, tp1: 1, tp2: 2, tp3: 3.5 },
  "FX:EURUSD": { sl: 0.003, tp1: 0.002, tp2: 0.004, tp3: 0.006 },
  "FX:GBPUSD": { sl: 0.003, tp1: 0.002, tp2: 0.004, tp3: 0.006 },
}

export function getOffsets(symbol: string): Offsets {
  return DEFAULT_OFFSETS[symbol] ?? DEFAULT_OFFSETS["OANDA:XAUUSD"]
}

/**
 * Given a live entry price + signal type, compute suggested SL/TP values using
 * the symbol's default offsets. Returns formatted strings ready to drop into
 * the admin form (and still fully editable afterwards).
 */
export function suggestLevels(
  symbol: string,
  signalType: "BUY" | "SELL",
  entryPrice: number,
): { entry: string; stopLoss: string; tp1: string; tp2: string; tp3: string } {
  const o = getOffsets(symbol)
  const d = DECIMALS[symbol] ?? 2
  const dir = signalType === "BUY" ? 1 : -1
  return {
    entry: entryPrice.toFixed(d),
    stopLoss: (entryPrice - dir * o.sl).toFixed(d),
    tp1: (entryPrice + dir * o.tp1).toFixed(d),
    tp2: (entryPrice + dir * o.tp2).toFixed(d),
    tp3: (entryPrice + dir * o.tp3).toFixed(d),
  }
}

// Rough USD profit/loss multiplier per 1 unit of price movement.
// Tuned to produce realistic numbers for a small retail lot size.
// XAUUSD: ~$10 per $1 move (0.1 lot)
// BTCUSDT: ~$0.10 per $1 move (0.001 BTC)
// USOIL: ~$100 per $1 move (0.1 lot)
// EURUSD/GBPUSD: ~$100,000 per 1.0 price move = $10 per pip (1 lot)
const PROFIT_MULTIPLIER: Record<string, number> = {
  "OANDA:XAUUSD": 10,
  "BINANCE:BTCUSDT": 0.1,
  "TVC:USOIL": 100,
  "FX:EURUSD": 100000,
  "FX:GBPUSD": 100000,
}

/** Estimated USD profit for hitting a TP (positive) or SL (negative). */
export function estimateProfitUsd(
  symbol: string,
  signalType: string,
  entry: string,
  target: string,
): number {
  const e = parseFloat(entry)
  const t = parseFloat(target)
  if (!Number.isFinite(e) || !Number.isFinite(t)) return 0
  const mult = PROFIT_MULTIPLIER[symbol] ?? 1
  // For BUY: profit = (target - entry) * mult  (positive when target > entry)
  // For SELL: profit = (entry - target) * mult (positive when target < entry)
  const diff = signalType === "SELL" ? e - t : t - e
  return Math.round(diff * mult)
}

// Build the notification title/body for a TP/SL hit action.
export function buildHitNotification(
  action: HitAction,
  symbol: string,
  signalType: string,
  entry: string,
  target: string | null,
): { title: string; body: string } {
  const pair = pairLabel(symbol)
  const type = signalType.toUpperCase()
  const profit = target ? estimateProfitUsd(symbol, signalType, entry, target) : 0

  switch (action) {
    case "tp1":
      return {
        title: `${pair} ${type} TP1 HIT ✅ +$${Math.max(profit, 0)} Profit`,
        body: `TP2 is running... Check App`,
      }
    case "tp2":
      return {
        title: `${pair} ${type} TP2 HIT ✅ +$${Math.max(profit, 0)} Profit`,
        body: `TP3 is running... Check App`,
      }
    case "tp3":
      return {
        title: `${pair} ${type} TP3 HIT ✅ +$${Math.max(profit, 0)} Profit`,
        body: `All targets hit! 🎉 Check App`,
      }
    case "sl":
      return {
        // SL hit = loss. profit will be negative; show as -$X Loss
        title: `${pair} ${type} SL HIT ❌ -$${Math.abs(profit)} Loss`,
        body: `Trade stopped out. Better luck next time. Check App`,
      }
  }
}

// Map an action to the resulting signal status.
export function actionToStatus(action: HitAction): SignalStatus {
  switch (action) {
    case "tp1":
      return "tp1_hit"
    case "tp2":
      return "tp2_hit"
    case "tp3":
      return "tp3_hit"
    case "sl":
      return "sl_hit"
  }
}
