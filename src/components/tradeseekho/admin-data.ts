"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CategoryDTO, LessonListItemDTO, LessonDetailDTO, QuizDTO } from "@/lib/types"

export interface AdminStats {
  totalDownloads: number
  activeUsers: number
  totalLessons: number
  totalQuizzes: number
  totalUsers: number
}
export interface AdminAds {
  bannerEnabled: boolean
  interstitialEnabled: boolean
  bannerUnitId: string
  interstitialUnitId: string
}

async function j<T>(res: Response | Promise<Response>): Promise<T> {
  const r = await res
  if (!r.ok) {
    const e = await r.json().catch(() => ({}))
    throw new Error((e as any).error || `http_${r.status}`)
  }
  return r.json() as Promise<T>
}

export function useAdminMe() {
  return useQuery<{ authed: boolean }>({
    queryKey: ["admin-me"],
    queryFn: () => j(fetch("/api/admin/me").then((r) => r)),
    staleTime: 30_000,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation<{ ok: boolean }, Error, { password: string }>({
    mutationFn: (v) =>
      j(
        fetch("/api/admin/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(v),
        }).then((r) => r),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-me"] }),
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await fetch("/api/admin/logout", { method: "POST" })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-me"] }),
  })
}

export function useAdminLessons() {
  return useQuery<{ lessons: LessonListItemDTO[] }>({
    queryKey: ["admin-lessons"],
    queryFn: () => j(fetch("/api/admin/lessons").then((r) => r)),
  })
}

export function useCategories() {
  return useQuery<{ categories: CategoryDTO[] }>({
    queryKey: ["categories"],
    queryFn: () => j(fetch("/api/categories").then((r) => r)),
  })
}

export function useAdminLessonDetail(id: string | null) {
  return useQuery<{ lesson: LessonDetailDTO; quiz: QuizDTO | null }>({
    enabled: !!id,
    queryKey: ["admin-lesson", id],
    queryFn: () => j(fetch(`/api/admin/lessons/${id}`).then((r) => r)),
  })
}

export function useSaveLesson() {
  const qc = useQueryClient()
  return useMutation<
    { lesson: LessonDetailDTO },
    Error,
    { id?: string; data: Record<string, unknown> }
  >({
    mutationFn: async ({ id, data }) => {
      const url = id ? `/api/admin/lessons/${id}` : "/api/admin/lessons"
      const method = id ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      })
      return j(res)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-lessons"] })
    },
  })
}

export function useDeleteLesson() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await fetch(`/api/admin/lessons/${id}`, { method: "DELETE" })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-lessons"] }),
  })
}

export function useSaveQuiz() {
  const qc = useQueryClient()
  return useMutation<
    { quiz: QuizDTO },
    Error,
    { lessonId: string; body: { passMark: number; questions: QuizDTO["questions"] } }
  >({
    mutationFn: async ({ lessonId, body }) => {
      const res = await fetch(`/api/admin/quizzes/${lessonId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      })
      return j(res)
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-lesson", vars.lessonId] })
      qc.invalidateQueries({ queryKey: ["admin-quiz", vars.lessonId] })
      qc.invalidateQueries({ queryKey: ["lessons"] })
    },
  })
}

export function useAdminQuiz(lessonId: string | null) {
  return useQuery<{ quiz: QuizDTO | null }>({
    enabled: !!lessonId,
    queryKey: ["admin-quiz", lessonId],
    queryFn: () => j(fetch(`/api/admin/quizzes/${lessonId}`).then((r) => r)),
  })
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: () => j(fetch("/api/admin/stats").then((r) => r)),
  })
}

export function useSaveStats() {
  const qc = useQueryClient()
  return useMutation<
    AdminStats,
    Error,
    { totalDownloads: number; activeUsers: number }
  >({
    mutationFn: async (body) => {
      const res = await fetch("/api/admin/stats", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      })
      return j(res)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-stats"] }),
  })
}

export function useAdminAds() {
  return useQuery<AdminAds>({
    queryKey: ["admin-ads"],
    queryFn: () => j(fetch("/api/admin/ads").then((r) => r)),
  })
}

export function useSaveAds() {
  const qc = useQueryClient()
  return useMutation<AdminAds, Error, AdminAds>({
    mutationFn: async (body) => {
      const res = await fetch("/api/admin/ads", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      })
      return j(res)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-ads"] }),
  })
}

export interface AdminProRequest {
  id: string
  userId: string
  method: string
  amount: number
  screenshotPath: string
  note: string | null
  status: string
  reviewerNote: string | null
  createdAt: string
  reviewedAt: string | null
  user: { id: string; name: string | null; email: string | null; image: string | null }
}

export function useAdminProRequests(status = "all") {
  return useQuery<{ requests: AdminProRequest[] }>({
    queryKey: ["admin-pro", status],
    queryFn: () => j(fetch(`/api/admin/pro?status=${encodeURIComponent(status)}`).then((r) => r)),
  })
}

export function useApproveProRequest() {
  const qc = useQueryClient()
  return useMutation<void, Error, { id: string; note?: string }>({
    mutationFn: async ({ id, note }) => {
      await fetch(`/api/admin/pro/${id}/approve`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ note }),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pro"] })
      qc.invalidateQueries({ queryKey: ["admin-stats"] })
    },
  })
}

export function useRejectProRequest() {
  const qc = useQueryClient()
  return useMutation<void, Error, { id: string; note?: string }>({
    mutationFn: async ({ id, note }) => {
      await fetch(`/api/admin/pro/${id}/reject`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ note }),
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pro"] }),
  })
}
