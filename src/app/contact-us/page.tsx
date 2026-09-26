import { db } from "@/lib/db"
import { PageView } from "../about-us/page-view"

export const dynamic = "force-dynamic"

const DEFAULT_CONTENT = `Contact TradeSeekho PK - We welcome all Users from all over the world and Pakistani People. For any help, support, feedback or business query, any User can contact us anytime. Email: tradeseekhopk@gmail.com - Location: Pakistan, Serving Worldwide Users. We reply to all Users within 24 hours. Thank you for using TradeSeekho PK.`

export default async function ContactUsPage() {
  let page = await db.pageContent.findUnique({ where: { slug: "contact-us" } })
  if (!page) {
    page = await db.pageContent.create({
      data: { slug: "contact-us", title: "Contact Us - TradeSeekho PK", content: DEFAULT_CONTENT }
    })
  }
  return <PageView title={page.title} content={page.content} slug="contact-us" />
}
