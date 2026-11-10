import { db } from "@/lib/db"
import { PageView } from "../about-us/page-view"

export const dynamic = "force-dynamic"

const DEFAULT_CONTENT = `Terms of Service - TradeSeekho PK

1. Acceptance of Terms: By using TradeSeekho PK, you agree to these terms. If you do not agree, please do not use the app.

2. Educational Purpose: All content including lessons, signals, and market analysis is for educational purposes only. This is not financial advice.

3. Not Financial Advice: We are not SECP registered financial advisors. We do not provide investment advice. All trading decisions are your own responsibility.

4. Risk Warning: Trading in Forex, Gold (XAU/USD) and Crypto involves substantial risk of loss and is not suitable for all investors. Never trade with money you cannot afford to lose.

5. No Guarantee: We do not guarantee any profit or income. Past performance is not indicative of future results.

6. User Accounts: You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to use this app.

7. Pro Accounts: Pro access is granted after payment verification. Refunds are handled on a case-by-case basis — contact tradeseekhopk@gmail.com.

8. Data & Privacy: We do not collect CNIC, Bank details or Password. To delete your account and data, please email us at tradeseekhopk@gmail.com and we will delete it within 7 days.

9. Intellectual Property: All lessons and signals are our own original content. You may not copy, redistribute, or resell our content without permission.

10. Termination: We reserve the right to suspend or terminate accounts that violate these terms.

11. Changes to Terms: We may update these terms from time to time. Continued use of the app constitutes acceptance of the updated terms.

12. Contact: For any questions about these terms, email us at tradeseekhopk@gmail.com

By using this app, you agree to these Terms of Service.`

export default async function TermsPage() {
  let page = await db.pageContent.findUnique({ where: { slug: "terms" } })
  if (!page) {
    page = await db.pageContent.create({
      data: { slug: "terms", title: "Terms of Service - TradeSeekho PK", content: DEFAULT_CONTENT }
    })
  }
  return <PageView title={page.title} content={page.content} slug="terms" />
}
