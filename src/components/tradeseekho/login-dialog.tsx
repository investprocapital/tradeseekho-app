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

        {/* Background: scattered candlestick pattern (more visible) */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
          <BgCandlesticks />
        </div>

        {/* Background: prominent green glow on right side */}
        <div className="pointer-events-none absolute right-[-10%] top-1/4 h-96 w-96 rounded-full bg-[#00D09C] opacity-[0.15] blur-[120px]" />
        {/* Secondary blue glow on left */}
        <div className="pointer-events-none absolute left-[-5%] bottom-1/3 h-72 w-72 rounded-full bg-[#0EA5E9] opacity-[0.08] blur-[100px]" />

        {/* Background: sweeping green trend line / wave arc */}
        <div className="pointer-events-none absolute inset-0">
          <svg viewBox="0 0 390 600" className="h-full w-full" preserveAspectRatio="none">
            <path d="M-20,400 C80,350 150,300 200,250 C280,170 340,120 420,60" stroke="#00D09C" strokeWidth="2" fill="none" opacity="0.15" />
            <path d="M-20,420 C80,370 150,320 200,270 C280,190 340,140 420,80" stroke="#00D09C" strokeWidth="1.5" fill="none" opacity="0.08" />
          </svg>
        </div>

        {/* Background: bottom waves (bigger, more glowing) */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 390 200" className="w-full" preserveAspectRatio="none" style={{ height: "160px" }}>
            <defs>
              <linearGradient id="wave1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D09C" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00D09C" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="wave2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.03" />
              </linearGradient>
              <linearGradient id="wave3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D09C" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00D09C" stopOpacity="0.08" />
              </linearGradient>
            </defs>
            <path d="M0,80 C60,120 120,40 195,70 C270,100 330,50 390,80 L390,200 L0,200 Z" fill="url(#wave1)" />
            <path d="M0,110 C60,140 120,70 195,95 C270,120 330,80 390,110 L390,200 L0,200 Z" fill="url(#wave2)" />
            <path d="M0,140 C60,160 120,100 195,120 C270,140 330,105 390,140 L390,200 L0,200 Z" fill="url(#wave3)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6 pb-10" style={{ paddingTop: "env(safe-area-inset-top, 2rem)" }}>
          <AnimatePresence mode="wait">
            {view === "landing" ? (
              <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="flex w-full flex-col items-center">
                {/* Logo: gradient T + green curved arrow + candlesticks (no box) */}
                <div className="relative mb-4 flex h-28 w-28 items-center justify-center">
                  {/* Candlesticks behind the T */}
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 112 112" fill="none">
                    {/* Candlestick 1 (green/bullish) */}
                    <line x1="38" y1="30" x2="38" y2="82" stroke="#00D09C" strokeWidth="2" opacity="0.5" />
                    <rect x="33" y="45" width="10" height="25" fill="#00D09C" opacity="0.35" rx="1.5" />
                    {/* Candlestick 2 (green/bullish, smaller) */}
                    <line x1="74" y1="25" x2="74" y2="75" stroke="#00D09C" strokeWidth="2" opacity="0.4" />
                    <rect x="69" y="35" width="10" height="28" fill="#00D09C" opacity="0.25" rx="1.5" />
                  </svg>
                  {/* The T — blue-to-cyan gradient, no box */}
                  <span
                    className="relative text-6xl font-extrabold leading-none"
                    style={{
                      background: "linear-gradient(135deg, #0EA5E9 0%, #00D09C 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    T
                  </span>
                  {/* Green curved arrow sweeping up-right */}
                  <svg className="absolute -right-2 -top-1 h-10 w-10" viewBox="0 0 40 40" fill="none">
                    <path
                      d="M5,35 C10,25 18,15 30,8"
                      stroke="#00D09C"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* Arrowhead */}
                    <path
                      d="M30,8 L30,16 M30,8 L22,8"
                      stroke="#00D09C"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  <span className="text-white">Trade</span><span className="text-[#00D09C]">Seekho</span>
                </h1>
                <p className="mt-1.5 text-sm font-medium tracking-[0.15em] text-white/50">Learn. Trade. Grow.</p>

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

                {/* Logo small (no box — gradient T) */}
                <div className="mb-2 flex flex-col items-center">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <span
                      className="text-4xl font-extrabold leading-none"
                      style={{
                        background: "linear-gradient(135deg, #0EA5E9 0%, #00D09C 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      T
                    </span>
                    <svg className="absolute -right-1 -top-0 h-6 w-6" viewBox="0 0 40 40" fill="none">
                      <path d="M5,35 C10,25 18,15 30,8" stroke="#00D09C" strokeWidth="3" strokeLinecap="round" fill="none" />
                      <path d="M30,8 L30,16 M30,8 L22,8" stroke="#00D09C" strokeWidth="3" strokeLinecap="round" fill="none" />
                    </svg>
                  </div>
                  <h2 className="mt-1 text-xl font-extrabold text-white">
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
