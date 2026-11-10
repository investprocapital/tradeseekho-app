"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Trash2, Loader2, ImageIcon, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

/**
 * QrUploader — reusable admin component for uploading/changing/deleting a
 * payment method's QR code image.
 *
 * Flow:
 *   1. Admin clicks "Upload QR" → file picker opens
 *   2. Image is auto-compressed + uploaded to Supabase Storage (or Vercel Blob)
 *      via /api/admin/upload-image → returns CDN URL
 *   3. The CDN URL is saved to the payment method's qrUrl field via onSave callback
 *   4. Preview of the uploaded QR is shown
 *   5. Admin can "Change" (re-upload) or "Delete" (set to null) anytime
 *
 * Props:
 *   - label: e.g. "USDT TRC20 QR"
 *   - qrUrl: current QR URL (null = not uploaded)
 *   - onSave: async (url: string | null) => void  — called with new URL or null (delete)
 */
export function QrUploader({
  label,
  qrUrl,
  onSave,
  accent = "#00c853",
}: {
  label: string
  qrUrl: string | null | undefined
  onSave: (url: string | null) => Promise<void>
  accent?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith("image/")) {
      toast.error("Please select an image file (PNG/JPG).")
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB.")
      return
    }
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append("file", f)
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd })
      const j = await res.json()
      if (!res.ok || !j.url) {
        throw new Error(j?.error || "Upload failed")
      }
      await onSave(j.url)
      toast.success(`${label} uploaded`)
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload QR")
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const onDelete = async () => {
    if (!confirm(`Delete this QR? The Pro payment popup will show "QR Not Uploaded".`)) return
    setBusy(true)
    try {
      await onSave(null)
      toast.success(`${label} deleted`)
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete QR")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
          {qrUrl ? (
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-emerald-600">
              <CheckCircle2 className="h-3 w-3" /> QR uploaded
            </div>
          ) : (
            <div className="mt-0.5 text-[10px] text-muted-foreground/70">QR Not Uploaded</div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
        {qrUrl ? (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 px-2 text-[10px]"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              Change
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={busy}
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className="h-7 gap-1 px-2 text-[10px] text-white"
            style={{ background: accent }}
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            Upload QR
          </Button>
        )}
      </div>
      {/* Preview */}
      <div className="mt-2 flex justify-center">
        {qrUrl ? (
          <img
            src={qrUrl}
            alt={`${label} preview`}
            className="h-32 w-32 rounded-lg border-2 border-border bg-white object-contain p-1"
          />
        ) : (
          <div className="flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-muted/30">
            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
            <span className="text-[9px] text-muted-foreground/60">No QR</span>
          </div>
        )}
      </div>
    </div>
  )
}
