"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { signIn } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import { Mail, Lock, User, Loader2, AlertCircle } from "lucide-react"

export function LoginDialog() {
  const lang = useStore((s) => s.lang)
  const urduFont = lang === "ur" || lang === "ar"
  const loginOpen = useStore((s) => s.loginOpen)
  const setLoginOpen = useStore((s) => s.setLoginOpen)

  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      if (mode === "signup") {
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
      // sign in with the just-created (or existing) credentials
      const r = await signIn("credentials", { email, password, redirect: false })
      if (!r || r.error) {
        setErr("Invalid email or password.")
        setBusy(false)
        return
      }
      setBusy(false)
      setLoginOpen(false)
      // reload to refresh server-rendered session + scoped data
      window.location.reload()
    } catch {
      setErr("Something went wrong. Try again.")
      setBusy(false)
    }
  }

  const google = () => {
    setBusy(true)
    void signIn("google", { callbackUrl: "/" })
  }

  return (
    <Dialog open={loginOpen} onOpenChange={(v) => !busy && setLoginOpen(v)}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="gap-2 border-b border-border p-5">
          <DialogTitle className={`text-xl font-extrabold ${urduFont ? "font-urdu" : ""}`}>
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signin"
              ? "Sign in to save your progress & earn certificates."
              : "Sign up with Google or email — free."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-5">
          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full gap-3 border-2 font-bold"
            onClick={google}
            disabled={busy}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Email / password form */}
          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="h-11 ps-10" />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" className="h-11 ps-10" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="h-11 ps-10" required minLength={6} />
              </div>
            </div>

            {err && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                <AlertCircle className="h-3.5 w-3.5" /> {err}
              </p>
            )}

            <Button type="submit" className="h-12 w-full gap-2 bg-brand font-bold text-brand-foreground hover:bg-brand/90" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center text-xs text-muted-foreground">
            {mode === "signin" ? "Don't have an account? " : "Already registered? "}
            <button
              type="button"
              className="font-bold text-brand hover:underline"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErr(null) }}
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  )
}
