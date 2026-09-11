"use client"

import { useStore } from "@/lib/store"
import type { LocalizedText } from "@/lib/types"
import type { Lang } from "@/lib/i18n"

export function usePick() {
  const lang = useStore((s) => s.lang)
  return (t: LocalizedText | undefined | null) => (t ? t[lang] || t.en || "" : "")
}

export function pick(t: LocalizedText | undefined | null, lang: Lang) {
  return t ? t[lang] || t.en || "" : ""
}
