"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search as SearchIcon, X, Clock, Lock, CheckCircle2 } from "lucide-react"
import { useStore } from "@/lib/store"
import { useLessonsBundle } from "./use-data"
import { usePick } from "./localize"
import type { LessonListItemDTO } from "@/lib/types"

export function SearchDialog() {
  const open = useStore((s) => s.searchOpen)
  const setOpen = useStore((s) => s.setSearchOpen)
  const lang = useStore((s) => s.lang)
  const urduFont = lang === "ur" || lang === "ar"
  const pick = usePick()
  const openLesson = useStore((s) => s.openLesson)
  const setActiveCategory = useStore((s) => s.setActiveCategory)
  const { data } = useLessonsBundle("all")
  const [q, setQ] = useState("")

  const all = data?.lessons ?? []
  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return all.slice(0, 6)
    return all.filter((l) => {
      const title = l.title[lang].toLowerCase() || l.title.en.toLowerCase()
      const summary = l.summary[lang].toLowerCase() || l.summary.en.toLowerCase()
      return title.includes(term) || summary.includes(term) || l.categorySlug.includes(term)
    })
  }, [q, all, lang])

  const onOpen = (l: LessonListItemDTO) => {
    setOpen(false)
    setActiveCategory("all")
    openLesson(l.id)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-border p-4">
          <DialogTitle className="flex items-center gap-2 text-base font-extrabold">
            <SearchIcon className="h-4 w-4 text-brand" /> Search lessons
          </DialogTitle>
          <div className="relative mt-2">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, topic or level…"
              className="h-11 ps-10 pe-9"
            />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </DialogHeader>
        <ScrollArea className="ts-scroll max-h-[60vh]">
          <div className="p-3">
            {results.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">No lessons match “{q}”.</p>
            ) : (
              <ul className="space-y-1.5">
                {results.map((l, i) => (
                  <motion.li
                    key={l.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.2) }}
                  >
                    <button
                      onClick={() => onOpen(l)}
                      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-start transition hover:border-brand/50 hover:bg-muted/40"
                    >
                      <span
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                        style={{ background: l.categoryColor || "var(--brand)" }}
                      >
                        <Clock className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className={`truncate text-sm font-bold ${urduFont ? "font-urdu" : ""}`}>{pick(l.title)}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{pick(l.summary)}</div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Badge variant="secondary" className="capitalize">{l.categorySlug}</Badge>
                        {l.passed ? <CheckCircle2 className="h-4 w-4 text-brand" />
                          : l.orderInCategory > 1 && !l.passed ? <Lock className="h-4 w-4 text-muted-foreground" /> : null}
                      </div>
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
