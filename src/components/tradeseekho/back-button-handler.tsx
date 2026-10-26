"use client"

import { useEffect, useRef } from "react"
import { useStore } from "@/lib/store"

/**
 * BackButtonHandler — intercepts the browser/Android hardware back button.
 *
 * Priority order (highest first):
 *   1. If any TOP-LEVEL sheet is open → close it (don't navigate)
 *   2. If on home page → let the default back behavior happen (exit app)
 *
 * IMPORTANT: Only handles top-level SHEETS (Settings, Signals, Bookmarks, etc).
 * Does NOT handle DIALOGS (Edit Profile, Set Password, Pro Dialog, Delete Account).
 * Dialogs have their own close mechanism (X button, Cancel button, Escape key).
 * If we close dialogs here, it causes a cascade that also closes the parent
 * Settings sheet → blank screen bug.
 *
 * Uses history.pushState to create a "stop" entry that we can intercept.
 */
export function BackButtonHandler() {
  const isHandlingRef = useRef(false)

  useEffect(() => {
    const checkAndClose = (): boolean => {
      const s = useStore.getState()

      // Only close TOP-LEVEL sheets (not dialogs).
      // Dialogs (editProfileOpen, proOpen, loginOpen) are handled by their
      // own components — closing them here causes the blank screen bug.
      if (s.signalsOpen) { s.setSignalsOpen(false); return true }
      if (s.searchOpen) { s.setSearchOpen(false); return true }
      if (s.bookmarksOpen) { s.setBookmarksOpen(false); return true }
      if (s.certOpen) { s.setCertOpen(false); return true }
      if (s.leaderboardOpen) { s.setLeaderboardOpen(false); return true }
      if (s.priceAlertsOpen) { s.setPriceAlertsOpen(false); return true }
      if (s.marketGaugeOpen) { s.setMarketGaugeOpen(false); return true }
      if (s.notificationsOpen) { s.setNotificationsOpen(false); return true }
      if (s.settingsOpen) { s.setSettingsOpen(false); return true }
      if (s.showAdmin) { s.setShowAdmin(false); return true }

      return false
    }

    const onPopState = (e: PopStateEvent) => {
      // Prevent re-entrancy (multiple popstate events firing in sequence)
      if (isHandlingRef.current) return
      isHandlingRef.current = true

      // Check if any top-level sheet is open — close it instead of navigating
      if (checkAndClose()) {
        // Re-push the dummy state so we can intercept the next back press too
        history.pushState(null, "", window.location.href)
      }

      // Reset the handling flag after a short delay
      setTimeout(() => { isHandlingRef.current = false }, 100)
    }

    // Push initial dummy state
    history.pushState(null, "", window.location.href)
    window.addEventListener("popstate", onPopState)

    return () => {
      window.removeEventListener("popstate", onPopState)
    }
  }, [])

  return null
}
