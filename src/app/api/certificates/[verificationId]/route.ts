import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { CertificateDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

// GET /api/certificates/[verificationId] — public verification (no auth)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ verificationId: string }> },
) {
  const { verificationId } = await params
  const c = await db.certificate.findUnique({ where: { verificationId } })
  if (!c) return NextResponse.json({ error: "not_found" }, { status: 404 })
  const dto: CertificateDTO = {
    id: c.id,
    categorySlug: c.categorySlug,
    userName: c.userName,
    lessonsPassed: c.lessonsPassed,
    totalLessons: c.totalLessons,
    scoreSum: c.scoreSum,
    scoreTotal: c.scoreTotal,
    verificationId: c.verificationId,
    issuedAt: c.issuedAt.toISOString(),
  }
  return NextResponse.json({ certificate: dto })
}
