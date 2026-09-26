"use client"

import { useState } from "react"
import { Lock, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  // Read oobCode from URL (Google Identity Toolkit redirect)
  const [oobCode] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      return params.get("oobCode") || params.get("code") || ""
    }
    return ""
  })
  const [newPassword, setNewPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState("")

  const submit = async () => {
    if (newPassword.length < 6) { setErr("Password must be at least 6 characters"); return }
    if (!oobCode) { setErr("Invalid reset link — no code found in URL"); return }
    setBusy(true); setErr("")
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ oobCode, newPassword }),
      })
      const j = await res.json()
      if (!res.ok) { setErr(j.error || "Reset failed"); setBusy(false); return }
      setDone(true); setBusy(false)
      toast.success("Password reset successful!")
    } catch {
      setErr("Network error"); setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#070F2B] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-6 text-center">
          <span className="text-xl font-extrabold"><span className="text-white">TradeSeekho</span> <span className="text-[#00D09C]">PK</span></span>
        </div>

        {done ? (
          // Success state
          <div className="rounded-2xl border border-[#00D09C]/30 bg-white/5 p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00D09C]/20">
              <CheckCircle2 className="h-8 w-8 text-[#00D09C]" />
            </div>
            <h1 className="text-xl font-extrabold text-white">Password Reset!</h1>
            <p className="mt-2 text-sm text-white/50">Your password has been changed successfully. You can now login with your new password.</p>
            <Link href="/" className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #00D09C 0%, #0072FF 100%)" }}>
              Back to Login
            </Link>
          </div>
        ) : (
          // Reset form
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <Link href="/" className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-white/60 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <h1 className="text-2xl font-extrabold text-white">Reset Password</h1>
            <p className="mt-1 text-sm text-white/50">Enter your new password below.</p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
                <Lock className="h-4 w-4 text-white/40" />
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  placeholder="New password (min 6 chars)"
                  className="h-12 w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>

              {err && <p className="flex items-center gap-1.5 text-xs font-semibold text-red-400"><AlertCircle className="h-3.5 w-3.5" /> {err}</p>}

              <button
                onClick={submit}
                disabled={busy}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-lg transition active:scale-[0.98] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #00D09C 0%, #0072FF 100%)" }}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Reset Password</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
