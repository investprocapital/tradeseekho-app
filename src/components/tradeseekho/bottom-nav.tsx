"use client"

import { Home, BookOpen, BarChart3, User } from "lucide-react"
import { useStore } from "@/lib/store"
import type { BottomTab } from "@/lib/store"
import { useLessonsBundle } from "./use-data"

const TABS: { id: BottomTab; label: string; icon: any }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "quiz", label: "Quiz", icon: BarChart3 },
  { id: "profile", label: "Profile", icon: User },
]

export function BottomNav() {
  const bottomTab = useStore((s) => s.bottomTab)
  const setBottomTab = useStore((s) => s.setBottomTab)
  const setBookmarksOpen = useStore((s) => s.setBookmarksOpen)
  const setCertOpen = useStore((s) => s.setCertOpen)
  const setEditProfileOpen = useStore((s) => s.setEditProfileOpen)
  const setSettingsOpen = useStore((s) => s.setSettingsOpen)
  const setShowAdmin = useStore((s) => s.setShowAdmin)
  const setLoginOpen = useStore((s) => s.setLoginOpen)
  const setProOpen = useStore((s) => s.setProOpen)
  const activeCategory = useStore((s) => s.activeCategorySlug)
  const setActiveCategory = useStore((s) => s.setActiveCategory)
  const { data } = useLessonsBundle("all")

  const onTab = (tab: BottomTab) => {
    setShowAdmin(false)
    if (tab === "lessons") setActiveCategory("all")
    setBottomTab(tab)
  }

  // Profile tab opens a profile sheet (uses Settings + Edit Profile + certs)
  const onProfile = () => {
    setBottomTab("profile")
    setSettingsOpen(true)
  }

  return (
    <nav className="sticky bottom-0 z-40 w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-stretch justify-around px-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = bottomTab === tab.id
          const isProfile = tab.id === "profile"
          return (
            <button
              key={tab.id}
              onClick={() => (isProfile ? onProfile() : onTab(tab.id))}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors ${
                active ? "text-brand" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
            >
              <span className={`relative inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all ${active ? "bg-brand-muted" : ""}`}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
