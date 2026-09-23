"use client"

import { useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Crown, Copy, Upload, Loader2, AlertCircle, CheckCircle2, Clock, Smartphone, Image as ImageIcon, CreditCard } from "lucide-react"
import { useStore } from "@/lib/store"
import { useProMe, useSubmitProRequest } from "./use-data"
import { toast } from "sonner"

interface ProSettings {
  usdPrice: number
  pkrRate: number
  pkrPrice: number
  jazzcashNumber: string
  easypaisaNumber: string
  cardEnabled: boolean
  cardInstructions: string
}

async function fetchProSettings(): Promise<ProSettings> {
  const res = await fetch("/api/pro/settings")
  if (!res.ok) throw new Error("failed")
  return res.json()
}

type Method = "JazzCash" | "Easypaisa" | "Card"

export function ProDialog() {
  const open = useStore((s) => s.proOpen)
  const setOpen = useStore((s) => s.setProOpen)
  const setLoginOpen = useStore((s) => s.setLoginOpen)
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
  const fileRef = useRef<HTMLInputElement>(null)

  const isPro = proMe?.proStatus === "active"
  const isPending = proMe?.proStatus === "pending"

  const usdPrice = settings?.usdPrice ?? 5
  const pkrRate = settings?.pkrRate ?? 280
  const pkrPrice = settings?.pkrPrice ?? Math.round(usdPrice * pkrRate)
  const displayAmount = amount || String(pkrPrice)

  const methods: { id: Method; label: string; color: string; accent: string; icon: any }[] = [
    { id: "JazzCash", label: "JazzCash", color: "#ED1C24", accent: "bg-[#ED1C24]", icon: Smartphone },
    { id: "Easypaisa", label: "Easypaisa", color: "#00B14F", accent: "bg-[#00B14F]", icon: Smartphone },
  ]
  if (settings?.cardEnabled !== false) {
    methods.push({ id: "Card", label: "Visa / Debit Card", color: "#1A1F71", accent: "bg-[#1A1F71]", icon: CreditCard })
  }

  const currentNumber = method === "JazzCash" ? settings?.jazzcashNumber : method === "Easypaisa" ? settings?.easypaisaNumber : ""

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
    try {
      await submit.mutateAsync({ method, amount: Number(displayAmount) || 0, note, file })
      toast.success("Payment submitted!", { description: "We'll review and activate Pro within 24h." })
      setFile(null); setFilePreview(null); setNote("")
    } catch (e2: any) {
      const msg = e2?.message
      setErr(msg?.includes("already_pro") ? "You're already Pro." : msg?.includes("unauthorized") ? "Please sign in first." : "Submission failed. Try again.")
    }
  }

  const copy = (text: string) => { navigator.clipboard?.writeText(text); toast.success("Copied: " + text) }

  return (
    <Dialog open={open} onOpenChange={(v) => !submit.isPending && setOpen(v)}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto p-0">
        <DialogHeader className="border-b border-border bg-gradient-to-br from-gold/15 to-brand-muted/30 p-5">
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
            <Crown className="h-5 w-5 text-gold" /> TradeSeekho Pro
          </DialogTitle>
          <DialogDescription>
            Unlock all lessons, ad-free experience & certificates.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5">
          {/* Already Pro */}
          {isPro ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
                <Crown className="h-8 w-8 text-gold" />
              </span>
              <h3 className="text-lg font-extrabold text-foreground">You're Pro! 🎉</h3>
              <p className="text-sm text-muted-foreground">Thanks for supporting TradeSeekho. Enjoy unlimited access.</p>
            </div>
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
                          <div className="text-[10px] text-muted-foreground">Tap to select</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Number to send to (JazzCash / Easypaisa) OR Card instructions */}
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
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Send Rs {displayAmount} to</div>
                      <div className="font-mono text-base font-bold text-foreground">{currentNumber}</div>
                      <div className="text-[10px] text-muted-foreground">{method} • TradeSeekho</div>
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
                <Label className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted-foreground">2. Upload payment screenshot</Label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                {filePreview ? (
                  <div className="relative overflow-hidden rounded-xl border border-border">
                    <img src={filePreview} alt="screenshot" className="h-40 w-full object-cover" />
                    <button type="button" onClick={() => { setFile(null); setFilePreview(null) }} className="absolute right-2 top-2 rounded-full bg-foreground/80 px-2 py-0.5 text-xs font-bold text-background">Change</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-6 text-center transition hover:border-brand/50 hover:bg-muted/50">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-bold">Tap to upload</span>
                    <span className="text-[10px] text-muted-foreground">JPG/PNG • max 4MB</span>
                  </button>
                )}
              </div>
              )}

              {/* Optional note */}
              <div className="space-y-1.5">
                <Label htmlFor="note">Transaction ID / note (optional)</Label>
                <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="e.g. JazzCash TID 12345678" className="text-sm" />
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
