import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

const DEFAULT_PAGES: Record<string, { title: string; content: string }> = {
  "about-us": {
    title: "About Us - TradeSeekho PK",
    content: `About TradeSeekho PK - TradeSeekho PK is a global learning platform made for all Users around the world, with a special focus on Pakistani People and Students. We provide ITI Trades MCQs, Technical Skills, and Stock Market Learning for educational purpose only. Our app is useful for Users from Pakistan, India, USA, UK and all countries. All content is for learning and knowledge. Note: This app is TradeSeekho PK, Made in Pakistan, but available for all Users worldwide. This is not related to TradeSeekho India app, we are a separate educational project.`,
  },
  "privacy-policy": {
    title: "Privacy Policy - TradeSeekho PK",
    content: `Privacy Policy for TradeSeekho PK - At TradeSeekho PK, we respect the privacy of all our Users worldwide including Pakistani People and Users from all countries. We do not collect any personal sensitive information of any User like CNIC, Bank or Password. We use Google AdMob and Google AdSense to show ads, they may use cookies to show better ads to Users. We do not sell or share Users data with anyone. Data of all Users is 100% safe. This app is for educational purpose only. If any User from any country has any privacy question, please contact us.`,
  },
  "contact-us": {
    title: "Contact Us - TradeSeekho PK",
    content: `Contact TradeSeekho PK - We welcome all Users from all over the world and Pakistani People. For any help, support, feedback or business query, any User can contact us anytime. Email: tradeseekhopk@gmail.com - Location: Pakistan, Serving Worldwide Users. We reply to all Users within 24 hours. Thank you for using TradeSeekho PK.`,
  },
}

// GET /api/pages/[slug] — public: get page content
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  let page = await db.pageContent.findUnique({ where: { slug } })
  if (!page) {
    // Return default content if not in DB
    const def = DEFAULT_PAGES[slug]
    if (def) {
      page = await db.pageContent.create({ data: { slug, ...def } })
    } else {
      return NextResponse.json({ error: "not_found" }, { status: 404 })
    }
  }
  return NextResponse.json({ slug: page.slug, title: page.title, content: page.content })
}
