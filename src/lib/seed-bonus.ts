/* TradeSeekho Bonus Module — Pro Trader Journey
   5 lessons (eurusd-46 to eurusd-50) + 25 quiz questions
   Run via POST /api/admin/seed-bonus (admin-gated)
   Bonus lessons continue inside the Advanced category with order 17-21:
   Live Trading Sessions, Withdrawal & Profit Management, Prop Firm Rules,
   When Not to Trade, 1-Year Career Roadmap. */
import type { PrismaClient } from "@prisma/client"

type QuizQ = {
  type: "MCQ"
  prompt: { en: string; ur: string; hi: string; ar: string }
  options: { en: string; ur: string; hi: string; ar: string }[]
  correctIndex: number
  explanation: { en: string; ur: string; hi: string; ar: string }
}

type LessonSeed = {
  id: string
  order: number
  title: { en: string; ur: string; hi: string; ar: string }
  summary: { en: string; ur: string; hi: string; ar: string }
  content: { en: string; ur: string; hi: string; ar: string }
  durationMin: number
  isFree: boolean
  questions: QuizQ[]
}

const LESSONS: LessonSeed[] = [
  // ===== LESSON 46: Live Trading Sessions — 3 Real Trades =====
  {
    id: "eurusd-46",
    order: 17,
    title: {
      en: "Live Trading Sessions - 3 Real Trades | London Kill Zone",
      ur: "Live Trading Sessions - 3 Real Trades | London Kill Zone",
      hi: "लाइव ट्रेडिंग सत्र - 3 वास्तविक ट्रेड | लंदन किल ज़ोन",
      ar: "جلسات التداول المباشر - 3 صفقات حقيقية | منطقة قتل لندن",
    },
    summary: {
      en: "Watch 3 real live trades using the SMC strategy during the London Kill Zone — Bullish OB+FVG, Bearish Breaker, and Post-News FVG Fill.",
      ur: "London Kill Zone میں SMC strategy سے لیے گئے 3 live trades دیکھیں — Bullish OB+FVG، Bearish Breaker، اور News کے بعد FVG Fill۔",
      hi: "लंदन किल ज़ोन में SMC strategy से लिए गए 3 live trades देखें — Bullish OB+FVG, Bearish Breaker, और News के बाद FVG Fill।",
      ar: "شاهد 3 صفقات مباشرة حقيقية باستخدام استراتيجية SMC خلال منطقة قتل لندن — OB صعودي+FVG، Breaker هبوطي، وملء FVG بعد الأخبار.",
    },
    content: {
      en: `## Live Trading Sessions - 3 Real Trades | London Kill Zone

Theory is over, now practical. I am showing you 3 live trades taken from this same SMC strategy.

### Trade 1: Bullish OB + FVG
Date: 10-Sep-2026. Pair: EUR/USD. Time: 1:30 PM Pak.
Daily Bias: Bullish. H1 took Sell Side Liquidity at 1.0940. M15 formed Bullish OB at 1.0950 + FVG at 1.0955.
Entry: Buy at 1.0955, SL: 1.0935 (20 pips), TP: 1.0995 (40 pips) = 1:2 Win. Profit $4 on 0.02 lot.

### Trade 2: Bearish Breaker
EUR/USD at 1.1050 Resistance. Bullish OB failed = Breaker Block formed at 1.1045. Entry Sell at 1.1040, SL 1.1060, TP 1.1000 = 1:2 Win.

### Trade 3: FVG Fill After News
After CPI news, EUR/USD took 50 pips up liquidity then came down. Buy at FVG 1.0980. 1:2.5 Win.

### Golden Rule
In every live trade, first write the Daily Bias, then take the entry.`,
      ur: `## Live Trading Sessions - 3 Real Trades | London Kill Zone

Theory ختم، اب practical۔ میں آپ کو 3 live trade دکھا رہا ہوں جو اسی SMC strategy سے لیے گئے۔

### Trade 1: Bullish OB + FVG
Date: 10-Sep-2026. Pair: EUR/USD. Time: 1:30 PM Pak.
Daily Bias: Bullish. H1 نے Sell Side Liquidity 1.0940 لی۔ M15 پر Bullish OB 1.0950 + FVG 1.0955 بنا۔
Entry: 1.0955 Buy، SL: 1.0935 (20 pips)، TP: 1.0995 (40 pips) = 1:2 Win۔ Profit $4 on 0.02 lot۔

### Trade 2: Bearish Breaker
EUR/USD 1.1050 Resistance پر۔ Bullish OB fail ہوا = Breaker Block 1.1045 بنا۔ Entry Sell 1.1040، SL 1.1060، TP 1.1000 = 1:2 Win۔

### Trade 3: News ke Baad FVG Fill
CPI news کے بعد EUR/USD نے 50 pips اوپر liquidity لی پھر نیچے آیا۔ FVG 1.0980 پر Buy۔ 1:2.5 Win۔

### Golden Rule
ہر live trade میں پہلے Daily Bias لکھو، پھر entry۔`,
      hi: `## लाइव ट्रेडिंग सत्र - 3 वास्तविक ट्रेड | लंदन किल ज़ोन

Theory खत्म, अब practical। मैं आपको 3 live trade दिखा रहा हूँ जो इसी SMC strategy से लिए गए।

### Trade 1: Bullish OB + FVG
Date: 10-Sep-2026. Pair: EUR/USD. Time: 1:30 PM Pak.
Daily Bias: Bullish. H1 ने Sell Side Liquidity 1.0940 ली। M15 पर Bullish OB 1.0950 + FVG 1.0955 बना।
Entry: 1.0955 Buy, SL: 1.0935 (20 pips), TP: 1.0995 (40 pips) = 1:2 Win। Profit $4 on 0.02 lot।

### Trade 2: Bearish Breaker
EUR/USD 1.1050 Resistance पर। Bullish OB fail हुआ = Breaker Block 1.1045 बना। Entry Sell 1.1040, SL 1.1060, TP 1.1000 = 1:2 Win।

### Trade 3: News के बाद FVG Fill
CPI news के बाद EUR/USD ने 50 pips ऊपर liquidity ली फिर नीचे आया। FVG 1.0980 पर Buy। 1:2.5 Win।

### Golden Rule
हर live trade में पहले Daily Bias लिखो, फिर entry।`,
      ar: `## جلسات التداول المباشر - 3 صفقات حقيقية | منطقة قتل لندن

انتهى النظري، الآن العملي. أعرض لك 3 صفقات مباشرة مأخوذة من نفس استراتيجية SMC.

### الصفقة 1: OB صعودي + FVG
التاريخ: 10-Sep-2026. الزوج: EUR/USD. الوقت: 1:30 PM بتوقيت باكستان.
الاتجاه اليومي: صعودي. H1 أخذ سيولة البيع عند 1.0940. على M15 تشكل OB صعودي عند 1.0950 + FVG عند 1.0955.
الدخول: شراء عند 1.0955، وقف الخسارة: 1.0935 (20 نقطة)، الهدف: 1.0995 (40 نقطة) = فوز 1:2. الربح 4$ على 0.02 لوت.

### الصفقة 2: Breaker هبوطي
EUR/USD عند مقاومة 1.1050. فشل OB الصعودي = تشكل Breaker Block عند 1.1045. الدخول بيع عند 1.1040، وقف 1.1060، الهدف 1.1000 = فوز 1:2.

### الصفقة 3: ملء FVG بعد الأخبار
بعد أخبار CPI، أخذ EUR/USD سيولة 50 نقطة لأعلى ثم نزل. شراء عند FVG 1.0980. فوز 1:2.5.

### القاعدة الذهبية
في كل صفقة مباشرة، اكتب أولاً الاتجاه اليومي، ثم الدخول.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What was the Daily Bias for Trade 1?", ur: "Trade 1 کا Daily Bias کیا تھا؟", hi: "Trade 1 का Daily Bias क्या था?", ar: "ما كان الاتجاه اليومي للصفقة 1؟" },
        options: [
          { en: "Bullish", ur: "Bullish", hi: "Bullish", ar: "صعودي" },
          { en: "Bearish", ur: "Bearish", hi: "Bearish", ar: "هبوطي" },
          { en: "Neutral", ur: "Neutral", hi: "Neutral", ar: "محايد" },
          { en: "Sideways", ur: "Sideways", hi: "Sideways", ar: "جانبي" },
        ],
        correctIndex: 0,
        explanation: { en: "Daily Bias was Bullish — H1 took Sell Side Liquidity at 1.0940, then a Buy was taken.", ur: "Daily Bias Bullish تھا — H1 نے 1.0940 پر Sell Side Liquidity لی، پھر Buy لیا گیا۔", hi: "Daily Bias Bullish था — H1 ने 1.0940 पर Sell Side Liquidity ली, फिर Buy लिया गया।", ar: "كان الاتجاه اليومي صعودياً — أخذ H1 سيولة البيع عند 1.0940، ثم أُخذ شراء." },
      },
      {
        type: "MCQ",
        prompt: { en: "What was the Risk:Reward ratio for Trade 1?", ur: "Trade 1 کا Risk:Reward ratio کیا تھا؟", hi: "Trade 1 का Risk:Reward ratio क्या था?", ar: "ما كان نسبة المخاطرة إلى العائد للصفقة 1؟" },
        options: [
          { en: "1:1", ur: "1:1", hi: "1:1", ar: "1:1" },
          { en: "1:2", ur: "1:2", hi: "1:2", ar: "1:2" },
          { en: "1:3", ur: "1:3", hi: "1:3", ar: "1:3" },
          { en: "1:5", ur: "1:5", hi: "1:5", ar: "1:5" },
        ],
        correctIndex: 1,
        explanation: { en: "SL was 20 pips and TP was 40 pips, giving a 1:2 Risk:Reward ratio.", ur: "SL 20 pips اور TP 40 pips تھا، یعنی 1:2 Risk:Reward ratio۔", hi: "SL 20 pips और TP 40 pips था, यानी 1:2 Risk:Reward ratio।", ar: "كان وقف الخسارة 20 نقطة والهدف 40 نقطة، مما يعطي نسبة مخاطرة إلى عائد 1:2." },
      },
      {
        type: "MCQ",
        prompt: { en: "In Trade 2, what formed when the Bullish OB failed?", ur: "Trade 2 میں Bullish OB fail ہونے پر کیا بنا؟", hi: "Trade 2 में Bullish OB fail होने पर क्या बना?", ar: "في الصفقة 2، ما الذي تشكل عندما فشل OB الصعودي؟" },
        options: [
          { en: "FVG", ur: "FVG", hi: "FVG", ar: "FVG" },
          { en: "Breaker Block", ur: "Breaker Block", hi: "Breaker Block", ar: "Breaker Block" },
          { en: "Liquidity Void", ur: "Liquidity Void", hi: "Liquidity Void", ar: "Liquidity Void" },
          { en: "Equal Highs", ur: "Equal Highs", hi: "Equal Highs", ar: "Equal Highs" },
        ],
        correctIndex: 1,
        explanation: { en: "When a Bullish OB fails, it converts into a Bearish Breaker Block — used as the Sell entry.", ur: "Bullish OB fail ہونے پر وہ Bearish Breaker Block بن جاتا ہے — جسے Sell entry کے طور پر استعمال کیا جاتا ہے۔", hi: "Bullish OB fail होने पर वह Bearish Breaker Block बन जाता है — जिसे Sell entry के रूप में इस्तेमाल किया जाता है।", ar: "عندما يفشل OB الصعودي، يتحول إلى Breaker Block هبوطي — يُستخدم كدخول بيع." },
      },
      {
        type: "MCQ",
        prompt: { en: "In Trade 3, where was the Buy taken after CPI news?", ur: "Trade 3 میں CPI news کے بعد Buy کہاں لیا گیا؟", hi: "Trade 3 में CPI news के बाद Buy कहाँ लिया गया?", ar: "في الصفقة 3، أين أُخذ الشراء بعد أخبار CPI؟" },
        options: [
          { en: "At the high of 1.1050", ur: "High 1.1050 پر", hi: "High 1.1050 पर", ar: "عند القمة 1.1050" },
          { en: "Before CPI news release", ur: "CPI news سے پہلے", hi: "CPI news से पहले", ar: "قبل صدور أخبار CPI" },
          { en: "At FVG 1.0980 after the news", ur: "News کے بعد FVG 1.0980 پر", hi: "News के बाद FVG 1.0980 पर", ar: "عند FVG 1.0980 بعد الأخبار" },
          { en: "At 1.0940 liquidity", ur: "1.0940 liquidity پر", hi: "1.0940 liquidity पर", ar: "عند سيولة 1.0940" },
        ],
        correctIndex: 2,
        explanation: { en: "After CPI news, EUR/USD took liquidity up then came down — Buy was taken at the FVG fill at 1.0980.", ur: "CPI news کے بعد EUR/USD نے اوپر liquidity لی پھر نیچے آیا — Buy FVG fill 1.0980 پر لیا گیا۔", hi: "CPI news के बाद EUR/USD ने ऊपर liquidity ली फिर नीचे आया — Buy FVG fill 1.0980 पर लिया गया।", ar: "بعد أخبار CPI، أخذ EUR/USD السيولة لأعلى ثم نزل — أُخذ الشراء عند ملء FVG عند 1.0980." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the Golden Rule for live trades?", ur: "Live trades کا Golden Rule کیا ہے؟", hi: "Live trades का Golden Rule क्या है?", ar: "ما هي القاعدة الذهبية للصفقات المباشرة؟" },
        options: [
          { en: "Always use a big lot size", ur: "ہمیشہ بڑا lot size استعمال کریں", hi: "हमेशा बड़ा lot size इस्तेमाल करें", ar: "استخدم دائماً حجم لوت كبير" },
          { en: "Trade without a stop loss", ur: "Stop loss کے بغیر ٹریڈ کریں", hi: "Stop loss के बिना ट्रेड करें", ar: "تداول بدون وقف خسارة" },
          { en: "Write the Daily Bias first, then take the entry", ur: "پہلے Daily Bias لکھیں، پھر entry لیں", hi: "पहले Daily Bias लिखें, फिर entry लें", ar: "اكتب الاتجاه اليومي أولاً، ثم خذ الدخول" },
          { en: "Only trade on Mondays", ur: "صرف Monday کو ٹریڈ کریں", hi: "सिर्फ Monday को ट्रेड करें", ar: "تداول يوم الاثنين فقط" },
        ],
        correctIndex: 2,
        explanation: { en: "Always write the Daily Bias first, then the entry — bias drives the trade direction.", ur: "ہمیشہ پہلے Daily Bias لکھیں، پھر entry — bias ہی trade کی سمت طے کرتا ہے۔", hi: "हमेशा पहले Daily Bias लिखें, फिर entry — bias ही trade की दिशा तय करता है।", ar: "اكتب دائماً الاتجاه اليومي أولاً، ثم الدخول — الاتجاه يحدد مسار الصفقة." },
      },
    ],
  },

  // ===== LESSON 47: Withdrawal & Profit Management =====
  {
    id: "eurusd-47",
    order: 18,
    title: {
      en: "Withdrawal & Profit Management | How to Take Out Money",
      ur: "Withdrawal & Profit Management | پیسے کیسے نکالیں",
      hi: "निकासी और लाभ प्रबंधन | पैसे कैसे निकालें",
      ar: "السحب وإدارة الأرباح | كيف تسحب الأموال",
    },
    summary: {
      en: "90% of traders give profits back to the market because they don't have a withdrawal rule. Learn the 50/30/20 Pro Rule.",
      ur: "90% trader profit کما کر واپس market کو دے دیتے ہیں کیونکہ ان کو withdrawal کا rule نہیں پتا۔ 50/30/20 Pro Rule سیکھیں۔",
      hi: "90% trader profit कमा कर वापस market को दे देते हैं क्योंकि उनको withdrawal का rule नहीं पता। 50/30/20 Pro Rule सीखें।",
      ar: "90% من المتداولين يعيدون الأرباح للسوق لأنهم لا يملكون قاعدة سحب. تعلم قاعدة 50/30/20 الاحترافية.",
    },
    content: {
      en: `## Withdrawal & Profit Management | How to Take Out Money

90% of traders earn profit and give it back to the market because they don't have a withdrawal rule.

### Pro Rule - 50/30/20
1. **Withdraw 50% Profit:** For yourself. Money should come into your hand.
2. **Leave 30% in the Account:** For compounding.
3. **20% Emergency:** Backup in case the account washes out.

### Example
You turned $100 into $200. $100 profit. Withdraw $50 to JazzCash, leave $30 in the account ($130 total), keep $20 separate.
Next target $130 to $200, then apply the same rule again.

### Remember
On every $100 profit, withdrawal is necessary, even if it's just $10. This builds confidence.`,
      ur: `## Withdrawal & Profit Management | پیسے کیسے نکالیں

90% trader profit کما کر واپس market کو دے دیتے ہیں کیونکہ ان کو withdrawal کا rule نہیں پata۔

### Pro Rule - 50/30/20
1. **50% Profit Withdraw:** اپنے لیے۔ ہاتھ میں paisa آنا چاہیے۔
2. **30% Account me Rehne Dein:** Compounding کے لیے۔
3. **20% Emergency:** اگر account wash ہو تو backup۔

### Misaal
$100 سے $200 کیا۔ $100 profit۔ $50 withdraw کر کے JazzCash، $30 account میں رہنے دو ($130 total)، $20 الگ رکھو۔
اگلا target $130 سے $200، پھر سے same rule۔

### Yaad Rakhein
ہر $100 profit پر withdrawal لازم ہے، چاہے $10 ہی کیوں نہ ہو۔ اس سے confidence بنتا ہے۔`,
      hi: `## निकासी और लाभ प्रबंधन | पैसे कैसे निकालें

90% trader profit कमा कर वापस market को दे देते हैं क्योंकि उनको withdrawal का rule नहीं पता।

### Pro Rule - 50/30/20
1. **50% Profit Withdraw:** अपने लिए। हाथ में paisa आना चाहिए।
2. **30% Account में रहने दें:** Compounding के लिए।
3. **20% Emergency:** अगर account wash हो जाए तो backup।

### उदाहरण
$100 से $200 किया। $100 profit। $50 withdraw करके JazzCash, $30 account में रहने दो ($130 total), $20 अलग रखो।
अगला target $130 से $200, फिर से same rule।

### याद रखें
हर $100 profit पर withdrawal ज़रूरी है, चाहे $10 ही क्यों न हो। इससे confidence बनता है।`,
      ar: `## السحب وإدارة الأرباح | كيف تسحب الأموال

90% من المتداولين يربحون ثم يعيدون الأموال للسوق لأنهم لا يملكون قاعدة سحب.

### القاعدة الاحترافية - 50/30/20
1. **سحب 50% من الربح:** لنفسك. يجب أن يأتي المال إلى يدك.
2. **اترك 30% في الحساب:** للتجميع (Compounding).
3. **20% طوارئ:** احتياطي في حالة غسل الحساب.

### مثال
حوّلت $100 إلى $200. الربح $100. اسحب $50 إلى JazzCash، اترك $30 في الحساب ($130 المجموع)، وافصل $20.
الهدف التالي $130 إلى $200، ثم طبق نفس القاعدة.

### تذكر
عند كل $100 ربح، السحب ضروري، حتى لو كان $10 فقط. هذا يبني الثقة.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What percentage of traders give profits back to the market?", ur: "کتنے فیصد trader اپنا profit واپس market کو دے دیتے ہیں؟", hi: "कितने प्रतिशत trader अपना profit वापस market को दे देते हैं?", ar: "كم نسبة المتداولين الذين يعيدون الأرباح للسوق؟" },
        options: [
          { en: "10%", ur: "10%", hi: "10%", ar: "10%" },
          { en: "50%", ur: "50%", hi: "50%", ar: "50%" },
          { en: "90%", ur: "90%", hi: "90%", ar: "90%" },
          { en: "0%", ur: "0%", hi: "0%", ar: "0%" },
        ],
        correctIndex: 2,
        explanation: { en: "90% of traders give profits back to the market because they have no withdrawal rule.", ur: "90% trader اپنا profit واپس market کو دے دیتے ہیں کیونکہ ان کے پاس withdrawal کا rule نہیں ہوتا۔", hi: "90% trader अपना profit वापस market को दे देते हैं क्योंकि उनके पास withdrawal का rule नहीं होता।", ar: "90% من المتداولين يعيدون الأرباح للسوق لأنهم لا يملكون قاعدة سحب." },
      },
      {
        type: "MCQ",
        prompt: { en: "In the 50/30/20 rule, what percentage of profit should be withdrawn?", ur: "50/30/20 rule میں profit کا کتنا فیصد withdraw کرنا چاہیے؟", hi: "50/30/20 rule में profit का कितना प्रतिशत withdraw करना चाहिए?", ar: "في قاعدة 50/30/20، كم نسبة الربح التي يجب سحبها؟" },
        options: [
          { en: "20%", ur: "20%", hi: "20%", ar: "20%" },
          { en: "30%", ur: "30%", hi: "30%", ar: "30%" },
          { en: "50%", ur: "50%", hi: "50%", ar: "50%" },
          { en: "100%", ur: "100%", hi: "100%", ar: "100%" },
        ],
        correctIndex: 2,
        explanation: { en: "50% of profit is withdrawn so real money reaches your hand (e.g. JazzCash).", ur: "Profit کا 50% withdraw کیا جاتا ہے تاکہ اصل paisa آپ کے ہاتھ میں آئے (جیسے JazzCash)۔", hi: "Profit का 50% withdraw किया जाता है ताकि असली paisa आपके हाथ में आए (जैसे JazzCash)।", ar: "يُسحب 50% من الربح حتى يصل المال الحقيقي إلى يدك (مثل JazzCash)." },
      },
      {
        type: "MCQ",
        prompt: { en: "Why should you leave 30% of profit in the account?", ur: "Profit کا 30% account میں کیوں رہنے دیا جائے؟", hi: "Profit का 30% account में क्यों रहने दिया जाए?", ar: "لماذا تترك 30% من الربح في الحساب؟" },
        options: [
          { en: "To buy new indicators", ur: "نئے indicators خریدنے کے لیے", hi: "नए indicators ख़रीदने के लिए", ar: "لشراء مؤشرات جديدة" },
          { en: "For compounding", ur: "Compounding کے لیے", hi: "Compounding के लिए", ar: "للتجميع (Compounding)" },
          { en: "To pay broker fees", ur: "Broker fees ادا کرنے کے لیے", hi: "Broker fees अदा करने के लिए", ar: "لدفع رسوم الوسيط" },
          { en: "For taxes", ur: "Tax کے لیے", hi: "Tax के लिए", ar: "للضرائب" },
        ],
        correctIndex: 1,
        explanation: { en: "30% stays in the account for compounding — so the next target is bigger than the previous one.", ur: "30% account میں compounding کے لیے رہتا ہے — تاکہ اگلا target پچھلے سے بڑا ہو۔", hi: "30% account में compounding के लिए रहता है — ताकि अगला target पिछले से बड़ा हो।", ar: "يبقى 30% في الحساب للتجميع — حتى يكون الهدف التالي أكبر من السابق." },
      },
      {
        type: "MCQ",
        prompt: { en: "In the example, $100 became $200. How much is kept as the 20% emergency backup?", ur: "مثال میں $100 سے $200 ہوا۔ 20% emergency backup کے طور پر کتنا الگ رکھا جائے؟", hi: "उदाहरण में $100 से $200 हुआ। 20% emergency backup के रूप में कितना अलग रखा जाए?", ar: "في المثال، أصبح $100 إلى $200. كم يُفصل كاحتياطي طوارئ 20%؟" },
        options: [
          { en: "$10", ur: "$10", hi: "$10", ar: "$10" },
          { en: "$20", ur: "$20", hi: "$20", ar: "$20" },
          { en: "$30", ur: "$30", hi: "$30", ar: "$30" },
          { en: "$50", ur: "$50", hi: "$50", ar: "$50" },
        ],
        correctIndex: 1,
        explanation: { en: "20% of $100 profit = $20, kept separate as a backup in case the account washes out.", ur: "$100 profit کا 20% = $20، الگ رکھا جاتا ہے تاکہ account wash ہو تو backup ہو۔", hi: "$100 profit का 20% = $20, अलग रखा जाता है ताकि account wash हो तो backup हो।", ar: "20% من ربح $100 = $20، يُفصل كاحتياطي في حالة غسل الحساب." },
      },
      {
        type: "MCQ",
        prompt: { en: "Why is even a $10 withdrawal important?", ur: "صرف $10 کا withdrawal بھی کیوں ضروری ہے؟", hi: "सिर्फ $10 का withdrawal भी क्यों ज़रूरी है?", ar: "لماذا حتى سحب $10 مهم؟" },
        options: [
          { en: "It pays broker fees", ur: "یہ broker fees ادا کرتا ہے", hi: "यह broker fees अदा करता है", ar: "يدفع رسوم الوسيط" },
          { en: "It builds confidence", ur: "یہ confidence بناتا ہے", hi: "यह confidence बनाता है", ar: "يبني الثقة" },
          { en: "It increases leverage", ur: "یہ leverage بڑھاتا ہے", hi: "यह leverage बढ़ाता है", ar: "يزيد الرافعة المالية" },
          { en: "It's a tax rule", ur: "یہ tax rule ہے", hi: "यह tax rule है", ar: "إنها قاعدة ضريبية" },
        ],
        correctIndex: 1,
        explanation: { en: "Even a small withdrawal builds confidence — money in your hand proves the system works.", ur: "چھوٹا withdrawal بھی confidence بناتا ہے — ہاتھ میں paisا آنے سے ثابت ہوتا ہے کہ system کام کرتا ہے۔", hi: "छोटा withdrawal भी confidence बनाता है — हाथ में paisa आने से साबित होता है कि system काम करता है।", ar: "حتى السحب الصغير يبني الثقة — وصول المال إلى يدك يثبت أن النظام يعمل." },
      },
    ],
  },

  // ===== LESSON 48: Prop Firm / Funded Account Rules =====
  {
    id: "eurusd-48",
    order: 19,
    title: {
      en: "Prop Firm / Funded Account Rules | Why Challenges Fail",
      ur: "Prop Firm / Funded Account Rules | Challenge Fail کیوں ہوتے ہیں",
      hi: "प्रॉप फर्म / फंडेड अकाउंट नियम | Challenge क्यों Fail होते हैं",
      ar: "قواعد شركة البروب / الحساب المموّل | لماذا تفشل التحديات",
    },
    summary: {
      en: "Funded accounts aren't like real accounts — their rules are strict. Learn the top 5 fail reasons and the pass formula.",
      ur: "Funded account اصل account جیسا نہیں، اس کے rules سخت ہیں۔ Top 5 fail reasons اور pass formula سیکھیں۔",
      hi: "Funded account असली account जैसा नहीं, इसके rules सख्त हैं। Top 5 fail reasons और pass formula सीखें।",
      ar: "الحساب المموّل ليس مثل الحساب الحقيقي، قواعده صارمة. تعلم أهم 5 أسباب للفشل وصيغة النجاح.",
    },
    content: {
      en: `## Prop Firm / Funded Account Rules | Why Challenges Fail

A funded account is not like a real account — its rules are strict.

### Top 5 Fail Reasons
1. **Daily Loss 5%:** On a $10,000 account, losing more than $500 in a day = Fail. Solution: Don't risk more than 0.5% daily.
2. **IP Rule:** Running two accounts from one IP or sharing VPS = Ban.
3. **Gambling:** Taking a big lot on news = Fail.
4. **Weekend Hold:** Some firms don't allow holding trades over the weekend. Close on Friday.
5. **Consistency Rule:** Don't make 50% profit in one day, do a little every day.

### Pass Formula
One trade per day, 0.5% risk, 1:2 RR, hit 8% target in 15 days.`,
      ur: `## Prop Firm / Funded Account Rules | Challenge Fail کیوں ہوتے ہیں

Funded account اصل account جیسا نہیں، اس کے rules سخت ہیں۔

### Top 5 Fail Reasons
1. **Daily Loss 5%:** $10,000 account پر din کا $500 سے زیادہ loss = Fail۔ Hal: Roz 0.5% سے زیادہ risk نہیں۔
2. **IP Rule:** ایک IP سے دو account یا VPS share کرنا = Ban۔
3. **Gambling:** News پر بڑا lot لگانا = Fail۔
4. **Weekend Hold:** کچھ firms weekend پر trade hold نہیں کرنے دیتی۔ Friday کو close کرو۔
5. **Consistency Rule:** ایک din میں 50% profit نہیں کرنا، roz thoda thoda۔

### Pass Formula
Roz 1 trade، 0.5% risk، 1:2 RR، 15 din میں 8% target pura۔`,
      hi: `## प्रॉप फर्म / फंडेड अकाउंट नियम | Challenge क्यों Fail होते हैं

Funded account असली account जैसा नहीं, इसके rules सख्त हैं।

### Top 5 Fail Reasons
1. **Daily Loss 5%:** $10,000 account पर दिन का $500 से ज़्यादा loss = Fail। Hal: रोज़ 0.5% से ज़्यादा risk नहीं।
2. **IP Rule:** एक IP से दो account या VPS share करना = Ban।
3. **Gambling:** News पर बड़ा lot लगाना = Fail।
4. **Weekend Hold:** कुछ firms weekend पर trade hold नहीं करने देती। Friday को close करो।
5. **Consistency Rule:** एक दिन में 50% profit नहीं करना, रोज़ थोड़ा थोड़ा।

### Pass Formula
रोज़ 1 trade, 0.5% risk, 1:2 RR, 15 दिन में 8% target पूरा।`,
      ar: `## قواعد شركة البروب / الحساب المموّل | لماذا تفشل التحديات

الحساب المموّل ليس مثل الحساب الحقيقي، قواعده صارمة.

### أهم 5 أسباب للفشل
1. **الخسارة اليومية 5%:** على حساب $10,000، خسارة أكثر من $500 في اليوم = فشل. الحل: لا تخاطر بأكثر من 0.5% يومياً.
2. **قاعدة IP:** تشغيل حسابين من IP واحد أو مشاركة VPS = حظر.
3. **المقامرة:** وضع لوت كبير على الأخبار = فشل.
4. **حمل عطلة نهاية الأسبوع:** بعض الشركات لا تسمح بحمل الصفقات خلال عطلة نهاية الأسبوع. أغلق يوم الجمعة.
5. **قاعدة الاتساق:** لا تحقق 50% ربح في يوم واحد، افعل القليل كل يوم.

### صيغة النجاح
صفقة واحدة يومياً، مخاطرة 0.5%، RR 1:2، تحقيق هدف 8% في 15 يوماً.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "On a $10,000 prop account, what daily loss amount causes a fail?", ur: "$10,000 کے prop account پر din کا کتنا loss چلے تو Fail ہو جاتا ہے؟", hi: "$10,000 के prop account पर दिन का कितना loss चले तो Fail हो जाता है?", ar: "على حساب بروب $10,000، كم خسارة يومية تسبب الفشل؟" },
        options: [
          { en: "$50", ur: "$50", hi: "$50", ar: "$50" },
          { en: "$100", ur: "$100", hi: "$100", ar: "$100" },
          { en: "$500", ur: "$500", hi: "$500", ar: "$500" },
          { en: "$1000", ur: "$1000", hi: "$1000", ar: "$1000" },
        ],
        correctIndex: 2,
        explanation: { en: "A 5% daily loss on $10,000 = $500 — exceeding this triggers an automatic fail.", ur: "$10,000 پر 5% daily loss = $500 — اس سے زیادہ ہوتے ہی خودکار Fail ہو جاتا ہے۔", hi: "$10,000 पर 5% daily loss = $500 — इससे ज़्यादा होते ही स्वचालित Fail हो जाता है।", ar: "خسارة يومية 5% على $10,000 = $500 — تجاوز ذلك يسبب فشلاً تلقائياً." },
      },
      {
        type: "MCQ",
        prompt: { en: "What happens if you share a VPS or run two accounts from one IP?", ur: "VPS share کرنے یا ایک IP سے دو account چلانے پر کیا ہوتا ہے؟", hi: "VPS share करने या एक IP से दो account चलाने पर क्या होता है?", ar: "ماذا يحدث إذا شاركت VPS أو شغّلت حسابين من IP واحد؟" },
        options: [
          { en: "Nothing happens", ur: "کچھ نہیں ہوتا", hi: "कुछ नहीं होता", ar: "لا يحدث شيء" },
          { en: "You get a bonus reward", ur: "Bonus ملتا ہے", hi: "Bonus मिलता है", ar: "تحصل على مكافأة" },
          { en: "Account ban", ur: "Account Ban ہو جاتا ہے", hi: "Account Ban हो जाता है", ar: "يُحظر الحساب" },
          { en: "Slow execution only", ur: "صرف execution سست ہوتا ہے", hi: "सिर्फ execution धीमा होता है", ar: "بطء التنفيذ فقط" },
        ],
        correctIndex: 2,
        explanation: { en: "Prop firms ban accounts that share VPS or run two accounts from one IP — it violates the IP rule.", ur: "Prop firms ایسے accounts بان کر دیتی ہیں جو VPS share کریں یا ایک IP سے دو accounts چلائیں — یہ IP rule کی خلاف ورزی ہے۔", hi: "Prop firms ऐसे accounts बैन कर देती हैं जो VPS share करें या एक IP से दो accounts चलाएँ — यह IP rule का उल्लंघन है।", ar: "تقوم شركات البروب بحظر الحسابات التي تشارك VPS أو تشغل حسابين من IP واحد — هذا ينتهك قاعدة IP." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the recommended daily risk percentage for passing a prop challenge?", ur: "Prop challenge پاس کرنے کے لیے روزانہ کتنا فیصد risk تجویز کیا جاتا ہے؟", hi: "Prop challenge पास करने के लिए रोज़ाना कितना प्रतिशत risk अनुशंसित किया जाता है?", ar: "كم نسبة المخاطرة اليومية الموصى بها لاجتياز تحدي البروب؟" },
        options: [
          { en: "5%", ur: "5%", hi: "5%", ar: "5%" },
          { en: "2%", ur: "2%", hi: "2%", ar: "2%" },
          { en: "0.5%", ur: "0.5%", hi: "0.5%", ar: "0.5%" },
          { en: "10%", ur: "10%", hi: "10%", ar: "10%" },
        ],
        correctIndex: 2,
        explanation: { en: "0.5% daily risk keeps you safely away from the 5% daily loss limit.", ur: "0.5% daily risk آپ کو 5% daily loss limit سے محفوظ رکھتا ہے۔", hi: "0.5% daily risk आपको 5% daily loss limit से सुरक्षित रखता है।", ar: "مخاطرة 0.5% يومياً تبقيك بعيداً بأمان عن حد الخسارة اليومي 5%." },
      },
      {
        type: "MCQ",
        prompt: { en: "Why should you close trades on Friday in some prop firms?", ur: "کچھ Prop firms میں Friday کو trades کیوں close کرنی چاہئیں؟", hi: "कुछ Prop firms में Friday को trades क्यों close करनी चाहिए?", ar: "لماذا يجب إغلاق الصفقات يوم الجمعة في بعض شركات البروب؟" },
        options: [
          { en: "Spread is too low", ur: "Spread بہت کم ہوتا ہے", hi: "Spread बहुत कम होता है", ar: "السبريد منخفض جداً" },
          { en: "Some firms don't allow weekend hold", ur: "کچھ firms weekend hold کی اجازت نہیں دیتیں", hi: "कुछ firms weekend hold की अनुमति नहीं देतीं", ar: "بعض الشركات لا تسمح بحمل عطلة نهاية الأسبوع" },
          { en: "Friday is a bank holiday", ur: "Friday bank holiday ہے", hi: "Friday bank holiday है", ar: "الجمعة عطلة بنكية" },
          { en: "To avoid news events", ur: "News events سے بچنے کے لیے", hi: "News events से बचने के लिए", ar: "لتجنب الأحداث الإخبارية" },
        ],
        correctIndex: 1,
        explanation: { en: "Some prop firms don't allow holding trades over the weekend — close on Friday to avoid breaching the rule.", ur: "کچھ Prop firms weekend پر trade hold کی اجازت نہیں دیتیں — rule کی خلاف ورزی سے بچنے کے لیے Friday کو close کریں۔", hi: "कुछ Prop firms weekend पर trade hold की अनुमति नहीं देतीं — rule के उल्लंघन से बचने के लिए Friday को close करें।", ar: "بعض شركات البروب لا تسمح بحمل الصفقات خلال عطلة نهاية الأسبوع — أغلق يوم الجمعة لتجنب انتهاك القاعدة." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the Pass Formula for a prop challenge?", ur: "Prop challenge پاس کرنے کا Pass Formula کیا ہے؟", hi: "Prop challenge पास करने का Pass Formula क्या है?", ar: "ما هي صيغة النجاح لتحدي البروب؟" },
        options: [
          { en: "10 trades/day, 5% risk, 1:10 RR", ur: "10 trades/day، 5% risk، 1:10 RR", hi: "10 trades/day, 5% risk, 1:10 RR", ar: "10 صفقات/يوم، مخاطرة 5%، RR 1:10" },
          { en: "1 trade/day, 0.5% risk, 1:2 RR, 8% target in 15 days", ur: "1 trade/day، 0.5% risk، 1:2 RR، 15 din میں 8% target", hi: "1 trade/day, 0.5% risk, 1:2 RR, 15 दिन में 8% target", ar: "صفقة/يوم، مخاطرة 0.5%، RR 1:2، هدف 8% في 15 يوماً" },
          { en: "5 trades/day, 1% risk, 1:1 RR", ur: "5 trades/day، 1% risk، 1:1 RR", hi: "5 trades/day, 1% risk, 1:1 RR", ar: "5 صفقات/يوم، مخاطرة 1%، RR 1:1" },
          { en: "0 trades/day, wait for major news", ur: "0 trades/day، بڑی news کا انتظار", hi: "0 trades/day, बड़ी news का इंतज़ार", ar: "0 صفقات/يوم، انتظار الأخبار الكبرى" },
        ],
        correctIndex: 1,
        explanation: { en: "1 trade per day, 0.5% risk, 1:2 RR, hits the 8% target safely in 15 days.", ur: "Roz 1 trade، 0.5% risk، 1:2 RR، 15 din میں 8% target محفوظ طریقے سے پورا ہو جاتا ہے۔", hi: "Roz 1 trade, 0.5% risk, 1:2 RR, 15 दिन में 8% target सुरक्षित तरीके से पूरा हो जाता है।", ar: "صفقة واحدة يومياً، مخاطرة 0.5%، RR 1:2، تحقق هدف 8% بأمان في 15 يوماً." },
      },
    ],
  },

  // ===== LESSON 49: Kab Trade Nahi Karna — Market Holidays & Dead Zones =====
  {
    id: "eurusd-49",
    order: 20,
    title: {
      en: "When Not to Trade | Market Holidays & Dead Zones",
      ur: "Kab Trade Nahi Karna | Market Holidays & Dead Zones",
      hi: "कब ट्रेड नहीं करना | मार्केट छुट्टियाँ और डेड ज़ोन",
      ar: "متى لا تتداول | عطلات السوق والمناطق الميتة",
    },
    summary: {
      en: "A pro trader knows when NOT to trade. Learn the no-trade days and dead zones (12am-8am Pak time).",
      ur: "Pro trader کو pata ہوتا ہے kab trade نہیں کرنا۔ No-trade days اور dead zones (12am-8am Pak time) سیکھیں۔",
      hi: "Pro trader को पता होता है कब ट्रेड नहीं करना। No-trade days और dead zones (12am-8am Pak time) सीखें।",
      ar: "المتداول المحترف يعرف متى لا يتداول. تعلم أيام عدم التداول والمناطق الميتة (12am-8am بتوقيت باكستان).",
    },
    content: {
      en: `## When Not to Trade | Market Holidays & Dead Zones

A pro trader knows when not to trade. A beginner trades all the time.

### No Trade Days
1. **Christmas (24 Dec - 26 Dec) & New Year (31 Dec - 2 Jan):** Banks closed, market dead.
2. **NFP Week Friday:** 2 hours before NFP, the market moves weirdly. Avoid.
3. **Monday's First Hour:** Spread is very high in EUR/USD — 3-5 pips.
4. **Your Personal Bad Day:** Lack of sleep, anger, or after 2 losses = No Trade.

### Dead Zone (Pak Time)
Night 12am - 8am. During this time EUR/USD is slow, SL hunts happen more.`,
      ur: `## Kab Trade Nahi Karna | Market Holidays & Dead Zones

Pro trader کو pata ہوتا ہے kab trade نہیں کرنا، beginner ہر waqt trade کرتا ہے۔

### No Trade Days
1. **Christmas (24 Dec - 26 Dec) & New Year (31 Dec - 2 Jan):** Bank band، market dead۔
2. **NFP Week ka Jummah:** NFP سے پہلے 2 گھنٹے market عجیب چلتی ہے۔ Avoid۔
3. **Monday ka Pehla Ghanta:** Spread بہت زیادہ ہوتا ہے EUR/USD میں 3-5 pips۔
4. **Aap ka Personal Bad Day:** نیند puri نہیں، غصہ، یا 2 loss کے بعد = No Trade۔

### Dead Zone Pak Time
رات 12am - 8am۔ اس time EUR/USD slow ہوتا ہے، SL hunt زیادہ ہوتا ہے۔`,
      hi: `## कब ट्रेड नहीं करना | मार्केट छुट्टियाँ और डेड ज़ोन

Pro trader को पता होता है कब ट्रेड नहीं करना, beginner हर waqt ट्रेड करता है।

### No Trade Days
1. **Christmas (24 Dec - 26 Dec) & New Year (31 Dec - 2 Jan):** Bank बंद, market dead।
2. **NFP Week का Jummah:** NFP से पहले 2 घंटे market अजीब चलती है। Avoid।
3. **Monday का पहला घंटा:** Spread बहुत ज़्यादा होता है EUR/USD में 3-5 pips।
4. **आपका Personal Bad Day:** नींद पूरी नहीं, गुस्सा, या 2 loss के बाद = No Trade।

### Dead Zone (Pak Time)
रात 12am - 8am। इस time EUR/USD slow होता है, SL hunt ज़्यादा होता है।`,
      ar: `## متى لا تتداول | عطلات السوق والمناطق الميتة

المتداول المحترف يعرف متى لا يتداول، المبتدئ يتداول طوال الوقت.

### أيام عدم التداول
1. **الكريسماس (24 ديسمبر - 26 ديسمبر) ورأس السنة (31 ديسمبر - 2 يناير):** البنوك مغلقة، السوق ميت.
2. **جمعة أسبوع NFP:** قبل ساعتين من NFP، يتحرك السوق بشكل غريب. تجنب.
3. **الساعة الأولى من يوم الاثنين:** السبريد مرتفع جداً في EUR/USD — 3-5 نقاط.
4. **يومك السيء الشخصي:** قلة النوم، الغضب، أو بعد خسارتين = لا تتداول.

### المنطقة الميتة (بتوقيت باكستان)
ليلاً 12am - 8am. خلال هذا الوقت EUR/USD بطيء، وصيد وقف الخسارة يكثر.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "When are banks closed and the market dead?", ur: "Bank کب بند اور market dead ہوتی ہے؟", hi: "Bank कब बंद और market dead होती है?", ar: "متى تكون البنوك مغلقة والسوق ميتاً؟" },
        options: [
          { en: "Eid holidays", ur: "Eid کی چھٹیاں", hi: "Eid की छुट्टियाँ", ar: "عطلة العيد" },
          { en: "Christmas (24-26 Dec) & New Year (31 Dec - 2 Jan)", ur: "Christmas (24-26 Dec) اور New Year (31 Dec - 2 Jan)", hi: "Christmas (24-26 Dec) और New Year (31 Dec - 2 Jan)", ar: "الكريسماس (24-26 ديسمبر) ورأس السنة (31 ديسمبر - 2 يناير)" },
          { en: "Every weekend", ur: "ہر weekend", hi: "हर weekend", ar: "كل عطلة نهاية أسبوع" },
          { en: "Ramadan month", ur: "Ramadan کا مہینہ", hi: "Ramadan का महीना", ar: "شهر رمضان" },
        ],
        correctIndex: 1,
        explanation: { en: "Banks close during Christmas (24-26 Dec) and New Year (31 Dec - 2 Jan), making the market dead.", ur: "Christmas (24-26 Dec) اور New Year (31 Dec - 2 Jan) کے دوران Bank بند ہوتے ہیں، جس سے market dead ہو جاتی ہے۔", hi: "Christmas (24-26 Dec) और New Year (31 Dec - 2 Jan) के दौरान Bank बंद होते हैं, जिससे market dead हो जाती है।", ar: "تُغلق البنوك خلال الكريسماس (24-26 ديسمبر) ورأس السنة (31 ديسمبر - 2 يناير)، مما يجعل السوق ميتاً." },
      },
      {
        type: "MCQ",
        prompt: { en: "When should you avoid trading on NFP week Friday?", ur: "NFP week کے Jummah کو کب ٹریڈ نہیں کرنا چاہیے؟", hi: "NFP week के Jummah को कब ट्रेड नहीं करना चाहिए?", ar: "متى يجب تجنب التداول في جمعة أسبوع NFP؟" },
        options: [
          { en: "2 hours after NFP", ur: "NFP کے 2 گھنٹے بعد", hi: "NFP के 2 घंटे बाद", ar: "بعد ساعتين من NFP" },
          { en: "2 hours before NFP", ur: "NFP سے 2 گھنٹے پہلے", hi: "NFP से 2 घंटे पहले", ar: "قبل ساعتين من NFP" },
          { en: "The whole Friday", ur: "پورا Friday", hi: "पूरा Friday", ar: "كامل يوم الجمعة" },
          { en: "The entire week", ur: "پورا ہفتہ", hi: "पूरा हफ़्ता", ar: "الأسبوع كاملاً" },
        ],
        correctIndex: 1,
        explanation: { en: "2 hours before NFP, the market moves weirdly and unpredictably — avoid trading.", ur: "NFP سے 2 گھنٹے پہلے market عجیب اور غیر متوقع چلتی ہے — ٹریڈنگ سے بچیں۔", hi: "NFP से 2 घंटे पहले market अजीब और अनियमित चलती है — ट्रेडिंग से बचें।", ar: "قبل ساعتين من NFP، يتحرك السوق بشكل غريب وغير متوقع — تجنب التداول." },
      },
      {
        type: "MCQ",
        prompt: { en: "Why avoid Monday's first hour in EUR/USD?", ur: "EUR/USD میں Monday کے پہلے گھنٹے سے کیوں بچیں؟", hi: "EUR/USD में Monday के पहले घंटे से क्यों बचें?", ar: "لماذا تجنب الساعة الأولى من يوم الاثنين في EUR/USD؟" },
        options: [
          { en: "Banks are closed", ur: "Bank بند ہوتے ہیں", hi: "Bank बंद होते हैं", ar: "البنوك مغلقة" },
          { en: "Major news is released", ur: "بڑی news آتی ہے", hi: "बड़ी news आती है", ar: "تصدر أخبار كبرى" },
          { en: "Spread is very high (3-5 pips)", ur: "Spread بہت زیادہ ہوتا ہے (3-5 pips)", hi: "Spread बहुत ज़्यादा होता है (3-5 pips)", ar: "السبريد مرتفع جداً (3-5 نقاط)" },
          { en: "No liquidity at all", ur: "کوئی liquidity نہیں", hi: "कोई liquidity नहीं", ar: "لا سيولة إطلاقاً" },
        ],
        correctIndex: 2,
        explanation: { en: "On Monday's first hour, EUR/USD spread jumps to 3-5 pips, making entries risky.", ur: "Monday کے پہلے گھنٹے میں EUR/USD کا spread 3-5 pips تک چلا جاتا ہے، جس سے entries خطرناک ہو جاتی ہیں۔", hi: "Monday के पहले घंटे में EUR/USD का spread 3-5 pips तक चला जाता है, जिससे entries खतरनाक हो जाती हैं।", ar: "في الساعة الأولى من يوم الاثنين، يقفز سبريد EUR/USD إلى 3-5 نقاط، مما يجعل الدخول محفوفاً بالمخاطر." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the Dead Zone in Pakistan time?", ur: "Pakistan time میں Dead Zone کیا ہے؟", hi: "Pakistan time में Dead Zone क्या है?", ar: "ما هي المنطقة الميتة بتوقيت باكستان؟" },
        options: [
          { en: "8am - 12pm", ur: "8am - 12pm", hi: "8am - 12pm", ar: "8am - 12pm" },
          { en: "12pm - 4pm", ur: "12pm - 4pm", hi: "12pm - 4pm", ar: "12pm - 4pm" },
          { en: "12am - 8am (night)", ur: "12am - 8am (رات)", hi: "12am - 8am (रात)", ar: "12am - 8am (ليلاً)" },
          { en: "4pm - 8pm", ur: "4pm - 8pm", hi: "4pm - 8pm", ar: "4pm - 8pm" },
        ],
        correctIndex: 2,
        explanation: { en: "The dead zone is 12am-8am Pak time — EUR/USD is slow and SL hunts are more frequent.", ur: "Dead zone 12am-8am Pak time ہے — EUR/USD slow ہوتا ہے اور SL hunts زیادہ ہوتے ہیں۔", hi: "Dead zone 12am-8am Pak time है — EUR/USD slow होता है और SL hunts ज़्यादा होते हैं।", ar: "المنطقة الميتة هي 12am-8am بتوقيت باكستان — يكون EUR/USD بطيئاً وصيد وقف الخسارة أكثر تكراراً." },
      },
      {
        type: "MCQ",
        prompt: { en: "Which is a personal 'Bad Day' reason to NOT trade?", ur: "Personal 'Bad Day' کی وجہ سے کب ٹریڈ نہیں کرنا چاہیے؟", hi: "Personal 'Bad Day' की वजह से कब ट्रेड नहीं करना चाहिए?", ar: "ما السبب الشخصي لـ 'يوم سيء' الذي يمنع التداول؟" },
        options: [
          { en: "After one win", ur: "ایک جیت کے بعد", hi: "एक जीत के बाद", ar: "بعد فوز واحد" },
          { en: "Lack of sleep, anger, or after 2 losses", ur: "نیند پوری نہ ہونا، غصہ، یا 2 loss کے بعد", hi: "नींद पूरी न होना, गुस्सा, या 2 loss के बाद", ar: "قلة النوم، الغضب، أو بعد خسارتين" },
          { en: "After a small profit", ur: "چھوٹے profit کے بعد", hi: "छोटे profit के बाद", ar: "بعد ربح صغير" },
          { en: "When feeling bored", ur: "جب bore ہوں", hi: "जब bore हों", ar: "عند الشعور بالملل" },
        ],
        correctIndex: 1,
        explanation: { en: "Lack of sleep, anger, or after 2 losses — emotional/physical state is off, so don't trade.", ur: "نیند پوری نہ ہونا، غصہ، یا 2 loss کے بعد — emotional/physical حالت ٹھیک نہیں، تو ٹریڈ نہ کریں۔", hi: "नींद पूरी न होना, गुस्सा, या 2 loss के बाद — emotional/physical स्थिति ठीक नहीं, तो ट्रेड न करें।", ar: "قلة النوم، الغضب، أو بعد خسارتين — الحالة العاطفية/الجسدية غير سليمة، فلا تتداول." },
      },
    ],
  },

  // ===== LESSON 50: 1 Saal Ka Career Roadmap — $100 se Pro Tak =====
  {
    id: "eurusd-50",
    order: 21,
    title: {
      en: "1 Year Career Roadmap | From $100 to Pro",
      ur: "1 Saal Ka Career Roadmap | $100 سے Pro تک",
      hi: "1 साल का करियर रोडमैप | $100 से Pro तक",
      ar: "خارطة طريق مهنة سنة واحدة | من $100 إلى الاحتراف",
    },
    summary: {
      en: "Your final 1-year roadmap: Learning → Consistency → Funded Challenge → Funded Trader. Take a screenshot.",
      ur: "آپ کا final 1-year roadmap: Learning → Consistency → Funded Challenge → Funded Trader۔ Screenshot لیں۔",
      hi: "आपका final 1-year roadmap: Learning → Consistency → Funded Challenge → Funded Trader। Screenshot लें।",
      ar: "خارطة طريقك النهائية لسنة واحدة: التعلم ← الاتساق ← تحدي البروب ← متداول مموّل. التقط لقطة شاشة.",
    },
    content: {
      en: `## 1 Year Career Roadmap | From $100 to Pro

This is your final roadmap. Take a screenshot.

### Phase 1 - Month 1-3: Learning (You Are Here)
Account: $100 Demo + $100 Real (cent). Target: Reduce losses, build a journal. Lot: 0.01

### Phase 2 - Month 4-6: Consistency
Account: $200-$500. Target: Monthly 10%. Strategy: Only London Kill Zone OB+FVG.

### Phase 3 - Month 7-9: Funded Challenge
Account: Buy $5k Challenge ($50 fee). Target: Pass it. Risk 0.5%.

### Phase 4 - Month 10-12: Funded Trader
Account: $10k-$20k Funded. Target: Monthly $500-$1000 withdrawal. Now you are a Pro.

### Final Advice
For 1 year: 1 Pair EUR/USD, 1 Session (London), 1 Setup (OB+FVG). Don't change the strategy.

### Congratulations! You Are a TradeSeekho PK Graduate! 🎓`,
      ur: `## 1 Saal Ka Career Roadmap | $100 سے Pro تک

یہ آپ کا final roadmap ہے۔ اس کو screenshot لیں۔

### Phase 1 - Month 1-3: Learning (Aap Yahan Hain)
Account: $100 Demo + $100 Real (cent)۔ Target: Loss کم کرنا، journal بنانا۔ Lot: 0.01

### Phase 2 - Month 4-6: Consistency
Account: $200-$500۔ Target: Monthly 10%۔ Strategy: صرف London Kill Zone OB+FVG۔

### Phase 3 - Month 7-9: Funded Challenge
Account: $5k Challenge خریدو ($50 fee)۔ Target: Pass کرو۔ Risk 0.5%۔

### Phase 4 - Month 10-12: Funded Trader
Account: $10k-$20k Funded۔ Target: Monthly $500-$1000 withdrawal۔ اب آپ Pro ہیں۔

### Aakhri Naseehat
1 saal tak 1 Pair EUR/USD، 1 Session (London)، 1 Setup (OB+FVG)۔ Strategy مت بدلو۔

### Mubarak Ho! Aap TradeSeekho PK Graduate Hain! 🎓`,
      hi: `## 1 साल का करियर रोडमैप | $100 से Pro तक

यह आपका final roadmap है। इसको screenshot लें।

### Phase 1 - Month 1-3: Learning (आप यहाँ हैं)
Account: $100 Demo + $100 Real (cent)। Target: Loss कम करना, journal बनाना। Lot: 0.01

### Phase 2 - Month 4-6: Consistency
Account: $200-$500। Target: Monthly 10%। Strategy: सिर्फ London Kill Zone OB+FVG।

### Phase 3 - Month 7-9: Funded Challenge
Account: $5k Challenge ख़रीदो ($50 fee)। Target: Pass करो। Risk 0.5%।

### Phase 4 - Month 10-12: Funded Trader
Account: $10k-$20k Funded। Target: Monthly $500-$1000 withdrawal। अब आप Pro हैं।

### आख़िरी नसीहत
1 साल तक 1 Pair EUR/USD, 1 Session (London), 1 Setup (OB+FVG)। Strategy मत बदलो।

### मुबारक हो! आप TradeSeekho PK Graduate हैं! 🎓`,
      ar: `## خارطة طريق مهنة سنة واحدة | من $100 إلى الاحتراف

هذه خارطة طريقك النهائية. التقط لقطة شاشة.

### المرحلة 1 - الشهر 1-3: التعلم (أنت هنا)
الحساب: $100 تجريبي + $100 حقيقي (cent). الهدف: تقليل الخسائر، بناء يوميات. اللوت: 0.01

### المرحلة 2 - الشهر 4-6: الاتساق
الحساب: $200-$500. الهدف: 10% شهرياً. الاستراتيجية: فقط منطقة قتل لندن OB+FVG.

### المرحلة 3 - الشهر 7-9: تحدي البروب
الحساب: اشترِ تحدي $5k ($50 رسوم). الهدف: اجتازه. المخاطرة 0.5%.

### المرحلة 4 - الشهر 10-12: متداول مموّل
الحساب: $10k-$20k مموّل. الهدف: سحب $500-$1000 شهرياً. الآن أنت محترف.

### نصيحة أخيرة
لسنة كاملة: زوج واحد EUR/USD، جلسة واحدة (لندن)، إعداد واحد (OB+FVG). لا تغيّر الاستراتيجية.

### مبروك! أنت خريج TradeSeekho! 🎓`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What should you focus on in Phase 1 (Month 1-3)?", ur: "Phase 1 (Month 1-3) میں کیا focus کرنا چاہیے؟", hi: "Phase 1 (Month 1-3) में क्या focus करना चाहिए?", ar: "على ماذا يجب التركيز في المرحلة 1 (الشهر 1-3)؟" },
        options: [
          { en: "Trade with big lot sizes", ur: "بڑے lot sizes سے ٹریڈ کریں", hi: "बड़े lot sizes से ट्रेड करें", ar: "التداول بأحجام لوت كبيرة" },
          { en: "Reduce losses and build a journal", ur: "Loss کم کریں اور journal بنائیں", hi: "Loss कम करें और journal बनाएँ", ar: "تقليل الخسائر وبناء يوميات" },
          { en: "Buy a $5k funded challenge", ur: "$5k funded challenge خریدیں", hi: "$5k funded challenge ख़रीदें", ar: "شراء تحدي بروب $5k" },
          { en: "Withdraw all profits immediately", ur: "سارا profit فوراً withdraw کریں", hi: "सारा profit तुरंत withdraw करें", ar: "سحب كل الأرباح فوراً" },
        ],
        correctIndex: 1,
        explanation: { en: "Phase 1 (Month 1-3) is for Learning — reduce losses, build a journal, use 0.01 lot.", ur: "Phase 1 (Month 1-3) Learning کے لیے ہے — loss کم کریں، journal بنائیں، 0.01 lot استعمال کریں۔", hi: "Phase 1 (Month 1-3) Learning के लिए है — loss कम करें, journal बनाएँ, 0.01 lot इस्तेमाल करें।", ar: "المرحلة 1 (الشهر 1-3) للتعلم — قلل الخسائر، ابن يوميات، استخدم لوت 0.01." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the monthly target for Phase 2 (Month 4-6)?", ur: "Phase 2 (Month 4-6) کا monthly target کیا ہے؟", hi: "Phase 2 (Month 4-6) का monthly target क्या है?", ar: "ما هو الهدف الشهري للمرحلة 2 (الشهر 4-6)؟" },
        options: [
          { en: "Monthly 50%", ur: "Monthly 50%", hi: "Monthly 50%", ar: "50% شهرياً" },
          { en: "Monthly 10%", ur: "Monthly 10%", hi: "Monthly 10%", ar: "10% شهرياً" },
          { en: "Monthly 100%", ur: "Monthly 100%", hi: "Monthly 100%", ar: "100% شهرياً" },
          { en: "Monthly 1%", ur: "Monthly 1%", hi: "Monthly 1%", ar: "1% شهرياً" },
        ],
        correctIndex: 1,
        explanation: { en: "Phase 2 target is Monthly 10% consistency using only London Kill Zone OB+FVG.", ur: "Phase 2 کا target Monthly 10% consistency ہے، صرف London Kill Zone OB+FVG استعمال کر کے۔", hi: "Phase 2 का target Monthly 10% consistency है, सिर्फ London Kill Zone OB+FVG इस्तेमाल करके।", ar: "هدف المرحلة 2 هو 10% شهرياً باتساق باستخدام فقط منطقة قتل لندن OB+FVG." },
      },
      {
        type: "MCQ",
        prompt: { en: "When should you buy a $5k Funded Challenge?", ur: "$5k Funded Challenge کب خریدنا چاہیے؟", hi: "$5k Funded Challenge कब ख़रीदना चाहिए?", ar: "متى يجب شراء تحدي البروب $5k؟" },
        options: [
          { en: "Phase 1 (Month 1-3)", ur: "Phase 1 (Month 1-3)", hi: "Phase 1 (Month 1-3)", ar: "المرحلة 1 (الشهر 1-3)" },
          { en: "Phase 2 (Month 4-6)", ur: "Phase 2 (Month 4-6)", hi: "Phase 2 (Month 4-6)", ar: "المرحلة 2 (الشهر 4-6)" },
          { en: "Phase 3 (Month 7-9)", ur: "Phase 3 (Month 7-9)", hi: "Phase 3 (Month 7-9)", ar: "المرحلة 3 (الشهر 7-9)" },
          { en: "Phase 4 (Month 10-12)", ur: "Phase 4 (Month 10-12)", hi: "Phase 4 (Month 10-12)", ar: "المرحلة 4 (الشهر 10-12)" },
        ],
        correctIndex: 2,
        explanation: { en: "Phase 3 (Month 7-9) is for buying a $5k Challenge ($50 fee) and passing it with 0.5% risk.", ur: "Phase 3 (Month 7-9) میں $5k Challenge ($50 fee) خریدیں اور 0.5% risk سے پاس کریں۔", hi: "Phase 3 (Month 7-9) में $5k Challenge ($50 fee) ख़रीदें और 0.5% risk से पास करें।", ar: "في المرحلة 3 (الشهر 7-9) اشترِ تحدي $5k ($50 رسوم) واجتزه بمخاطرة 0.5%." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the Final Advice for 1 year?", ur: "1 سال کے لیے Final Advice کیا ہے؟", hi: "1 साल के लिए Final Advice क्या है?", ar: "ما هي النصيحة الأخيرة لمدة سنة؟" },
        options: [
          { en: "Change strategy every month", ur: "ہر مہینے strategy بدلیں", hi: "हर महीने strategy बदलें", ar: "غيّر الاستراتيجية كل شهر" },
          { en: "Trade 5 different pairs", ur: "5 الگ pairs ٹریڈ کریں", hi: "5 अलग pairs ट्रेड करें", ar: "تداول 5 أزواج مختلفة" },
          { en: "1 Pair EUR/USD, 1 Session (London), 1 Setup (OB+FVG)", ur: "1 Pair EUR/USD، 1 Session (London)، 1 Setup (OB+FVG)", hi: "1 Pair EUR/USD, 1 Session (London), 1 Setup (OB+FVG)", ar: "زوج واحد EUR/USD، جلسة واحدة (لندن)، إعداد واحد (OB+FVG)" },
          { en: "Trade without stop loss", ur: "Stop loss کے بغیر ٹریڈ کریں", hi: "Stop loss के बिना ट्रेड करें", ar: "تداول بدون وقف خسارة" },
        ],
        correctIndex: 2,
        explanation: { en: "For 1 year: stick to 1 Pair (EUR/USD), 1 Session (London), 1 Setup (OB+FVG) — don't change the strategy.", ur: "1 سال تک: 1 Pair (EUR/USD)، 1 Session (London)، 1 Setup (OB+FVG) پر قائم رہیں — strategy مت بدلیں۔", hi: "1 साल तक: 1 Pair (EUR/USD), 1 Session (London), 1 Setup (OB+FVG) पर कायम रहें — strategy मत बदलें।", ar: "لسنة كاملة: التزم بزوج واحد (EUR/USD)، جلسة واحدة (لندن)، إعداد واحد (OB+FVG) — لا تغيّر الاستراتيجية." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the monthly withdrawal target in Phase 4 (Funded Trader)?", ur: "Phase 4 (Funded Trader) میں monthly withdrawal target کیا ہے؟", hi: "Phase 4 (Funded Trader) में monthly withdrawal target क्या है?", ar: "ما هو هدف السحب الشهري في المرحلة 4 (متداول مموّل)؟" },
        options: [
          { en: "$50 - $100", ur: "$50 - $100", hi: "$50 - $100", ar: "$50 - $100" },
          { en: "$500 - $1000", ur: "$500 - $1000", hi: "$500 - $1000", ar: "$500 - $1000" },
          { en: "$5000 - $10000", ur: "$5000 - $10000", hi: "$5000 - $10000", ar: "$5000 - $10000" },
          { en: "$1 - $10", ur: "$1 - $10", hi: "$1 - $10", ar: "$1 - $10" },
        ],
        correctIndex: 1,
        explanation: { en: "Phase 4 target is $500-$1000 monthly withdrawal on a $10k-$20k funded account — you are now a Pro.", ur: "Phase 4 کا target $10k-$20k funded account پر $500-$1000 monthly withdrawal ہے — اب آپ Pro ہیں۔", hi: "Phase 4 का target $10k-$20k funded account पर $500-$1000 monthly withdrawal है — अब आप Pro हैं।", ar: "هدف المرحلة 4 هو سحب $500-$1000 شهرياً على حساب مموّل $10k-$20k — الآن أنت محترف." },
      },
    ],
  },
]

export async function seedBonusLessons(db: PrismaClient) {
  // Get the Advanced category (bonus lessons live inside Advanced)
  const advanced = await db.category.findUnique({ where: { slug: "advanced" } })
  if (!advanced) throw new Error("Advanced category not found — run main seed first")

  // Only delete old bonus lessons (eurusd-46 to eurusd-50), keep eurusd-30 to eurusd-45 intact
  const existingAdvancedLessons = await db.lesson.findMany({
    where: { categoryId: advanced.id, id: { startsWith: "eurusd-" } },
    select: { id: true },
  })
  // Filter to only eurusd-46 through eurusd-50
  const bonusIds = existingAdvancedLessons
    .filter((l) => {
      const num = parseInt(l.id.replace("eurusd-", ""), 10)
      return num >= 46 && num <= 50
    })
    .map((l) => l.id)
  if (bonusIds.length > 0) {
    await db.lesson.deleteMany({ where: { id: { in: bonusIds } } })
  }

  let lessonCount = 0
  let quizCount = 0

  for (const ls of LESSONS) {
    const lesson = await db.lesson.create({
      data: {
        id: ls.id,
        categoryId: advanced.id,
        order: ls.order,
        titleEn: ls.title.en, titleUr: ls.title.ur, titleHi: ls.title.hi, titleAr: ls.title.ar,
        summaryEn: ls.summary.en, summaryUr: ls.summary.ur, summaryHi: ls.summary.hi, summaryAr: ls.summary.ar,
        contentEn: ls.content.en, contentUr: ls.content.ur, contentHi: ls.content.hi, contentAr: ls.content.ar,
        // Bonus lessons continue the Advanced image numbering: order 17 → lesson-46.png ... order 21 → lesson-50.png
        imageUrl: `/lessons/lesson-${ls.order + 29}.png`,
        durationMin: ls.durationMin,
        isPublished: true,
        isFree: ls.isFree,
      },
    })

    // Create quiz with questions
    const quiz = await db.quiz.create({
      data: { lessonId: lesson.id, passMark: 3 },
    })

    for (const q of ls.questions) {
      await db.question.create({
        data: {
          quizId: quiz.id,
          type: q.type,
          promptEn: q.prompt.en, promptUr: q.prompt.ur, promptHi: q.prompt.hi, promptAr: q.prompt.ar,
          option1En: q.options[0].en, option1Ur: q.options[0].ur, option1Hi: q.options[0].hi, option1Ar: q.options[0].ar,
          option2En: q.options[1].en, option2Ur: q.options[1].ur, option2Hi: q.options[1].hi, option2Ar: q.options[1].ar,
          option3En: q.options[2].en, option3Ur: q.options[2].ur, option3Hi: q.options[2].hi, option3Ar: q.options[2].ar,
          option4En: q.options[3].en, option4Ur: q.options[3].ur, option4Hi: q.options[3].hi, option4Ar: q.options[3].ar,
          correctIndex: q.correctIndex,
          explanationEn: q.explanation.en, explanationUr: q.explanation.ur, explanationHi: q.explanation.hi, explanationAr: q.explanation.ar,
        },
      })
    }
    lessonCount++
    quizCount++
  }

  return { lessons: lessonCount, quizzes: quizCount, questions: LESSONS.reduce((a, l) => a + l.questions.length, 0) }
}
