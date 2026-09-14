"use client"

import { useTheme } from "next-themes"
import { useSession, signOut } from "next-auth/react"
import {
  Moon, Sun, Home, User as UserIcon, Trophy, Bookmark, Settings as SettingsIcon,
  Bell, Search, LogIn, LogOut, Edit3, Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useStore, useT } from "@/lib/store"

export function Header() {
  const t = useT()
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()
  const user = session?.user
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-1 px-3 sm:gap-2 sm:px-4">
        {/* Home button (circular green logo with gold notification dot) */}
        <button
          onClick={() => setShowAdmin(false)}
          className="relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label={t("nav.home")}
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-sm shadow-brand/30">
            <span className="text-lg font-extrabold leading-none">T</span>
          </span>
          <span className="pointer-events-none absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-gold ring-2 ring-background" />
        </button>

        {/* Brand text (desktop) */}
        <button onClick={() => setShowAdmin(false)} className="hidden flex-col leading-tight sm:flex" aria-label={t("nav.home")}>
          <span className="text-base font-extrabold tracking-tight text-foreground">
            Trade<span className="text-brand">Seekho</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Forex · Crypto
          </span>
        </button>

        {/* Edit Profile (avatar with edit icon — opens Edit Profile dialog) */}
        <Button
          variant="ghost"
          size="sm"
          className="group relative ml-1 h-10 gap-2 rounded-full px-1"
          onClick={() => setEditProfileOpen(true)}
          aria-label="Edit Profile"
        >
          <span className="relative inline-block">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage src={(user as { image?: string })?.image ?? undefined} alt="" />
              <AvatarFallback className="bg-brand text-xs font-bold text-brand-foreground">
                {initial}
              </AvatarFallback>
            </Avatar>
            <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white ring-2 ring-background transition group-hover:scale-110">
              <Edit3 className="h-2.5 w-2.5" />
            </span>
          </span>
          <span className="hidden lg:inline text-xs font-bold">Edit Profile</span>
        </Button>

        <div className="flex-1" />

        {/* Search */}
        <Button variant="ghost" size="icon" aria-label="Search lessons" onClick={() => setSearchOpen(true)}>
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications — dot is pointer-events-none so it never blocks the click */}
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications" onClick={() => setNotificationsOpen(true)}>
          <Bell className="h-5 w-5" />
          <span className="pointer-events-none absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold ring-2 ring-background" />
        </Button>

        {/* Leaderboard (desktop) */}
        <Button variant="ghost" size="sm" className="hidden gap-1.5 sm:flex" onClick={() => setLeaderboardOpen(true)}>
          <Trophy className="h-4 w-4" /> <span className="hidden md:inline">Leaderboard</span>
        </Button>

        {/* Saved / Wishlist */}
        <Button variant="ghost" size="icon" className="relative" aria-label="Saved / Wishlist" onClick={() => setBookmarksOpen(true)}>
          <Bookmark className="h-5 w-5" />
          {bookmarksCount > 0 && (
            <span className="pointer-events-none absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-gold-foreground">
              {bookmarksCount}
            </span>
          )}
        </Button>

        {/* Dark theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Toggle dark theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
          <SettingsIcon className="h-5 w-5" />
        </Button>

        {/* Login / user menu */}
        {status === "loading" ? (
          <Button variant="ghost" size="sm" disabled className="gap-1.5">
            <UserIcon className="h-4 w-4" />…
          </Button>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={(user as { image?: string }).image ?? undefined} alt="" />
                  <AvatarFallback className="bg-brand text-xs font-bold text-brand-foreground">{initial}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[100px] truncate text-xs font-bold sm:inline">
                  {user.name || user.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditProfileOpen(true)} className="gap-2">
                <Edit3 className="h-4 w-4" /> Edit profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLeaderboardOpen(true)} className="gap-2">
                <Trophy className="h-4 w-4" /> Leaderboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCertOpen(true)} className="gap-2">
                <Award className="h-4 w-4" /> Certificates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="gap-2 text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button size="sm" className="gap-1.5 bg-brand font-bold text-brand-foreground hover:bg-brand/90" onClick={() => setLoginOpen(true)}>
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Login</span>
          </Button>
        )}

        {/* Admin (compact, hidden on mobile — also in Settings) */}
        <Button variant="ghost" size="icon" className="hidden lg:inline-flex" aria-label="Admin" onClick={() => setShowAdmin(true)}>
          <span className="text-base font-extrabold text-muted-foreground">⚙</span>
        </Button>
      </div>
    </header>
  )
}
