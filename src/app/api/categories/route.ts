import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { CategoryDTO } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  const rows = await db.category.findMany({ orderBy: { order: "asc" } })
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
}
