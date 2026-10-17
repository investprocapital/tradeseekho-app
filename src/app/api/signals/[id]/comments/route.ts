import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadImage } from "@/lib/blob-upload"
import { withDbRetry } from "@/lib/db-retry"

export const dynamic = "force-dynamic"

/**
 * Checks if comments are enabled globally (Admin Panel toggle).
 * Returns true if enabled, false if disabled.
 */
async function isCommentsEnabled(): Promise<boolean> {
  try {
    let s = await withDbRetry(() => db.adSettings.findUnique({ where: { id: "singleton" } }))
    if (!s) {
      s = await withDbRetry(() => db.adSettings.create({ data: { id: "singleton" } }))
    }
    return s.commentsEnabled
  } catch {
    // DB unreachable → default to enabled (don't break app)
    return true
  }
}

// GET /api/signals/[id]/comments — public: list VISIBLE comments for a signal
// (hidden comments are only shown to admin)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const comments = await db.comment.findMany({
    where: { signalId: id, hidden: false },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return NextResponse.json({
    comments: comments.map((c) => ({
      id: c.id,
      signalId: c.signalId,
      userName: c.userName,
      text: c.text,
      image: c.image,
      likes: c.likes,
      reports: c.reports,
      createdAt: c.createdAt.toISOString(),
    })),
  })
}

// POST /api/signals/[id]/comments — auth: create a new comment (hidden by default)
// Body: { text: string, image?: string (base64 data URL) }
// Images are uploaded to Vercel Blob (CDN) — only the URL is stored in Neon.
// BLOCKED if admin has disabled comments globally (commentsEnabled = false).
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Please sign in to comment" }, { status: 401 })
  }
  const userId = (session.user as { id?: string }).id
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 })
  }

  // Block comment writes if admin has disabled comments globally
  const enabled = await isCommentsEnabled()
  if (!enabled) {
    return NextResponse.json(
      { error: "Comments are disabled by admin" },
      { status: 403 },
    )
  }

  const body = await req.json()
  const { text, image } = body
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Comment text required" }, { status: 400 })
  }
  if (text.length > 500) {
    return NextResponse.json({ error: "Comment too long (max 500 chars)" }, { status: 400 })
  }

  // Validate image size (base64 data URL — estimate ~1.37x base64 overhead)
  // Allow up to 2MB raw (will be auto-compressed to ~150KB)
  if (image && typeof image === "string") {
    const sizeBytes = (image.length * 3) / 4
    if (sizeBytes > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (max 2MB)" }, { status: 400 })
    }
  }

  // ─── AUTO-COMPRESS comment image (resize 800px + WebP + quality 75) ───
  // Then upload to Vercel Blob CDN. This keeps comment images small (80-150KB)
  // so the DB + CDN stay lean.
  let finalImage = image
  if (image && typeof image === "string" && image.startsWith("data:")) {
    try {
      const { compressImage } = await import("@/lib/image-compress")
      const compressed = await compressImage(Buffer.from(image.split(",")[1], "base64"))
      finalImage = `data:${compressed.mimeType};base64,${compressed.buffer.toString("base64")}`
    } catch (e) {
      // Compression failed — use original (uploadImage will handle it)
      console.error("[comments] image compression failed:", e?.message)
    }
  }

  // Upload image to Vercel Blob CDN (falls back to base64 if Blob not configured)
  const { url: imageUrl } = await uploadImage(finalImage, "comments", `cmt_${Date.now()}`)

  // Get user name from DB
  const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } })
  const userName = user?.name || user?.email?.split("@")[0] || "Anonymous"

  const comment = await db.comment.create({
    data: {
      signalId: id,
      userId,
      userName,
      text: text.trim(),
      image: imageUrl,
      hidden: false,
    },
  })

  return NextResponse.json({
    ok: true,
    comment: {
      id: comment.id,
      hidden: comment.hidden,
      message: "Comment posted successfully!",
    },
  })
}
