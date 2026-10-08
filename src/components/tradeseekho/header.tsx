"use client"

import { useTheme } from "next-themes"
import { useSession, signOut } from "next-auth/react"
import {
  Search, Bell, Settings as SettingsIcon, LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore, useT } from "@/lib/store"

export function Header() {
  const t = useT()
  const { status } = useSession()
  const setSearchOpen = useStore((s) => s.setSearchOpen)
  const setSettingsOpen = useStore((s) => s.setSettingsOpen)
  const setNotificationsOpen = useStore((s) => s.setNotificationsOpen)
  const setLoginOpen = useStore((s) => s.setLoginOpen)
  const setBottomTab = useStore((s) => s.setBottomTab)
  const setShowAdmin = useStore((s) => s.setShowAdmin)

  return (
    <header className="shrink-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-12 w-full max-w-3xl items-center gap-1 px-2 sm:gap-2 sm:px-3">
        {/* Home button (TradeSeekho logo) */}
        <button
          onClick={() => { setShowAdmin(false); setBottomTab("home") }}
          className="relative shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label={t("nav.home")}
        >
          <img src="/tradeseekho-logo.png" alt="TradeSeekho PK" className="h-8 w-8 rounded-lg" />
        </button>

        {/* Brand text (desktop only) */}
        <button onClick={() => { setShowAdmin(false); setBottomTab("home") }} className="hidden flex-col leading-none sm:flex" aria-label={t("nav.home")}>
          <span className="text-sm font-extrabold tracking-tight text-foreground">
            TradeSeekho <span className="text-brand">PK</span>
          </span>
        </button>

        <div className="flex-1" />

        {/* Only 3 icons in header: Search, Notifications, Settings */}
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Search" onClick={() => setSearchOpen(true)}>
          <Search className="h-[18px] w-[18px]" />
        </Button>

        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications" onClick={() => setNotificationsOpen(true)}>
          <Bell className="h-[18px] w-[18px]" />
          <span className="pointer-events-none absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold ring-2 ring-background" />
        </Button>

        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
          <SettingsIcon className="h-[18px] w-[18px]" />
        </Button>

        {/* Login button (if not signed in) */}
        {status !== "authenticated" && (
          <Button size="sm" className="h-8 gap-1 bg-brand px-3 text-xs font-bold text-brand-foreground hover:bg-brand/90" onClick={() => setLoginOpen(true)}>
            <LogIn className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Login</span>
          </Button>
        )}
      </div>
    </header>
  )
}
