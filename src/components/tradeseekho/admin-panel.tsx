"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Download, Users, BookOpen, BarChart3, Shield, Lock, LogOut, Eye,
  Plus, Pencil, Trash2, Save, Send, Megaphone, Check, ChevronRight, ArrowLeft,
  Crown, X,
} from "lucide-react"
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { useStore, useT } from "@/lib/store"
import { usePick } from "./localize"
import { LANG_ORDER, LANGS } from "@/lib/i18n"
import type { LocalizedText } from "@/lib/types"
import {
  useAdminMe, useLogin, useLogout, useAdminLessons, useCategories,
  useAdminLessonDetail, useSaveLesson, useDeleteLesson, useSaveQuiz,
  useAdminQuiz, useAdminStats, useSaveStats, useAdminAds, useSaveAds,
  useAdminProRequests, useApproveProRequest, useRejectProRequest,
} from "./admin-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const EMPTY_LOC: LocalizedText = { en: "", ur: "", hi: "", ar: "" }

function blankQuestion() {
  return {
    type: "MCQ" as "MCQ" | "TF",
    prompt: { ...EMPTY_LOC },
    options: [
      { ...EMPTY_LOC },
      { ...EMPTY_LOC },
    ],
    correctIndex: 0,
    explanation: { ...EMPTY_LOC },
  }
}

export function AdminPanel() {
  const t = useT()
  const { data: me } = useAdminMe()
  const adminAuthed = useStore((s) => s.adminAuthed)
  const setAdminAuthed = useStore((s) => s.setAdminAuthed)
  const adminTab = useStore((s) => s.adminTab)
  const setAdminTab = useStore((s) => s.setAdminTab)
  const setShowAdmin = useStore((s) => s.setShowAdmin)
  const logout = useLogout()

  const authed = adminAuthed || me?.authed

  // keep store in sync with server truth (adjust-during-render, lint-clean)
  const [seenAuthed, setSeenAuthed] = useState<boolean | undefined>(undefined)
  const serverAuthed = me?.authed
  if (serverAuthed !== undefined && serverAuthed !== seenAuthed) {
    setSeenAuthed(serverAuthed)
    setAdminAuthed(serverAuthed)
  }

  if (!authed) return <AdminLogin />

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">{t("admin.title")}</h1>
            <p className="text-xs text-muted-foreground">TradeSeekho v1.0</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowAdmin(false)}>
            <Eye className="h-4 w-4" /> <span className="hidden sm:inline">View Site</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
            onClick={() => logout.mutateAsync().then(() => setAdminAuthed(false))}
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">{t("action.logout")}</span>
          </Button>
        </div>
      </div>

      <Tabs value={adminTab} onValueChange={(v) => setAdminTab(v as any)} className="mt-6">
        <ScrollArea className="ts-scroll w-full">
          <TabsList className="flex w-max">
            <TabsTrigger value="dashboard" className="gap-1.5"><BarChart3 className="h-4 w-4" />{t("admin.dashboard")}</TabsTrigger>
            <TabsTrigger value="lessons" className="gap-1.5"><BookOpen className="h-4 w-4" />{t("admin.manageLessons")}</TabsTrigger>
            <TabsTrigger value="quizzes" className="gap-1.5"><BarChart3 className="h-4 w-4" />{t("admin.manageQuizzes")}</TabsTrigger>
            <TabsTrigger value="ads" className="gap-1.5"><Megaphone className="h-4 w-4" />{t("admin.ads")}</TabsTrigger>
            <TabsTrigger value="pro" className="gap-1.5"><Crown className="h-4 w-4" />Pro Requests</TabsTrigger>
          </TabsList>
        </ScrollArea>
        <TabsContent value="dashboard" className="mt-5"><DashboardTab /></TabsContent>
        <TabsContent value="lessons" className="mt-5"><LessonsTab /></TabsContent>
        <TabsContent value="quizzes" className="mt-5"><QuizzesTab /></TabsContent>
        <TabsContent value="ads" className="mt-5"><AdsTab /></TabsContent>
        <TabsContent value="pro" className="mt-5"><ProRequestsTab /></TabsContent>
      </Tabs>
    </div>
  )
}

