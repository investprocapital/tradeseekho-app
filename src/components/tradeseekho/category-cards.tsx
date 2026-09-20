"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useStore, useT } from "@/lib/store"
import { usePick } from "./localize"
import { CategoryIcon } from "./icons"
import type { CategoryDTO } from "@/lib/types"

export function CategoryCards({ categories }: { categories: CategoryDTO[] }) {
  const t = useT()
  const pick = usePick()
  const active = useStore((s) => s.activeCategorySlug)
  const setActive = useStore((s) => s.setActiveCategory)

  return (
    <section id="categories" className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading title={t("home.categoriesTitle")} subtitle={t("home.categoriesSubtitle")} />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, i) => {
          const isActive = active === c.slug
          return (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              onClick={() => setActive(isActive ? "all" : c.slug)}
              className={`ts-card-sheen group relative overflow-hidden rounded-2xl border-2 p-5 text-start transition-all hover:-translate-y-1 ${
                isActive ? "border-brand bg-brand-muted/50" : "border-border bg-card hover:border-brand/50"
              }`}
            >
              <div
                className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-15 blur-2xl"
                style={{ background: c.color || "var(--brand)" }}
              />
              <div className="relative flex items-start gap-4">
                <span
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
                  style={{ background: c.color || "var(--brand)" }}
                >
                  <CategoryIcon name={c.icon} className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <h3 className={`text-lg font-bold ${t ? "" : ""}`}>{pick(c.name)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{pick(c.description)}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {isActive ? "✓ Selected" : "Tap to filter"}
                </span>
                <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1 rtl:rotate-180" />
              </div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  const lang = useStore((s) => s.lang)
  return (
    <div className={lang === "ur" ? "font-urdu" : lang === "ar" ? "font-arabic" : ""}>
      <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
    </div>
  )
}
