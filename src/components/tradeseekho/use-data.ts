"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  CategoryDTO, LessonListItemDTO, LessonDetailDTO, PublicQuizDTO,
  QuizSubmitResult, CertificateDTO,
} from "@/lib/types"

export interface LessonsBundle {
  categories: CategoryDTO[]
  lessons: LessonListItemDTO[]
}

export interface AdSettings {
  bannerEnabled: boolean
  interstitialEnabled: boolean
  bannerUnitId: string
  interstitialUnitId: string
}

async function j<T>(res: Response | Promise<Response>): Promise<T> {
  const r = await res
  if (!r.ok) throw new Error(`http_${r.status}`)
  return r.json() as Promise<T>
}

export function useLessonsBundle(category: string | "all") {
  return useQuery<LessonsBundle>({
    queryKey: ["lessons", category],
    queryFn: () => j(fetch(`/api/lessons?category=${encodeURIComponent(category)}`).then((r) => r)),
  })
}

export function useLessonDetail(id: string | null) {
  return useQuery<{ lesson: LessonDetailDTO; quiz: PublicQuizDTO | null }>({
    enabled: !!id,
    queryKey: ["lesson", id],
    queryFn: () => j(fetch(`/api/lessons/${id}`).then((r) => r)),
  })
}

export function useSubmitQuiz() {
  const qc = useQueryClient()
  return useMutation<
    QuizSubmitResult,
    Error,
    { lessonId: string; answers: number[] }
  >({
    mutationFn: (vars) =>
      j(
        fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(vars),
        }).then((r) => r),
      ),
    onSuccess: (data) => {
      // refresh lists + detail so lock/unlock + progress reflect server truth
      qc.invalidateQueries({ queryKey: ["lessons"] })
      qc.invalidateQueries({ queryKey: ["lesson", data.lessonId] })
      qc.invalidateQueries({ queryKey: ["bookmarks"] })
    },
  })
}

export function useBookmarks() {
  return useQuery<{ bookmarks: LessonListItemDTO[] }>({
    queryKey: ["bookmarks"],
    queryFn: () => j(fetch("/api/bookmarks").then((r) => r)),
  })
}

export function useToggleBookmark() {
  const qc = useQueryClient()
  return useMutation<void, Error, { lessonId: string; add: boolean }>({
    mutationFn: async ({ lessonId, add }) => {
      if (add) {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ lessonId }),
        })
      } else {
        await fetch(`/api/bookmarks?lessonId=${encodeURIComponent(lessonId)}`, { method: "DELETE" })
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
  })
}

export function useAdSettings() {
  return useQuery<AdSettings>({
    queryKey: ["ad-settings"],
    queryFn: () => j(fetch("/api/admin/ads").then((r) => r)),
    staleTime: 60_000,
  })
}

export function useCertificates() {
  return useQuery<{ certificates: CertificateDTO[] }>({
    queryKey: ["certificates"],
    queryFn: () => j(fetch("/api/certificates").then((r) => r)),
  })
}

export interface LeaderboardRow {
  rank: number
  userId: string
  name: string
  image: string | null
  lessonsPassed: number
  scoreSum: number
  scoreTotal: number
  streak: number
  isMe: boolean
}

export function useLeaderboard() {
  return useQuery<{ leaderboard: LeaderboardRow[]; totalLearners: number }>({
    queryKey: ["leaderboard"],
    queryFn: () => j(fetch("/api/leaderboard").then((r) => r)),
  })
}

export interface AppNotification {
  id: string
  type: "welcome" | "quiz_passed" | "new_lesson" | "signal"
  title: string
  body: string
  createdAt: string
}

export function useNotifications() {
  return useQuery<{ notifications: AppNotification[] }>({
    queryKey: ["notifications"],
    queryFn: () => j(fetch("/api/notifications").then((r) => r)),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation<
    { ok: boolean },
    Error,
    { name?: string; currentPassword?: string; newPassword?: string }
  >({
    mutationFn: async (vars) => {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(vars),
      })
      return j(res)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaderboard"] })
      qc.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

