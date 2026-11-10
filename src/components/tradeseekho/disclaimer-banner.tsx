"use client"

/**
 * DisclaimerBanner — small educational-purpose disclaimer shown on every
 * screen. Required by Google Play Store policy (educational apps that
 * mention trading/finance must display a risk warning).
 *
 * Text: "This app is for educational purpose only. This is not financial
 * advice. Trading involves risk."
 *
 * Placed in the footer so it appears on all screens without intruding on
 * the main content. Compact + dismissible.
 */
export function DisclaimerBanner() {
  return (
    <div className="border-t border-amber-500/20 bg-amber-500/5 px-4 py-2">
      <p className="text-center text-[10px] font-medium leading-relaxed text-amber-600/90">
        ⚠️ This app is for educational purpose only. This is not financial advice. Trading involves risk.
      </p>
    </div>
  )
}