/* ---------------- Login ---------------- */
function AdminLogin() {
  const t = useT()
  const login = useLogin()
  const setAdminAuthed = useStore((s) => s.setAdminAuthed)
  const setShowAdmin = useStore((s) => s.setShowAdmin)
  const [pw, setPw] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login.mutateAsync({ password: pw })
      setAdminAuthed(true)
      toast.success(t("toast.loginSuccess"))
      setPw("")
    } catch {
      toast.error(t("admin.loginError"))
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <Card className="border-border shadow-xl">
          <CardHeader className="items-center text-center">
            <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-lg shadow-brand/30">
              <Lock className="h-7 w-7" />
            </span>
            <CardTitle className="mt-2">{t("admin.title")}</CardTitle>
            <CardDescription>{t("admin.loginSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pw">{t("admin.password")}</Label>
                <Input
                  id="pw"
                  type="password"
                  autoFocus
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder={t("admin.passwordPlaceholder")}
                  className="h-11"
                />
              </div>
              {login.isError && (
                <p className="text-xs font-semibold text-destructive">{t("admin.loginError")}</p>
              )}
              <Button type="submit" className="h-11 w-full gap-2 bg-brand font-bold text-brand-foreground hover:bg-brand/90" disabled={login.isPending}>
                {login.isPending ? t("common.loading") : t("action.login")}
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                Demo password: <code className="rounded bg-muted px-1 py-0.5 font-mono">tradeseekho</code>
              </p>
              <Button type="button" variant="ghost" size="sm" className="w-full gap-1.5" onClick={() => setShowAdmin(false)}>
                <ArrowLeft className="h-4 w-4" /> {t("action.backToHome")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

/* ---------------- Dashboard ---------------- */
function DashboardTab() {
  const t = useT()
  const setAdminTab = useStore((s) => s.setAdminTab)
  const { data, isLoading } = useAdminStats()
  const [dl, setDl] = useState("")
  const [au, setAu] = useState("")
  const saveStats = useSaveStats()

  // Sync local inputs when server stats arrive (adjust-during-render, lint-clean)
  const [seenStats, setSeenStats] = useState<typeof data>(null)
  if (data && data !== seenStats) {
    setSeenStats(data)
    setDl(String(data.totalDownloads))
    setAu(String(data.activeUsers))
  }

  const stats = [
    { icon: Download, label: t("admin.totalDownloads"), value: data?.totalDownloads ?? 0, color: "var(--brand)" },
    { icon: Users, label: t("admin.activeUsers"), value: data?.activeUsers ?? 0, color: "#00bfa5" },
    { icon: BookOpen, label: t("admin.totalLessons"), value: data?.totalLessons ?? 0, color: "var(--gold)" },
    { icon: BarChart3, label: t("admin.totalQuizzes"), value: data?.totalQuizzes ?? 0, color: "#7c4dff" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="overflow-hidden">
            <CardContent className="flex items-center gap-3 p-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ background: s.color }}>
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-2xl font-extrabold leading-none">{isLoading ? "—" : s.value.toLocaleString()}</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit app metrics</CardTitle>
            <CardDescription>Used on the marketing dashboard + app home.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("admin.totalDownloads")}</Label>
                <Input type="number" value={dl} onChange={(e) => setDl(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label>{t("admin.activeUsers")}</Label>
                <Input type="number" value={au} onChange={(e) => setAu(e.target.value)} className="h-10" />
              </div>
            </div>
            <Button
              className="gap-2 bg-brand font-bold text-brand-foreground hover:bg-brand/90"
              onClick={async () => {
                try {
                  await saveStats.mutateAsync({ totalDownloads: Number(dl) || 0, activeUsers: Number(au) || 0 })
                  toast.success(t("toast.adsUpdated"))
                } catch { toast.error(t("common.error")) }
              }}
            >
              <Save className="h-4 w-4" /> {t("action.save")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
            <CardDescription>Jump to a management area.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {[
              { tab: "lessons", label: t("admin.manageLessons"), icon: BookOpen },
              { tab: "quizzes", label: t("admin.manageQuizzes"), icon: BarChart3 },
              { tab: "ads", label: t("admin.ads"), icon: Megaphone },
            ].map((q) => (
              <button
                key={q.tab}
                onClick={() => setAdminTab(q.tab as any)}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-start text-sm font-semibold transition hover:border-brand/50 hover:bg-muted/40"
              >
                <span className="flex items-center gap-2"><q.icon className="h-4 w-4 text-brand" /> {q.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ---------------- Lessons ---------------- */
function LessonsTab() {
  const t = useT()
  const pick = usePick()
  const { data, isLoading } = useAdminLessons()
  const del = useDeleteLesson()
  const [editing, setEditing] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })

  const lessons = data?.lessons ?? []

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{lessons.length} {t("nav.lessons").toLowerCase()}</p>
        <Button className="gap-1.5 bg-brand font-bold text-brand-foreground hover:bg-brand/90" onClick={() => setEditing({ open: true, id: null })}>
          <Plus className="h-4 w-4" /> {t("action.addLesson")}
        </Button>
      </div>
      <Card>
        <ScrollArea className="ts-scroll max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.lessonTitle")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("admin.lessonCategory")}</TableHead>
                <TableHead className="hidden sm:table-cell">Min</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-end">{t("action.edit")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="py-6 text-center text-muted-foreground">{t("common.loading")}</TableCell></TableRow>
              ) : lessons.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="py-6 text-center text-muted-foreground">{t("common.empty")}</TableCell></TableRow>
              ) : lessons.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="max-w-[220px] truncate font-semibold">{pick(l.title)}</TableCell>
                  <TableCell className="hidden sm:table-cell capitalize text-muted-foreground">{l.categorySlug}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{l.durationMin}</TableCell>
                  <TableCell>
                    {l.isPublished
                      ? <Badge className="bg-brand-muted text-brand">{t("lesson.published")}</Badge>
                      : <Badge variant="secondary">{t("lesson.draft")}</Badge>}
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="inline-flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing({ open: true, id: l.id })} aria-label={t("action.edit")}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive"
                        aria-label={t("action.delete")}
                        onClick={async () => {
                          if (!confirm(`${t("action.delete")}: ${pick(l.title)}?`)) return
                          try {
                            await del.mutateAsync(l.id)
                            toast.success(t("toast.lessonDeleted"))
                          } catch { toast.error(t("common.error")) }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      <LessonEditor
        open={editing.open}
        id={editing.id}
        onOpenChange={(v) => setEditing({ open: v, id: v ? editing.id : null })}
      />
    </div>
  )
}

/* ---------------- Lesson editor (4-lang, dialog) ---------------- */
function LessonEditor({ open, id, onOpenChange }: { open: boolean; id: string | null; onOpenChange: (v: boolean) => void }) {
  const t = useT()
  const pick = usePick()
  const { data: cats } = useCategories()
  const { data: detail, isLoading } = useAdminLessonDetail(id)
  const save = useSaveLesson()
  const lang = useStore((s) => s.lang)
  const [locTab, setLocTab] = useState<typeof LANG_ORDER[number]>(lang)
  const [form, setForm] = useState(() => ({
    categoryId: "",
    title: { ...EMPTY_LOC },
    summary: { ...EMPTY_LOC },
    content: { ...EMPTY_LOC },
    imageUrl: "",
    order: 1,
    durationMin: 5,
    isPublished: false,
    isFree: true,
  }))

  // Reset form when the editing target (id) changes — adjust-during-render (lint-clean)
  const [initedId, setInitedId] = useState<string | null | undefined>(undefined)
  if (id !== initedId) {
    setInitedId(id)
    if (!id) {
      setForm({
        categoryId: cats?.categories[0]?.id ?? "",
        title: { ...EMPTY_LOC },
        summary: { ...EMPTY_LOC },
        content: { ...EMPTY_LOC },
        imageUrl: "",
        order: 1,
        durationMin: 5,
        isPublished: false,
        isFree: true,
      })
    }
    setLocTab(lang)
  }
  // Populate form once server detail arrives (editing mode)
  const [initedDetailId, setInitedDetailId] = useState<string | null>(null)
  if (detail && detail.lesson.id !== initedDetailId) {
    setInitedDetailId(detail.lesson.id)
    setForm({
      categoryId: detail.lesson.categoryId,
      title: { ...detail.lesson.title },
      summary: { ...detail.lesson.summary },
      content: { ...detail.lesson.content },
      imageUrl: detail.lesson.imageUrl ?? "",
      order: detail.lesson.order,
      durationMin: detail.lesson.durationMin,
      isPublished: detail.lesson.isPublished,
      isFree: true,
    })
    setLocTab(lang)
  }

  const setLoc = (field: "title" | "summary" | "content", l: string, val: string) =>
    setForm((f) => ({ ...f, [field]: { ...f[field], [l]: val } }))

  const submit = async (publish = false) => {
    if (!form.categoryId || !form.title.en) {
      toast.error("Title (EN) + category required")
      return
    }
    const payload: Record<string, unknown> = {
      categoryId: form.categoryId,
      titleEn: form.title.en, titleUr: form.title.ur || form.title.en, titleHi: form.title.hi || form.title.en, titleAr: form.title.ar || form.title.en,
      summaryEn: form.summary.en || null, summaryUr: form.summary.ur || null, summaryHi: form.summary.hi || null, summaryAr: form.summary.ar || null,
      contentEn: form.content.en, contentUr: form.content.ur || form.content.en, contentHi: form.content.hi || form.content.en, contentAr: form.content.ar || form.content.en,
      imageUrl: form.imageUrl || null,
      order: Number(form.order) || 0,
      durationMin: Number(form.durationMin) || 5,
      isPublished: publish ? true : form.isPublished,
      isFree: form.isFree,
    }
    try {
      await save.mutateAsync({ id: id ?? undefined, data: payload })
      toast.success(publish ? t("toast.lessonPublished") : t("toast.lessonSaved"))
      onOpenChange(false)
    } catch {
      toast.error(t("common.error"))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border p-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-extrabold">
            <BookOpen className="h-5 w-5 text-brand" />
            {id ? t("action.edit") : t("admin.newLesson")}
          </DialogTitle>
          <DialogDescription>{t("admin.lessonEditor")}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="ts-scroll max-h-[64vh]">
          <div className="space-y-5 p-5">
            {/* Category + meta */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t("admin.lessonCategory")}</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {cats?.categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{pick(c.name)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("admin.lessonOrder")}</Label>
                  <Input type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("admin.lessonDuration")}</Label>
                  <Input type="number" value={form.durationMin} onChange={(e) => setForm((f) => ({ ...f, durationMin: Number(e.target.value) }))} className="h-10" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t("admin.lessonImage")}</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." className="h-10" />
            </div>

            {/* Language tabs */}
            <div>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {LANG_ORDER.map((code) => (
                  <button
                    key={code}
                    onClick={() => setLocTab(code)}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                      locTab === code ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    {LANGS[code].native}
                  </button>
                ))}
              </div>

              <div className={`space-y-3 rounded-xl border border-border bg-card p-3 ${locTab === "ur" || locTab === "ar" ? "font-urdu" : ""}`}>
                <div className="space-y-1.5">
                  <Label>{t("admin.lessonTitle")}</Label>
                  <Input
                    value={form.title[locTab]}
                    onChange={(e) => setLoc("title", locTab, e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("admin.lessonSummary")}</Label>
                  <Input
                    value={form.summary[locTab]}
                    onChange={(e) => setLoc("summary", locTab, e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("admin.lessonContent")}</Label>
                  <Textarea
                    value={form.content[locTab]}
                    onChange={(e) => setLoc("content", locTab, e.target.value)}
                    rows={9}
                    className="font-mono text-[13px]"
                  />
                </div>
              </div>
            </div>

            <Separator />
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="text-sm font-bold">{t("admin.lessonEditor")} → {t("lesson.published")}</div>
                <div className="text-xs text-muted-foreground">Publish makes it live in app + website instantly.</div>
              </div>
              <Switch checked={form.isPublished} onCheckedChange={(v) => setForm((f) => ({ ...f, isPublished: v }))} />
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("action.cancel")}</Button>
          <Button variant="secondary" className="gap-1.5" onClick={() => submit(false)} disabled={save.isPending || isLoading}>
            <Save className="h-4 w-4" /> {t("action.save")}
          </Button>
          <Button className="gap-1.5 bg-brand font-bold text-brand-foreground hover:bg-brand/90" onClick={() => submit(true)} disabled={save.isPending || isLoading}>
            <Send className="h-4 w-4" /> {t("action.publish")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------- Quizzes ---------------- */
function QuizzesTab() {
  const t = useT()
  const pick = usePick()
  const { data: lessonsData } = useAdminLessons()
  const [lessonId, setLessonId] = useState<string | null>(null)
  const { data: quizData, isLoading } = useAdminQuiz(lessonId)
  const save = useSaveQuiz()
  const lang = useStore((s) => s.lang)
  const [locTab, setLocTab] = useState<typeof LANG_ORDER[number]>(lang)
  const [passMark, setPassMark] = useState(3)
  const [questions, setQuestions] = useState(() => [blankQuestion()])

  // Sync the editor language tab with the global language (adjust-during-render, lint-clean)
  const [seenLang, setSeenLang] = useState(lang)
  if (lang !== seenLang) {
    setSeenLang(lang)
    setLocTab(lang)
  }

  // Seed questions + passMark from server when the quiz/lesson target changes
  const [initedKey, setInitedKey] = useState<string | null>(null)
  const quizKey = lessonId
    ? `${lessonId}::${quizData?.quiz?.id ?? "none"}::${isLoading ? "loading" : "done"}`
    : null
  if (quizKey && quizKey !== initedKey) {
    setInitedKey(quizKey)
    if (quizData?.quiz) {
      setPassMark(quizData.quiz.passMark)
      setQuestions(
        quizData.quiz.questions.length
          ? quizData.quiz.questions.map((q) => ({
              type: q.type,
              prompt: { ...q.prompt },
              options: q.options.map((o) => ({ ...o })),
              correctIndex: q.correctIndex,
              explanation: { ...q.explanation },
            }))
          : [blankQuestion()],
      )
    } else {
      setPassMark(3)
      setQuestions([blankQuestion()])
    }
  }

  const updateQ = (i: number, patch: any) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)))

  const setQLoc = (i: number, field: "prompt" | "explanation", l: string, val: string) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, [field]: { ...q[field], [l]: val } } : q)))

  const setOptLoc = (i: number, oi: number, l: string, val: string) =>
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === i
          ? { ...q, options: q.options.map((o, oidx) => (oidx === oi ? { ...o, [l]: val } : o)) }
          : q,
      ),
    )

  const addOption = (i: number) =>
    setQuestions((qs) =>
      qs.map((q, idx) => (idx === i && q.options.length < 4 ? { ...q, options: [...q.options, { ...EMPTY_LOC }] } : q)),
    )
  const removeOption = (i: number, oi: number) =>
    setQuestions((qs) =>
      qs.map((q, idx) => {
        if (idx !== i || q.options.length <= 2) return q
        const options = q.options.filter((_, oidx) => oidx !== oi)
        const correctIndex = q.correctIndex >= options.length ? options.length - 1 : q.correctIndex
        return { ...q, options, correctIndex }
      }),
    )

  const setType = (i: number, type: "MCQ" | "TF") =>
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === i
          ? { ...q, type, options: type === "TF" ? q.options.slice(0, 2) : q.options.length < 2 ? [{ ...EMPTY_LOC }, { ...EMPTY_LOC }] : q.options }
          : q,
      ),
    )

  const saveQuiz = async () => {
    if (!lessonId) return
    try {
      await save.mutateAsync({ lessonId, body: { passMark, questions } })
      toast.success(t("toast.questionSaved"))
    } catch { toast.error(t("common.error")) }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label>{t("admin.quizFor")}</Label>
            <Select value={lessonId ?? ""} onValueChange={(v) => setLessonId(v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select lesson" /></SelectTrigger>
              <SelectContent>
                {lessonsData?.lessons.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{pick(l.title)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-32 space-y-1.5">
            <Label>Pass mark</Label>
            <Input type="number" min={1} value={passMark} onChange={(e) => setPassMark(Number(e.target.value) || 1)} className="h-10" />
          </div>
        </CardContent>
      </Card>

      {!lessonId ? (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">{t("common.empty")}</CardContent></Card>
      ) : isLoading ? (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">{t("common.loading")}</CardContent></Card>
      ) : (
        <>
          {/* Language tabs */}
          <div className="flex flex-wrap gap-1.5">
            {LANG_ORDER.map((code) => (
              <button key={code} onClick={() => setLocTab(code)} className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${locTab === code ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
                {LANGS[code].native}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {questions.map((q, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className={`p-4 ${locTab === "ur" || locTab === "ar" ? "font-urdu" : ""}`}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-brand px-1.5 text-xs font-bold text-brand-foreground">{i + 1}</span>
                      <div className="inline-flex rounded-md border border-border p-0.5">
                        <button onClick={() => setType(i, "MCQ")} className={`rounded px-2 py-0.5 text-[11px] font-bold ${q.type === "MCQ" ? "bg-brand text-brand-foreground" : "text-muted-foreground"}`}>MCQ</button>
                        <button onClick={() => setType(i, "TF")} className={`rounded px-2 py-0.5 text-[11px] font-bold ${q.type === "TF" ? "bg-brand text-brand-foreground" : "text-muted-foreground"}`}>T/F</button>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setQuestions((qs) => qs.filter((_, idx) => idx !== i))} aria-label={t("action.delete")}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t("admin.questionPrompt")} ({LANGS[locTab].native})</Label>
                      <Textarea value={q.prompt[locTab]} onChange={(e) => setQLoc(i, "prompt", locTab, e.target.value)} rows={2} className="text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t("admin.option")} · {t("admin.correct")} ({LANGS[locTab].native})</Label>
                      <div className="space-y-1.5">
                        {q.options.map((o, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <button
                              onClick={() => updateQ(i, { correctIndex: oi })}
                              className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition ${q.correctIndex === oi ? "border-brand bg-brand text-brand-foreground" : "border-muted-foreground/40 text-muted-foreground"}`}
                              aria-label={`Correct ${oi + 1}`}
                            >
                              {q.correctIndex === oi ? <Check className="h-3.5 w-3.5" /> : String.fromCharCode(65 + oi)}
                            </button>
                            <Input value={o[locTab]} onChange={(e) => setOptLoc(i, oi, locTab, e.target.value)} className="h-9 flex-1 text-sm" />
                            {q.type === "MCQ" && q.options.length > 2 && (
                              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeOption(i, oi)} aria-label="Remove option">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      {q.type === "MCQ" && q.options.length < 4 && (
                        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => addOption(i)}>
                          <Plus className="h-3.5 w-3.5" /> {t("action.add")}
                        </Button>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t("admin.explanation")} ({LANGS[locTab].native})</Label>
                      <Textarea value={q.explanation[locTab]} onChange={(e) => setQLoc(i, "explanation", locTab, e.target.value)} rows={2} className="text-sm" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-border bg-background/90 py-3 backdrop-blur">
            <Button variant="outline" className="gap-1.5" onClick={() => setQuestions((qs) => [...qs, blankQuestion()])}>
              <Plus className="h-4 w-4" /> {t("action.addQuestion")}
            </Button>
            <Button className="gap-1.5 bg-brand font-bold text-brand-foreground hover:bg-brand/90" onClick={saveQuiz} disabled={save.isPending}>
              <Save className="h-4 w-4" /> {t("action.save")}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

/* ---------------- Ads ---------------- */
function AdsTab() {
  const t = useT()
  const { data, isLoading } = useAdminAds()
  const save = useSaveAds()
  const [form, setForm] = useState<AdminAdsForm | null>(null)

  // Sync local form when server ad settings arrive (adjust-during-render, lint-clean)
  const [seenAds, setSeenAds] = useState<typeof data>(null)
  if (data && data !== seenAds) {
    setSeenAds(data)
    setForm(data)
  }

  if (!form) {
    return <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">{t("common.loading")}</CardContent></Card>
  }

  const saveAds = async () => {
    try {
      await save.mutateAsync(form)
      toast.success(t("toast.adsUpdated"))
    } catch { toast.error(t("common.error")) }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Megaphone className="h-5 w-5 text-gold" /> {t("admin.bannerAds")}</CardTitle>
          <CardDescription>Bottom banner shown on home + reader.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <div className="text-sm font-bold">{form.bannerEnabled ? t("admin.adsEnabled") : t("admin.adsDisabled")}</div>
              <div className="text-xs text-muted-foreground">Toggle AdMob banner ads.</div>
            </div>
            <Switch checked={form.bannerEnabled} onCheckedChange={(v) => setForm((f) => f && ({ ...f, bannerEnabled: v }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Banner Unit ID</Label>
            <Input value={form.bannerUnitId} onChange={(e) => setForm((f) => f && ({ ...f, bannerUnitId: e.target.value }))} className="h-9 font-mono text-xs" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Megaphone className="h-5 w-5 text-brand" /> {t("admin.interstitialAds")}</CardTitle>
          <CardDescription>Full-screen ad shown after quiz submit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <div className="text-sm font-bold">{form.interstitialEnabled ? t("admin.adsEnabled") : t("admin.adsDisabled")}</div>
              <div className="text-xs text-muted-foreground">Toggle AdMob interstitials.</div>
            </div>
            <Switch checked={form.interstitialEnabled} onCheckedChange={(v) => setForm((f) => f && ({ ...f, interstitialEnabled: v }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Interstitial Unit ID</Label>
            <Input value={form.interstitialUnitId} onChange={(e) => setForm((f) => f && ({ ...f, interstitialUnitId: e.target.value }))} className="h-9 font-mono text-xs" />
          </div>
        </CardContent>
      </Card>

      <div className="sm:col-span-2 flex justify-end">
        <Button className="gap-1.5 bg-brand font-bold text-brand-foreground hover:bg-brand/90" onClick={saveAds} disabled={save.isPending || isLoading}>
          <Save className="h-4 w-4" /> {t("action.save")}
        </Button>
      </div>
    </div>
  )
}

type AdminAdsForm = {
  bannerEnabled: boolean
  interstitialEnabled: boolean
  bannerUnitId: string
  interstitialUnitId: string
}

/* ---------------- Pro Requests ---------------- */
function ProRequestsTab() {
  const t = useT()
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "all">("pending")
  const { data, isLoading } = useAdminProRequests(status)
  const approve = useApproveProRequest()
  const reject = useRejectProRequest()
  const [preview, setPreview] = useState<string | null>(null)
  const list = data?.requests ?? []

  const onApprove = async (id: string) => {
    try { await approve.mutateAsync({ id }); toast.success("Pro approved — user is now Pro 🎉") }
    catch { toast.error("Could not approve") }
  }
  const onReject = async (id: string) => {
    if (!confirm("Reject this payment request? User's Pro will stay off.")) return
    try { await reject.mutateAsync({ id }); toast.success("Request rejected") }
    catch { toast.error("Could not reject") }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition ${
              status === s ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{list.length} request{list.length === 1 ? "" : "s"}</span>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">{t("common.loading")}</CardContent></Card>
      ) : list.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-2 p-10 text-center">
          <Crown className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No {status} Pro requests.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((r) => {
            const initial = (r.user.name || r.user.email || "U").charAt(0).toUpperCase()
            return (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={r.user.image ?? undefined} alt="" />
                      <AvatarFallback className="bg-brand text-xs font-bold text-brand-foreground">{initial}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">{r.user.name || "Learner"}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{r.user.email}</div>
                    </div>
                    <Badge className={
                      r.status === "approved" ? "bg-brand-muted text-brand"
                      : r.status === "rejected" ? "bg-destructive/15 text-destructive"
                      : "bg-gold/20 text-gold-foreground"
                    }>{r.status}</Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Method:</span> <span className="font-bold">{r.method}</span></div>
                    <div><span className="text-muted-foreground">Amount:</span> <span className="font-bold">Rs {r.amount}</span></div>
                    <div className="col-span-2"><span className="text-muted-foreground">Submitted:</span> <span className="font-bold">{new Date(r.createdAt).toLocaleString()}</span></div>
                    {r.note && <div className="col-span-2 rounded bg-muted/50 p-2"><span className="font-semibold">Note:</span> {r.note}</div>}
                    {r.reviewerNote && <div className="col-span-2 rounded bg-muted/50 p-2"><span className="font-semibold">Admin:</span> {r.reviewerNote}</div>}
                  </div>

                  <button
                    onClick={() => setPreview(r.screenshotPath)}
                    className="mt-3 block w-full overflow-hidden rounded-lg border border-border"
                    aria-label="View screenshot"
                  >
                    <img src={r.screenshotPath} alt="payment screenshot" className="h-32 w-full object-cover" />
                  </button>

                  {r.status === "pending" && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="flex-1 gap-1.5 bg-brand font-bold text-brand-foreground hover:bg-brand/90" onClick={() => onApprove(r.id)} disabled={approve.isPending}>
                        <Check className="h-4 w-4" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-destructive hover:text-destructive" onClick={() => onReject(r.id)} disabled={reject.isPending}>
                        <X className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Screenshot preview lightbox */}
      {preview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/90 p-4" onClick={() => setPreview(null)}>
          <button className="absolute right-4 top-4 text-background" aria-label="Close"><X className="h-6 w-6" /></button>
          <img src={preview} alt="screenshot" className="max-h-[90vh] max-w-full rounded-lg" />
        </div>
      )}
    </div>
  )
}
