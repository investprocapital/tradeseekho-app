"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Flame, Crown, Medal, Award } from "lucide-react"
import { useStore } from "@/lib/store"
import { useLeaderboard, type LeaderboardRow } from "./use-data"

export function LeaderboardSheet() {
  const open = useStore((s) => s.leaderboardOpen)
  const setOpen = useStore((s) => s.setLeaderboardOpen)
  const { data, isLoading } = useLeaderboard()
  const rows = data?.leaderboard ?? []

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="end" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="flex items-center gap-2 text-xl font-extrabold">
            <Trophy className="h-5 w-5 text-gold" /> Leaderboard
          </SheetTitle>
          <SheetDescription>
            {data ? `${data.totalLearners} learners • top ${rows.length}` : "Top learners by lessons passed"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="ts-scroll flex-1">
          <div className="p-4">
            {isLoading ? (
              <p className="p-6 text-sm text-muted-foreground">Loading…</p>
            ) : rows.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                <Flame className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                No one has passed a lesson yet. Be the first!
              </div>
            ) : (
              <ul className="space-y-2">
                {rows.map((r) => <Row key={r.userId} row={r} />)}
              </ul>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

function Row({ row }: { row: LeaderboardRow }) {
  const medal = row.rank === 1 ? <Crown className="h-4 w-4 text-gold" /> : row.rank === 2 ? <Medal className="h-4 w-4 text-muted-foreground" /> : row.rank === 3 ? <Award className="h-4 w-4 text-amber-700" /> : null
  const initial = row.name.charAt(0).toUpperCase()
  const scorePct = row.scoreTotal ? Math.round((row.scoreSum / row.scoreTotal) * 100) : 0
  return (
    <li className={`flex items-center gap-3 rounded-xl border p-3 ${row.isMe ? "border-brand bg-brand-muted/40" : "border-border bg-card"}`}>
      <div className="flex w-8 items-center justify-center font-extrabold">
        {medal ?? <span className="text-muted-foreground">{row.rank}</span>}
      </div>
      <Avatar className="h-9 w-9">
        <AvatarImage src={row.image ?? undefined} alt="" />
        <AvatarFallback className="bg-brand text-xs font-bold text-brand-foreground">{initial}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">
          {row.name} {row.isMe && <span className="text-brand">(you)</span>}
        </div>
        <div className="text-[11px] text-muted-foreground">
          {row.lessonsPassed} lessons passed · {scorePct}% correct
        </div>
      </div>
      {row.streak > 0 && (
        <Badge className="gap-1 bg-gold/20 text-gold-foreground">
          <Flame className="h-3 w-3" /> {row.streak}d
        </Badge>
      )}
    </li>
  )
}
