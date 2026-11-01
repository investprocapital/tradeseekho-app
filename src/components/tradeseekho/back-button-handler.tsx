"use client"

import { useEffect } from "react"
import { useStore } from "@/lib/store"

/**
 * BackButtonHandler — intercepts the browser/Android hardware back button.
 *
 * When the user presses back:
 *   1. If any top-level sheet is open → close it (don't navigate)
 *   2. If no sheet is open → let the default back behavior happen (exit app)
 *
 * IMPORTANT: Does NOT push dummy history states (that caused blank screen bugs).
 * Just listens for popstate and closes any open sheet. Simple and reliable.
 *
 * Does NOT handle dialogs (Edit Profile, Set Password, etc.) — those have
 * their own close mechanism. Handling them here caused cascade-close bugs.
 */
export function BackButtonHandler() {
  useEffect(() => {
    let isClosing = false

    const onPopState = () => {
      if (isClosing) return
      isClosing = true

      const s = useStore.getState()

      // Close the first open top-level sheet we find (priority order)
      if (s.settingsOpen) { s.setSettingsOpen(false); history.pushState(null, "", window.location.href) }
      else if (s.signalsOpen) { s.setSignalsOpen(false); history.pushState(null, "", window.location.href) }
      else if (s.searchOpen) { s.setSearchOpen(false); history.pushState(null, "", window.location.href) }
      else if (s.bookmarksOpen) { s.setBookmarksOpen(false); history.pushState(null, "", window.location.href) }
      else if (s.certOpen) { s.setCertOpen(false); history.pushState(null, "", window.location.href) }
      else if (s.leaderboardOpen) { s.setLeaderboardOpen(false); history.pushState(null, "", window.location.href) }
      else if (s.priceAlertsOpen) { s.setPriceAlertsOpen(false); history.pushState(null, "", window.location.href) }
      else if (s.marketGaugeOpen) { s.setMarketGaugeOpen(false); history.pushState(null, "", window.location.href) }
      else if (s.notificationsOpen) { s.setNotificationsOpen(false); history.pushState(null, "", window.location.href) }
      else if (s.showAdmin) { s.setShowAdmin(false); history.pushState(null, "", window.location.href) }
      // If nothing is open, let the default back behavior happen (exit app)

      // Reset flag after a short delay
      setTimeout(() => { isClosing = false }, 50)
    }

    // Push one initial state so we can intercept the first back press
    history.pushState(null, "", window.location.href)
    window.addEventListener("popstate", onPopState)

    return () => {
      window.removeEventListener("popstate", onPopState)
    }
  }, [])

  return null
}
