import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

// GET /api/admin/users?search=email&filter=pro
// Returns all users with: email, name, password (hash truncated), proStatus,
// joiningDate, totalPassedQuiz, proRequest (method+note), deviceInfo
export async function GET(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search")?.trim().toLowerCase() || ""
  const filter = searchParams.get("filter") || "all" // all | pro | free

  const where: Record<string, unknown> = {}
  // Exclude local-learner demo account
  where.id = { not: "local-learner" }
  where.email = { not: null }

  if (search) {
    where.OR = [
      { email: { contains: search } },
      { name: { contains: search } },
    ]
  }

  if (filter === "pro") {
    where.proStatus = "active"
  } else if (filter === "free") {
    where.proStatus = { not: "active" }
  }

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      role: true,
      proStatus: true,
      createdAt: true,
      lessonsCompleted: true,
      proRequests: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { method: true, note: true, status: true, createdAt: true },
      },
      _count: {
        select: {
          progress: { where: { passed: true } },
        },
      },
    },
  })

  const totalLessons = await db.lesson.count({ where: { isPublished: true } })

  const dto = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name || "-",
    // Show truncated hash (first 15 chars) so admin can see it's hashed, not plaintext
    password: u.password ? u.password.slice(0, 15) + "..." : "(Google login)",
    authMethod: u.password ? "Email/Password" : "Google",
    role: u.role,
    proStatus: u.proStatus,
    proMethod: u.proRequests[0]?.method || null,
    proNote: u.proRequests[0]?.note || null,
    joinedAt: u.createdAt.toISOString(),
    passedQuizzes: u._count.progress,
    totalLessons,
    deviceInfo: "Web Browser", // Placeholder — device tracking not implemented
  }))

  return NextResponse.json({
    users: dto,
    total: dto.length,
  })
}
