"use client"

import { useTheme } from "next-themes"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell, Shield, Moon, Sun, User as UserIcon, Award, Bookmark, Languages, Trophy, ChevronRight, BookOpen, Mail, FileText, Info, Check } from "lucide-react"
import { useStore } from "@/lib/store"
import { useCertificates } from "./use-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Download } from "lucide-react"
import { toast } from "sonner"
import { LANG_ORDER, LANGS } from "@/lib/i18n"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export function SettingsSheet() {
  const open = useStore((s) => s.settingsOpen)
  const setOpen = useStore((s) => s.setSettingsOpen)
  const setEditProfileOpen = useStore((s) => s.setEditProfileOpen)
  const setBookmarksOpen = useStore((s) => s.setBookmarksOpen)
  const setLeaderboardOpen = useStore((s) => s.setLeaderboardOpen)
  const setCertOpen = useStore((s) => s.setCertOpen)
  const setPriceAlertsOpen = useStore((s) => s.setPriceAlertsOpen)
  const { theme, setTheme } = useTheme()
  const { data: certData } = useCertificates()
  const certs = certData?.certificates ?? []
  const lang = useStore((s) => s.lang)
  const setLang = useStore((s) => s.setLang)
  const bookmarksCount = useStore((s) => s.bookmarks.length)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="flex items-center gap-2 text-xl font-extrabold">
            <Shield className="h-5 w-5 text-brand" /> Settings
          </SheetTitle>
          <SheetDescription>Account, preferences, trading tools & support.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: "touch", minHeight: 0, touchAction: "pan-y" }}>
          <div className="space-y-1 p-4">

            {/* ACCOUNT */}
            <Section title="Account">
              <Row icon={UserIcon} label="Edit profile" hint="Change name & password"
                onClick={() => { setOpen(false); setEditProfileOpen(true) }} />
              <Row icon={Bookmark} label="My Bookmarks" hint={bookmarksCount > 0 ? `${bookmarksCount} saved` : "No bookmarks yet"}
                onClick={() => { setOpen(false); setBookmarksOpen(true) }} />
              <Row icon={Trophy} label="Leaderboard" hint="View rankings"
                onClick={() => { setOpen(false); setLeaderboardOpen(true) }} />
              <Row icon={Award} label="Certificates" hint={certs.length > 0 ? `${certs.length} earned` : "No certificates yet"}
                onClick={() => { setOpen(false); setCertOpen(true) }} />
            </Section>

            <Separator className="my-3" />

            {/* APP PREFERENCES */}
            <Section title="App Preferences">
              {/* Language */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition hover:bg-muted/40">
                    <Languages className="h-4 w-4 text-brand" />
                    <span className="flex-1 text-start">App Language</span>
                    <span className="text-[11px] text-muted-foreground">{LANGS[lang].label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                    Language / زبان / भाषा / لغة
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {LANG_ORDER.map((code) => (
                    <DropdownMenuItem key={code} onSelect={(e) => { e.preventDefault(); setLang(code) }} className="gap-2">
                      <span className={LANGS[code].dir === "rtl" ? "font-urdu text-base" : ""}>
                        {LANGS[code].native}
                      </span>
                      {lang === code && <Check className="ms-auto h-4 w-4 text-brand" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Theme */}
              <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm font-bold">
                  {theme === "dark" ? <Moon className="h-4 w-4 text-brand" /> : <Sun className="h-4 w-4 text-brand" />}
                  Dark theme
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
              </div>
            </Section>

            <Separator className="my-3" />

            {/* TRADING TOOLS */}
            <Section title="Trading Tools">
              <Row icon={Bell} label="Price Alerts" hint="Set price notifications"
                onClick={() => { setOpen(false); setPriceAlertsOpen(true) }} />
            </Section>

            <Separator className="my-3" />

            {/* SUPPORT */}
            <Section title="Support">
              <Row icon={Info} label="About Us" onClick={() => { setOpen(false); window.open("/about-us", "_self") }} />
              <Row icon={FileText} label="Privacy Policy" onClick={() => { setOpen(false); window.open("/privacy-policy", "_self") }} />
              <Row icon={Mail} label="Contact Us" onClick={() => { setOpen(false); window.open("/contact-us", "_self") }} />
            </Section>

            <Separator className="my-3" />

            {/* My Certificates */}
            <Section title="My Certificates / میری اسناد">
              {certs.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
                    <Award className="h-6 w-6 text-gold" />
                  </span>
                  <p className="mt-2 text-xs text-muted-foreground">No certificates yet. Complete a level to earn one!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {certs.map((c) => {
                    const pct = c.scoreTotal ? Math.round((c.scoreSum / c.scoreTotal) * 100) : 0
                    const date = new Date(c.issuedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    return (
                      <div key={c.id} className="rounded-xl border-2 border-gold/30 bg-gradient-to-br from-gold/5 to-card p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold text-gold-foreground">
                              <Award className="h-4 w-4" />
                            </span>
                            <div>
                              <div className="text-sm font-bold capitalize">{c.categorySlug} Level</div>
                              <div className="text-[10px] text-muted-foreground">{date}</div>
                            </div>
                          </div>
                          <Badge className="bg-brand text-brand-foreground">{pct}%</Badge>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <code className="font-mono text-[10px] text-muted-foreground">{c.verificationId}</code>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-[10px]" onClick={() => { navigator.clipboard?.writeText(c.verificationId); toast.success("Copied!") }}>
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-[10px]" onClick={() => downloadCertificate(c, pct, date)}>
                              <Download className="h-3 w-3" /> Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Section>

            <Separator className="my-3" />

            {/* Theme */}
            <Section title="Appearance">
              <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm font-bold">
                  {theme === "dark" ? <Moon className="h-4 w-4 text-brand" /> : <Sun className="h-4 w-4 text-brand" />}
                  Dark theme
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
              </div>
            </Section>

            <Separator className="my-3" />

            {/* Notifications */}
            <Section title="Notifications">
              <Toggle icon={Bell} label="Quiz results" defaultChecked />
              <Toggle icon={Bell} label="New lessons" defaultChecked />
              <Toggle icon={Bell} label="Market signals" defaultChecked />
            </Section>

            <Separator className="my-3" />

            {/* Privacy */}
            <Section title="Privacy">
              <Row icon={Shield} label="Progress sharing" hint="Show me on the leaderboard" />
              <Row icon={Shield} label="Analytics" hint="Anonymous usage helps improve the app" />
            </Section>

            <div className="px-3 py-4 text-center text-[11px] text-muted-foreground">
              TradeSeekho PK v1.0 · Made for learners
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function downloadCertificate(cert: any, pct: number, date: string) {
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
  toast.success("Certificate downloaded!")
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}

function Row({ icon: Icon, label, hint, onClick }: { icon: any; label: string; hint?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex h-full w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start transition hover:bg-muted/40">
      <Icon className="h-4 w-4 text-brand" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold">{label}</div>
        {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
      </div>
    </button>
  )
}

function Toggle({ icon: Icon, label, defaultChecked }: { icon: any; label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-2 text-sm font-bold">
        <Icon className="h-4 w-4 text-brand" /> {label}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}
