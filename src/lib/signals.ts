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
export const SIGNAL_SYMBOLS = [
  { value: "OANDA:XAUUSD", label: "Gold (XAU/USD)", pair: "GOLD" },
  { value: "BINANCE:BTCUSDT", label: "Bitcoin (BTC/USDT)", pair: "BTC" },
  { value: "TVC:USOIL", label: "Crude Oil (USOIL)", pair: "OIL" },
  { value: "FX:EURUSD", label: "EUR/USD", pair: "EURUSD" },
  { value: "FX:GBPUSD", label: "GBP/USD", pair: "GBPUSD" },
] as const

// Display label for a symbol, e.g. "OANDA:XAUUSD" -> "GOLD"
export function pairLabel(symbol: string): string {
  const found = SIGNAL_SYMBOLS.find((s) => s.value === symbol)
  if (found) return found.pair
  return symbol.split(":")[1] ?? symbol
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
