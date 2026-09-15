"use client"

import { useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Lock, Loader2, AlertCircle, Camera, Upload } from "lucide-react"
import { useStore } from "@/lib/store"
import { useUpdateProfile } from "./use-data"
import { toast } from "sonner"

export function EditProfileDialog() {
  const open = useStore((s) => s.editProfileOpen)
  const setOpen = useStore((s) => s.setEditProfileOpen)
  const { data: session, update: updateSession } = useSession()
  const user = session?.user
  const [name, setName] = useState(user?.name ?? "")
  const [cur, setCur] = useState("")
  const [next, setNext] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState((user as { image?: string } | undefined)?.image ?? null)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const mut = useUpdateProfile()

  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setAvatarBusy(true)
    try {
      const fd = new FormData()
      fd.append("file", f)
      const res = await fetch("/api/auth/avatar", { method: "POST", body: fd })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || "upload_failed")
      setAvatarUrl(j.image)
      await updateSession() // refresh session so header avatar updates
      toast.success("Profile photo updated")
    } catch {
      toast.error("Could not upload photo")
    } finally {
      setAvatarBusy(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      const payload: { name?: string; currentPassword?: string; newPassword?: string } = {}
      if (name.trim() && name.trim() !== (user?.name ?? "")) payload.name = name.trim()
      if (next) { payload.newPassword = next; payload.currentPassword = cur || undefined }
      if (Object.keys(payload).length === 0) {
        // If photo was already uploaded, just close — no error needed
        if (avatarUrl && avatarUrl !== (user as { image?: string })?.image) {
          setOpen(false)
          toast.success("Profile photo updated")
          return
        }
        setErr("No changes to save. Edit your name or password above, or upload a new photo.")
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
            {/* Avatar upload */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group relative shrink-0"
                aria-label="Upload profile photo"
              >
                <Avatar className="h-16 w-16 border-2 border-border">
                  <AvatarImage src={avatarUrl ?? undefined} alt="" />
                  <AvatarFallback className="bg-brand text-xl font-bold text-brand-foreground">
                    {(name || user.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white shadow ring-2 ring-background transition group-hover:scale-110">
                  {avatarBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatar}
                  disabled={avatarBusy}
                />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">Profile photo</p>
                <p className="text-[11px] text-muted-foreground">Tap the avatar to upload (JPG/PNG, max 2MB).</p>
                <Button type="button" variant="outline" size="sm" className="mt-1.5 h-8 gap-1.5 text-xs" onClick={() => fileRef.current?.click()} disabled={avatarBusy}>
                  <Upload className="h-3.5 w-3.5" /> {avatarBusy ? "Uploading…" : "Upload"}
                </Button>
              </div>
            </div>

            <Separator />

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
