import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

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

  const body = await req.json()
  const { text, image } = body
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Comment text required" }, { status: 400 })
  }
  if (text.length > 500) {
    return NextResponse.json({ error: "Comment too long (max 500 chars)" }, { status: 400 })
  }

  // Validate image size (base64 data URL — estimate ~1.37x base64 overhead)
  if (image && typeof image === "string") {
    // Rough size check: base64 string length / 1.37 ≈ bytes
    const sizeBytes = (image.length * 3) / 4
    if (sizeBytes > 300 * 1024) {
      return NextResponse.json({ error: "Image too large (max 200KB)" }, { status: 400 })
    }
  }

  // Get user name from DB
  const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } })
  const userName = user?.name || user?.email?.split("@")[0] || "Anonymous"

  const comment = await db.comment.create({
    data: {
      signalId: id,
      userId,
      userName,
      text: text.trim(),
      image: image || null,
      hidden: true, // new comments start hidden — admin approves
    },
  })

  return NextResponse.json({
    ok: true,
    comment: {
      id: comment.id,
      hidden: comment.hidden,
      message: "Comment submitted! It will appear after admin approval.",
    },
  })
}
