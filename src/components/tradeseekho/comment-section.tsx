"use client"

import { useState, useRef, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Send, Image as ImageIcon, Heart, Flag, X, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Comment {
  id: string
  signalId: string
  userName: string
  text: string
  image: string | null
  likes: number
  reports: number
  createdAt: string
}

interface CommentSectionProps {
  signalId: string
}

async function fetchComments(signalId: string) {
  const res = await fetch(`/api/signals/${signalId}/comments`)
  if (!res.ok) throw new Error("failed")
  return res.json() as Promise<{ comments: Comment[] }>
}

/**
 * Compress an image file to a JPEG data URL, max ~200KB.
 * Uses canvas to resize + re-encode. Returns base64 data URL.
 */
function compressImage(file: File, maxSize: number = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        // Scale down if needed — start at 800px max dimension
        let { width, height } = img
        const maxDim = 800
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) { reject(new Error("no ctx")); return }
        ctx.drawImage(img, 0, 0, width, height)
        // Try decreasing quality until under maxSize (KB)
        let quality = 0.8
        let dataUrl = canvas.toDataURL("image/jpeg", quality)
        while (dataUrl.length > maxSize * 1024 * 1.37 && quality > 0.2) {
          quality -= 0.1
          dataUrl = canvas.toDataURL("image/jpeg", quality)
        }
        resolve(dataUrl)
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function CommentSection({ signalId }: CommentSectionProps) {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const [text, setText] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["comments", signalId],
    queryFn: () => fetchComments(signalId),
    staleTime: 15_000,
  })

  const comments = data?.comments ?? []

  const submitMutation = useMutation({
    mutationFn: async (data: { text: string; image: string | null }) => {
      const res = await fetch(`/api/signals/${signalId}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to post comment")
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", signalId] })
      toast.success("Comment submitted! It will appear after admin approval.")
      setText("")
      setImage(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const likeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/comments/${id}/like`, { method: "POST" })
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", signalId] }),
  })

  const reportMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/comments/${id}/report`, { method: "POST" })
      if (!res.ok) throw new Error("failed")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", signalId] })
      toast.success("Comment reported. Admin will review.")
    },
  })

  const onFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    try {
      const compressed = await compressImage(file, 200)
      setImage(compressed)
    } catch {
      toast.error("Failed to process image")
    }
    e.target.value = ""
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) { toast.error("Please write a comment"); return }
    if (!session?.user) {
      toast.error("Please sign in to comment")
      return
    }
    setBusy(true)
    submitMutation.mutate({ text: text.trim(), image }, { finally: () => setBusy(false) } as any)
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <MessageSquare className="h-4 w-4 text-brand" />
        <h3 className="text-sm font-extrabold text-foreground">Comments ({comments.length})</h3>
      </div>

      {/* Comment input */}
      {session?.user ? (
        <form onSubmit={onSubmit} className="space-y-2 rounded-xl border border-border bg-card p-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Write a comment... (max 500 chars)"
            maxLength={500}
            className="text-sm"
          />
          {/* Image preview / upload */}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          {image ? (
            <div className="relative inline-block">
              <img src={image} alt="preview" className="h-20 w-auto rounded-lg border border-border object-cover" />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute -right-1.5 -top-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-[11px] font-bold text-muted-foreground transition hover:border-brand/50 hover:text-brand"
            >
              <ImageIcon className="h-3.5 w-3.5" /> Attach chart screenshot (optional)
            </button>
          )}
          <Button
            type="submit"
            size="sm"
            className="gap-1.5 bg-brand font-bold text-brand-foreground hover:bg-brand/90"
            disabled={busy || !text.trim()}
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Post Comment
          </Button>
        </form>
      ) : (
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
          Please sign in to post a comment
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <p className="text-center text-xs text-muted-foreground py-4">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-center text-xs text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {comments.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card p-3"
              >
                {/* Header: name + date */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{c.userName}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {/* Text */}
                <p className="mt-1 text-sm text-foreground">{c.text}</p>
                {/* Image */}
                {c.image && (
                  <img src={c.image} alt="chart" className="mt-2 max-h-48 w-auto rounded-lg border border-border" draggable={false} />
                )}
                {/* Actions: like + report */}
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => likeMutation.mutate(c.id)}
                    className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground transition hover:text-brand"
                  >
                    <Heart className="h-3.5 w-3.5" /> {c.likes > 0 ? c.likes : "Like"}
                  </button>
                  <button
                    onClick={() => reportMutation.mutate(c.id)}
                    className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground transition hover:text-destructive"
                  >
                    <Flag className="h-3.5 w-3.5" /> Report
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
