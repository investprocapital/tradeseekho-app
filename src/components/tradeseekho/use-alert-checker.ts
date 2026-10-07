"use client"

import { useEffect, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { pairLabel, formatPrice } from "@/lib/signals"

interface TriggeredAlert {
  id: string
  symbol: string
  targetPrice: number
  direction: string
  livePrice: number
}

interface CheckResult {
  triggered: TriggeredAlert[]
  checked: number
  prices: Record<string, number>
}

/**
 * useAlertChecker — global hook that polls /api/price-alerts/check every 20s.
 * When a price alert target is hit:
 *   1. Shows a toast notification: "🔔 GOLD Alert Triggered!"
 *   2. Invalidates the price-alerts query (so the UI updates — alert shows as Triggered)
 *   3. Invalidates the notifications query (so the bell badge updates)
 *
 * This runs on the home page (always active when the app is open).
 * For push notifications when the app is CLOSED, FCM setup is needed (Phase 2).
 */
export function useAlertChecker() {
  const qc = useQueryClient()
  const seenAlertIds = useRef<Set<string>>(new Set())

  const { data } = useQuery<CheckResult>({
    queryKey: ["alert-check"],
    queryFn: async () => {
      const res = await fetch("/api/price-alerts/check", { cache: "no-store" })
      if (!res.ok) return { triggered: [], checked: 0, prices: {} }
      return res.json()
    },
    // Poll every 20 seconds (when app is open)
    refetchInterval: 20_000,
    // Don't refetch on window focus (avoid double-checking)
    refetchOnWindowFocus: false,
    // Start immediately
    staleTime: 0,
  })

  useEffect(() => {
    if (!data?.triggered || data.triggered.length === 0) return

    for (const alert of data.triggered) {
      // Skip if we've already shown a toast for this alert
      if (seenAlertIds.current.has(alert.id)) continue
      seenAlertIds.current.add(alert.id)

      const pair = pairLabel(alert.symbol)
      const dir = alert.direction === "above" ? "▲ reached above" : "▼ dropped below"
      const target = formatPrice(alert.symbol, alert.targetPrice)
      const live = formatPrice(alert.symbol, alert.livePrice)

      // Show toast notification (auto-dismisses after 6s)
      toast.success(`🔔 ${pair} Alert Triggered!`, {
        description: `${pair} ${dir} your target ${target} — current: ${live}`,
        duration: 6000,
      })

      // Also show a more prominent notification using the browser Notification API
      // (works on desktop + Android Chrome, asks permission first)
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(`🔔 ${pair} Alert Triggered!`, {
            body: `${pair} ${dir} ${target} — current: ${live}`,
            icon: "/tradeseekho-logo.png",
            tag: alert.id,
          })
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((perm) => {
            if (perm === "granted") {
              new Notification(`🔔 ${pair} Alert Triggered!`, {
                body: `${pair} ${dir} ${target} — current: ${live}`,
                icon: "/tradeseekho-logo.png",
                tag: alert.id,
              })
            }
          })
        }
      }
    }

    // Invalidate queries so UI updates
    qc.invalidateQueries({ queryKey: ["price-alerts"] })
    qc.invalidateQueries({ queryKey: ["notifications"] })
  }, [data, qc])
}
