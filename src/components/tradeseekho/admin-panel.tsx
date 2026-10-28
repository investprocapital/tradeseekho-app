"use client"

import { useState, useRef } from "react"
import { signOut } from "next-auth/react"
import { motion } from "framer-motion"
import {
  Download, Users, BookOpen, BarChart3, Shield, Lock, LogOut, Eye,
  Plus, Pencil, Trash2, Save, Send, Megaphone, Check, ChevronRight, ArrowLeft,
  Crown, X, Upload, CreditCard, Search, TrendingUp, MessageSquare, Copy, ExternalLink,
  Bell, Image as ImageIcon, Link2, LayoutGrid, RefreshCw,
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
  useProSettings, useSaveProSettings,
  useBrokerAds, useSaveBrokerAds, useAdminPages, useSavePage,
  useAdminUsers, usePendingProCount,
  useAffiliateAd, useSaveAffiliateAd,
} from "./admin-data"
import { SignalManager } from "./signal-manager"
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"
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
  // Pending Pro payment count → drives the red badge on Pro Payments button.
  // Polled every 30s by the hook so the badge stays fresh.
  const { data: pendingData } = usePendingProCount()
  const pendingCount = pendingData?.pending ?? 0

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
    <div className="mx-auto w-full max-w-6xl px-2 py-4 sm:px-4 sm:py-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">{t("admin.title")}</h1>
            <p className="text-xs text-muted-foreground">TradeSeekho PK v1.0</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 border-brand/40 text-brand hover:bg-brand-muted" onClick={() => setShowAdmin(false)}>
            <Eye className="h-4 w-4" /> <span>Exit Admin</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
            onClick={() => {
              // Clear admin cookie + adminAuthed + showAdmin (goes to client view)
              logout.mutateAsync()
              setAdminAuthed(false)
              setShowAdmin(false)
              // Also sign out of NextAuth so the session is fully cleared
              // Use redirect:true so NextAuth handles cookie clear + redirect
              signOut({ callbackUrl: "/", redirect: true })
            }}
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">{t("action.logout")}</span>
          </Button>
        </div>
      </div>

      <Tabs value={adminTab} onValueChange={(v) => setAdminTab(v as any)} className="mt-4">
        {/* Professional card-based navigation — replaces small icon tabs.
            Each card: colored icon + label, full-width, grid layout. */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3, color: "bg-blue-500" },
            { id: "users", label: "All Clients", icon: Users, color: "bg-emerald-500" },
            { id: "lessons", label: "Lessons", icon: BookOpen, color: "bg-purple-500" },
            { id: "quizzes", label: "Quizzes", icon: BarChart3, color: "bg-pink-500" },
            { id: "signals", label: "Signals", icon: TrendingUp, color: "bg-cyan-500" },
            { id: "pro", label: "Pro Payments", icon: Crown, color: "bg-amber-500" },
            { id: "ads", label: "Ad Settings", icon: Megaphone, color: "bg-orange-500" },
            { id: "broker-ads", label: "Broker Ads", icon: Megaphone, color: "bg-teal-500" },
            { id: "affiliate-ads", label: "Affiliate Ads", icon: ImageIcon, color: "bg-fuchsia-500" },
            { id: "banners", label: "Promo Banners", icon: LayoutGrid, color: "bg-violet-500" },
            { id: "broker-links", label: "Broker Links", icon: Link2, color: "bg-indigo-500" },
            { id: "payment", label: "Payment Settings", icon: CreditCard, color: "bg-indigo-500" },
            { id: "pages", label: "Pages", icon: BookOpen, color: "bg-rose-500" },
            { id: "comments", label: "Comments", icon: MessageSquare, color: "bg-sky-500" },
            { id: "notifications", label: "Notifications", icon: Bell, color: "bg-red-500" },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = adminTab === tab.id
            // Red badge on Pro Payments button = count of pending payment requests
            const badge = tab.id === "pro" && pendingCount > 0 ? pendingCount : 0
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`relative flex items-center gap-2.5 rounded-xl border-2 p-3 text-start transition ${
                  isActive
                    ? "border-brand bg-brand-muted/30 shadow-sm"
                    : "border-border bg-card hover:border-brand/40 hover:bg-muted/30"
                }`}
              >
                <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm ${tab.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className={`text-xs font-bold ${isActive ? "text-brand" : "text-foreground"}`}>
                  {tab.label}
                </span>
                {badge > 0 && (
                  <span
                    className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold leading-none text-white shadow-sm ring-2 ring-background"
                    aria-label={`${badge} pending payment${badge === 1 ? "" : "s"}`}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <TabsContent value="dashboard" className="mt-5"><DashboardTab /></TabsContent>
        <TabsContent value="users" className="mt-5"><UsersTab /></TabsContent>
        <TabsContent value="lessons" className="mt-5"><LessonsTab /></TabsContent>
        <TabsContent value="quizzes" className="mt-5"><QuizzesTab /></TabsContent>
        <TabsContent value="ads" className="mt-5"><AdsTab /></TabsContent>
        <TabsContent value="broker-ads" className="mt-5"><BrokerAdsTab /></TabsContent>
        <TabsContent value="affiliate-ads" className="mt-5"><AffiliateAdsTab /></TabsContent>
        <TabsContent value="banners" className="mt-5"><PromotionBannersTab /></TabsContent>
        <TabsContent value="broker-links" className="mt-5"><BrokerLinksTab /></TabsContent>
        <TabsContent value="payment" className="mt-5"><PaymentSettingsTab /></TabsContent>
        <TabsContent value="pages" className="mt-5"><PagesTab /></TabsContent>
        <TabsContent value="signals" className="mt-5"><SignalManager /></TabsContent>
        <TabsContent value="pro" className="mt-5"><ProRequestsTab /></TabsContent>
        <TabsContent value="comments" className="mt-5"><ManageCommentsTab /></TabsContent>
        <TabsContent value="notifications" className="mt-5"><NotificationsTab /></TabsContent>
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
  // Toggle between "demo password" login + "email + password" login.
  // Demo password = quick access (tradeseekho). Email+password = real admin
  // account via NextAuth credentials (checks role=admin in DB).
  const [mode, setMode] = useState<"demo" | "email">("demo")
  const [email, setEmail] = useState("")
  const [emailPw, setEmailPw] = useState("")
  const [emailErr, setEmailErr] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "demo") {
      try {
        await login.mutateAsync({ password: pw })
        setAdminAuthed(true)
        toast.success(t("toast.loginSuccess"))
        setPw("")
      } catch {
        toast.error(t("admin.loginError"))
      }
    } else {
      // Email + password login via NextAuth credentials
      setEmailErr(null)
      try {
        const { signIn } = await import("next-auth/react")
        const r = await signIn("credentials", { email, password: emailPw, redirect: false })
        if (!r || r.error || !r.ok) {
          setEmailErr("Invalid email or password.")
          return
        }
        // Check if the user is admin
        const sres = await fetch("/api/auth/session").then((x) => x.json())
        if ((sres?.user as { role?: string })?.role !== "admin") {
          setEmailErr("This account is not an admin. Use the demo password or an admin account.")
          return
        }
        setAdminAuthed(true)
        toast.success(t("toast.loginSuccess"))
        setEmail(""); setEmailPw("")
      } catch {
        setEmailErr("Login failed. Try again.")
      }
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
            {/* Mode toggle */}
            <div className="mb-4 flex gap-1 rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => setMode("demo")}
                className={`flex-1 rounded-md py-1.5 text-xs font-bold transition ${mode === "demo" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                Demo Password
              </button>
              <button
                type="button"
                onClick={() => setMode("email")}
                className={`flex-1 rounded-md py-1.5 text-xs font-bold transition ${mode === "email" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                Email + Password
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === "demo" ? (
                <>
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
                  <p className="text-center text-[11px] text-muted-foreground">
                    Demo password: <code className="rounded bg-muted px-1 py-0.5 font-mono">tradeseekho</code>
                  </p>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-email-pw">Password</Label>
                    <Input
                      id="admin-email-pw"
                      type="password"
                      value={emailPw}
                      onChange={(e) => setEmailPw(e.target.value)}
                      placeholder="Your account password"
                      className="h-11"
                      required
                    />
                  </div>
                  {emailErr && (
                    <p className="text-xs font-semibold text-destructive">{emailErr}</p>
                  )}
                  {/* Forgot Password link */}
                  <div className="text-right">
                    <a href="/reset-password" className="text-xs font-bold text-brand hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                </>
              )}
              <Button type="submit" className="h-11 w-full gap-2 bg-brand font-bold text-brand-foreground hover:bg-brand/90" disabled={login.isPending}>
                {login.isPending ? t("common.loading") : t("action.login")}
              </Button>
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
        <ScrollArea className="ts-scroll max-h-[70vh] overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>{t("admin.lessonTitle")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("admin.lessonCategory")}</TableHead>
                <TableHead className="hidden sm:table-cell">Min</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-end">{t("action.edit")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="py-6 text-center text-muted-foreground">{t("common.loading")}</TableCell></TableRow>
              ) : lessons.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-6 text-center text-muted-foreground">{t("common.empty")}</TableCell></TableRow>
              ) : lessons.map((l) => (
                <TableRow
                  key={l.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => setEditing({ open: true, id: l.id })}
                >
                  <TableCell>
                    {l.imageUrl ? (
                      <img src={l.imageUrl} alt="" className="h-10 w-14 rounded object-cover" />
                    ) : (
                      <div className="flex h-10 w-14 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">No img</div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate font-semibold">{pick(l.title)}</TableCell>
                  <TableCell className="hidden md:table-cell capitalize text-muted-foreground whitespace-nowrap">{l.categorySlug}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground whitespace-nowrap">{l.durationMin}</TableCell>
                  <TableCell>
                    {l.isPublished
                      ? <Badge className="bg-brand-muted text-brand">{t("lesson.published")}</Badge>
                      : <Badge variant="secondary">{t("lesson.draft")}</Badge>}
                  </TableCell>
                  <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex gap-1">
                      <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => setEditing({ open: true, id: l.id })}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        size="sm" variant="ghost" className="h-8 gap-1 text-xs text-destructive hover:text-destructive"
                        onClick={async () => {
                          if (!confirm(`${t("action.delete")}: ${pick(l.title)}?`)) return
                          try {
                            await del.mutateAsync(l.id)
                            toast.success(t("toast.lessonDeleted"))
                          } catch { toast.error(t("common.error")) }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
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

  const imgFileRef = useRef<HTMLInputElement>(null)
  const [imgUploading, setImgUploading] = useState(false)

  const onImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    // Check size before upload
    if (f.size > 2 * 1024 * 1024) {
      toast.error("Image too large (max 2MB). Use a smaller image.")
      if (imgFileRef.current) imgFileRef.current.value = ""
      return
    }
    setImgUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", f)
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || "upload_failed")
      setForm((prev) => ({ ...prev, imageUrl: j.url }))
      toast.success("Image uploaded successfully")
    } catch (err: any) {
      toast.error(err?.message === "too_large" ? "Image too large (max 2MB)" : "Upload failed. Try a smaller image.")
    } finally {
      setImgUploading(false)
      if (imgFileRef.current) imgFileRef.current.value = ""
    }
  }

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
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border p-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-extrabold">
            <BookOpen className="h-5 w-5 text-brand" />
            {id ? t("action.edit") : t("admin.newLesson")}
          </DialogTitle>
          <DialogDescription>{t("admin.lessonEditor")}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto p-5">
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
              <div className="flex gap-2">
                <Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="URL or upload below" className="h-10" />
                {form.imageUrl && (
                  <Button type="button" variant="outline" size="sm" className="h-10 shrink-0 text-destructive hover:text-destructive" onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {/* Upload from gallery */}
              <input ref={imgFileRef} type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs"
                onClick={() => imgFileRef.current?.click()}
                disabled={imgUploading}
              >
                {imgUploading ? (
                  <><span className="h-3.5 w-3.5 animate-spin rounded-full border border-brand/30 border-t-brand" /> Uploading...</>
                ) : (
                  <><Upload className="h-3.5 w-3.5" /> Upload from Gallery</>
                )}
              </Button>
              {/* Image preview */}
              {form.imageUrl && (
                <div className="mt-2 overflow-hidden rounded-lg border border-border">
                  <img src={form.imageUrl} alt="lesson preview" className="h-32 w-full object-cover" />
                </div>
              )}
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
        </div>

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

      <Card className="sm:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Megaphone className="h-5 w-5 text-brand" /> Ad Network Settings</CardTitle>
          <CardDescription>Control which ad network shows on which platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* AdMob Switch */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <div className="text-sm font-bold">AdMob (Native App Ads)</div>
              <div className="text-xs text-muted-foreground">For Android APK / Play Store App. Default: OFF</div>
            </div>
            <Switch
              checked={form.admobEnabled || false}
              onCheckedChange={(v) => {
                setForm((f) => f && ({ ...f, admobEnabled: v, ...(f.autoMode && v ? { adsenseEnabled: false } : {}) }))
              }}
            />
          </div>

          {/* AdSense Switch */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <div className="text-sm font-bold">AdSense (Web Ads)</div>
              <div className="text-xs text-muted-foreground">For PC / Mobile Browser / iPhone. Default: ON</div>
            </div>
            <Switch
              checked={form.adsenseEnabled ?? true}
              onCheckedChange={(v) => {
                setForm((f) => f && ({ ...f, adsenseEnabled: v, ...(f.autoMode && v ? { admobEnabled: false } : {}) }))
              }}
            />
          </div>

          {/* Auto Mode Switch */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <div className="text-sm font-bold">Auto Switch Mode</div>
              <div className="text-xs text-muted-foreground">One network at a time. Turning one ON auto-turns the other OFF.</div>
            </div>
            <Switch
              checked={form.autoMode ?? true}
              onCheckedChange={(v) => setForm((f) => f && ({ ...f, autoMode: v }))}
            />
          </div>

          {/* Ad Frequency */}
          <div className="space-y-1.5">
            <Label className="text-xs">Ad Frequency (show ad every N lessons)</Label>
            <Input
              type="number"
              value={form.adFrequency ?? 4}
              onChange={(e) => setForm((f) => f && ({ ...f, adFrequency: Number(e.target.value) || 4 }))}
              className="h-9"
              min={1}
              max={10}
            />
            <p className="text-[10px] text-muted-foreground">Default: 4 (ad shows after every 4th completed lesson)</p>
          </div>

          {/* Signal Bottom Ad — ON/OFF + Unit ID */}
          <div className="flex items-center justify-between rounded-lg border border-brand/30 bg-brand/5 p-3">
            <div>
              <div className="text-sm font-bold">Signal Screen Bottom Ad</div>
              <div className="text-[11px] text-muted-foreground">Banner ad at the bottom of Signal List (below all signals)</div>
            </div>
            <Switch
              checked={form.signalBottomAd ?? true}
              onCheckedChange={(v) => setForm((f) => f && ({ ...f, signalBottomAd: v }))}
            />
          </div>
          {(form.signalBottomAd ?? true) && (
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Signal Bottom Ad Unit ID</label>
              <Input
                value={form.signalBottomAdUnitId || ""}
                onChange={(e) => setForm((f) => f && ({ ...f, signalBottomAdUnitId: e.target.value }))}
                className="h-9 font-mono text-xs"
                placeholder="ca-app-pub-XXXX/XXXX or ca-XXXX"
              />
              <p className="text-[10px] text-muted-foreground">AdMob (ca-app-pub-) for mobile app · AdSense (ca-) for web</p>
            </div>
          )}

          {/* Comments Section ON/OFF — global toggle for signal detail page.
              When OFF: hides the entire comments section (comment box + list)
              AND blocks DB writes to the Comment table (saves Supabase space). */}
          <div className="flex items-center justify-between rounded-lg border border-purple-500/30 bg-purple-500/5 p-3">
            <div>
              <div className="text-sm font-bold">Signal Comments Section</div>
              <div className="text-[11px] text-muted-foreground">
                Show/hide the entire comments area on signal detail page. When OFF, new comments are also blocked (saves DB space).
              </div>
            </div>
            <Switch
              checked={form.commentsEnabled ?? true}
              onCheckedChange={(v) => setForm((f) => f && ({ ...f, commentsEnabled: v }))}
            />
          </div>

          {/* Google Login Button ON/OFF — admin controls whether the
              "Continue with Google" button shows on the login page. */}
          <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
            <div>
              <div className="text-sm font-bold">Google Login Button</div>
              <div className="text-[11px] text-muted-foreground">
                Show/hide the "Continue with Google" button on the login page. When OFF, only email/password login is available.
              </div>
            </div>
            <Switch
              checked={form.googleLoginEnabled ?? true}
              onCheckedChange={(v) => setForm((f) => f && ({ ...f, googleLoginEnabled: v }))}
            />
          </div>

          {/* Price Alerts ON/OFF — admin can enable/disable the entire
              Price Alerts feature (home button + alerts sheet). */}
          <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <div>
              <div className="text-sm font-bold">Price Alerts Feature</div>
              <div className="text-[11px] text-muted-foreground">
                Show/hide the Price Alerts button on home dashboard. When OFF, the entire alerts section is hidden.
              </div>
            </div>
            <Switch
              checked={form.priceAlertsEnabled ?? true}
              onCheckedChange={(v) => setForm((f) => f && ({ ...f, priceAlertsEnabled: v }))}
            />
          </div>

          {/* Reviews Section ON/OFF — admin can show/hide "What Students Say" */}
          <div className="flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3">
            <div>
              <div className="text-sm font-bold">Reviews Section (What Students Say)</div>
              <div className="text-[11px] text-muted-foreground">
                Show/hide the student reviews section on the home page.
              </div>
            </div>
            <Switch
              checked={form.reviewsEnabled ?? true}
              onCheckedChange={(v) => setForm((f) => f && ({ ...f, reviewsEnabled: v }))}
            />
          </div>

          {/* Signals Section ON/OFF — global toggle to hide the entire Live Signals section.
              When OFF: home page "Live Signals" card hidden, signals sheet doesn't open,
              public API returns empty array (no DB fetch — zero bandwidth). */}
          <div className="flex items-center justify-between rounded-lg border border-purple-500/30 bg-purple-500/5 p-3">
            <div>
              <div className="text-sm font-bold">Signals Section (Live Signals)</div>
              <div className="text-[11px] text-muted-foreground">
                Show/hide the entire Live Signals section on the home page. When OFF, no signal data is fetched from the database.
              </div>
            </div>
            <Switch
              checked={form.signalsEnabled ?? true}
              onCheckedChange={(v) => setForm((f) => f && ({ ...f, signalsEnabled: v }))}
            />
          </div>

          {/* Broker Comparison Section ON/OFF — hide the entire "World's Top Broker" section */}
          <div className="flex items-center justify-between rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3">
            <div>
              <div className="text-sm font-bold">Broker Comparison Section (World's Top Broker)</div>
              <div className="text-[11px] text-muted-foreground">
                Show/hide the broker comparison cards on the home page.
              </div>
            </div>
            <Switch
              checked={form.showBrokerAds ?? true}
              onCheckedChange={(v) => setForm((f) => f && ({ ...f, showBrokerAds: v }))}
            />
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
  admobEnabled?: boolean
  adsenseEnabled?: boolean
  autoMode?: boolean
  adFrequency?: number
  signalBottomAd?: boolean
  signalBottomAdUnitId?: string
  commentsEnabled?: boolean
  googleLoginEnabled?: boolean
  priceAlertsEnabled?: boolean
  reviewsEnabled?: boolean
  brokerAdsEnabled?: boolean
  signalsEnabled?: boolean
  showBrokerAds?: boolean
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
            const isCrypto = r.method === "USDT" || r.method === "USDT_BEP20"
            const explorerUrl = r.txHash
              ? (r.method === "USDT_BEP20"
                ? `https://bscscan.com/tx/${r.txHash}`
                : r.method === "USDT"
                ? `https://tronscan.org/#/transaction/${r.txHash}`
                : null)
              : null
            return (
              <Card key={r.id}>
                <CardContent className="p-4 space-y-3">
                  {/* ─── User Info: Name + Email + Status ─── */}
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

                  {/* ─── Payment Method + Amount + Plan Type ─── */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Method:</span> <span className="font-bold">{r.method}</span></div>
                    <div><span className="text-muted-foreground">Amount:</span> <span className="font-bold">Rs {r.amount} (${Math.round(r.amount / 280)})*</span></div>
                  </div>
                  {/* Plan Type badge — shows what the client paid for:
                      all = full Pro | lessons = lessons only | alerts = alerts only | signals = signals only */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Plan:</span>
                    <Badge className={
                      r.planType === "all" ? "bg-brand-muted text-brand"
                      : r.planType === "lessons" ? "bg-blue-500/15 text-blue-500"
                      : r.planType === "alerts" ? "bg-amber-500/15 text-amber-600"
                      : r.planType === "signals" ? "bg-purple-500/15 text-purple-500"
                      : "bg-muted text-muted-foreground"
                    }>
                      {r.planType === "all" ? "Full Pro (All)" : r.planType === "lessons" ? "Lessons Only" : r.planType === "alerts" ? "Alerts Only" : r.planType === "signals" ? "Signals Only" : r.planType}
                    </Badge>
                  </div>

                  {/* ─── Tx Hash / TxID (crypto only) — with Copy + Explorer link ─── */}
                  {r.txHash && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-amber-600">Tx Hash / TxID</div>
                      <div className="flex items-center gap-1.5">
                        <code className="flex-1 truncate font-mono text-[11px] font-bold text-foreground" title={r.txHash}>
                          {r.txHash}
                        </code>
                        <button
                          onClick={() => { navigator.clipboard?.writeText(r.txHash!); toast.success("Tx Hash copied") }}
                          className="shrink-0 rounded-md border border-border bg-card p-1.5 transition hover:bg-muted"
                          title="Copy Tx Hash"
                          aria-label="Copy Tx Hash"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        {explorerUrl && (
                          <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded-md border border-border bg-card p-1.5 transition hover:bg-muted"
                            title={`View on ${r.method === "USDT_BEP20" ? "BSCScan" : "Tronscan"}`}
                            aria-label="View on blockchain explorer"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ─── Screenshot — image preview, tap to zoom ─── */}
                  {r.screenshotPath && (
                    <div>
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Screenshot</div>
                      <button
                        onClick={() => setPreview(r.screenshotPath)}
                        className="block w-full overflow-hidden rounded-lg border border-border"
                        aria-label="View screenshot full size"
                      >
                        <img src={r.screenshotPath} alt="payment screenshot" className="h-36 w-full object-cover" />
                      </button>
                    </div>
                  )}

                  {/* ─── User Note (optional, separate from Tx Hash) ─── */}
                  {r.note && (
                    <div className="rounded-lg bg-muted/50 p-2">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">User Note</div>
                      <div className="mt-0.5 text-xs">{r.note}</div>
                    </div>
                  )}

                  {/* ─── Date ─── */}
                  <div className="text-[10px] text-muted-foreground">
                    Submitted: <span className="font-bold">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>

                  {/* ─── Admin reviewer note (if reviewed) ─── */}
                  {r.reviewerNote && (
                    <div className="rounded-lg bg-muted/50 p-2">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Admin Note</div>
                      <div className="mt-0.5 text-xs">{r.reviewerNote}</div>
                    </div>
                  )}

                  {/* ─── Actions: Approve / Reject ─── */}
                  {r.status === "pending" && (
                    <div className="flex gap-2">
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

/* ---------------- Payment Settings ---------------- */
function PaymentSettingsTab() {
  const { data, isLoading } = useProSettings()
  const save = useSaveProSettings()

  const [usdPrice, setUsdPrice] = useState("5")
  const [pkrRate, setPkrRate] = useState("280")
  const [jazzcash, setJazzcash] = useState("")
  const [easypaisa, setEasypaisa] = useState("")
  const [cardEnabled, setCardEnabled] = useState(true)
  const [cardInstructions, setCardInstructions] = useState("")
  const [sadapayEnabled, setSadapayEnabled] = useState(true)
  const [sadapayName, setSadapayName] = useState("")
  const [sadapayNumber, setSadapayNumber] = useState("")
  const [sadapayIban, setSadapayIban] = useState("")
  const [usdtEnabled, setUsdtEnabled] = useState(true)
  const [usdtAddress, setUsdtAddress] = useState("")
  const [bep20Enabled, setBep20Enabled] = useState(true)
  const [bep20Address, setBep20Address] = useState("0xaa889030e6e69ef3eb55a2e94f1226628a8a19c3")
  const [payoneerEnabled, setPayoneerEnabled] = useState(false)
  const [payoneerEmail, setPayoneerEmail] = useState("")
  const [payoneerInstructions, setPayoneerInstructions] = useState("")
  const [loaded, setLoaded] = useState(false)

  // Sync local inputs when server data arrives
  if (data && !loaded) {
    setUsdPrice(String(data.usdPrice))
    setPkrRate(String(data.pkrRate))
    setJazzcash(data.jazzcashNumber)
    setEasypaisa(data.easypaisaNumber)
    setCardEnabled(data.cardEnabled)
    setCardInstructions(data.cardInstructions)
    setSadapayEnabled(data.sadapayEnabled ?? true)
    setSadapayName(data.sadapayName || "")
    setSadapayNumber(data.sadapayNumber || "")
    setSadapayIban(data.sadapayIban || "")
    setUsdtEnabled(data.usdtEnabled ?? true)
    setUsdtAddress(data.usdtAddress || "")
    setBep20Enabled(data.bep20Enabled ?? true)
    setBep20Address(data.bep20Address || "0xaa889030e6e69ef3eb55a2e94f1226628a8a19c3")
    setPayoneerEnabled(data.payoneerEnabled ?? false)
    setPayoneerEmail(data.payoneerEmail || "")
    setPayoneerInstructions(data.payoneerInstructions || "")
    setLoaded(true)
  }

  const onSave = async () => {
    try {
      await save.mutateAsync({
        usdPrice: Number(usdPrice) || 5,
        pkrRate: Number(pkrRate) || 280,
        jazzcashNumber: jazzcash,
        easypaisaNumber: easypaisa,
        cardEnabled,
        cardInstructions,
        sadapayEnabled,
        sadapayName,
        sadapayNumber,
        sadapayIban,
        usdtEnabled,
        usdtAddress,
        bep20Enabled,
        bep20Address,
        payoneerEnabled,
        payoneerEmail,
        payoneerInstructions,
      })
      toast.success("Payment settings saved!")
    } catch {
      toast.error("Failed to save. Try again.")
    }
  }

  const pkrPrice = Math.round((Number(usdPrice) || 5) * (Number(pkrRate) || 280))

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-brand" /> Payment Settings</CardTitle>
          <CardDescription>Set Pro price, PKR exchange rate, and payment method numbers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">USD Price ($)</label>
              <Input type="number" step="0.01" value={usdPrice} onChange={(e) => setUsdPrice(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">PKR Rate (1 USD = ?)</label>
              <Input type="number" value={pkrRate} onChange={(e) => setPkrRate(e.target.value)} className="h-10" />
            </div>
          </div>
          <div className="rounded-lg bg-brand-muted/30 p-3 text-center">
            <span className="text-sm font-bold text-brand">Auto-calculated PKR: Rs {pkrPrice}</span>
            <span className="ml-2 text-xs text-muted-foreground">(${usdPrice} × {pkrRate})</span>
          </div>

          {/* JazzCash */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">JazzCash Number</label>
            <Input value={jazzcash} onChange={(e) => setJazzcash(e.target.value)} placeholder="03XX-XXXXXXX" className="h-10" />
          </div>

          {/* Easypaisa */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Easypaisa Number</label>
            <Input value={easypaisa} onChange={(e) => setEasypaisa(e.target.value)} placeholder="03XX-XXXXXXX" className="h-10" />
          </div>

          {/* Card option */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <div className="text-sm font-bold">Visa / Debit Card option</div>
              <div className="text-[11px] text-muted-foreground">Show 3rd payment method to users</div>
            </div>
            <Switch checked={cardEnabled} onCheckedChange={setCardEnabled} />
          </div>
          {cardEnabled && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Card Payment Instructions</label>
              <Textarea value={cardInstructions} onChange={(e) => setCardInstructions(e.target.value)} rows={2} placeholder="e.g. Contact admin on WhatsApp for card payment link" className="text-sm" />
            </div>
          )}

          {/* SadaPay — International */}
          <div className="flex items-center justify-between rounded-lg border border-[#6C2BD9]/30 bg-[#6C2BD9]/5 p-3">
            <div>
              <div className="text-sm font-bold">SadaPay (International / Worldwide)</div>
              <div className="text-[11px] text-muted-foreground">For clients outside Pakistan</div>
            </div>
            <Switch checked={sadapayEnabled} onCheckedChange={setSadapayEnabled} />
          </div>
          {sadapayEnabled && (
            <div className="space-y-2 rounded-lg border border-[#6C2BD9]/20 p-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">SadaPay Account Name</label>
                <Input value={sadapayName} onChange={(e) => setSadapayName(e.target.value)} className="h-9" placeholder="TradeSeekho PK" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">SadaPay Number</label>
                <Input value={sadapayNumber} onChange={(e) => setSadapayNumber(e.target.value)} className="h-9" placeholder="03XX-XXXXXXX" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">SadaPay IBAN</label>
                <Input value={sadapayIban} onChange={(e) => setSadapayIban(e.target.value)} className="h-9 font-mono text-xs" placeholder="PK36SAPK0000000000000000" />
              </div>
            </div>
          )}

          {/* USDT TRC20 (Binance) — Crypto */}
          <div className="flex items-center justify-between rounded-lg border border-[#26A17B]/30 bg-[#26A17B]/5 p-3">
            <div>
              <div className="text-sm font-bold">USDT TRC20 (Binance)</div>
              <div className="text-[11px] text-muted-foreground">Crypto payment via Tron network</div>
            </div>
            <Switch checked={usdtEnabled} onCheckedChange={setUsdtEnabled} />
          </div>
          {usdtEnabled && (
            <div className="space-y-2 rounded-lg border border-[#26A17B]/20 p-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">TRC20 Wallet Address</label>
                <Input value={usdtAddress} onChange={(e) => setUsdtAddress(e.target.value)} className="h-9 font-mono text-xs" placeholder="Paste your TRC20 wallet address here" />
                <p className="text-[10px] text-muted-foreground">Ye address clients ko dikhaya jayega. USDT sirf TRC20 (Tron) network par receive hoga.</p>
              </div>
            </div>
          )}

          {/* USDT BEP20 (BSC) — Crypto */}
          <div className="flex items-center justify-between rounded-lg border border-[#F3BA2F]/40 bg-[#F3BA2F]/5 p-3">
            <div>
              <div className="text-sm font-bold">USDT BEP20 (BSC) · NEW</div>
              <div className="text-[11px] text-muted-foreground">Crypto payment via BNB Smart Chain</div>
            </div>
            <Switch checked={bep20Enabled} onCheckedChange={setBep20Enabled} />
          </div>
          {bep20Enabled && (
            <div className="space-y-2 rounded-lg border border-[#F3BA2F]/30 p-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">BEP20 Wallet Address (BSC)</label>
                <Input value={bep20Address} onChange={(e) => setBep20Address(e.target.value)} className="h-9 font-mono text-xs" placeholder="0x... BSC wallet address" />
                <p className="text-[10px] text-muted-foreground">Ye address clients ko dikhaya jayega. Sirf BSC (BEP20) network par receive hoga. Galat network par bhejne se funds lost ho jayenge.</p>
              </div>
            </div>
          )}

          {/* Payoneer — Email Transfer */}
          <div className="flex items-center justify-between rounded-lg border border-orange-500/40 bg-orange-500/5 p-3">
            <div>
              <div className="text-sm font-bold">Payoneer · NEW</div>
              <div className="text-[11px] text-muted-foreground">Payment via Payoneer Email Transfer</div>
            </div>
            <Switch checked={payoneerEnabled} onCheckedChange={setPayoneerEnabled} />
          </div>
          {payoneerEnabled && (
            <div className="space-y-2 rounded-lg border border-orange-500/30 p-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Payoneer Email</label>
                <Input value={payoneerEmail} onChange={(e) => setPayoneerEmail(e.target.value)} className="h-9" placeholder="yourpayoneer@email.com" />
                <p className="text-[10px] text-muted-foreground">Ye email clients ko dikhaya jayega. User is email par payment bhejega + Transaction ID enter karega.</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Instructions (Optional)</label>
                <Textarea value={payoneerInstructions} onChange={(e) => setPayoneerInstructions(e.target.value)} rows={2} placeholder="e.g. Send $5 USD to this Payoneer email and enter the Transaction ID." className="text-sm" />
              </div>
            </div>
          )}

          <Button className="h-10 w-full gap-2 bg-brand font-bold text-brand-foreground hover:bg-brand/90" onClick={onSave} disabled={save.isPending}>
            {save.isPending ? <Save className="h-4 w-4 animate-pulse" /> : <Save className="h-4 w-4" />}
            Save Payment Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/* ---------------- Broker Ads ---------------- */
function BrokerAdsTab() {
  const { data, isLoading } = useBrokerAds()
  const save = useSaveBrokerAds()
  // Fetch AdSettings (for the global brokerAdsEnabled toggle)
  const { data: adsSettings } = useAdminAds()
  const saveAds = useSaveAds()
  const qc = useQueryClient()

  const [ads, setAds] = useState<Array<{
    id?: string; slot: number; name: string; text: string; btnText: string; link: string; enabled: boolean
  }>>([])
  const [loaded, setLoaded] = useState(false)

  if (data && !loaded) {
    setAds(data.ads.map((a: any) => ({ ...a })))
    setLoaded(true)
  }

  const update = (slot: number, field: string, value: string | boolean) => {
    setAds((prev) => prev.map((a) => a.slot === slot ? { ...a, [field]: value } : a))
  }

  const onSave = async () => {
    try {
      await save.mutateAsync({ ads })
      toast.success("Broker ads saved!")
    } catch {
      toast.error("Failed to save. Try again.")
    }
  }

  // Toggle the global brokerAdsEnabled flag (in AdSettings, not BrokerAd).
  // When OFF, the public API returns empty array → BrokerAdBanner hides.
  const onToggleGlobal = async (v: boolean) => {
    if (!adsSettings) return
    try {
      await saveAds.mutateAsync({ ...adsSettings, brokerAdsEnabled: v })
      qc.invalidateQueries({ queryKey: ["broker-ads"] })
      toast.success(`Broker ads ${v ? "enabled" : "disabled"} globally`)
    } catch {
      toast.error("Failed to toggle. Try again.")
    }
  }

  if (isLoading) return <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>

  const globalEnabled = adsSettings?.brokerAdsEnabled ?? true

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-brand" /> Broker Ad Banners</CardTitle>
          <CardDescription>Manage rotating broker ads shown on homepage. Ads auto-rotate every 10 seconds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ─── Global ON/OFF Toggle ───
              When OFF, the entire broker ads section is hidden on the home page.
              The public API returns empty array (no DB fetch) → zero bandwidth. */}
          <div className="flex items-center justify-between rounded-xl border-2 border-border bg-muted/30 p-3">
            <div>
              <div className="text-sm font-bold">Show Broker Ads (Global)</div>
              <div className="text-[11px] text-muted-foreground">Main switch — turn OFF to hide all broker ads on the home page</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold ${globalEnabled ? "text-emerald-600" : "text-muted-foreground"}`}>
                {globalEnabled ? "ON" : "OFF"}
              </span>
              <Switch checked={globalEnabled} onCheckedChange={onToggleGlobal} disabled={saveAds.isPending} />
            </div>
          </div>

          {/* Individual ad slots — only show when global toggle is ON */}
          {globalEnabled && ads.map((ad, i) => (
            <div key={ad.slot} className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Ad Slot {ad.slot}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{ad.enabled ? "ON" : "OFF"}</span>
                  <Switch checked={ad.enabled} onCheckedChange={(v) => update(ad.slot, "enabled", v)} />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Broker Name</label>
                  <Input value={ad.name} onChange={(e) => update(ad.slot, "name", e.target.value)} className="h-9" placeholder="e.g. Exness" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Ad Text</label>
                  <Input value={ad.text} onChange={(e) => update(ad.slot, "text", e.target.value)} className="h-9" placeholder="e.g. Trade with Exness - Instant Deposit" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Button Text</label>
                    <Input value={ad.btnText} onChange={(e) => update(ad.slot, "btnText", e.target.value)} className="h-9" placeholder="e.g. Open Account" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Link (URL)</label>
                    <Input value={ad.link} onChange={(e) => update(ad.slot, "link", e.target.value)} className="h-9" placeholder="https://..." />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {globalEnabled && (
            <Button className="h-10 w-full gap-2 bg-brand font-bold text-brand-foreground hover:bg-brand/90" onClick={onSave} disabled={save.isPending}>
              {save.isPending ? <Save className="h-4 w-4 animate-pulse" /> : <Save className="h-4 w-4" />}
              Save Broker Ads
            </Button>
          )}
          {!globalEnabled && (
            <div className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4 text-center">
              <p className="text-sm font-bold text-amber-600">⚠ Broker Ads are hidden globally</p>
              <p className="text-[11px] text-muted-foreground mt-1">Turn ON the toggle above to edit individual ad slots</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ---------------- Affiliate Ads ---------------- */
function AffiliateAdsTab() {
  const { data, isLoading } = useAffiliateAd()
  const save = useSaveAffiliateAd()

  const [form, setForm] = useState({
    enabled: false,
    title: "Mexc",
    description: "Make your first deposit and Futures trade to unlock rewards",
    buttonText: "Download",
    logoUrl: "",
    bannerUrl: "",
    combinedAdImage: "",
    showTitle: false,
    showButton: false,
    showDescription: false,
    link: "https://www.mexc.com",
  })
  const [loaded, setLoaded] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingCombined, setUploadingCombined] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const combinedInputRef = useRef<HTMLInputElement>(null)

  // One-time sync from server data → local form state
  if (data?.ad && !loaded) {
    const a = data.ad
    setForm({
      enabled: a.enabled,
      title: a.title,
      description: a.description,
      buttonText: a.buttonText,
      logoUrl: a.logoUrl,
      bannerUrl: a.bannerUrl,
      combinedAdImage: a.combinedAdImage,
      showTitle: a.showTitle,
      showButton: a.showButton,
      showDescription: a.showDescription,
      link: a.link,
    })
    setLoaded(true)
  }

  const upd = (field: string, value: string | boolean) => {
    setForm((p) => ({ ...p, [field]: value }))
  }

  // Upload image (logo, banner, or combined) via the shared /api/admin/upload-image endpoint.
  // Auto-compresses to WebP (max 800px, quality 75) server-side, returns CDN URL.
  const uploadImage = async (file: File, kind: "logo" | "banner" | "combined") => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB")
      return
    }
    const setLoading = kind === "logo" ? setUploadingLogo : kind === "banner" ? setUploadingBanner : setUploadingCombined
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok || !json.url) {
        throw new Error(json?.message || json?.error || "Upload failed")
      }
      if (kind === "logo") {
        upd("logoUrl", json.url)
      } else if (kind === "banner") {
        upd("bannerUrl", json.url)
      } else {
        upd("combinedAdImage", json.url)
      }
      const saved = json.compression
        ? ` (${json.compression.savedPc}% smaller, ${Math.round(json.compression.compressedSize / 1024)}KB)`
        : ""
      const label = kind === "logo" ? "Logo" : kind === "banner" ? "Banner" : "Combined image"
      toast.success(`${label} uploaded${saved}`)
    } catch (e: any) {
      toast.error(e?.message || "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  const onSave = async () => {
    try {
      await save.mutateAsync(form)
      toast.success("Affiliate ad saved!")
    } catch (e: any) {
      toast.error(e?.message || "Failed to save. Try again.")
    }
  }

  if (isLoading) return <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-brand" /> Affiliate Ad Banner
          </CardTitle>
          <CardDescription>
            Custom affiliate ad shown at the bottom of the <b>Lessons</b> page and <b>Live Signals</b> page. Clicking the ad opens your affiliate link in a new tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ─── Main On/Off Toggle ─── */}
          <div className="flex items-center justify-between rounded-xl border-2 border-border bg-muted/30 p-3">
            <div>
              <div className="text-sm font-bold">Show Affiliate Ad</div>
              <div className="text-[11px] text-muted-foreground">Main switch — turn ON to show the ad in the app</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold ${form.enabled ? "text-emerald-600" : "text-muted-foreground"}`}>
                {form.enabled ? "ON" : "OFF"}
              </span>
              <Switch checked={form.enabled} onCheckedChange={(v) => upd("enabled", v)} />
            </div>
          </div>

          {/* ─── Live Preview ─── */}
          <div className="rounded-xl border border-dashed border-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Live Preview</span>
              {form.combinedAdImage && (
                <span className="rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-[9px] font-bold text-fuchsia-600">COMBINED IMAGE MODE</span>
              )}
            </div>
            {form.combinedAdImage ? (
              // ─── Combined Image Mode: full-width single image + optional text overlay ───
              <div className="relative block overflow-hidden rounded-2xl border border-border bg-white dark:bg-zinc-900">
                <img src={form.combinedAdImage} alt="" className="block h-auto w-full object-contain" style={{ maxHeight: "160px" }} />
                {(form.showTitle || form.showButton || form.showDescription) && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3">
                    <div className="space-y-1">
                      {form.showTitle && form.title && (
                        <span className="inline-block rounded bg-black/60 px-2 py-0.5 text-sm font-extrabold text-white">{form.title}</span>
                      )}
                      {form.showDescription && form.description && (
                        <p className="line-clamp-2 max-w-[70%] rounded bg-black/50 px-2 py-0.5 text-[10px] font-medium leading-snug text-white">{form.description}</p>
                      )}
                    </div>
                    {form.showButton && form.buttonText && (
                      <span className="inline-flex w-fit items-center gap-1 rounded-lg bg-red-500 px-3 py-1 text-[11px] font-bold text-white">{form.buttonText}</span>
                    )}
                  </div>
                )}
                <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">AD</span>
              </div>
            ) : (
              // ─── Split Layout: logo + banner ───
              <div className="relative flex overflow-hidden rounded-2xl border border-border bg-white dark:bg-zinc-900">
                <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 p-3 text-center">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="" className="h-7 w-auto max-w-[120px] object-contain" />
                  ) : (
                    <span className="text-lg font-extrabold text-zinc-900 dark:text-white">{form.title || "Brand"}</span>
                  )}
                  {form.logoUrl && form.title && (
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-white">{form.title}</span>
                  )}
                  {form.description && (
                    <p className="line-clamp-2 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">{form.description}</p>
                  )}
                  {form.buttonText && (
                    <span className="mt-1 inline-block rounded-lg bg-red-500 px-4 py-1.5 text-xs font-bold text-white">
                      {form.buttonText}
                    </span>
                  )}
                </div>
                {/* Banner image: object-contain (NOT cut) + padding 5px + center-left position */}
                <div className="relative w-[42%] shrink-0 overflow-hidden bg-zinc-950 p-[5px]">
                  {form.bannerUrl ? (
                    <img src={form.bannerUrl} alt="" className="absolute inset-[5px] h-[calc(100%-10px)] w-[calc(100%-10px)] object-contain" style={{ objectPosition: "center left" }} />
                  ) : (
                    <div className="absolute inset-[5px] flex items-center justify-center rounded bg-gradient-to-br from-zinc-800 to-zinc-950">
                      <span className="px-2 text-center text-[10px] font-medium text-zinc-400">Banner Image</span>
                    </div>
                  )}
                </div>
                <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">AD</span>
              </div>
            )}
          </div>

          {/* ─── Text Fields (with ON/OFF toggles for combined image mode) ───
              The toggles only matter when Combined Image Mode is active.
              When ON → the text overlays on top of the combined image.
              When OFF → the text is hidden (only image shows). */}
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Ad Title + toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Ad Title</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-muted-foreground">SHOW</span>
                  <Switch checked={form.showTitle} onCheckedChange={(v) => upd("showTitle", v)} className="scale-75" />
                </div>
              </div>
              <Input value={form.title} onChange={(e) => upd("title", e.target.value)} className="h-9" placeholder="e.g. Mexc" maxLength={100} />
            </div>
            {/* Button Text + toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Button Text</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-muted-foreground">SHOW</span>
                  <Switch checked={form.showButton} onCheckedChange={(v) => upd("showButton", v)} className="scale-75" />
                </div>
              </div>
              <Input value={form.buttonText} onChange={(e) => upd("buttonText", e.target.value)} className="h-9" placeholder="e.g. Download" maxLength={30} />
            </div>
          </div>

          {/* Ad Description + toggle */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Ad Description</label>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-muted-foreground">SHOW</span>
                <Switch checked={form.showDescription} onCheckedChange={(v) => upd("showDescription", v)} className="scale-75" />
              </div>
            </div>
            <Textarea
              value={form.description}
              onChange={(e) => upd("description", e.target.value)}
              rows={2}
              placeholder="e.g. Make your first deposit and Futures trade to unlock rewards"
              maxLength={300}
            />
            <div className="flex items-center justify-between">
              {form.combinedAdImage ? (
                <p className="text-[10px] text-fuchsia-600">ℹ In Combined Image Mode, toggle ON to overlay text on the image</p>
              ) : (
                <p className="text-[10px] text-muted-foreground/60">Toggles apply only in Combined Image Mode</p>
              )}
              <p className="text-[10px] text-muted-foreground">{form.description.length}/300</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Affiliate Link</label>
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.link}
                onChange={(e) => upd("link", e.target.value)}
                className="h-9 pl-8"
                placeholder="https://www.mexc.com/..."
              />
            </div>
          </div>

          {/* ─── Image Uploads ─── */}
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Logo upload */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Brand Logo (Left side)</label>
              <div className="rounded-xl border border-border p-3 space-y-2">
                {form.logoUrl ? (
                  <div className="relative">
                    <img src={form.logoUrl} alt="Logo" className="mx-auto h-16 w-auto object-contain" />
                    <button
                      onClick={() => upd("logoUrl", "")}
                      className="absolute right-0 top-0 rounded-full bg-destructive/90 p-1 text-destructive-foreground"
                      aria-label="Remove logo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-16 items-center justify-center text-[11px] text-muted-foreground">No logo uploaded</div>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) uploadImage(f, "logo")
                    e.target.value = ""
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5"
                  disabled={uploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {uploadingLogo ? (
                    <><Save className="h-3.5 w-3.5 animate-pulse" /> Uploading...</>
                  ) : (
                    <><Upload className="h-3.5 w-3.5" /> Upload Logo</>
                  )}
                </Button>
              </div>
            </div>

            {/* Banner upload */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Banner Image (Right side)</label>
              <div className="rounded-xl border border-border p-3 space-y-2">
                {form.bannerUrl ? (
                  <div className="relative">
                    <img src={form.bannerUrl} alt="Banner" className="mx-auto h-16 w-full object-contain rounded bg-zinc-950" />
                    <button
                      onClick={() => upd("bannerUrl", "")}
                      className="absolute right-0 top-0 rounded-full bg-destructive/90 p-1 text-destructive-foreground"
                      aria-label="Remove banner"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-16 items-center justify-center text-[11px] text-muted-foreground">No banner uploaded</div>
                )}
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) uploadImage(f, "banner")
                    e.target.value = ""
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5"
                  disabled={uploadingBanner}
                  onClick={() => bannerInputRef.current?.click()}
                >
                  {uploadingBanner ? (
                    <><Save className="h-3.5 w-3.5 animate-pulse" /> Uploading...</>
                  ) : (
                    <><Upload className="h-3.5 w-3.5" /> Upload Banner</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* ─── Combined Image Upload (single full-width image mode) ─── */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Combined Ad Image (Optional · 600×300) — single full-width image
            </label>
            <div className="rounded-xl border-2 border-dashed border-fuchsia-500/30 bg-fuchsia-500/5 p-3 space-y-2">
              {form.combinedAdImage ? (
                <div className="relative">
                  <img src={form.combinedAdImage} alt="Combined ad" className="mx-auto h-24 w-full object-contain rounded bg-white" />
                  <button
                    onClick={() => upd("combinedAdImage", "")}
                    className="absolute right-0 top-0 rounded-full bg-destructive/90 p-1 text-destructive-foreground"
                    aria-label="Remove combined image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex h-20 items-center justify-center text-[11px] text-muted-foreground">
                  Upload a 600×300 image to show a single full-width ad (hides logo + banner split)
                </div>
              )}
              <input
                ref={combinedInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) uploadImage(f, "combined")
                  e.target.value = ""
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-1.5 border-fuchsia-500/50 text-fuchsia-600 hover:bg-fuchsia-500/10"
                disabled={uploadingCombined}
                onClick={() => combinedInputRef.current?.click()}
              >
                {uploadingCombined ? (
                  <><Save className="h-3.5 w-3.5 animate-pulse" /> Uploading...</>
                ) : (
                  <><Upload className="h-3.5 w-3.5" /> Upload Combined Image (600×300)</>
                )}
              </Button>
              {form.combinedAdImage && (
                <p className="text-center text-[10px] font-bold text-fuchsia-600">
                  ✓ Combined image mode is ACTIVE — logo + banner split is hidden
                </p>
              )}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Images auto-compress to WebP (max 800px, ~80-150KB) on upload. Stored on Vercel Blob CDN.
          </p>

          {/* ─── Save Button ─── */}
          <Button
            className="h-10 w-full gap-2 bg-brand font-bold text-brand-foreground hover:bg-brand/90"
            onClick={onSave}
            disabled={save.isPending}
          >
            {save.isPending ? <Save className="h-4 w-4 animate-pulse" /> : <Save className="h-4 w-4" />}
            Save Affiliate Ad
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/* ---------------- Users / Clients ---------------- */
function UsersTab() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const { data, isLoading } = useAdminUsers(search, filter)

  const users = data?.users ?? []
  const proCount = users.filter((u) => u.proStatus === "active").length
  // totalAll = ALL registered clients (ignoring search/filter) — always shows
  // the real total. Updates automatically when new accounts are created.
  const totalClients = data?.totalAll ?? 0
  const totalPro = data?.totalProAll ?? 0
  const totalFree = data?.totalFreeAll ?? 0

  return (
    <div className="space-y-4">
      {/* ─── PROMINENT TOTAL CLIENTS BOX (top) ─── */}
      {/* Big number showing total registered clients. Updates when new accounts are created. */}
      <Card className="border-brand/30 bg-gradient-to-br from-brand/5 to-transparent">
        <CardContent className="flex items-center gap-4 p-5">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand">
            <Users className="h-7 w-7" />
          </span>
          <div className="flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Total Clients</div>
            <div className="text-4xl font-extrabold text-foreground leading-tight">{totalClients}</div>
            <div className="text-[11px] text-muted-foreground">
              {totalPro} Pro · {totalFree} Free · {isLoading ? "Loading..." : "Live count"}
            </div>
          </div>
          {/* Mini stats on the right */}
          <div className="hidden sm:flex flex-col gap-2 text-right">
            <div className="rounded-lg bg-gold/10 px-3 py-1.5">
              <div className="text-lg font-extrabold text-gold-foreground">{totalPro}</div>
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground">Pro</div>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-1.5">
              <div className="text-lg font-extrabold text-foreground">{totalFree}</div>
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground">Free</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtered stats (changes with search/filter) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <div className="text-2xl font-extrabold text-foreground">{data?.total ?? 0}</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Showing</div>
        </div>
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 text-center">
          <div className="text-2xl font-extrabold text-gold-foreground">{proCount}</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Pro (filtered)</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <div className="text-2xl font-extrabold text-foreground">{(data?.total ?? 0) - proCount}</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Free (filtered)</div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or name..."
            className="h-10 pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-2 text-xs font-bold transition ${filter === "all" ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"}`}
          >All</button>
          <button
            onClick={() => setFilter("pro")}
            className={`rounded-lg px-3 py-2 text-xs font-bold transition ${filter === "pro" ? "bg-gold text-gold-foreground" : "bg-muted text-muted-foreground"}`}
          >Pro Only</button>
          <button
            onClick={() => setFilter("free")}
            className={`rounded-lg px-3 py-2 text-xs font-bold transition ${filter === "free" ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"}`}
          >Free Only</button>
        </div>
      </div>

      {/* Users Table — horizontal scroll on mobile so all columns visible */}
      <Card className="overflow-visible">
        <div className="max-h-[60vh] w-full overflow-x-auto overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x pan-y" }}>
          <table className="w-max min-w-[700px] border-collapse text-left text-xs">
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="whitespace-nowrap">Pro Status</TableHead>
                <TableHead className="whitespace-nowrap">Plan Type</TableHead>
                <TableHead className="whitespace-nowrap">Payment Method</TableHead>
                <TableHead className="whitespace-nowrap">Joined</TableHead>
                <TableHead className="whitespace-nowrap">Quiz</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="py-6 text-center text-muted-foreground">Loading...</TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-6 text-center text-muted-foreground">No users found.</TableCell></TableRow>
              ) : users.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/30">
                  <TableCell className="font-semibold text-xs whitespace-nowrap">{u.email}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{u.name}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {u.proStatus === "active" ? (
                      <Badge className="bg-gold/20 text-gold-foreground text-[10px]">PRO</Badge>
                    ) : u.proStatus === "pending" ? (
                      <Badge variant="secondary" className="text-[10px]">Pending</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Free</Badge>
                    )}
                  </TableCell>
                  {/* Plan Type — color badges: Alerts=Blue, Signals=Green, Lessons=Orange, All=Gold */}
                  <TableCell className="whitespace-nowrap py-3">
                    {u.proPlanType ? (
                      <div className="flex flex-wrap gap-1.5">
                        {u.proPlanType.split(",").map((plan) => {
                          const styles: Record<string, { bg: string; label: string; icon: string }> = {
                            alerts:   { bg: "bg-blue-500 text-white",            label: "Alerts",   icon: "🔔" },
                            signals:  { bg: "bg-emerald-500 text-white",         label: "Signals",  icon: "📡" },
                            lessons:  { bg: "bg-orange-500 text-white",          label: "Lessons",  icon: "📚" },
                            all:      { bg: "bg-gradient-to-r from-amber-400 to-yellow-500 text-white", label: "All", icon: "👑" },
                          }
                          const s = styles[plan] || { bg: "bg-muted text-muted-foreground", label: plan, icon: "" }
                          return (
                            <span key={plan} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold shadow-sm ${s.bg}`}>
                              {s.icon} {s.label}
                            </span>
                          )
                        })}
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  {/* Payment Method */}
                  <TableCell className="text-xs whitespace-nowrap">
                    {u.proMethod || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(u.joinedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell className="text-xs font-bold whitespace-nowrap">{u.passedQuizzes}/{u.totalLessons}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ---------------- Pages ---------------- */
function PagesTab() {
  const { data, isLoading } = useAdminPages()
  const save = useSavePage()
  const [editing, setEditing] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const pages = data?.pages ?? []

  const startEdit = (p: { slug: string; title: string; content: string }) => {
    setEditing(p.slug)
    setTitle(p.title)
    setContent(p.content)
  }

  const onSave = async () => {
    if (!editing) return
    try {
      await save.mutateAsync({ slug: editing, title, content })
      toast.success("Page saved!")
      setEditing(null)
    } catch {
      toast.error("Failed to save")
    }
  }

  if (isLoading) return <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-brand" /> Static Pages</CardTitle>
          <CardDescription>Edit About Us, Privacy Policy, Contact Us content.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pages.map((p) => (
            <div key={p.slug} className="rounded-xl border border-border p-3">
              {editing === p.slug ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Content</Label>
                    <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1.5 bg-brand font-bold text-brand-foreground" onClick={onSave} disabled={save.isPending}>
                      <Save className="h-3.5 w-3.5" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold capitalize">{p.slug.replace(/-/g, " ")}</div>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">{p.content.slice(0, 60)}...</div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => startEdit(p)}>
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

/* ---------------- Manage Comments ---------------- */
function ManageCommentsTab() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState<"all" | "hidden" | "visible" | "reported">("all")

  const { data, isLoading } = useQuery({
    queryKey: ["admin-comments", filter],
    queryFn: async () => {
      const res = await fetch(`/api/admin/comments?filter=${filter}`)
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, hidden }: { id: string; hidden: boolean }) => {
      const res = await fetch(`/api/admin/comments?id=${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hidden }),
      })
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-comments"] })
      toast.success("Comment updated")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/admin/comments?id=${id}`, { method: "DELETE" })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-comments"] })
      toast.success("Comment deleted")
    },
  })

  const comments = data?.comments ?? []

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-brand" /> Manage Comments
          </CardTitle>
          <CardDescription>
            Approve (show) or hide user comments. New comments are hidden by default.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {(["all", "hidden", "visible", "reported"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${filter === f ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {f === "all" ? "All" : f === "hidden" ? "Hidden" : f === "visible" ? "Visible" : "Reported"}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments found.</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {comments.map((c: any) => (
                <div key={c.id} className={`rounded-xl border p-3 ${c.hidden ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-card"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold">{c.userName}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {c.signalSymbol} {c.signalType}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          · {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {c.hidden && (
                          <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-600">HIDDEN</span>
                        )}
                        {c.reports > 0 && (
                          <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-600">{c.reports} REPORTS</span>
                        )}
                        <span className="text-[10px] text-muted-foreground">❤️ {c.likes}</span>
                      </div>
                      <p className="mt-1 text-sm text-foreground">{c.text}</p>
                      {c.image && (
                        <img src={c.image} alt="" className="mt-2 max-h-32 w-auto rounded-lg border border-border" />
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant={c.hidden ? "default" : "outline"}
                      className="gap-1.5"
                      onClick={() => toggleMutation.mutate({ id: c.id, hidden: !c.hidden })}
                    >
                      {c.hidden ? "Show" : "Hide"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-destructive"
                      onClick={() => {
                        if (confirm("Delete this comment?")) deleteMutation.mutate(c.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ---------------- Notifications Tab ---------------- */
function NotificationsTab() {
  const qc = useQueryClient()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [type, setType] = useState<"system" | "signal">("system")
  const [deepLink, setDeepLink] = useState("")

  // List all broadcast notifications
  const { data, isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const res = await fetch("/api/admin/notifications")
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
  })

  // Send a new broadcast notification
  const sendMutation = useMutation({
    mutationFn: async (payload: { title: string; body: string; type: string; deepLink?: string }) => {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e?.error || "failed")
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-notifications"] })
      // Also invalidate client notification feed so the bell refreshes
      qc.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("Notification sent to all users")
      setTitle(""); setBody(""); setDeepLink("")
    },
    onError: (e: any) => toast.error(e?.message || "Failed to send"),
  })

  // Delete a single notification
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/notifications?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-notifications"] })
      qc.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("Notification deleted")
    },
  })

  // Delete ALL notifications
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/notifications?all=true", { method: "DELETE" })
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
    onSuccess: (r: any) => {
      qc.invalidateQueries({ queryKey: ["admin-notifications"] })
      qc.invalidateQueries({ queryKey: ["notifications"] })
      toast.success(`Deleted ${r?.deleted ?? 0} notifications`)
    },
  })

  // Delete old notifications (older than 7 days)
  const deleteOldMutation = useMutation({
    mutationFn: async (days: number) => {
      const res = await fetch(`/api/admin/notifications?olderThanDays=${days}`, { method: "DELETE" })
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
    onSuccess: (r: any) => {
      qc.invalidateQueries({ queryKey: ["admin-notifications"] })
      qc.invalidateQueries({ queryKey: ["notifications"] })
      toast.success(`Deleted ${r?.deleted ?? 0} old notifications`)
    },
  })

  const list: Array<{
    id: string; type: string; title: string; body: string
    deepLink?: string; createdAt: string
  }> = data?.notifications ?? []

  const canSend = title.trim().length > 0 && body.trim().length > 0 && !sendMutation.isPending

  return (
    <div className="space-y-4">
      {/* Send new notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-brand" /> Send New Notification
          </CardTitle>
          <CardDescription>
            Broadcast a notification to every user&apos;s bell instantly. Use for announcements, news, or marketing messages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System / Announcement</SelectItem>
                  <SelectItem value="signal">Signal Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Deep Link (optional)</Label>
              <Input
                placeholder="app://signal/abc123 or app://lessons"
                value={deepLink}
                onChange={(e) => setDeepLink(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Title *</Label>
            <Input
              placeholder="e.g. New Gold signal published 🚀"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Message *</Label>
            <Textarea
              placeholder="Write the notification body..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-right text-[10px] text-muted-foreground">{body.length}/500</p>
          </div>
          <Button
            className="w-full gap-1.5"
            disabled={!canSend}
            onClick={() => sendMutation.mutate({ title, body, type, deepLink: deepLink.trim() || undefined })}
          >
            <Send className="h-4 w-4" /> Send to All Users
          </Button>
        </CardContent>
      </Card>

      {/* Existing notifications */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-brand" /> Existing Notifications
              </CardTitle>
              <CardDescription>
                {list.length} broadcast notification{list.length === 1 ? "" : "s"} stored. Delete old ones to save space.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={list.length === 0 || deleteOldMutation.isPending}
                onClick={() => {
                  if (confirm("Delete all notifications older than 7 days?")) deleteOldMutation.mutate(7)
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear 7d+
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5"
                disabled={list.length === 0 || deleteAllMutation.isPending}
                onClick={() => {
                  if (confirm("Delete ALL notifications? This cannot be undone.")) deleteAllMutation.mutate()
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : list.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No notifications yet. Send your first one above.</p>
            </div>
          ) : (
            <div className="max-h-[600px] space-y-2 overflow-y-auto">
              {list.map((n) => (
                <div key={n.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{n.title}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${n.type === "signal" ? "bg-amber-500/20 text-amber-600" : "bg-emerald-500/20 text-emerald-600"}`}>
                          {n.type === "signal" ? "SIGNAL" : "SYSTEM"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                      {n.deepLink && (
                        <p className="mt-1 truncate text-[10px] text-muted-foreground/70">→ {n.deepLink}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 gap-1 text-destructive hover:text-destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (confirm("Delete this notification?")) deleteMutation.mutate(n.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ---------------- Broker Links ---------------- */
function BrokerLinksTab() {
  const qc = useQueryClient()
  const [links, setLinks] = useState({
    xmLink: "",
    exnessLink: "",
    icmarketsLink: "",
    fbsLink: "",
    octafxLink: "",
    pepperstoneLink: "",
  })
  const [loaded, setLoaded] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-broker-links"],
    queryFn: async () => {
      const res = await fetch("/api/admin/broker-links")
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
  })

  if (data?.links && !loaded) {
    setLinks(data.links)
    setLoaded(true)
  }

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/broker-links", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(links),
      })
      if (!res.ok) throw new Error("failed")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-broker-links"] })
      qc.invalidateQueries({ queryKey: ["broker-links"] })
      toast.success("Broker links saved!")
    },
    onError: () => toast.error("Failed to save"),
  })

  if (isLoading) return <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>

  const brokers = [
    { key: "xmLink", label: "XM", color: "#0066CC" },
    { key: "exnessLink", label: "Exness", color: "#00B14F" },
    { key: "icmarketsLink", label: "IC Markets", color: "#1A3A5C" },
    { key: "fbsLink", label: "FBS", color: "#FF6B00" },
    { key: "octafxLink", label: "OctaFX", color: "#F7941D" },
    { key: "pepperstoneLink", label: "Pepperstone", color: "#00529B" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><LayoutGrid className="h-5 w-5 text-brand" /> Broker Comparison Links</CardTitle>
        <CardDescription>Edit referral links for the 6 brokers shown on the home page Broker Comparison section.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {brokers.map((b) => (
          <div key={b.key} className="space-y-1">
            <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded text-[8px] font-black text-white" style={{ backgroundColor: b.color }}>
                {b.label.substring(0, 2)}
              </span>
              {b.label} Referral Link
            </label>
            <Input
              value={(links as any)[b.key]}
              onChange={(e) => setLinks((p) => ({ ...p, [b.key]: e.target.value }))}
              className="h-9"
              placeholder={`https://${b.label.toLowerCase().replace(" ", "")}.com/your-referral-link`}
            />
          </div>
        ))}
        <Button
          className="h-10 w-full gap-2 bg-brand font-bold text-brand-foreground hover:bg-brand/90"
          onClick={() => save.mutate()}
          disabled={save.isPending}
        >
          {save.isPending ? <Save className="h-4 w-4 animate-pulse" /> : <Save className="h-4 w-4" />}
          Save Broker Links
        </Button>

        {/* Force-update: clears ALL users' 7-day localStorage cache.
            Updates brokerAdsUpdatedAt in DB → all clients detect mismatch
            and re-fetch on next visit. Use when you need urgent broker
            link changes (don't want to wait 7 days). */}
        <div className="rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 p-3">
          <div className="mb-2 text-center">
            <p className="text-sm font-bold text-amber-600">⚡ Force Update All Users</p>
            <p className="text-[11px] text-muted-foreground">
              Click to instantly refresh ALL users' cached broker links. Use when you urgently change broker links.
            </p>
          </div>
          <Button
            variant="outline"
            className="h-10 w-full gap-2 border-amber-500/50 font-bold text-amber-600 hover:bg-amber-500/10"
            onClick={async () => {
              try {
                // Fetch current ad settings
                const cfgRes = await fetch("/api/admin/ads")
                const cfg = await cfgRes.json()
                // Send PUT with forceUpdateBrokerCache flag
                const res = await fetch("/api/admin/ads", {
                  method: "PUT",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ ...cfg, forceUpdateBrokerCache: true }),
                })
                if (res.ok) {
                  toast.success("✅ All users' cache cleared! They'll see updated links on next visit.")
                } else {
                  toast.error("Failed to clear cache")
                }
              } catch {
                toast.error("Failed to clear cache")
              }
            }}
          >
            <RefreshCw className="h-4 w-4" /> Clear All Users Cache
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ---------------- Promotion Banners ---------------- */
function PromotionBannersTab() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [form, setForm] = useState({ imageUrl: "", title: "", linkUrl: "", isActive: true, sortOrder: 0 })
  const [uploading, setUploading] = useState(false)
  const imgInputRef = useRef<HTMLInputElement>(null)

  // List all banners
  const { data, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const res = await fetch("/api/admin/banners")
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
  })

  const banners: Array<{ id: string; imageUrl: string; title: string; linkUrl: string; isActive: boolean; sortOrder: number }> = data?.banners ?? []

  // Create/update mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const res = await fetch(`/api/admin/banners?id=${editing}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error("failed")
      } else {
        const res = await fetch("/api/admin/banners", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error("failed")
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] })
      qc.invalidateQueries({ queryKey: ["promotion-banners"] })
      toast.success(editing ? "Banner updated!" : "Banner added!")
      resetForm()
    },
    onError: () => toast.error("Failed to save. Try again."),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] })
      qc.invalidateQueries({ queryKey: ["promotion-banners"] })
      toast.success("Banner deleted")
    },
  })

  // Toggle active/inactive
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/admin/banners?id=${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isActive }),
      })
      if (!res.ok) throw new Error("failed")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] })
      qc.invalidateQueries({ queryKey: ["promotion-banners"] })
    },
  })

  // Image upload
  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok || !json.url) throw new Error(json?.error || "Upload failed")
      setForm((p) => ({ ...p, imageUrl: json.url }))
      const saved = json.compression ? ` (${json.compression.savedPc}% smaller, ${Math.round(json.compression.compressedSize / 1024)}KB)` : ""
      toast.success(`Image uploaded${saved}`)
    } catch (e: any) { toast.error(e?.message || "Upload failed") }
    finally { setUploading(false) }
  }

  const resetForm = () => {
    setForm({ imageUrl: "", title: "", linkUrl: "", isActive: true, sortOrder: 0 })
    setEditing(null)
    setShowForm(false)
  }

  const startEdit = (b: any) => {
    setForm({ imageUrl: b.imageUrl, title: b.title || "", linkUrl: b.linkUrl, isActive: b.isActive, sortOrder: b.sortOrder })
    setEditing(b.id)
    setShowForm(true)
  }

  const onSave = () => {
    if (!form.imageUrl) { toast.error("Please upload an image first"); return }
    saveMutation.mutate()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><LayoutGrid className="h-5 w-5 text-brand" /> Promotion Banners</CardTitle>
              <CardDescription>Rotating slider on the Home page (between Gold Price and Lessons). Auto-hides when no active banners.</CardDescription>
            </div>
            {!showForm && (
              <Button className="gap-1.5 bg-brand font-bold text-brand-foreground hover:bg-brand/90" onClick={() => { resetForm(); setShowForm(true) }}>
                <Plus className="h-4 w-4" /> Add Banner
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Form (Add/Edit) */}
          {showForm && (
            <div className="rounded-xl border-2 border-brand/30 bg-brand-muted/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{editing ? "Edit Banner" : "New Banner"}</span>
                <Button size="sm" variant="ghost" onClick={resetForm}><X className="h-4 w-4" /></Button>
              </div>

              {/* Image upload */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Banner Image (auto-compress to WebP, max 150KB)</label>
                <div className="rounded-xl border border-border p-3 space-y-2">
                  {form.imageUrl ? (
                    <div className="relative">
                      <img src={form.imageUrl} alt="Banner" className="mx-auto h-24 w-full rounded object-cover" />
                      <button onClick={() => setForm((p) => ({ ...p, imageUrl: "" }))} className="absolute right-0 top-0 rounded-full bg-destructive/90 p-1 text-destructive-foreground" aria-label="Remove">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-20 items-center justify-center text-[11px] text-muted-foreground">No image uploaded</div>
                  )}
                  <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = "" }} />
                  <Button type="button" variant="outline" size="sm" className="w-full gap-1.5" disabled={uploading} onClick={() => imgInputRef.current?.click()}>
                    {uploading ? <><Save className="h-3.5 w-3.5 animate-pulse" /> Uploading...</> : <><Upload className="h-3.5 w-3.5" /> Upload Image</>}
                  </Button>
                </div>
              </div>

              {/* Title + Link */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Title (optional)</label>
                  <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="h-9" placeholder="e.g. Special Offer" maxLength={200} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Link URL</label>
                  <Input value={form.linkUrl} onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))} className="h-9" placeholder="/pro or https://..." />
                </div>
              </div>

              {/* Sort order + Active toggle */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Sort Order (1,2,3...)</label>
                  <Input type="number" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))} className="h-9" placeholder="0" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
                  <span className="text-sm font-bold">Active (show in slider)</span>
                  <Switch checked={form.isActive} onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))} />
                </div>
              </div>

              <Button className="h-10 w-full gap-2 bg-brand font-bold text-brand-foreground hover:bg-brand/90" onClick={onSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Save className="h-4 w-4 animate-pulse" /> : <Save className="h-4 w-4" />}
                {editing ? "Update Banner" : "Add Banner"}
              </Button>
            </div>
          )}

          {/* Banner list */}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : banners.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <LayoutGrid className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No banners yet. Click "Add Banner" to create your first one.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {banners.map((b) => (
                <div key={b.id} className={`rounded-xl border p-3 ${b.isActive ? "border-brand/30 bg-brand-muted/5" : "border-border opacity-60"}`}>
                  <div className="flex items-center gap-3">
                    <img src={b.imageUrl} alt={b.title || "Banner"} className="h-12 w-20 shrink-0 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold">{b.title || "Untitled Banner"}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${b.isActive ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                          {b.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">Order: {b.sortOrder}</span>
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">{b.linkUrl}</div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Switch checked={b.isActive} onCheckedChange={(v) => toggleMutation.mutate({ id: b.id, isActive: v })} />
                      <Button size="sm" variant="ghost" className="gap-1" onClick={() => startEdit(b)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1 text-destructive" onClick={() => { if (confirm("Delete this banner?")) deleteMutation.mutate(b.id) }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
