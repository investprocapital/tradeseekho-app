"use client"

import { useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { pairLabel, formatPrice } from "@/lib/signals"
import { useLivePrices, fetchSinglePrice } from "@/lib/client-prices"

interface Alert {
  id: string
  symbol: string
  targetPrice: number
  direction: string
  triggered: boolean
}

/**
 * useAlertChecker — CLIENT-SIDE alert checking (zero server cost).
 *
 * ARCHITECTURE:
 *   - Live prices come from useLivePrices() (Binance WebSocket + TwelveData polling)
 *   - This hook polls the user's alerts every 30s (cheap DB query)
 *   - On each poll, checks each untriggered alert against the cached live price
 *   - If hit → POST /api/price-alerts/mark-triggered → marks in DB + creates notification
 *   - Shows toast + browser notification
 *
 * SERVER-SIDE (for when app is CLOSED):
 *   - /api/cron/check-alerts runs every 1 min via Vercel Cron
 *   - Fetches prices server-side, checks all untriggered alerts, sends FCM push
 *
 * So: client = instant feedback when open. Server = FCM push when closed.
 */
export function useAlertChecker() {
  const qc = useQueryClient()
  const seenAlertIds = useRef<Set<string>>(new Set())
  const prices = useLivePrices()

  // Fetch the user's alerts every 30s (cheap query, no price fetch)
  const { data: alertsData } = useQuery<{ alerts: Alert[] }>({
    queryKey: ["price-alerts"],
    queryFn: async () => {
      const res = await fetch("/api/price-alerts", { cache: "no-store" })
      if (!res.ok) return { alerts: [] }
      return res.json()
    },
    refetchInterval: 120_000, // 2 min (was 30s — reduced to save bandwidth)
    refetchOnWindowFocus: false,
    staleTime: 60_000, // 1 min stale (was 0)
  })

  // Mutation: mark alert as triggered (also creates DB notification)
  const markTriggered = useMutation({
    mutationFn: async (alertId: string) => {
      const res = await fetch("/api/price-alerts/mark-triggered", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: alertId }),
      })
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["price-alerts"] })
      qc.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  // Check alerts against live prices whenever prices OR alerts update
  useEffect(() => {
    if (!alertsData?.alerts) return
    const untriggered = alertsData.alerts.filter((a) => !a.triggered)
    if (untriggered.length === 0) return

    for (const alert of untriggered) {
      // Skip if already shown toast for this alert
      if (seenAlertIds.current.has(alert.id)) continue

      const livePrice = prices[alert.symbol]?.price
      if (livePrice === undefined || livePrice === null) {
        // Price not in cache yet — try fetching on-demand (rare)
        continue
      }

      let hit = false
      if (alert.direction === "above" && livePrice >= alert.targetPrice) {
        hit = true
      } else if (alert.direction === "below" && livePrice <= alert.targetPrice) {
        hit = true
      }

      if (hit) {
        seenAlertIds.current.add(alert.id)
        const pair = pairLabel(alert.symbol)
        const dir = alert.direction === "above" ? "▲ reached above" : "▼ dropped below"
        const target = formatPrice(alert.symbol, alert.targetPrice)
        const live = formatPrice(alert.symbol, livePrice)

        // Show toast notification
        toast.success(`🔔 ${pair} Alert Triggered!`, {
          description: `${pair} ${dir} your target ${target} — current: ${live}`,
          duration: 6000,
        })

        // Browser notification (desktop + Android Chrome)
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

        // Mark as triggered in DB (also creates a DB notification for the bell)
        markTriggered.mutate(alert.id)
      }
    }
  }, [alertsData, prices, markTriggered])
}
