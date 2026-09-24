"use client"

import { useTheme } from "next-themes"
import { useSession, signOut } from "next-auth/react"
import {
  Moon, Sun, Home, User as UserIcon, Trophy, Bookmark, Settings as SettingsIcon,
  Bell, Search, LogIn, LogOut, Edit3, Award, Languages, Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useStore, useT } from "@/lib/store"
import { useCurrentUser } from "./use-data"
import { LANG_ORDER, LANGS } from "@/lib/i18n"

export function Header() {
  const t = useT()
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()
  // Fetch the avatar separately (NOT from the session cookie — avoids 494 error)
  const { data: meData } = useCurrentUser()
  const user = session?.user
  const userImage = meData?.user?.image ?? null
  const userRole = meData?.user?.role ?? (user as { role?: string })?.role ?? "student"
  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase()

  const setShowAdmin = useStore((s) => s.setShowAdmin)
  const setBookmarksOpen = useStore((s) => s.setBookmarksOpen)
  const bookmarksCount = useStore((s) => s.bookmarks.length)
  const setCertOpen = useStore((s) => s.setCertOpen)
  const setLoginOpen = useStore((s) => s.setLoginOpen)
  const setLeaderboardOpen = useStore((s) => s.setLeaderboardOpen)
  const setSettingsOpen = useStore((s) => s.setSettingsOpen)
  const setNotificationsOpen = useStore((s) => s.setNotificationsOpen)
  const setSearchOpen = useStore((s) => s.setSearchOpen)
  const setEditProfileOpen = useStore((s) => s.setEditProfileOpen)
  const setBottomTab = useStore((s) => s.setBottomTab)
  const lang = useStore((s) => s.lang)
  const setLang = useStore((s) => s.setLang)

  return (
    <header className="shrink-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-12 w-full max-w-3xl items-center gap-1 px-2 sm:gap-2 sm:px-3">
        {/* Home button (TradeSeekho crystal T logo) */}
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

        {/* Search */}
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Search lessons" onClick={() => setSearchOpen(true)}>
          <Search className="h-[18px] w-[18px]" />
        </Button>

        {/* Language switcher — quick access in header */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-1 px-2" aria-label="Language">
              <Languages className="h-[18px] w-[18px]" />
              <span className="text-[10px] font-bold">{LANGS[lang].label}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
              Language / زبان / भाषा / لغة
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {LANG_ORDER.map((code) => (
              <DropdownMenuItem key={code} onSelect={(e) => { e.preventDefault(); setLang(code) }} className="gap-2">
                <span className={LANGS[code].dir === "rtl" ? "font-urdu text-base" : ""}>
                  {LANGS[code].native}
                </span>
                {lang === code && <Check className="ms-auto h-4 w-4 text-brand" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications" onClick={() => setNotificationsOpen(true)}>
          <Bell className="h-[18px] w-[18px]" />
          <span className="pointer-events-none absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold ring-2 ring-background" />
        </Button>

        {/* Leaderboard (desktop) */}
        <Button variant="ghost" size="sm" className="hidden gap-1.5 sm:flex" onClick={() => setLeaderboardOpen(true)}>
          <Trophy className="h-4 w-4" /> <span className="hidden lg:inline">Leaderboard</span>
        </Button>

        {/* Saved / Wishlist */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Saved / Wishlist" onClick={() => setBookmarksOpen(true)}>
          <Bookmark className="h-[18px] w-[18px]" />
          {bookmarksCount > 0 && (
            <span className="pointer-events-none absolute -right-0 -top-0 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-gold px-0.5 text-[8px] font-bold text-gold-foreground">
              {bookmarksCount}
            </span>
          )}
        </Button>

        {/* Dark theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label="Toggle dark theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
          <SettingsIcon className="h-[18px] w-[18px]" />
        </Button>

        {/* Login / user menu */}
        {status === "loading" ? (
          <Button variant="ghost" size="sm" disabled className="gap-1.5">
            <UserIcon className="h-4 w-4" />…
          </Button>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 px-1.5">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={userImage ?? undefined} alt="" />
                  <AvatarFallback className="bg-brand text-[10px] font-bold text-brand-foreground">{initial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setEditProfileOpen(true) }} className="gap-2">
                <Edit3 className="h-4 w-4" /> Edit profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setLeaderboardOpen(true) }} className="gap-2">
                <Trophy className="h-4 w-4" /> Leaderboard
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setCertOpen(true) }} className="gap-2">
                <Award className="h-4 w-4" /> Certificates
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/", redirect: true })} className="gap-2 text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button size="sm" className="h-8 gap-1 bg-brand px-3 text-xs font-bold text-brand-foreground hover:bg-brand/90" onClick={() => setLoginOpen(true)}>
            <LogIn className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Login</span>
          </Button>
        )}
      </div>
    </header>
  )
}
