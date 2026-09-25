import { db } from "@/lib/db"
import { PageView } from "./page-view"

export const dynamic = "force-dynamic"

const DEFAULT_CONTENT = `About TradeSeekho PK - TradeSeekho PK is a global learning platform made for all Users around the world, with a special focus on Pakistani People and Students. We provide ITI Trades MCQs, Technical Skills, and Stock Market Learning for educational purpose only. Our app is useful for Users from Pakistan, India, USA, UK and all countries. All content is for learning and knowledge. Note: This app is TradeSeekho PK, Made in Pakistan, but available for all Users worldwide. This is not related to TradeSeekho India app, we are a separate educational project.`

export default async function AboutUsPage() {
  let page = await db.pageContent.findUnique({ where: { slug: "about-us" } })
  if (!page) {
    page = await db.pageContent.create({
      data: { slug: "about-us", title: "About Us - TradeSeekho PK", content: DEFAULT_CONTENT }
    })
  }
  return <PageView title={page.title} content={page.content} slug="about-us" />
}
