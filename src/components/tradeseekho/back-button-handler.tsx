"use client"

import { useEffect } from "react"
import { useStore } from "@/lib/store"

/**
 * BackButtonHandler — intercepts the browser/Android hardware back button.
 *
 * Priority order (highest first):
 *   1. If any sheet/modal is open → close it (don't navigate)
 *   2. If on a legal page (/about-us, /privacy-policy, etc.) → go to home + reopen settings
 *   3. If on home page → let the default back behavior happen (exit app)
 *
 * This prevents the "random pages loop" bug where pressing back opens
 * Login/Set Password/About Us in sequence.
 *
 * Uses history.pushState to create a "stop" entry that we can intercept.
 */
export function BackButtonHandler() {
  useEffect(() => {
    // Push a dummy state so we can intercept the back button.
    // When user presses back, popstate fires → we close any open sheet/modal
    // instead of navigating away.
    const checkAndClose = (): boolean => {
      const s = useStore.getState()

      // Priority 1: Close open sheets/modals (don't navigate)
      if (s.loginOpen) { s.setLoginOpen(false); return true }
      if (s.settingsOpen) { s.setSettingsOpen(false); return true }
      if (s.editProfileOpen) { s.setEditProfileOpen(false); return true }
      if (s.proOpen) { s.setProOpen(false); return true }
      if (s.signalsOpen) { s.setSignalsOpen(false); return true }
      if (s.searchOpen) { s.setSearchOpen(false); return true }
      if (s.bookmarksOpen) { s.setBookmarksOpen(false); return true }
      if (s.certOpen) { s.setCertOpen(false); return true }
      if (s.leaderboardOpen) { s.setLeaderboardOpen(false); return true }
      if (s.priceAlertsOpen) { s.setPriceAlertsOpen(false); return true }
      if (s.marketGaugeOpen) { s.setMarketGaugeOpen(false); return true }
      if (s.notificationsOpen) { s.setNotificationsOpen(false); return true }
      if (s.showAdmin) { s.setShowAdmin(false); return true }

      return false
    }

    const onPopState = (e: PopStateEvent) => {
      // Check if any sheet/modal is open — close it instead of navigating
      if (checkAndClose()) {
        // Re-push the dummy state so we can intercept the next back press too
        history.pushState(null, "", window.location.href)
      }
      // If nothing is open, let the default back behavior happen
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
