"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Lock, Loader2, AlertCircle } from "lucide-react"
import { useStore } from "@/lib/store"
import { useUpdateProfile } from "./use-data"
import { toast } from "sonner"

export function EditProfileDialog() {
  const open = useStore((s) => s.editProfileOpen)
  const setOpen = useStore((s) => s.setEditProfileOpen)
  const { data: session } = useSession()
  const user = session?.user
  const [name, setName] = useState(user?.name ?? "")
  const [cur, setCur] = useState("")
  const [next, setNext] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const mut = useUpdateProfile()

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      const payload: { name?: string; currentPassword?: string; newPassword?: string } = {}
      if (name.trim() && name.trim() !== (user?.name ?? "")) payload.name = name.trim()
      if (next) { payload.newPassword = next; payload.currentPassword = cur || undefined }
      if (Object.keys(payload).length === 0) {
        setErr("Nothing to change.")
        setBusy(false)
        return
      }
      await mut.mutateAsync(payload)
      toast.success("Profile updated")
      setOpen(false)
      setCur(""); setNext("")
      // reload so the header avatar/name refreshes from the session
      window.location.reload()
    } catch (e2: any) {
      const msg = e2?.message
      setErr(msg?.includes("wrong_current") ? "Current password is incorrect." : msg?.includes("unauthorized") ? "Please sign in first." : "Could not update. Try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="border-b border-border p-5">
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
            <User className="h-5 w-5 text-brand" /> Edit Profile
          </DialogTitle>
          <DialogDescription>Update your name and password.</DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Please sign in to edit your profile.
          </div>
        ) : (
          <form onSubmit={save} className="space-y-4 p-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="h-11 ps-10" />
              </div>
              <p className="text-[11px] text-muted-foreground">Signed in as {user.email}</p>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Change password (optional)</p>
              <div className="space-y-1.5">
                <Label htmlFor="cur">Current password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="cur" type="password" value={cur} onChange={(e) => setCur(e.target.value)} placeholder="Required to change password" className="h-11 ps-10" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="next">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="next" type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Min 6 characters" className="h-11 ps-10" minLength={6} />
                </div>
              </div>
            </div>

            {err && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                <AlertCircle className="h-3.5 w-3.5" /> {err}
              </p>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
              <Button type="submit" className="flex-1 gap-2 bg-brand font-bold text-brand-foreground hover:bg-brand/90" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save changes
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
