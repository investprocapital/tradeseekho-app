"use client"

import { useState } from "react"
import { Home, BookOpen, BarChart3, User, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useStore } from "@/lib/store"
import type { BottomTab } from "@/lib/store"
import { useLessonsBundle } from "./use-data"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const TABS: { id: BottomTab; label: string; icon: any }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "quiz", label: "Quiz", icon: BarChart3 },
  { id: "profile", label: "Profile", icon: User },
]

export function BottomNav() {
  const { data: session } = useSession()
  const bottomTab = useStore((s) => s.bottomTab)
  const setBottomTab = useStore((s) => s.setBottomTab)
  const setBookmarksOpen = useStore((s) => s.setBookmarksOpen)
  const setCertOpen = useStore((s) => s.setCertOpen)
  const setEditProfileOpen = useStore((s) => s.setEditProfileOpen)
  const setSettingsOpen = useStore((s) => s.setSettingsOpen)
  const setLoginOpen = useStore((s) => s.setLoginOpen)
  const setProOpen = useStore((s) => s.setProOpen)
  const setShowAdmin = useStore((s) => s.setShowAdmin)
  const setSettingsClose = useStore((s) => s.setSettingsOpen)
  const activeCategory = useStore((s) => s.activeCategorySlug)
  const setActiveCategory = useStore((s) => s.setActiveCategory)
  const { data } = useLessonsBundle("all")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const onTab = (tab: BottomTab) => {
    if (tab === "lessons") setActiveCategory("all")
    setBottomTab(tab)
  }

  // Profile tab opens a profile sheet (uses Settings + Edit Profile + certs)
  const onProfile = () => {
    setBottomTab("profile")
    setSettingsOpen(true)
  }

  // Quick logout — closes any open sheets first, then signs out via NextAuth.
  // Uses a confirmation dialog so the user gets visual feedback on click.
  const onLogoutClick = () => {
    // Close any open sheets/dialogs that might be covering the nav
    setSettingsOpen(false)
    setShowLogoutConfirm(true)
  }

  const onLogoutConfirm = () => {
    setShowAdmin(false)
    signOut({ callbackUrl: "/", redirect: true })
  }

  return (
    <>
      <nav className="shrink-0 z-[60] w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 pb-[env(safe-area-inset-bottom)]">
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
          {/* Quick Logout button — only shows when user is logged in.
              Uses AlertDialog for confirmation + visual feedback. */}
          {session?.user && (
            <button
              onClick={onLogoutClick}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors text-destructive hover:text-destructive/80"
              aria-label="Logout"
            >
              <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all">
                <LogOut className="h-[18px] w-[18px]" />
              </span>
              <span className="text-[10px] font-bold">Logout</span>
            </button>
          )}
        </div>
      </nav>

      {/* Logout confirmation dialog — shows on Logout button click.
          Provides visual feedback + prevents accidental logouts. */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You'll need to sign in again to access your lessons and progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onLogoutConfirm}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Yes, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
