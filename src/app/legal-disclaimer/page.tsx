import { db } from "@/lib/db"
import { PageView } from "../about-us/page-view"

export const dynamic = "force-dynamic"

const DEFAULT_CONTENT = `TradeSeekhoPK - Legal Disclaimer

1. Educational Purpose: All content in this app including Gold Signals, Market Gauge, and Lessons are for educational purposes only.

2. Not Financial Advice: We are not SECP registered financial advisors. We do not provide investment advice.

3. Risk Warning: Trading in Forex, Gold (XAU/USD) and Crypto involves substantial risk of loss and is not suitable for all investors.

4. No Guarantee: We do not guarantee any profit or income. All trading decisions are your own responsibility.

5. Copyright: All lessons and signals are our own original content. Market data may be sourced from public sources like TradingView. If any content owner has an issue, please contact us at tradeseekhopk@gmail.com for removal.

6. Contact: For any legal concern: tradeseekhopk@gmail.com

By using this app, you agree to this disclaimer.`

export default async function LegalDisclaimerPage() {
  let page = await db.pageContent.findUnique({ where: { slug: "legal-disclaimer" } })
  if (!page) {
    page = await db.pageContent.create({
      data: { slug: "legal-disclaimer", title: "Disclaimer, Privacy & Risk Warning", content: DEFAULT_CONTENT }
    })
  }
  return <PageView title={page.title} content={page.content} slug="legal-disclaimer" />
}
