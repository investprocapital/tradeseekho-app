import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { withDbRetry } from "@/lib/db-retry"
import type { CategoryDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const rows = await withDbRetry(() => db.category.findMany({ orderBy: { order: "asc" } }))
    const dto: CategoryDTO[] = rows.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: { en: c.nameEn, ur: c.nameUr, hi: c.nameHi, ar: c.nameAr },
      description: {
        en: c.descriptionEn ?? "",
        ur: c.descriptionUr ?? "",
        hi: c.descriptionHi ?? "",
        ar: c.descriptionAr ?? "",
      },
      icon: c.icon,
      color: c.color,
      order: c.order,
    }))
    return NextResponse.json({ categories: dto })
  } catch (e: any) {
    console.error("[categories] DB unreachable:", e?.message)
    return NextResponse.json({ categories: [], error: e?.message?.slice(0, 200), code: e?.code })
  }
}
