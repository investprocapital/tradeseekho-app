import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

const DEFAULT_PAGES = [
  {
    slug: "about-us",
    title: "About Us - TradeSeekho PK",
    content: `About TradeSeekho PK - TradeSeekho PK is a global learning platform made for all Users around the world, with a special focus on Pakistani People and Students. We provide ITI Trades MCQs, Technical Skills, and Stock Market Learning for educational purpose only. Our app is useful for Users from Pakistan, India, USA, UK and all countries. All content is for learning and knowledge. Note: This app is TradeSeekho PK, Made in Pakistan, but available for all Users worldwide. This is not related to TradeSeekho India app, we are a separate educational project.`,
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy - TradeSeekho PK",
    content: `Privacy Policy for TradeSeekho PK - At TradeSeekho PK, we respect the privacy of all our Users worldwide including Pakistani People and Users from all countries. We do not collect any personal sensitive information of any User like CNIC, Bank or Password. We use Google AdMob and Google AdSense to show ads, they may use cookies to show better ads to Users. We do not sell or share Users data with anyone. Data of all Users is 100% safe. This app is for educational purpose only. If any User from any country has any privacy question, please contact us.`,
  },
  {
    slug: "contact-us",
    title: "Contact Us - TradeSeekho PK",
    content: `Contact TradeSeekho PK - We welcome all Users from all over the world and Pakistani People. For any help, support, feedback or business query, any User can contact us anytime. Email: tradeseekhopk@gmail.com - Location: Pakistan, Serving Worldwide Users. We reply to all Users within 24 hours. Thank you for using TradeSeekho PK.`,
  },
]

async function ensurePages() {
  for (const p of DEFAULT_PAGES) {
    await db.pageContent.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    })
  }
}

// GET /api/admin/pages — admin: get all pages
export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard
  await ensurePages()
  const pages = await db.pageContent.findMany({ orderBy: { slug: "asc" } })
  return NextResponse.json({ pages })
}

// PUT /api/admin/pages — admin: update a page
export async function PUT(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard
  const body = await req.json()
  const { slug, title, content } = body
  if (!slug || !title || !content) {
    return NextResponse.json({ error: "slug, title, content required" }, { status: 400 })
  }
  const updated = await db.pageContent.upsert({
    where: { slug },
    update: { title, content },
    create: { slug, title, content },
  })
  return NextResponse.json(updated)
}
