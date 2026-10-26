"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { signIn } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useStore } from "@/lib/store"
import { Mail, Lock, User, Loader2, AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, GraduationCap, BarChart3, TrendingUp, Moon, Sun, CheckCircle2 } from "lucide-react"
import { useTheme } from "next-themes"

type View = "landing" | "signin" | "signup" | "forgot" | "forgot-sent" | "forgot-done" | "set-password"

// Fetch ad settings (includes googleLoginEnabled toggle)
async function fetchLoginSettings() {
  const res = await fetch("/api/ads/config", { cache: "no-store" })
  if (!res.ok) return { googleLoginEnabled: true }
  return res.json()
}

export function LoginDialog() {
  const loginOpen = useStore((s) => s.loginOpen)
  const setLoginOpen = useStore((s) => s.setLoginOpen)
  const loginView = useStore((s) => s.loginView)
  const setLoginView = useStore((s) => s.setLoginView)
  const setShowAdmin = useStore((s) => s.setShowAdmin)
  const { theme, setTheme } = useTheme()

  // Fetch ad settings to check if Google Login button is enabled/disabled
  const { data: loginSettings } = useQuery<{ googleLoginEnabled?: boolean }>({
    queryKey: ["login-settings"],
    queryFn: fetchLoginSettings,
    staleTime: 60_000,
  })
  const googleLoginEnabled = loginSettings?.googleLoginEnabled ?? true

  const [view, setView] = useState<View>("landing")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [resetLink, setResetLink] = useState("")
  const [newPw, setNewPw] = useState("") // new password for forgot-password flow
  const [showNewPw, setShowNewPw] = useState(false) // eye toggle for new password

  // When login dialog opens with a specific view (e.g. "set-password" from Settings),
  // set the internal view state accordingly.
  useEffect(() => {
    if (loginOpen && loginView) {
      Promise.resolve().then(() => {
        setView(loginView)
        setLoginView(null)
      })
    }
  }, [loginOpen, loginView, setLoginView])
  // Tracks whether the entered email is a Google-only user (no password set).
  // If true, we show a "Use Continue with Google" hint instead of "Invalid password".
  const [googleUserHint, setGoogleUserHint] = useState(false)

  const reset = () => { setView("landing"); setEmail(""); setPassword(""); setName(""); setErr(null); setBusy(false); setGoogleUserHint(false) }

  // Auto-fill email from localStorage on mount + when dialog opens.
  // This pre-fills the email field with the last used email (Google or manual).
  useEffect(() => {
    if (loginOpen) {
      const lastEmail = typeof window !== "undefined" ? localStorage.getItem("last_email") : null
      if (lastEmail && !email) {
        Promise.resolve().then(() => setEmail(lastEmail))
      }
    }
  }, [loginOpen])

  // Check if the entered email is a Google-only user (no password).
  // Called when user blurs the email field (onBlur). If the email is registered
  // via Google, we show a hint: "Use Continue with Google" instead of letting
  // them type a password that will fail.
  const checkEmailForGoogleUser = async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes("@")) {
      setGoogleUserHint(false)
      return
    }
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: emailToCheck }),
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.exists && data.authMethod === "google") {
        setGoogleUserHint(true)
      } else {
        setGoogleUserHint(false)
      }
    } catch {
      // Silently fail — don't block login
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      if (view === "signup") {
        const res = await fetch("/api/auth/signup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password, name }) })
        const j = await res.json().catch(() => ({}))
        if (!res.ok) { setErr(j.error === "exists" ? "Email already registered." : j.error || "Signup failed"); setBusy(false); return }
      }
      let r: { error?: string | null; ok?: boolean } | undefined
      try { r = await signIn("credentials", { email, password, redirect: false }) }
      catch { setErr("Network error."); setBusy(false); return }
      if (!r || r.error || !r.ok) {
        // Check if this is a Google user trying to use password login
        if (r?.error === "CredentialsSignin") {
          const checkRes = await fetch("/api/auth/check-email", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email }),
          }).catch(() => null)
          if (checkRes && checkRes.ok) {
            const checkData = await checkRes.json().catch(() => ({}))
            if (checkData.exists && checkData.authMethod === "google") {
              setGoogleUserHint(true)
              setErr("This email is registered with Google. Please use 'Continue with Google' button above.")
              setBusy(false)
              return
            }
          }
          setErr("Invalid email or password.")
        } else {
          setErr("Login failed.")
        }
        setBusy(false)
        return
      }
      // Save email to localStorage for auto-fill next time
      if (email && typeof window !== "undefined") localStorage.setItem("last_email", email)

      // ─── Credential Management API: tell browser to save password ───
      // This triggers the "Save password?" popup in Chrome/Edge/Firefox.
      // After saving, next login the browser auto-fills email + password.
      if (typeof window !== "undefined" && "credentials" in navigator && password) {
        try {
          const cred = new PasswordCredential({
            id: email,
            password: password,
            name: name || email,
          })
          await navigator.credentials.store(cred)
        } catch {
          // Some browsers don't support PasswordCredential — silently ignore
        }
      }

      setBusy(false); setLoginOpen(false); reset()
      try {
        const sres = await fetch("/api/auth/session").then((x) => x.json())
        if ((sres?.user as { role?: string })?.role === "admin") { setShowAdmin(true); return }
      } catch { /* ignore */ }
      window.location.reload()
    } catch { setErr("Something went wrong."); setBusy(false) }
  }

  const google = () => { setBusy(true); void signIn("google", { callbackUrl: "/" }) }

  return (
    <Dialog open={loginOpen} onOpenChange={(v) => { if (!busy && v) { setLoginOpen(true) } /* only allow opening, not closing via outside click when unauth */ }}>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="!fixed !inset-0 !z-[100] !top-0 !left-0 !flex !max-h-none !w-full !max-w-none !translate-x-0 !translate-y-0 !flex-col !overflow-hidden !border-0 !rounded-none !p-0 !bg-[#070F2B]"
        style={{ borderRadius: 0, position: "fixed", inset: 0, width: "100vw", height: "100vh", maxWidth: "none", transform: "none", top: 0, left: 0 }}
      >
        <DialogTitle className="sr-only">Login</DialogTitle>

        {/* Top bar: tagline + dark mode */}
        <div className="absolute left-4 top-3 z-30 flex items-center gap-2 text-xs font-medium text-white/40">
          <span>Learn</span><span className="text-[#00D09C]">•</span><span>Trade</span><span className="text-[#00D09C]">•</span><span>Grow</span>
        </div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="absolute right-4 top-3 z-30 flex h-8 w-14 items-center rounded-full border border-white/10 bg-white/5 px-1"
          aria-label="Toggle dark mode"
        >
          <span className={`flex h-6 w-6 items-center justify-center rounded-full bg-[#00D09C] transition-transform ${theme === "dark" ? "translate-x-0" : "translate-x-6"}`}>
            {theme === "dark" ? <Moon className="h-3 w-3 text-[#070F2B]" /> : <Sun className="h-3 w-3 text-[#070F2B]" />}
          </span>
        </button>

        {/* SINGLE COLUMN — full width, scrollable */}
        <div className="relative flex h-full w-full flex-col overflow-y-auto">
          {/* Background: candlesticks */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.08]"><BgCandlesticks /></div>
          {/* Background: green glow top */}
          <div className="pointer-events-none absolute right-[-10%] top-10 h-80 w-80 rounded-full bg-[#00D09C] opacity-[0.1] blur-[100px]" />
          {/* Background: bottom waves */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 390 160" className="w-full" preserveAspectRatio="none" style={{ height: "120px" }}>
              <defs>
                <linearGradient id="bw1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00D09C" stopOpacity="0.2" /><stop offset="100%" stopColor="#00D09C" stopOpacity="0.05" /></linearGradient>
                <linearGradient id="bw2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0072FF" stopOpacity="0.12" /><stop offset="100%" stopColor="#0072FF" stopOpacity="0.03" /></linearGradient>
              </defs>
              <path d="M0,60 C60,90 120,30 195,50 C270,70 330,40 390,60 L390,160 L0,160 Z" fill="url(#bw1)" />
              <path d="M0,90 C60,110 120,60 195,80 C270,100 330,70 390,90 L390,160 L0,160 Z" fill="url(#bw2)" />
              <path d="M0,120 C60,135 120,90 195,105 C270,120 330,95 390,120 L390,160 L0,160 Z" fill="url(#bw1)" />
            </svg>
          </div>

          {/* Content — single column, centered, scrollable.
              paddingBottom includes safe-area-inset-bottom so the girl image
              doesn't touch the phone's navigation bar on devices with home
              indicators (iPhone) or gesture bars (Android). */}
          <div className="relative z-10 mx-auto flex w-full max-w-sm flex-col items-center px-6" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 3rem)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2.5rem)" }}>
            <AnimatePresence mode="wait">
              {view === "landing" ? (
                <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="flex w-full flex-col items-center">
                  {/* Logo — BIG, CENTERED, with glow */}
                  <div className="mb-3 flex flex-col items-center">
                    <div className="relative" style={{ filter: "drop-shadow(0 0 20px rgba(0, 208, 156, 0.3))" }}>
                      <img src="/tradeseekho-logo.png" alt="TradeSeekho PK" className="h-[70px] w-[70px] rounded-2xl" />
                    </div>
                    <span className="mt-2 text-xl font-extrabold"><span className="text-white">TradeSeekho</span> <span className="text-[#00D09C]">PK</span></span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
                  <p className="mt-1 text-sm text-white/50">Login to your account to continue</p>

                  <div className="mt-6 w-full space-y-3">
                    {/* Google Login button — shown only if admin has enabled it.
                        Admin Panel > Ads tab > "Google Login Button" toggle. */}
                    {googleLoginEnabled && (
                      <button onClick={google} disabled={busy}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#1E3A5F] bg-transparent text-sm font-semibold text-white transition hover:border-[#06b6d4] hover:bg-[#06b6d4]/5 active:scale-[0.98] disabled:opacity-50">
                        <GoogleG /> Continue with Google
                      </button>
                    )}
                    <button onClick={() => { setView("signin"); setErr(null) }}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-lg transition active:scale-[0.98]"
                      style={{ background: "linear-gradient(135deg, #00D09C 0%, #0072FF 100%)", boxShadow: "0 4px 20px rgba(0, 208, 156, 0.25)" }}>
                      <Mail className="h-4 w-4" /> Continue with Email
                    </button>
                  </div>

                  <p className="mt-5 text-sm text-white/50">
                    Don't have an account? <button onClick={() => { setView("signup"); setErr(null) }} className="font-bold text-[#00D09C] hover:underline">Sign Up</button>
                  </p>

                  {/* Forgot Password link — always visible on landing view too
                      so users can easily find it without going through Sign In form */}
                  <button type="button" onClick={() => { setView("forgot"); setErr(null) }} className="mt-3 text-xs font-semibold text-[#00D09C] hover:underline">
                    Forgot Password?
                  </button>

                  {/* Girl illustration — NOW a proper transparent PNG (no white box).
                      The old image had a solid white background creating a visible
                      rectangular box. New image is clean: only girl + laptop +
                      floating charts, transparent background. No waves/box behind. */}
                  <div className="relative mt-4 flex w-full flex-col items-center" style={{ marginBottom: "20px" }}>
                    {/* Green glow behind girl (soft, no box) */}
                    <div className="pointer-events-none absolute bottom-4 left-1/2 h-32 w-44 -translate-x-1/2 rounded-full bg-[#00D09C] opacity-15 blur-[60px]" />
                    <div className="relative z-10">
                      <img src="/login-girl-transparent.png" alt="TradeSeekho PK trader girl"
                        className="h-auto w-auto object-contain sm:max-w-[220px] md:max-w-[260px]"
                        style={{ maxWidth: "65vw", maxHeight: "32vh", filter: "brightness(1.2) contrast(1.05) drop-shadow(0 0 10px rgba(0,208,156,0.12))" }} />
                      {/* Floating green forex candlestick in girl's raised hand area */}
                      <motion.div
                        className="absolute"
                        style={{ top: "15%", right: "18%" }}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <svg width="28" height="48" viewBox="0 0 28 48" fill="none">
                          {/* Upper wick */}
                          <line x1="14" y1="2" x2="14" y2="12" stroke="#00D09C" strokeWidth="2" strokeLinecap="round" />
                          {/* Candle body (green, glowing) */}
                          <rect x="6" y="12" width="16" height="24" rx="2" fill="#00D09C" style={{ filter: "drop-shadow(0 0 8px rgba(0,208,156,0.8))" }} />
                          {/* Inner highlight */}
                          <rect x="8" y="14" width="3" height="20" rx="1" fill="rgba(255,255,255,0.3)" />
                          {/* Lower wick */}
                          <line x1="14" y1="36" x2="14" y2="46" stroke="#00D09C" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ) : (view === "signin" || view === "signup") ? (
                <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex w-full flex-col items-center">
                  <button onClick={() => { setView("landing"); setErr(null) }} className="mb-4 flex items-center gap-1.5 self-start text-sm font-semibold text-white/60 hover:text-white">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <div className="mb-4 flex flex-col items-center">
                    <div className="relative" style={{ filter: "drop-shadow(0 0 20px rgba(0, 208, 156, 0.3))" }}>
                      <img src="/tradeseekho-logo.png" alt="TradeSeekho PK" className="h-[60px] w-[60px] rounded-2xl" />
                    </div>
                    <span className="mt-2 text-lg font-extrabold"><span className="text-white">TradeSeekho</span> <span className="text-[#00D09C]">PK</span></span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">{view === "signup" ? "Create Account" : "Welcome Back"}</h2>
                  <p className="mt-1 text-sm text-white/50">{view === "signup" ? "Sign up to start learning" : "Login to your account to continue"}</p>

                  <form onSubmit={submit} autoComplete="on" className="mt-6 w-full space-y-3">
                    {view === "signup" && (
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#06b6d4]" />
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" autoComplete="name"
                          className="h-12 w-full rounded-xl border border-[#1E3A5F] bg-[#0f172a]/80 ps-10 pe-3 text-sm text-white placeholder:text-white/30 focus:border-[#00D09C] focus:outline-none" />
                      </div>
                    )}
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#06b6d4]" />
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        inputMode="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setGoogleUserHint(false); setErr(null) }}
                        onBlur={(e) => { if (view === "signin") checkEmailForGoogleUser(e.target.value) }}
                        placeholder="Email Address"
                        required
                        className="h-12 w-full rounded-xl border border-[#1E3A5F] bg-[#0f172a]/80 ps-10 pe-3 text-sm text-white placeholder:text-white/30 focus:border-[#00D09C] focus:outline-none"
                      />
                    </div>
                    {/* Google user hint — shown when the entered email is registered via Google.
                        Tells the user to use "Continue with Google" instead of typing a password. */}
                    {googleUserHint && view === "signin" && (
                      <div className="rounded-xl border border-[#00D09C]/40 bg-[#00D09C]/10 p-3 text-center">
                        <p className="text-xs font-bold text-[#00D09C]">✓ This email is registered with Google</p>
                        <p className="mt-1 text-[11px] text-white/60">Please use the "Continue with Google" button above to login. No password needed.</p>
                        <button
                          type="button"
                          onClick={() => { setBusy(true); void signIn("google", { callbackUrl: "/" }) }}
                          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#070F2B] transition hover:bg-white/90 active:scale-95"
                        >
                          <GoogleG /> Continue with Google
                        </button>
                      </div>
                    )}
                    {!googleUserHint && (
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#06b6d4]" />
                        <input type={showPw ? "text" : "password"} name="password" autoComplete={view === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6}
                          className="h-12 w-full rounded-xl border border-[#1E3A5F] bg-[#0f172a]/80 ps-10 pe-10 text-sm text-white placeholder:text-white/30 focus:border-[#00D09C] focus:outline-none" />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    )}
                    {err && <p className="flex items-center gap-1.5 text-xs font-semibold text-red-400"><AlertCircle className="h-3.5 w-3.5" /> {err}</p>}
                    
                    {/* Forgot Password — only on signin view, right aligned */}
                    {view === "signin" && (
                      <div className="flex justify-end">
                        <button type="button" onClick={() => { setView("forgot"); setErr(null) }} className="text-xs font-semibold text-[#00D09C] hover:underline">
                          Forgot Password?
                        </button>
                      </div>
                    )}
                    
                    <button type="submit" disabled={busy}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #00D09C 0%, #0072FF 100%)", boxShadow: "0 4px 20px rgba(0, 208, 156, 0.25)" }}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{view === "signup" ? "Create Account" : "Login"} <ArrowRight className="h-4 w-4" /></>}
                    </button>
                  </form>
                  <p className="mt-5 text-sm text-white/50">
                    {view === "signup" ? "Already have an account? " : "Don't have an account? "}
                    <button onClick={() => { setView(view === "signup" ? "landing" : "signup"); setErr(null) }} className="font-bold text-[#00D09C] hover:underline">{view === "signup" ? "Sign In" : "Sign Up"}</button>
                  </p>
                </motion.div>
              ) : null}

              {/* Forgot Password View — sends reset email only */}
              {view === "forgot" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                  <button onClick={() => { setView("landing"); setErr(null) }} className="mb-4 flex items-center gap-1.5 self-start text-sm font-semibold text-white/60 hover:text-white">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <span className="mt-2 text-xl font-extrabold"><span className="text-white">TradeSeekho</span> <span className="text-[#00D09C]">PK</span></span>
                  <h2 className="mt-6 text-2xl font-extrabold text-white">Forgot Password</h2>
                  <p className="mt-1 text-sm text-white/50">Enter your email — we'll send a reset link</p>

                  <div className="mt-6 w-full space-y-3">
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
                      <Mail className="h-4 w-4 text-white/40" />
                      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" name="email" autoComplete="email" inputMode="email" placeholder="your@email.com" className="h-12 w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none" />
                    </div>

                    {err && <p className="flex items-center gap-1.5 text-xs font-semibold text-red-400"><AlertCircle className="h-3.5 w-3.5" /> {err}</p>}

                    <button onClick={async () => {
                      if (!email) { setErr("Please enter your email"); return }
                      setBusy(true); setErr(null)
                      try {
                        const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) })
                        const j = await res.json()
                        if (!res.ok) { setErr(j.error || "Failed"); setBusy(false); return }
                        setErr(null)
                        setResetLink(j.resetLink || "")
                        setView("forgot-sent")
                        setBusy(false)
                      } catch { setErr("Network error"); setBusy(false) }
                    }} disabled={busy}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-lg transition active:scale-[0.98] disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #00D09C 0%, #0072FF 100%)", boxShadow: "0 4px 20px rgba(0, 208, 156, 0.25)" }}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send Reset Link <ArrowRight className="h-4 w-4" /></>}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Forgot Password Sent — enter new password directly (no separate page needed) */}
              {view === "forgot-sent" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center">
                  <button onClick={() => { setView("landing"); setErr(null); setResetLink(""); setNewPw(""); }} className="mb-4 flex items-center gap-1.5 self-start text-sm font-semibold text-white/60 hover:text-white">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <span className="text-xl font-extrabold"><span className="text-white">TradeSeekho</span> <span className="text-[#00D09C]">PK</span></span>
                  <div className="mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#00D09C]/20">
                    <Lock className="h-8 w-8 text-[#00D09C]" />
                  </div>
                  <h2 className="mt-4 text-2xl font-extrabold text-white">Reset Password</h2>
                  <p className="mt-2 text-sm text-white/50">
                    Enter your new password for<br />
                    <span className="font-bold text-white">{email}</span>
                  </p>

                  <div className="mt-6 w-full space-y-3">
                    {/* New password input with eye toggle */}
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
                      <Lock className="h-4 w-4 text-white/40" />
                      <input
                        type={showNewPw ? "text" : "password"}
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        placeholder="New password (min 6 chars)"
                        className="h-12 w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                        minLength={6}
                      />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="shrink-0 text-white/40 hover:text-white/70">
                        {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {err && <p className="flex items-center gap-1.5 text-xs font-semibold text-red-400"><AlertCircle className="h-3.5 w-3.5" /> {err}</p>}

                    {/* Reset button — calls reset-password API with the token from resetLink */}
                    <button
                      onClick={async () => {
                        if (newPw.length < 6) { setErr("Password must be at least 6 characters"); return }
                        // Extract token from resetLink
                        const token = resetLink.split("token=")[1] || ""
                        if (!token) { setErr("Reset token missing — please try again"); return }
                        setBusy(true); setErr(null)
                        try {
                          const res = await fetch("/api/auth/reset-password", {
                            method: "POST",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({ token, newPassword: newPw }),
                          })
                          const j = await res.json()
                          if (!res.ok) { setErr(j.error || "Reset failed"); setBusy(false); return }
                          // Success — go to success view
                          setErr(null)
                          setView("forgot-done")
                          setBusy(false)
                        } catch { setErr("Network error"); setBusy(false) }
                      }}
                      disabled={busy}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #00D09C 0%, #0072FF 100%)", boxShadow: "0 4px 20px rgba(0, 208, 156, 0.25)" }}
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Reset Password <ArrowRight className="h-4 w-4" /></>}
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-white/30">
                    Reset link expires in 1 hour.
                  </p>
                </motion.div>
              )}

              {/* Forgot Password Done — success message */}
              {view === "forgot-done" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center">
                  <span className="mt-2 text-xl font-extrabold"><span className="text-white">TradeSeekho</span> <span className="text-[#00D09C]">PK</span></span>
                  <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#00D09C]/20">
                    <CheckCircle2 className="h-8 w-8 text-[#00D09C]" />
                  </div>
                  <h2 className="mt-4 text-2xl font-extrabold text-white">Password Reset! ✅</h2>
                  <p className="mt-2 text-sm text-white/50">
                    Your password has been changed successfully.<br />
                    You can now login with your new password.
                  </p>
                  <button
                    onClick={() => { setView("signin"); setEmail(""); setNewPw(""); setResetLink(""); setErr(null) }}
                    className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #00D09C 0%, #0072FF 100%)" }}
                  >
                    Login Now <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {/* ─── SET PASSWORD view — for Google users to set a password ─── */}
              {/* Lets Google users set a password so they can use email/password
                  login (which triggers browser "Save password?" popup). */}
              {view === "set-password" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center">
                  <span className="mt-2 text-xl font-extrabold"><span className="text-white">TradeSeekho</span> <span className="text-[#00D09C]">PK</span></span>
                  <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#00D09C]/20">
                    <Lock className="h-8 w-8 text-[#00D09C]" />
                  </div>
                  <h2 className="mt-4 text-2xl font-extrabold text-white">Set a Password</h2>
                  <p className="mt-2 px-6 text-sm text-white/50">
                    Set a password for your account so you can login with email + password
                    (browser will save it for auto-fill next time).
                  </p>
                  <div className="mt-6 w-full max-w-xs space-y-3">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#06b6d4]" />
                      <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New Password (min 6 chars)"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="h-12 w-full rounded-xl border border-[#1E3A5F] bg-[#0f172a]/80 ps-10 pe-10 text-sm text-white placeholder:text-white/30 focus:border-[#00D09C] focus:outline-none"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {err && <p className="flex items-center gap-1.5 text-xs font-semibold text-red-400"><AlertCircle className="h-3.5 w-3.5" /> {err}</p>}
                    <button
                      onClick={async () => {
                        if (!password || password.length < 6) { setErr("Password must be at least 6 characters"); return }
                        setBusy(true); setErr(null)
                        try {
                          const res = await fetch("/api/auth/set-password", {
                            method: "POST",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({ password }),
                          })
                          const j = await res.json().catch(() => ({}))
                          if (!res.ok) {
                            setErr(j.error === "already_set" ? "Password already set." : j.message || "Failed to set password")
                            setBusy(false); return
                          }
                          // Save email to localStorage
                          if (j.email && typeof window !== "undefined") localStorage.setItem("last_email", j.email)
                          // Credential Management API — tell browser to save the new password
                          if (typeof window !== "undefined" && "credentials" in navigator) {
                            try {
                              const cred = new PasswordCredential({ id: j.email, password: password, name: j.email })
                              await navigator.credentials.store(cred)
                            } catch { /* ignore */ }
                          }
                          toast.success("Password set! You can now login with email + password.")
                          setBusy(false); setLoginOpen(false); reset()
                          window.location.reload()
                        } catch {
                          setErr("Something went wrong."); setBusy(false)
                        }
                      }}
                      disabled={busy}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #00D09C 0%, #0072FF 100%)" }}
                    >
                      {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                      Set Password
                    </button>
                  </div>
                  <button onClick={() => { setLoginOpen(false); setPassword(""); setErr(null); reset() }} className="mt-4 text-sm font-semibold text-white/60 hover:text-white">
                    Back to Settings
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FeatureIcon({ icon: Icon, title, sub }: { icon: any; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#06b6d4]/30 bg-[#06b6d4]/5">
        <Icon className="h-5 w-5 text-[#06b6d4]" />
      </div>
      <span className="text-xs font-bold text-white">{title}</span>
      <span className="text-[10px] text-white/40">{sub}</span>
    </div>
  )
}

function GoogleG() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  )
}

function BgCandlesticks() {
  const candles = [
    { o: 30, h: 10, l: 60, c: 20, up: true, x: 20 }, { o: 20, h: 5, l: 50, c: 15, up: true, x: 60 },
    { o: 15, h: 8, l: 40, c: 25, up: false, x: 100 }, { o: 25, h: 3, l: 45, c: 10, up: true, x: 140 },
    { o: 10, h: 2, l: 35, c: 8, up: false, x: 180 }, { o: 8, h: 1, l: 28, c: 5, up: true, x: 220 },
    { o: 5, h: 0, l: 22, c: 12, up: false, x: 260 }, { o: 12, h: 3, l: 30, c: 7, up: true, x: 300 },
    { o: 7, h: 0, l: 18, c: 4, up: true, x: 340 }, { o: 4, h: 0, l: 15, c: 10, up: false, x: 380 },
    { o: 18, h: 5, l: 45, c: 12, up: true, x: 420 }, { o: 12, h: 2, l: 35, c: 8, up: false, x: 460 },
    { o: 22, h: 8, l: 55, c: 15, up: true, x: 500 }, { o: 15, h: 3, l: 40, c: 10, up: false, x: 540 },
    { o: 8, h: 0, l: 25, c: 5, up: true, x: 580 },
  ]
  return (
    <svg viewBox="0 0 620 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      {candles.map((c, i) => {
        const color = c.up ? "#00D09C" : "#EF4444"
        return (
          <g key={i}>
            <line x1={c.x} x2={c.x} y1={c.h} y2={c.l} stroke={color} strokeWidth="1.5" opacity="0.5" />
            <rect x={c.x - 5} y={Math.min(c.o, c.c)} width="10" height={Math.max(2, Math.abs(c.c - c.o))} fill={color} opacity="0.3" rx="1" />
          </g>
        )
      })}
    </svg>
  )
}
