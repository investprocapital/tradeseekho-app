"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { signIn } from "next-auth/react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { Mail, Lock, User, Loader2, AlertCircle, ArrowLeft } from "lucide-react"

type View = "landing" | "signin" | "signup"

export function LoginDialog() {
  const lang = useStore((s) => s.lang)
  const loginOpen = useStore((s) => s.loginOpen)
  const setLoginOpen = useStore((s) => s.setLoginOpen)
  const setShowAdmin = useStore((s) => s.setShowAdmin)

  const [view, setView] = useState<View>("landing")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const reset = () => { setView("landing"); setEmail(""); setPassword(""); setName(""); setErr(null); setBusy(false) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      if (view === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        })
        const j = await res.json().catch(() => ({}))
        if (!res.ok) {
          setErr(j.error === "exists" ? "Email already registered. Sign in instead." : j.error || "Signup failed")
          setBusy(false)
          return
        }
      }
      let r: { error?: string | null; ok?: boolean; status?: number; url?: string | null } | undefined
      try {
        r = await signIn("credentials", { email, password, redirect: false })
      } catch {
        setErr("Network error. Check your connection and try again.")
        setBusy(false)
        return
      }
      if (!r || r.error || !r.ok) {
        setErr(r?.error === "CredentialsSignin" ? "Invalid email or password." : (r?.error || "Login failed. Try again."))
        setBusy(false)
        return
      }
      setBusy(false)
      setLoginOpen(false)
      reset()
      try {
        const sres = await fetch("/api/auth/session").then((x) => x.json())
        const role = (sres?.user as { role?: string } | undefined)?.role
        if (role === "admin") { setShowAdmin(true); return }
      } catch { /* ignore */ }
      window.location.reload()
    } catch {
      setErr("Something went wrong. Try again.")
      setBusy(false)
    }
  }

  const google = () => { setBusy(true); void signIn("google", { callbackUrl: "/" }) }

  return (
    <Dialog open={loginOpen} onOpenChange={(v) => { if (!busy) { setLoginOpen(v); if (!v) reset() } }}>
      <DialogContent
        showCloseButton={false}
        className="!fixed !inset-0 !z-[100] !top-0 !left-0 !flex !max-h-none !w-full !max-w-none !translate-x-0 !translate-y-0 !flex-col !items-center !justify-center !overflow-hidden !border-0 !rounded-none !p-0 !bg-[#0A1931]"
        style={{ borderRadius: 0, position: "fixed", inset: 0, width: "100vw", height: "100vh", maxWidth: "none", transform: "none", top: 0, left: 0 }}
      >
        <DialogTitle className="sr-only">Login</DialogTitle>

        {/* Background: candlestick pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
          <BgCandlesticks />
        </div>

        {/* Background: radial glow center */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00D09C] opacity-10 blur-[100px]" />

        {/* Background: bottom waves */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 390 120" className="w-full" preserveAspectRatio="none" style={{ height: "100px" }}>
            <path d="M0,60 C60,90 120,30 195,50 C270,70 330,40 390,60 L390,120 L0,120 Z" fill="#00D09C" opacity="0.12" />
            <path d="M0,80 C60,100 120,50 195,70 C270,90 330,60 390,80 L390,120 L0,120 Z" fill="#0EA5E9" opacity="0.08" />
            <path d="M0,95 C60,110 120,70 195,85 C270,100 330,75 390,95 L390,120 L0,120 Z" fill="#00D09C" opacity="0.15" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6 pb-10" style={{ paddingTop: "env(safe-area-inset-top, 2rem)" }}>
          <AnimatePresence mode="wait">
            {view === "landing" ? (
              <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="flex w-full flex-col items-center">
                {/* Logo */}
                <div className="mb-2 flex flex-col items-center">
                  <div className="relative mb-3 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#00D09C] shadow-lg shadow-[#00D09C]/30">
                    <span className="text-4xl font-extrabold text-white">T</span>
                    <svg className="absolute -right-1 -top-1 h-6 w-6" viewBox="0 0 24 24" fill="none">
                      <path d="M3 17L9 11L13 15L21 7" stroke="#00D09C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 7L21 13M21 7L15 7" stroke="#00D09C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight">
                    <span className="text-white">Trade</span><span className="text-[#00D09C]">Seekho</span>
                  </h1>
                  <p className="mt-1 text-sm font-medium tracking-[0.2em] text-white/60">LEARN. TRADE. GROW.</p>
                </div>

                {/* Spacer */}
                <div className="h-12" />

                {/* Button 1: Login (solid green) */}
                <button
                  onClick={() => { setView("signin"); setErr(null) }}
                  className="mb-3 flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#00D09C] text-base font-bold text-[#0A1931] shadow-lg shadow-[#00D09C]/30 transition hover:bg-[#00B986] active:scale-[0.98]"
                >
                  <User className="h-5 w-5" />
                  Login
                </button>

                {/* Button 2: Google (outline) */}
                <button
                  onClick={google}
                  disabled={busy}
                  className="mb-3 flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl border border-[#0EA5E9]/40 bg-transparent text-base font-semibold text-white transition hover:border-[#0EA5E9] hover:bg-[#0EA5E9]/5 active:scale-[0.98] disabled:opacity-50"
                >
                  <GoogleG />
                  Continue with Google
                </button>

                {/* Button 3: Email (outline) */}
                <button
                  onClick={() => { setView("signin"); setErr(null) }}
                  className="mb-8 flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl border border-[#0EA5E9]/40 bg-transparent text-base font-semibold text-white transition hover:border-[#0EA5E9] hover:bg-[#0EA5E9]/5 active:scale-[0.98]"
                >
                  <Mail className="h-5 w-5" />
                  Continue with Email
                </button>

                {/* Bottom text */}
                <p className="text-sm text-white/50">
                  Don't have an account?{" "}
                  <button onClick={() => { setView("signup"); setErr(null) }} className="font-bold text-[#00D09C] hover:underline">
                    Sign Up
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex w-full flex-col items-center">
                {/* Back button */}
                <button onClick={() => { setView("landing"); setErr(null) }} className="mb-6 flex items-center gap-1.5 self-start text-sm font-semibold text-white/60 hover:text-white">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>

                {/* Logo small */}
                <div className="mb-6 flex flex-col items-center">
                  <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#00D09C] shadow-lg shadow-[#00D09C]/30">
                    <span className="text-2xl font-extrabold text-white">T</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">
                    {view === "signup" ? "Create Account" : "Welcome Back"}
                  </h2>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="w-full space-y-4">
                  {view === "signup" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-white/70">Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="h-12 border-[#0EA5E9]/30 bg-white/5 ps-10 text-white placeholder:text-white/30 focus:border-[#00D09C]" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-white/70">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" className="h-12 border-[#0EA5E9]/30 bg-white/5 ps-10 text-white placeholder:text-white/30 focus:border-[#00D09C]" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-white/70">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="h-12 border-[#0EA5E9]/30 bg-white/5 ps-10 text-white placeholder:text-white/30 focus:border-[#00D09C]" required minLength={6} />
                    </div>
                  </div>

                  {err && (
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                      <AlertCircle className="h-3.5 w-3.5" /> {err}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#00D09C] text-base font-bold text-[#0A1931] shadow-lg shadow-[#00D09C]/30 transition hover:bg-[#00B986] active:scale-[0.98] disabled:opacity-50"
                  >
                    {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                    {view === "signup" ? "Create Account" : "Sign In"}
                  </button>
                </form>

                {/* Bottom text */}
                <p className="mt-6 text-sm text-white/50">
                  {view === "signup" ? "Already have an account? " : "Don't have an account? "}
                  <button onClick={() => { setView(view === "signup" ? "signin" : "signup"); setErr(null) }} className="font-bold text-[#00D09C] hover:underline">
                    {view === "signup" ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function GoogleG() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  )
}

function BgCandlesticks() {
  const candles = [
    { o: 30, h: 10, l: 60, c: 20, up: true, x: 20 },
    { o: 20, h: 5, l: 50, c: 15, up: true, x: 60 },
    { o: 15, h: 8, l: 40, c: 25, up: false, x: 100 },
    { o: 25, h: 3, l: 45, c: 10, up: true, x: 140 },
    { o: 10, h: 2, l: 35, c: 8, up: false, x: 180 },
    { o: 8, h: 1, l: 28, c: 5, up: true, x: 220 },
    { o: 5, h: 0, l: 22, c: 12, up: false, x: 260 },
    { o: 12, h: 3, l: 30, c: 7, up: true, x: 300 },
    { o: 7, h: 0, l: 18, c: 4, up: true, x: 340 },
    { o: 4, h: 0, l: 15, c: 10, up: false, x: 380 },
  ]
  return (
    <svg viewBox="0 0 420 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      {candles.map((c, i) => {
        const color = c.up ? "#00D09C" : "#EF4444"
        return (
          <g key={i}>
            <line x1={c.x} x2={c.x} y1={c.h} y2={c.l} stroke={color} strokeWidth="1.5" opacity="0.6" />
            <rect x={c.x - 5} y={Math.min(c.o, c.c)} width="10" height={Math.max(2, Math.abs(c.c - c.o))} fill={color} opacity="0.4" rx="1" />
          </g>
        )
      })}
    </svg>
  )
}
