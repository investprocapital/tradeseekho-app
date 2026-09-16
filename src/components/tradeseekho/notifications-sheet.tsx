"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, CheckCircle2, BookOpen, TrendingUp, Hand } from "lucide-react"
import { useStore } from "@/lib/store"
import { useNotifications, type AppNotification } from "./use-data"

export function NotificationsSheet() {
  const open = useStore((s) => s.notificationsOpen)
  const setOpen = useStore((s) => s.setNotificationsOpen)
  const { data, isLoading } = useNotifications()
  const list = data?.notifications ?? []

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="flex items-center gap-2 text-xl font-extrabold">
            <Bell className="h-5 w-5 text-brand" /> Notifications
          </SheetTitle>
          <SheetDescription>Quiz results, new lessons & market signals.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="ts-scroll flex-1">
          <div className="p-4">
            {isLoading ? (
              <p className="p-6 text-sm text-muted-foreground">Loading…</p>
            ) : list.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No notifications yet.</p>
            ) : (
              <ul className="space-y-2">
                {list.map((n) => <Item key={n.id} n={n} />)}
              </ul>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

const ICONS: Record<AppNotification["type"], { icon: any; color: string }> = {
  welcome: { icon: Hand, color: "var(--brand)" },
  quiz_passed: { icon: CheckCircle2, color: "var(--brand)" },
  new_lesson: { icon: BookOpen, color: "#00bfa5" },
  signal: { icon: TrendingUp, color: "var(--gold)" },
}

function Item({ n }: { n: AppNotification }) {
  const { icon: Icon, color } = ICONS[n.type] ?? ICONS.signal
  return (
    <li className="flex gap-3 rounded-xl border border-border bg-card p-3">
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: color }}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-foreground">{n.title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{n.body}</div>
        <div className="mt-1 text-[10px] text-muted-foreground/70">{timeAgo(n.createdAt)}</div>
      </div>
    </li>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - +new Date(iso)
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
