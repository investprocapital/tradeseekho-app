"use client"

import { motion } from "framer-motion"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Award, Copy, Trophy, Sparkles, Download, Share2 } from "lucide-react"
import { useStore, useT } from "@/lib/store"
import { useCertificates } from "./use-data"
import { toast } from "sonner"

export function CertificateSheet() {
  const t = useT()
  const lang = useStore((s) => s.lang)
  const rtlFont = lang === "ur" ? "font-urdu" : lang === "ar" ? "font-arabic" : ""
  const urduFont = lang === "ur" || lang === "ar"
  const certOpen = useStore((s) => s.certOpen)
  const setCertOpen = useStore((s) => s.setCertOpen)
  const { data, isLoading } = useCertificates()
  const certs = data?.certificates ?? []

  return (
    <Sheet open={certOpen} onOpenChange={setCertOpen}>
      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="flex items-center gap-2 text-xl font-extrabold">
            <Award className="h-5 w-5 text-gold" /> Certificates
          </SheetTitle>
          <SheetDescription>Earn one by passing every lesson in a level.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="ts-scroll flex-1">
          <div className="space-y-4 p-4">
            {isLoading ? (
              <p className="p-6 text-sm text-muted-foreground">{t("common.loading")}</p>
            ) : certs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-10 text-center">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold/15">
                  <Trophy className="h-8 w-8 text-gold" />
                </span>
                <p className="text-sm text-muted-foreground">
                  No certificates yet. Pass every lesson in a level to earn one.
                </p>
              </div>
            ) : (
              certs.map((c) => <CertificateCard key={c.id} cert={c} urduFont={urduFont} />)
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

function CertificateCard({
  cert,
  urduFont,
}: {
  cert: {
    id: string
    categorySlug: string
    userName: string
    lessonsPassed: number
    totalLessons: number
    scoreSum: number
    scoreTotal: number
    verificationId: string
    issuedAt: string
  }
  urduFont: boolean
}) {
  const lang = useStore((s) => s.lang)
  const rtlFont = lang === "ur" ? "font-urdu" : lang === "ar" ? "font-arabic" : ""
  const pct = cert.scoreTotal ? Math.round((cert.scoreSum / cert.scoreTotal) * 100) : 0
  const date = new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-gold/10 via-card to-brand-muted/30"
    >
      {/* Seal header */}
      <div className="flex items-center justify-between border-b border-gold/30 bg-gold/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold text-gold-foreground shadow">
            <Award className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-foreground/80">TradeSeekho PK</div>
            <div className="text-xs font-bold capitalize">{cert.categorySlug} Level</div>
          </div>
        </div>
        <Badge className="bg-brand text-brand-foreground">Passed {cert.lessonsPassed}/{cert.totalLessons}</Badge>
      </div>

      {/* Body */}
      <div className={`p-4 ${rtlFont}`}>
        <p className="text-center text-[11px] uppercase tracking-wide text-muted-foreground">This certifies that</p>
        <h3 className="mt-1 text-center text-xl font-extrabold text-foreground">{cert.userName}</h3>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          has successfully completed the <span className="font-bold capitalize text-foreground">{cert.categorySlug}</span> level
          of the TradeSeekho PK Forex &amp; Crypto learning program.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Score" value={`${pct}%`} />
          <Stat label="Correct" value={`${cert.scoreSum}/${cert.scoreTotal}`} />
          <Stat label="Date" value={date} />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Verification ID</div>
            <code className="font-mono text-sm font-bold text-brand">{cert.verificationId}</code>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              navigator.clipboard?.writeText(cert.verificationId)
              toast.success("Verification ID copied")
            }}
          >
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
        </div>

        {/* Download + Share buttons */}
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            className="h-9 flex-1 gap-1.5 bg-brand font-bold text-brand-foreground hover:bg-brand/90"
            onClick={() => downloadCertificateHTML(cert, pct, date)}
          >
            <Download className="h-3.5 w-3.5" /> Download PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 flex-1 gap-1.5 font-bold"
            onClick={() => shareOnWhatsApp(cert, pct, date)}
          >
            <Share2 className="h-3.5 w-3.5" /> Share on WhatsApp
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function downloadCertificateHTML(cert: any, pct: number, date: string) {
  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Certificate - ${cert.categorySlug}</title>
<style>
body{margin:0;padding:40px;background:#0A1929;font-family:Arial,sans-serif}
.cert{max-width:600px;margin:0 auto;background:linear-gradient(135deg,#0A1929,#050D17);border:3px solid #FFC107;border-radius:20px;padding:40px;color:#fff;text-align:center}
.seal{width:60px;height:60px;background:#FFC107;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:30px}
h1{font-size:24px;margin:10px 0} h2{font-size:20px;color:#00D09C}
.stats{display:flex;justify-content:center;gap:30px;margin:20px 0}
.stat{text-align:center} .stat-val{font-size:22px;font-weight:bold;color:#FFC107} .stat-lbl{font-size:11px;color:#888}
.vid{font-family:monospace;font-size:14px;color:#00D09C;margin-top:20px}
.brand{font-size:11px;color:#666;letter-spacing:3px;margin-top:10px}
</style></head><body>
<div class="cert">
<div class="seal">🏆</div>
<div class="brand">TRADESEEKHO PK</div>
<h1>Certificate of Completion</h1>
<p>This certifies that</p>
<h2>${cert.userName}</h2>
<p>has successfully completed the <b style="text-transform:capitalize">${cert.categorySlug}</b> level<br>of the TradeSeekho PK Forex & Crypto Learning Program</p>
<div class="stats">
<div class="stat"><div class="stat-val">${pct}%</div><div class="stat-lbl">SCORE</div></div>
<div class="stat"><div class="stat-val">${cert.scoreSum}/${cert.scoreTotal}</div><div class="stat-lbl">CORRECT</div></div>
<div class="stat"><div class="stat-val">${cert.lessonsPassed}/${cert.totalLessons}</div><div class="stat-lbl">LESSONS</div></div>
</div>
<p style="color:#888;font-size:12px">Issued: ${date}</p>
<div class="vid">Verification ID: ${cert.verificationId}</div>
<div class="brand">LEARN • TRADE • GROW</div>
</div></body></html>`
  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `TradeSeekho-PK-${cert.categorySlug}-Certificate.html`
  a.click()
  URL.revokeObjectURL(url)
  toast.success("Certificate downloaded! Open and print to PDF.")
}

function shareOnWhatsApp(cert: any, pct: number, date: string) {
  const text = `🎓 I earned a certificate from TradeSeekho PK!\n\n🏆 ${cert.categorySlug.toUpperCase()} Level Complete\n✅ Score: ${pct}% (${cert.scoreSum}/${cert.scoreTotal} correct)\n📅 Date: ${date}\n🆔 Verification ID: ${cert.verificationId}\n\nJoin TradeSeekho PK to learn Forex & Crypto trading!\n🌐 https://tradeseekho-app.vercel.app`
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`
  window.open(url, "_blank")
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/60 p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-bold text-foreground">{value}</div>
    </div>
  )
}

function Separator() {
  return <div className="my-3 h-px w-full bg-gold/30" />
}
