"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Lang } from "@/lib/i18n"

export interface LessonProgress {
  score: number
  total: number
  passed: boolean
  completed: boolean
}

export type AdminTab = "dashboard" | "lessons" | "quizzes" | "ads"

interface AppState {
  // Language + onboarding (persisted)
  lang: Lang
  setLang: (l: Lang) => void

  onboardingSeen: boolean
  setOnboardingSeen: (v: boolean) => void

  // Bookmarks (lesson ids)
  bookmarks: string[]
  toggleBookmark: (lessonId: string) => void
  isBookmarked: (lessonId: string) => boolean

  // Progress keyed by lessonId
  progress: Record<string, LessonProgress>
  setProgress: (lessonId: string, p: LessonProgress) => void

  // Admin
  adminAuthed: boolean
  setAdminAuthed: (v: boolean) => void

  // View orchestration (not persisted)
  activeCategorySlug: string | "all"
  setActiveCategory: (slug: string | "all") => void

  activeLessonId: string | null
  openLesson: (id: string) => void
  closeLesson: () => void

  quizOpenFor: string | null
  openQuiz: (lessonId: string) => void
  closeQuiz: () => void

  bookmarksOpen: boolean
  setBookmarksOpen: (v: boolean) => void

  certOpen: boolean
  setCertOpen: (v: boolean) => void

  loginOpen: boolean
  setLoginOpen: (v: boolean) => void

  leaderboardOpen: boolean
  setLeaderboardOpen: (v: boolean) => void

  settingsOpen: boolean
  setSettingsOpen: (v: boolean) => void

  notificationsOpen: boolean
  setNotificationsOpen: (v: boolean) => void

  searchOpen: boolean
  setSearchOpen: (v: boolean) => void

  editProfileOpen: boolean
  setEditProfileOpen: (v: boolean) => void

  showAdmin: boolean
  setShowAdmin: (v: boolean) => void

  adminTab: AdminTab
  setAdminTab: (t: AdminTab) => void

  // Whether the persisted store has rehydrated from localStorage (client only).
  // Used to gate UI that depends on persisted state so SSR + initial client render match.
  hasHydrated: boolean
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      lang: "en",
      setLang: (l) => set({ lang: l }),

      onboardingSeen: false,
      setOnboardingSeen: (v) => set({ onboardingSeen: v }),

      bookmarks: [],
      toggleBookmark: (lessonId) =>
        set((s) => {
          const has = s.bookmarks.includes(lessonId)
          return {
            bookmarks: has
              ? s.bookmarks.filter((b) => b !== lessonId)
              : [...s.bookmarks, lessonId],
          }
        }),
      isBookmarked: (lessonId) => get().bookmarks.includes(lessonId),

      progress: {},
      setProgress: (lessonId, p) =>
        set((s) => ({ progress: { ...s.progress, [lessonId]: p } })),

      adminAuthed: false,
      setAdminAuthed: (v) => set({ adminAuthed: v }),

      activeCategorySlug: "all",
      setActiveCategory: (slug) => set({ activeCategorySlug: slug }),

      activeLessonId: null,
      openLesson: (id) => set({ activeLessonId: id, quizOpenFor: null }),
      closeLesson: () => set({ activeLessonId: null, quizOpenFor: null }),

      quizOpenFor: null,
      // Keep the reader open; the quiz renders INSIDE the reader sheet (single overlay).
      openQuiz: (lessonId) => set({ quizOpenFor: lessonId }),
      closeQuiz: () => set({ quizOpenFor: null }),

      bookmarksOpen: false,
      setBookmarksOpen: (v) => set({ bookmarksOpen: v }),

      certOpen: false,
      setCertOpen: (v) => set({ certOpen: v }),

      loginOpen: false,
      setLoginOpen: (v) => set({ loginOpen: v }),

      leaderboardOpen: false,
      setLeaderboardOpen: (v) => set({ leaderboardOpen: v }),

      settingsOpen: false,
      setSettingsOpen: (v) => set({ settingsOpen: v }),

      notificationsOpen: false,
      setNotificationsOpen: (v) => set({ notificationsOpen: v }),

      searchOpen: false,
      setSearchOpen: (v) => set({ searchOpen: v }),

      editProfileOpen: false,
      setEditProfileOpen: (v) => set({ editProfileOpen: v }),

      showAdmin: false,
      setShowAdmin: (v) => set({ showAdmin: v }),

      adminTab: "dashboard",
      setAdminTab: (t) => set({ adminTab: t }),

      hasHydrated: false,
    }),
    {
      name: "tradeseekho-store",
      storage: createJSONStorage(() => localStorage),
      // CRITICAL: do NOT auto-rehydrate during the initial client render.
      // The server renders with the defaults above; skipHydration ensures the
      // client's first render uses the SAME defaults → no hydration mismatch.
      // We rehydrate manually in <Providers/> after mount.
      skipHydration: true,
      // Only persist user-facing prefs + data, not ephemeral view state
      partialize: (s) => ({
        lang: s.lang,
        onboardingSeen: s.onboardingSeen,
        bookmarks: s.bookmarks,
        progress: s.progress,
        adminAuthed: s.adminAuthed,
      }),
    },
  ),
)

// Helper hook for translated strings bound to current language
import { translate } from "@/lib/i18n"
export function useT() {
  const lang = useStore((s) => s.lang)
  return (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars)
}
