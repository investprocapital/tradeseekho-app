"use client"

import { Megaphone, Github, Heart } from "lucide-react"
import { useStore, useT } from "@/lib/store"
import { useAdSettings } from "./use-data"
import { LANGS } from "@/lib/i18n"

export function Footer() {
  const t = useT()
  const lang = useStore((s) => s.lang)
  const urduFont = lang === "ur" || lang === "ar"
  const { data: ads } = useAdSettings()
  const showBanner = ads?.bannerEnabled ?? true

  return (
    <footer className="mt-auto border-t border-border bg-card">
      {/* AdMob banner (when enabled) */}
      {showBanner && (
        <div className="flex items-center justify-between gap-3 bg-foreground/[0.04] px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gold/20 text-gold">
              <Megaphone className="h-4 w-4" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-bold text-foreground">TradeSeekho Pro — unlock all lessons</p>
              <p className="truncate text-[10px] text-muted-foreground">{t("footer.ad")} · AdMob Banner</p>
            </div>
          </div>
          <button className="shrink-0 rounded-full bg-brand px-3 py-1 text-[11px] font-bold text-brand-foreground">
            Get Pro
          </button>
        </div>
      )}

      {/* Main footer */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ${urduFont ? "font-urdu" : ""}`}>
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground font-bold">
                ₸
              </span>
              <span className="text-base font-extrabold">
                Trade<span className="text-brand">Seekho</span>
              </span>
            </div>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t("app.subtitle")}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Heart className="h-3.5 w-3.5 text-brand" /> {t("footer.madeWith")}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-foreground">{t("nav.lessons")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Beginner</li>
              <li>Intermediate</li>
              <li>Advanced</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-foreground">{t("home.langSection")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {Object.values(LANGS).map((m) => (
                <li key={m.code} className={m.dir === "rtl" ? "font-urdu" : ""}>{m.native}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-5 sm:flex-row">
          <p className="text-xs text-muted-foreground">{t("footer.rights", { year: String(new Date().getFullYear()) })}</p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-brand"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
