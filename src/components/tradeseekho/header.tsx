"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Bookmark, Shield, Languages, Check, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useStore, useT } from "@/lib/store"
import { LANG_ORDER, LANGS } from "@/lib/i18n"

export function Header() {
  const t = useT()
  const { theme, setTheme } = useTheme()
  const lang = useStore((s) => s.lang)
  const setLang = useStore((s) => s.setLang)
  const setBookmarksOpen = useStore((s) => s.setBookmarksOpen)
  const bookmarksCount = useStore((s) => s.bookmarks.length)
  const setCertOpen = useStore((s) => s.setCertOpen)
  const showAdmin = useStore((s) => s.showAdmin)
  const setShowAdmin = useStore((s) => s.setShowAdmin)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:gap-4">
        {/* Logo */}
        <button
          onClick={() => setShowAdmin(false)}
          className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label={t("nav.home")}
        >
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm shadow-brand/30">
            <span className="text-lg font-extrabold leading-none">₸</span>
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-gold ring-2 ring-background" />
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-base font-extrabold tracking-tight text-foreground">
              Trade<span className="text-brand">Seekho</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Forex · Crypto
            </span>
          </span>
        </button>

        <div className="flex-1" />

        {/* Certificates */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Certificates"
          onClick={() => setCertOpen(true)}
        >
          <Award className="h-5 w-5 text-gold" />
        </Button>

        {/* Bookmarks */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t("nav.bookmarks")}
          onClick={() => setBookmarksOpen(true)}
        >
          <Bookmark className="h-5 w-5" />
          {bookmarksCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center bg-gold px-1 text-[10px] font-bold text-gold-foreground">
              {bookmarksCount}
            </Badge>
          )}
        </Button>

        {/* Language */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 px-2">
              <Languages className="h-5 w-5" />
              <span className="text-xs font-bold">{LANGS[lang].label}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("home.langSection")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {LANG_ORDER.map((code) => {
              const meta = LANGS[code]
              return (
                <DropdownMenuItem
                  key={code}
                  onClick={() => setLang(code)}
                  className="flex items-center justify-between"
                >
                  <span className={meta.dir === "rtl" ? "font-urdu text-base" : ""}>
                    {meta.native}
                  </span>
                  {lang === code && <Check className="h-4 w-4 text-brand" />}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dark mode — dual icons with CSS so SSR + initial client render match (no hydration mismatch) */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Admin */}
        <Button
          variant={showAdmin ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setShowAdmin(!showAdmin)}
        >
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">{t("nav.admin")}</span>
        </Button>
      </div>
    </header>
  )
}
