import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { CertificateDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

// GET /api/certificates — list the local learner's earned certificates
export async function GET() {
  const userId = "local-learner"
  const rows = await db.certificate.findMany({
    where: { userId },
    orderBy: { issuedAt: "desc" },
  })
  const dto: CertificateDTO[] = rows.map((c) => ({
    id: c.id,
    categorySlug: c.categorySlug,
    userName: c.userName,
    lessonsPassed: c.lessonsPassed,
    totalLessons: c.totalLessons,
    scoreSum: c.scoreSum,
    scoreTotal: c.scoreTotal,
    verificationId: c.verificationId,
    issuedAt: c.issuedAt.toISOString(),
  }))
  return NextResponse.json({ certificates: dto })
}
