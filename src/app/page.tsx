"use client"

import { motion } from "framer-motion"
import { Globe, CheckCircle2, Award, BookOpen } from "lucide-react"
import { useStore } from "@/lib/store"
import { LANGS } from "@/lib/i18n"
import { useLessonsBundle } from "@/components/tradeseekho/use-data"
import { Header } from "@/components/tradeseekho/header"
import { Hero } from "@/components/tradeseekho/hero"
import { CategoryCards, SectionHeading } from "@/components/tradeseekho/category-cards"
import { LessonGrid } from "@/components/tradeseekho/lesson-grid"
import { Footer } from "@/components/tradeseekho/footer"
import { Onboarding } from "@/components/tradeseekho/onboarding"
import { LessonReader } from "@/components/tradeseekho/lesson-reader"
import { BookmarksSheet } from "@/components/tradeseekho/bookmarks-sheet"
import { CertificateSheet } from "@/components/tradeseekho/certificate-sheet"
import { LoginDialog } from "@/components/tradeseekho/login-dialog"
import { AdminPanel } from "@/components/tradeseekho/admin-panel"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const activeCategory = useStore((s) => s.activeCategorySlug)
  const showAdmin = useStore((s) => s.showAdmin)
  const lang = useStore((s) => s.lang)
  const { data, isLoading } = useLessonsBundle(activeCategory)

  const lessons = data?.lessons ?? []
  const completedCount = lessons.filter((l) => l.passed).length
  const totalLessons = lessons.length

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {showAdmin ? (
          <AdminPanel />
        ) : (
          <>
            <Hero />

            {/* Progress strip */}
            <section className="mx-auto max-w-6xl px-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3"
              >
                <ProgressCard
                  icon={CheckCircle2}
                  value={`${completedCount}/${totalLessons}`}
                  label={lang === "ur" || lang === "ar" ? "اسباق مکمل" : lang === "hi" ? "पाठ पूर्ण" : "Lessons passed"}
                  color="var(--brand)"
                />
                <ProgressCard
                  icon={Award}
                  value={`${Math.round(totalLessons ? (completedCount / totalLessons) * 100 : 0)}%`}
                  label={lang === "ur" || lang === "ar" ? "مکمل" : lang === "hi" ? "प्रगति" : "Overall progress"}
                  color="var(--gold)"
                />
                <ProgressCard
                  icon={BookOpen}
                  value={`${totalLessons}`}
                  label={lang === "ur" || lang === "ar" ? "کل اسباق" : lang === "hi" ? "कुल पाठ" : "Total lessons"}
                  color="#00bfa5"
                />
              </motion.div>
            </section>

            {data && <CategoryCards categories={data.categories} />}

            {isLoading ? (
              <section className="mx-auto max-w-6xl px-4 py-10">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-2xl" />
                  ))}
                </div>
              </section>
            ) : (
              <LessonGrid lessons={lessons} />
            )}

            {/* Language showcase */}
            <section className="mx-auto max-w-6xl px-4 py-10">
              <div className={`overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand-muted/40 to-gold/10 p-6 sm:p-8 ${lang === "ur" || lang === "ar" ? "font-urdu" : ""}`}>
                <SectionHeading
                  title={lang === "ur" || lang === "ar" ? "اپنی زبان میں سیکھیں" : lang === "hi" ? "अपनी भाषा में सीखें" : "Learn in your language"}
                  subtitle={lang === "ur" || lang === "ar" ? "چار زبانیں، ایک پلیٹ فارم" : lang === "hi" ? "चार भाषाएँ, एक मंच" : "Four languages, one platform"}
                />
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.values(LANGS).map((m) => (
                    <div key={m.code} className="flex items-center gap-3 rounded-xl border border-border bg-background/70 p-3">
                      <Globe className={`h-5 w-5 text-brand ${m.dir === "rtl" ? "rtl:rotate-180" : ""}`} />
                      <div className={m.dir === "rtl" ? "font-urdu" : ""}>
                        <div className="text-sm font-bold">{m.native}</div>
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{m.label} · {m.dir.toUpperCase()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />

      {/* Overlays */}
      <Onboarding />
      <LessonReader />
      <BookmarksSheet />
      <CertificateSheet />
      <LoginDialog />
    </div>
  )
}

function ProgressCard({ icon: Icon, value, label, color }: { icon: any; value: string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ background: color }}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-xl font-extrabold leading-none">{value}</div>
        <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}
