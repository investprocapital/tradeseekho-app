import { db } from "@/lib/db"
import { PageView } from "../about-us/page-view"

export const dynamic = "force-dynamic"

const DEFAULT_CONTENT = `Privacy Policy for TradeSeekho PK - At TradeSeekho PK, we respect the privacy of all our Users worldwide including Pakistani People and Users from all countries. We do not collect any personal sensitive information of any User like CNIC, Bank or Password. We use Google AdMob and Google AdSense to show ads, they may use cookies to show better ads to Users. We do not sell or share Users data with anyone. Data of all Users is 100% safe. This app is for educational purpose only. If any User from any country has any privacy question, please contact us.`

export default async function PrivacyPolicyPage() {
  let page = await db.pageContent.findUnique({ where: { slug: "privacy-policy" } })
  if (!page) {
    page = await db.pageContent.create({
      data: { slug: "privacy-policy", title: "Privacy Policy - TradeSeekho PK", content: DEFAULT_CONTENT }
    })
  }
  return <PageView title={page.title} content={page.content} slug="privacy-policy" />
}
