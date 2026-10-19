"use client"

import { useRef, useState, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Crown, Copy, Upload, Loader2, AlertCircle, CheckCircle2, Clock, Smartphone, Image as ImageIcon, CreditCard, Globe, Coins, Share2, Download } from "lucide-react"
import { useStore, useT } from "@/lib/store"
import { useProMe, useSubmitProRequest } from "./use-data"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"
import QRCode from "qrcode"

interface ProSettings {
  usdPrice: number
  pkrRate: number
  pkrPrice: number
  jazzcashNumber: string
  easypaisaNumber: string
  cardEnabled: boolean
  cardInstructions: string
  sadapayEnabled: boolean
  sadapayName: string
  sadapayNumber: string
  sadapayIban: string
  usdtEnabled: boolean
  usdtAddress: string
  bep20Enabled: boolean
  bep20Address: string
  payoneerEnabled: boolean
  payoneerEmail: string
  payoneerInstructions: string
}

async function fetchProSettings(): Promise<ProSettings> {
  const res = await fetch("/api/pro/settings")
  if (!res.ok) throw new Error("failed")
  return res.json()
}

type Method = "JazzCash" | "Easypaisa" | "Card" | "SadaPay" | "USDT" | "USDT_BEP20" | "Payoneer"

export function ProDialog() {
  const open = useStore((s) => s.proOpen)
  const setOpen = useStore((s) => s.setProOpen)
  const proPlan = useStore((s) => s.proPlan) // which plan client is buying (from store context)
  const setLoginOpen = useStore((s) => s.setLoginOpen)
  const t = useT()
  const lang = useStore((s) => s.lang)
  const rtlFont = lang === "ur" ? "font-urdu" : lang === "ar" ? "font-arabic" : ""
  const { data: session } = useSession()
  const { data: proMe, isLoading } = useProMe()
  const submit = useSubmitProRequest()
  const { data: settings } = useQuery<ProSettings>({
    queryKey: ["pro-settings"],
    queryFn: fetchProSettings,
    staleTime: 60_000,
  })

  const [method, setMethod] = useState<Method>("JazzCash")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const isPro = proMe?.proStatus === "active"
  const isPending = proMe?.proStatus === "pending"
  // Check if user already has the specific plan they're trying to buy
  const currentPlans = proMe?.proPlans ?? ""
  const alreadyHasThisPlan = proPlan ? currentPlans.includes(proPlan) : false

  const usdPrice = settings?.usdPrice ?? 5
  const pkrRate = settings?.pkrRate ?? 280
  const pkrPrice = settings?.pkrPrice ?? Math.round(usdPrice * pkrRate)
  const displayAmount = amount || String(pkrPrice)

  const methods: { id: Method; label: string; color: string; accent: string; icon: any; subtitle?: string }[] = [
    { id: "JazzCash", label: "JazzCash", color: "#ED1C24", accent: "bg-[#ED1C24]", icon: Smartphone },
    { id: "Easypaisa", label: "Easypaisa", color: "#00B14F", accent: "bg-[#00B14F]", icon: Smartphone },
  ]
  if (settings?.cardEnabled !== false) {
    methods.push({ id: "Card", label: "Visa / Debit Card", color: "#1A1F71", accent: "bg-[#1A1F71]", icon: CreditCard })
  }
  if (settings?.sadapayEnabled !== false) {
    methods.push({ id: "SadaPay", label: "SadaPay", color: "#6C2BD9", accent: "bg-[#6C2BD9]", icon: Globe, subtitle: "For International / Worldwide Clients" })
  }
  if (settings?.usdtEnabled !== false) {
    methods.push({ id: "USDT", label: "USDT TRC20 (Binance)", color: "#26A17B", accent: "bg-[#26A17B]", icon: Coins, subtitle: "Crypto · Tron Network" })
  }
  if (settings?.bep20Enabled !== false) {
    methods.push({ id: "USDT_BEP20", label: "USDT BEP20 (BSC) · NEW", color: "#F3BA2F", accent: "bg-[#F3BA2F]", icon: Coins, subtitle: "Crypto · BNB Smart Chain" })
  }
  if (settings?.payoneerEnabled !== false && settings?.payoneerEmail) {
    methods.push({ id: "Payoneer", label: "Payoneer · NEW", color: "#FF4800", accent: "bg-[#FF4800]", icon: Coins, subtitle: "Email Transfer" })
  }

  const currentNumber = method === "JazzCash" ? settings?.jazzcashNumber : method === "Easypaisa" ? settings?.easypaisaNumber : ""

  // Resolve which crypto address/network to show based on method
  const cryptoCtx = method === "USDT"
    ? { address: settings?.usdtAddress || "", network: "TRC20 / Tron", color: "#26A17B", sectionTitle: t("pro.usdtSectionTitle"), warning: t("pro.usdtWarning"), shareLabel: "TradeSeekho PK · USDT TRC20" }
    : method === "USDT_BEP20"
    ? { address: settings?.bep20Address || "0xaa889030e6e69ef3eb55a2e94f1226628a8a19c3", network: t("pro.bep20Network"), color: "#F3BA2F", sectionTitle: t("pro.bep20SectionTitle"), warning: t("pro.bep20Warning"), shareLabel: "TradeSeekho PK · USDT BEP20 (BSC)" }
    : method === "Payoneer"
    ? { address: settings?.payoneerEmail || "", network: "Payoneer Email Transfer", color: "#FF4800", sectionTitle: "Payoneer · Email Transfer", warning: "⚠ Only send to this Payoneer Email. After sending, upload screenshot and Payoneer Transaction ID is mandatory.", shareLabel: "TradeSeekho PK · Payoneer" }
    : null

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith("image/")) { setErr("Please select an image file."); return }
    if (f.size > 4 * 1024 * 1024) { setErr("Max 4MB."); return }
    setFile(f)
    setFilePreview(URL.createObjectURL(f))
    setErr(null)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!session?.user) {
      setOpen(false)
      setLoginOpen(true)
      return
    }
    if (method !== "Card" && !file) { setErr("Please upload a payment screenshot."); return }
    const isCrypto = method === "USDT" || method === "USDT_BEP20"
    const isPayoneer = method === "Payoneer"
    const needsTxId = isCrypto || isPayoneer
    if (needsTxId && !note.trim()) {
      setErr(isPayoneer
        ? "Please enter your Payoneer Transaction ID."
        : "Please paste your Transaction Hash / TxID for the crypto payment.")
      return
    }
    try {
      // For crypto/Payoneer: send txHash SEPARATELY from note (so admin can verify)
      const txHash = needsTxId ? note.trim() : undefined
      // planType: from store context (which page client came from)
      // alerts = Price Alerts page, lessons = locked lesson, signals = signals page
      const planType = proPlan || "alerts" // default to alerts if not set
      await submit.mutateAsync({ method, amount: Number(displayAmount) || 0, note: needsTxId ? "" : note, txHash, planType, file })
      toast.success("Payment submitted!", { description: "We'll review and activate Pro within 24h." })
      setFile(null); setFilePreview(null); setNote("")
    } catch (e2: any) {
      const msg = e2?.message || ""
      if (msg.includes("already_pro")) setErr("You're already Pro.")
      else if (msg.includes("unauthorized")) setErr("Please sign in first.")
      else if (msg.includes("txid_required")) setErr("Transaction Hash / TxID is required for crypto payments.")
      else if (msg.includes("txid_invalid")) setErr("Invalid Tx Hash format. BSC/ETH: 0x + 64 hex chars (66 total). Tron: 64 hex chars.")
      else if (msg.includes("bad_method")) setErr("Invalid payment method. Please refresh and try again.")
      else if (msg.includes("no_file")) setErr("Please upload a payment screenshot.")
      else if (msg.includes("not_image")) setErr("Please select an image file (JPG/PNG).")
      else if (msg.includes("too_large")) setErr("Image too large. Max 5MB.")
      else setErr("Submission failed. Try again.")
    }
  }

  const copy = (text: string) => {
    if (!text) return
    navigator.clipboard?.writeText(text)
    toast.success("Copied: " + text)
  }

  // Save & Share: generate QR PNG, then try Web Share API with files; fallback to download.
  const saveAndShare = useCallback(async () => {
    if (!cryptoCtx?.address) return
    setSharing(true)
    try {
      const dataUrl = await QRCode.toDataURL(cryptoCtx.address, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 480,
        color: { dark: "#0b0f17", light: "#ffffff" },
      })
      const shareText = `${cryptoCtx.shareLabel}\nNetwork: ${cryptoCtx.network}\nAddress: ${cryptoCtx.address}\n\nSend only via the ${cryptoCtx.network} network.`
      // Try Web Share API with file
      if (typeof navigator !== "undefined" && (navigator as any).canShare) {
        try {
          const resp = await fetch(dataUrl)
          const blob = await resp.blob()
          const file = new File([blob], "tradeseekho-deposit-qr.png", { type: "image/png" })
          if ((navigator as any).canShare({ files: [file] })) {
            await (navigator as any).share({ files: [file], title: cryptoCtx.shareLabel, text: shareText })
            setSharing(false)
            return
          }
        } catch {
          // fall through to download
        }
      }
      // Fallback: download the PNG + copy address
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = "tradeseekho-deposit-qr.png"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      navigator.clipboard?.writeText(cryptoCtx.address)
      toast.success("QR image saved. Address copied to clipboard.")
    } catch (e) {
      toast.error("Could not generate QR image.")
    } finally {
      setSharing(false)
    }
  }, [cryptoCtx])

  return (
    <Dialog open={open} onOpenChange={(v) => !submit.isPending && setOpen(v)}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto p-0">
        <DialogHeader className="border-b border-border bg-gradient-to-br from-gold/15 to-brand-muted/30 p-5">
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
            <Crown className="h-5 w-5 text-gold" /> TradeSeekho PK Pro
            {proPlan && (
              <Badge className={
                proPlan === "alerts" ? "bg-amber-500/15 text-amber-600"
                : proPlan === "lessons" ? "bg-blue-500/15 text-blue-500"
                : proPlan === "signals" ? "bg-purple-500/15 text-purple-500"
                : "bg-muted text-muted-foreground"
              }>
                {proPlan === "alerts" ? "Alerts Plan" : proPlan === "lessons" ? "Lessons Plan" : proPlan === "signals" ? "Signals Plan" : proPlan}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Unlock all lessons, ad-free experience & certificates.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5">
          {/* Already has this specific plan */}
          {isPro && alreadyHasThisPlan ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
                <CheckCircle2 className="h-8 w-8 text-gold" />
              </span>
              <h3 className="text-lg font-extrabold text-foreground">
                {proPlan === "alerts" ? "Alerts Plan Active! 🎉" : proPlan === "lessons" ? "Lessons Plan Active! 🎉" : proPlan === "signals" ? "Signals Plan Active! 🎉" : "Plan Active! 🎉"}
              </h3>
              <p className="text-sm text-muted-foreground">
                You already have this plan. Your current plans: {currentPlans.split(",").join(", ")}
              </p>
              <p className="text-xs text-muted-foreground">Buy another plan if you want to unlock more features.</p>
            </div>
          ) : isPro && !alreadyHasThisPlan ? (
            /* Has SOME pro plan but not THIS one — show payment form for the missing plan */
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="flex items-start gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 p-3 text-xs">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <span>You have: <b>{currentPlans.split(",").join(", ")}</b>. Buy the <b>{proPlan}</b> plan to unlock more features.</span>
              </div>
              {/* Sign-in gate */}
              {!session?.user && (
                <div className="flex items-start gap-2 rounded-lg border border-gold/40 bg-gold/10 p-3 text-xs">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>Please <button type="button" className="font-bold text-gold underline" onClick={() => { setOpen(false); setLoginOpen(true) }}>sign in</button> first so we can link your payment to your account.</span>
                </div>
              )}
              {/* Price */}
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="text-3xl font-extrabold text-foreground">${usdPrice}<span className="text-sm font-medium text-muted-foreground"> USD</span></div>
                <div className="mt-1 text-sm font-bold text-brand">≈ Rs {pkrPrice} PKR</div>
                <p className="mt-1 text-[11px] text-muted-foreground">One-time payment • Lifetime access • No auto-renewal</p>
              </div>
              {/* Method selection */}
              <div>
                <Label className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted-foreground">1. Choose payment method</Label>
                <div className={`grid gap-2 ${methods.length > 2 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {methods.map((m) => {
                    const Icon = m.icon
                    return (
                      <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                        className={`flex items-center gap-2 rounded-xl border-2 p-3 text-start transition ${method === m.id ? "border-brand bg-brand-muted/40" : "border-border hover:bg-muted/40"}`}>
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-white ${m.accent}`}><Icon className="h-4 w-4" /></span>
                        <div><div className="text-sm font-bold">{m.label}</div>{m.subtitle ? <div className="text-[9px] text-muted-foreground">{m.subtitle}</div> : <div className="text-[10px] text-muted-foreground">Tap to select</div>}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
              {/* Screenshot upload */}
              {method !== "Card" && (
                <div>
                  <Label className={`mb-2 block text-xs font-bold uppercase tracking-wide text-muted-foreground ${rtlFont}`}>2. {t("pro.uploadScreenshot")}</Label>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                  {filePreview ? (
                    <div className="relative overflow-hidden rounded-xl border border-border">
                      <img src={filePreview} alt="screenshot" className="h-40 w-full object-cover" />
                      <button type="button" onClick={() => { setFile(null); setFilePreview(null) }} className="absolute right-2 top-2 rounded-full bg-foreground/80 px-2 py-0.5 text-xs font-bold text-background">Change</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-6 text-center transition hover:border-brand/50 hover:bg-muted/50">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      <span className={`text-sm font-bold ${rtlFont}`}>{t("pro.tapToUpload")}</span>
                      <span className="text-[10px] text-muted-foreground">JPG/PNG • max 4MB</span>
                    </button>
                  )}
                </div>
              )}
              {/* Note / TxID */}
              <div className="space-y-1.5">
                <Label htmlFor="note" className={rtlFont}>
                  {method === "Payoneer" ? "Payoneer Transaction ID" : t("pro.txIdNote")}
                  {(method === "USDT" || method === "USDT_BEP20" || method === "Payoneer") && <span className="font-bold text-destructive">{t("pro.txIdRequired")}</span>}
                </Label>
                <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                  placeholder={method === "Payoneer" ? "Enter your Payoneer Transaction ID here (required)" : (method === "USDT" || method === "USDT_BEP20") ? t("pro.txIdPlaceholderUsdt") : t("pro.txIdPlaceholderOther")}
                  className="text-sm" />
              </div>
              {err && <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive"><AlertCircle className="h-3.5 w-3.5" /> {err}</p>}
              <Button type="submit" className="h-12 w-full gap-2 bg-brand font-bold text-brand-foreground hover:bg-brand/90" disabled={submit.isPending}>
                {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Submit for approval
              </Button>
              <p className="text-center text-[10px] text-muted-foreground">Pro activates after admin approves your payment (usually within 24h).</p>
            </form>
          ) : isPending ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold/15">
                <Clock className="h-8 w-8 text-gold" />
              </span>
              <h3 className="text-lg font-extrabold text-foreground">Payment under review ⏳</h3>
              <p className="text-sm text-muted-foreground">
                Your {proMe?.latestRequest?.method} payment screenshot is being reviewed. Pro activates within 24h of approval.
              </p>
              {proMe?.latestRequest?.reviewerNote && (
                <p className="rounded-lg bg-muted/60 p-2 text-xs text-muted-foreground">Admin: {proMe.latestRequest.reviewerNote}</p>
              )}
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Sign-in gate */}
              {!session?.user && (
                <div className="flex items-start gap-2 rounded-lg border border-gold/40 bg-gold/10 p-3 text-xs">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>Please <button type="button" className="font-bold text-gold underline" onClick={() => { setOpen(false); setLoginOpen(true) }}>sign in</button> first so we can link your payment to your account.</span>
                </div>
              )}

              {/* Price */}
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="text-3xl font-extrabold text-foreground">${usdPrice}<span className="text-sm font-medium text-muted-foreground"> USD</span></div>
                <div className="mt-1 text-sm font-bold text-brand">≈ Rs {pkrPrice} PKR</div>
                <p className="mt-1 text-[11px] text-muted-foreground">One-time payment • Lifetime access • No auto-renewal</p>
              </div>

              {/* Method selection */}
              <div>
                <Label className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted-foreground">1. Choose payment method</Label>
                <div className={`grid gap-2 ${methods.length > 2 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {methods.map((m) => {
                    const Icon = m.icon
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={`flex items-center gap-2 rounded-xl border-2 p-3 text-start transition ${method === m.id ? "border-brand bg-brand-muted/40" : "border-border hover:bg-muted/40"}`}
                      >
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-white ${m.accent}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="text-sm font-bold">{m.label}</div>
                          {m.subtitle ? <div className="text-[9px] text-muted-foreground">{m.subtitle}</div> : <div className="text-[10px] text-muted-foreground">Tap to select</div>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Payment details: Card / SadaPay / JazzCash / Easypaisa */}
              {method === "Card" ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3">
                  <div className="flex items-start gap-2">
                    <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-[#1A1F71]" />
                    <div className="flex-1">
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Card Payment</div>
                      <div className="text-sm font-bold text-foreground">{settings?.cardInstructions || "Contact admin on WhatsApp for card payment link"}</div>
                      <div className="mt-1 text-[10px] text-muted-foreground">Pay ${usdPrice} USD via secure card link</div>
                    </div>
                  </div>
                </div>
              ) : method === "SadaPay" ? (
                <div className="rounded-xl border border-dashed border-[#6C2BD9]/40 bg-[#6C2BD9]/5 p-3">
                  <div className="flex items-start gap-2">
                    <Globe className="mt-0.5 h-5 w-5 shrink-0 text-[#6C2BD9]" />
                    <div className="flex-1">
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">SadaPay · International</div>
                      <div className="text-sm font-bold text-foreground">{settings?.sadapayName || "TradeSeekho PK"}</div>
                      <div className="mt-1.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">Number:</span>
                          <span className="font-mono text-xs font-bold text-foreground">{settings?.sadapayNumber || "03XX-XXXXXXX"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">IBAN:</span>
                          <span className="font-mono text-xs font-bold text-foreground">{settings?.sadapayIban || "PK36SAPK0000000000000000"}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => copy(settings?.sadapayNumber || "")}>
                          <Copy className="h-3.5 w-3.5" /> Copy Number
                        </Button>
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground">Send ${usdPrice} USD or Rs {pkrPrice} PKR</div>
                    </div>
                  </div>
                </div>
              ) : cryptoCtx ? (
                <div className="rounded-xl border border-dashed p-3" style={{ borderColor: `${cryptoCtx.color}66`, backgroundColor: `${cryptoCtx.color}0D` }}>
                  <div className="flex items-start gap-2">
                    <Coins className="mt-0.5 h-5 w-5 shrink-0" style={{ color: cryptoCtx.color }} />
                    <div className="flex-1">
                      <div className={`text-[11px] uppercase tracking-wide text-muted-foreground ${rtlFont}`}>{cryptoCtx.sectionTitle}</div>

                      {/* QR + address block */}
                      <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                        <div className="rounded-lg border-2 border-border bg-white p-2 shadow-sm">
                          {cryptoCtx.address ? (
                            <QRCodeSVG
                              value={cryptoCtx.address}
                              size={120}
                              level="M"
                              marginSize={1}
                              fgColor="#0b0f17"
                              bgColor="#ffffff"
                            />
                          ) : (
                            <div className="flex h-[120px] w-[120px] items-center justify-center text-[10px] text-muted-foreground">No address</div>
                          )}
                        </div>
                        <div className="flex-1 space-y-1.5 self-stretch">
                          <div className="space-y-0.5">
                            <div className={`text-[10px] text-muted-foreground ${rtlFont}`}>{t("pro.address")}</div>
                            <div className="break-all font-mono text-[11px] font-bold text-foreground">{cryptoCtx.address || "—"}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] text-muted-foreground ${rtlFont}`}>{t("pro.network")}</span>
                            <span className="text-xs font-bold" style={{ color: cryptoCtx.color }}>{cryptoCtx.network}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] text-muted-foreground ${rtlFont}`}>{t("pro.amount")}</span>
                            <span className="text-xs font-bold text-foreground">${usdPrice} USDT</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons: Copy + Save & Share */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => copy(cryptoCtx.address)}
                          disabled={!cryptoCtx.address}
                        >
                          <Copy className="h-3.5 w-3.5" /> {t("pro.copyAddress")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="gap-1.5"
                          onClick={saveAndShare}
                          disabled={sharing || !cryptoCtx.address}
                        >
                          {sharing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
                          {t("pro.saveShareAddress")}
                        </Button>
                      </div>

                      {/* Network-specific warning */}
                      <div className={`mt-2 rounded-lg bg-red-500/10 p-2 text-[10px] font-bold leading-relaxed text-destructive ${rtlFont}`}>
                        {cryptoCtx.warning}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Send Rs {displayAmount} to</div>
                      <div className="font-mono text-base font-bold text-foreground">{currentNumber}</div>
                      <div className="text-[10px] text-muted-foreground">{method} • TradeSeekho PK</div>
                    </div>
                    <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => copy(currentNumber || "")}>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              {/* Screenshot upload (not required for Card method) */}
              {method !== "Card" && (
              <div>
                <Label className={`mb-2 block text-xs font-bold uppercase tracking-wide text-muted-foreground ${rtlFont}`}>2. {t("pro.uploadScreenshot")}</Label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                {filePreview ? (
                  <div className="relative overflow-hidden rounded-xl border border-border">
                    <img src={filePreview} alt="screenshot" className="h-40 w-full object-cover" />
                    <button type="button" onClick={() => { setFile(null); setFilePreview(null) }} className="absolute right-2 top-2 rounded-full bg-foreground/80 px-2 py-0.5 text-xs font-bold text-background">Change</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-6 text-center transition hover:border-brand/50 hover:bg-muted/50">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    <span className={`text-sm font-bold ${rtlFont}`}>{t("pro.tapToUpload")}</span>
                    <span className="text-[10px] text-muted-foreground">JPG/PNG • max 4MB</span>
                  </button>
                )}
              </div>
              )}

              {/* Optional note */}
              <div className="space-y-1.5">
                <Label htmlFor="note" className={rtlFont}>
                  {method === "Payoneer" ? "Payoneer Transaction ID" : t("pro.txIdNote")}
                  {(method === "USDT" || method === "USDT_BEP20" || method === "Payoneer") && <span className="font-bold text-destructive">{t("pro.txIdRequired")}</span>}
                </Label>
                <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                  placeholder={method === "Payoneer" ? "Enter your Payoneer Transaction ID here (required)" : (method === "USDT" || method === "USDT_BEP20") ? t("pro.txIdPlaceholderUsdt") : t("pro.txIdPlaceholderOther")}
                  className="text-sm" />
              </div>

              {err && (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" /> {err}
                </p>
              )}

              <Button type="submit" className="h-12 w-full gap-2 bg-brand font-bold text-brand-foreground hover:bg-brand/90" disabled={submit.isPending}>
                {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Submit for approval
              </Button>
              <p className="text-center text-[10px] text-muted-foreground">
                Pro activates after admin approves your payment (usually within 24h).
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
