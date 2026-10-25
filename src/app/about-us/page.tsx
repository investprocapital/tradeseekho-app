import { db } from "@/lib/db"
import { PageView } from "./page-view"

export const dynamic = "force-dynamic"

const DEFAULT_CONTENT = `About TradeSeekho PK - TradeSeekho PK is a global learning platform made for all Users around the world, with a special focus on Pakistani People and Students. We provide Forex, Gold, and Crypto trading education for educational purpose only.

This app is strictly for educational purposes. All content including lessons, signals, and market analysis is provided to help users learn about financial markets. We are not SECP registered financial advisors and do not provide investment advice. Trading involves substantial risk of loss.

Note: This app is TradeSeekho PK, Made in Pakistan, but available for all Users worldwide. This is not related to TradeSeekho India app, we are a separate educational project.`

export default async function AboutUsPage() {
  let page = await db.pageContent.findUnique({ where: { slug: "about-us" } })
  if (!page) {
    page = await db.pageContent.create({
      data: { slug: "about-us", title: "About Us - TradeSeekho PK", content: DEFAULT_CONTENT }
    })
  }
  return <PageView title={page.title} content={page.content} slug="about-us" />
}
