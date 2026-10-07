"use client"

import { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search as SearchIcon, X, Clock, Lock, CheckCircle2, BookOpen } from "lucide-react"
import { useStore } from "@/lib/store"
import { useLessonsBundle, useProMe } from "./use-data"
import { usePick } from "./localize"
import { CategoryIcon } from "./icons"
import type { LessonListItemDTO } from "@/lib/types"

export function SearchDialog() {
  const open = useStore((s) => s.searchOpen)
  const setOpen = useStore((s) => s.setSearchOpen)
  const lang = useStore((s) => s.lang)
  const rtlFont = lang === "ur" ? "font-urdu" : lang === "ar" ? "font-arabic" : ""
  const pick = usePick()
  const openLesson = useStore((s) => s.openLesson)
  const setActiveCategory = useStore((s) => s.setActiveCategory)
  const { data } = useLessonsBundle("all")
  const { data: proMe } = useProMe()
  const isPro = proMe?.proStatus === "active"

  // Debounced search query — 300ms delay after user stops typing
  const [q, setQ] = useState("")
  const [debouncedQ, setDebouncedQ] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(timer)
  }, [q])

  // Reset search when dialog closes — use a guard to avoid setState-in-effect
  const [wasOpen, setWasOpen] = useState(open)
  if (wasOpen !== open) {
    setWasOpen(open)
    if (!open) { setQ(""); setDebouncedQ("") }
  }

  const all = data?.lessons ?? []

  // Filter results with debounce + Pro logic
  const results = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase()

    // Start with all lessons
    let filtered = all

    // Pro logic: hide Pro-only lessons from non-Pro users
    if (!isPro) {
      filtered = filtered.filter((l) => l.isFree)
    }

    // If no search term, show first 8 lessons (suggestions)
    if (!term) return filtered.slice(0, 8)

    // Real-time filtering — contains match (not exact)
    // Search in: title (all languages), summary, category slug, category name
    filtered = filtered.filter((l) => {
      const titleEn = l.title.en.toLowerCase()
      const titleLang = (l.title[lang] || "").toLowerCase()
      const summaryEn = l.summary.en.toLowerCase()
      const summaryLang = (l.summary[lang] || "").toLowerCase()
      const category = l.categorySlug.toLowerCase()

      return (
        titleEn.includes(term) ||
        titleLang.includes(term) ||
        summaryEn.includes(term) ||
        summaryLang.includes(term) ||
        category.includes(term)
      )
    })

    return filtered
  }, [debouncedQ, all, lang, isPro])

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
              placeholder="Type 2-3 letters… e.g. 'gol', 'can', 'sup'"
              className="h-11 ps-10 pe-9"
            />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* Hint text */}
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            {debouncedQ
              ? `${results.length} result${results.length !== 1 ? "s" : ""} for "${debouncedQ}"`
              : `Showing ${Math.min(8, all.filter(l => isPro || l.isFree).length)} lessons — start typing to search`}
          </p>
        </DialogHeader>

        {/* Suggestion list — native overflow for mobile scroll */}
        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: "60vh", WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}>
          <div className="p-3">
            {results.length === 0 ? (
              <div className="p-8 text-center">
                <SearchIcon className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {debouncedQ ? `No lessons match "${debouncedQ}"` : "No lessons available"}
                </p>
                {!isPro && (
                  <p className="mt-1 text-[10px] text-muted-foreground/60">
                    Pro lessons are hidden. Upgrade to see all 43 lessons.
                  </p>
                )}
              </div>
            ) : (
              <ul className="space-y-1.5">
                {results.map((l, i) => (
                  <motion.li
                    key={l.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: Math.min(i * 0.02, 0.15) }}
                  >
                    <button
                      onClick={() => onOpen(l)}
                      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-start transition hover:border-brand/50 hover:bg-muted/40"
                    >
                      {/* Lesson icon — category color */}
                      <span
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                        style={{ background: l.categoryColor || "var(--brand)" }}
                      >
                        <CategoryIcon name={l.categoryIcon} className="h-4 w-4" style={{ color: "#fff" }} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className={`truncate text-sm font-bold ${rtlFont}`}>{pick(l.title)}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{pick(l.summary)}</div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {/* Level badge — Beginner/Intermediate/Advanced */}
                        <Badge
                          variant="secondary"
                          className="capitalize text-[9px]"
                          style={l.categoryColor ? { background: `${l.categoryColor}20`, color: l.categoryColor } : undefined}
                        >
                          {l.categorySlug}
                        </Badge>
                        {/* Status icon — passed / locked / free */}
                        {l.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-brand" />
                        ) : !l.isFree ? (
                          <Lock className="h-3.5 w-3.5 text-gold" />
                        ) : null}
                      </div>
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
