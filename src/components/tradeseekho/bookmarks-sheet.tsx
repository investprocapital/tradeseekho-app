"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Bookmark, BookOpen, Clock } from "lucide-react"
import { useStore, useT } from "@/lib/store"
import { useBookmarks } from "./use-data"
import { usePick } from "./localize"

export function BookmarksSheet() {
  const t = useT()
  const pick = usePick()
  const lang = useStore((s) => s.lang)
  const rtlFont = lang === "ur" ? "font-urdu" : lang === "ar" ? "font-arabic" : ""
  const bookmarksOpen = useStore((s) => s.bookmarksOpen)
  const setBookmarksOpen = useStore((s) => s.setBookmarksOpen)
  const openLesson = useStore((s) => s.openLesson)
  const { data, isLoading } = useBookmarks()
  const list = data?.bookmarks ?? []

  const onOpen = (id: string) => {
    setBookmarksOpen(false)
    openLesson(id)
  }

  return (
    <Sheet open={bookmarksOpen} onOpenChange={setBookmarksOpen}>
      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="flex items-center gap-2 text-xl font-extrabold">
            <Bookmark className="h-5 w-5 fill-gold text-gold" /> Saved / Wishlist
          </SheetTitle>
          <SheetDescription>
            {list.length} saved lesson{list.length === 1 ? "" : "s"}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="ts-scroll flex-1">
          <div className="p-4">
            {isLoading ? (
              <p className="p-6 text-sm text-muted-foreground">{t("common.loading")}</p>
            ) : list.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-10 text-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <BookOpen className="h-7 w-7 text-muted-foreground" />
                </span>
                <p className="text-sm text-muted-foreground">{t("common.empty")}</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {list.map((l) => (
                  <li key={l.id}>
                    <button
                      onClick={() => onOpen(l.id)}
                      className="flex h-full w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-start transition hover:border-brand/50 hover:bg-muted/40"
                    >
                      <span
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
                        style={{ background: l.categoryColor || "var(--brand)" }}
                      >
                        <BookOpen className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className={`line-clamp-1 text-sm font-bold text-foreground ${rtlFont}`}>
                          {pick(l.title)}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="uppercase">{l.categorySlug}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-0.5">
                            <Clock className="h-3 w-3" /> {t("lesson.duration", { n: l.durationMin })}
                          </span>
                        </div>
                      </div>
                      {l.passed && <Bookmark className="h-4 w-4 text-brand" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
