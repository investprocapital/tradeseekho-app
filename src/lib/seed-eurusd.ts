/* TradeSeekho EUR/USD Beginner Lessons — 12 lessons + 48 quiz questions
   Run via POST /api/admin/seed-eurusd (admin-gated)
   Replaces existing Beginner lessons with this EUR/USD-focused version. */
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
  {
    id: "eurusd-1",
    order: 1,
    title: { en: "What is Forex?", ur: "Forex کیا ہے؟", hi: "फॉरेक्स क्या है?", ar: "ما هو الفوركس؟" },
    summary: { en: "Understand the world's largest market — Foreign Exchange.", ur: "دنیا کی سب سے بڑی مارکیٹ کو سمجھیں۔", hi: "दुनिया का सबसे बड़ा बाज़ार समझें।", ar: "افهم أكبر سوق في العالم." },
    content: {
      en: `## What is Forex?

**Forex** = Foreign Exchange — exchanging one country's currency for another's. It is the world's largest financial market, with over **$7 trillion** traded daily.

### Example
You live in Pakistan. You have 1000 Rupees. You buy Dollars before the price goes up. When the Dollar becomes more expensive, you sell it back for Rupees and make a profit. Forex does this online.

### Key Points
1. We buy and sell **currencies** here
2. No physical currency — everything is online
3. The market is open **24 hours a day, 5 days a week**`,
      ur: `## Forex کیا ہے؟

Forex = Foreign Exchange یعنی "غیر ملکی کرنسی کا تبادلہ"
سادہ الفاظ میں: ایک ملک کی کرنسی کو دوسرے ملک کی کرنسی سے خریدنا
یہ دنیا کی سب سے بڑی مارکیٹ ہے۔ روزانہ 7 ٹریلین ڈالر سے زیادہ کا کاروبار ہوتا ہے۔

### مثال
آپ پاکستان میں ہیں۔ آپ کے پاس 1000 روپے ہیں۔ آپ ڈالر مہنگا ہونے سے پہلے خرید لیتے ہیں۔
جب ڈالر مہنگا ہو جاتا ہے تو آپ وہ ڈالر بیچ کر روپے میں منافع کماتے ہیں۔
Forex میں یہی کام آن لائن ہوتا ہے۔

### اہم پوائنٹ
1. یہاں ہم "کرنسی" خریدتے اور بیچتے ہیں
2. یہاں کوئی فزیکل کرنسی ہاتھ میں نہیں آتی، سب آن لائن ہوتا ہے
3. مارکیٹ ہفتے میں 5 دن، 24 گھنٹے کھلی رہتی ہے`,
      hi: `## फॉरेक्स क्या है?

फॉरेक्स = विदेशी विनिमय — एक देश की मुद्रा को दूसरे देश की मुद्रा से बदलना। यह दुनिया का सबसे बड़ा वित्तीय बाज़ार है।`,
      ar: `## ما هو الفوركس؟

**الفوركس** = سوق الصرف الأجنبي — تبديل عملة بلد بعملة بلد آخر. إنه أكبر سوق مالي في العالم، بأكثر من **7 تريليون دولار** يومياً.

### مثال
أنت في باكستان. لديك 1000 روبية. تشتري الدولارات قبل أن يرتفع السعر. عندما يغلو الدولار، تبيعه وتحقق ربحاً. هذا ما يفعله الفوركس عبر الإنترنت.

### نقاط رئيسية
1. نشتري ونبيع **العملات** هنا
2. لا توجد عملة مادية — كل شيء عبر الإنترنت
3. السوق مفتوح **24 ساعة، 5 أيام أسبوعياً**`,
    },
    durationMin: 5,
        isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What does Forex mean?", ur: "Forex کا مطلب کیا ہے؟", hi: "फॉरेक्स का मतलब क्या है?", ar: "ماذا يعني الفوركس؟" },
        options: [
          { en: "Foreign Exchange", ur: "Foreign Exchange", hi: "विदेशी विनिमय", ar: "صرف أجنبي" },
          { en: "Future Exchange", ur: "Future Exchange", hi: "भविष्य विनिमय", ar: "صرف مستقبلي" },
          { en: "Fast Exchange", ur: "Fast Exchange", hi: "तेज़ विनिमय", ar: "صرف سريع" },
          { en: "Full Exchange", ur: "Full Exchange", hi: "पूर्ण विनिमय", ar: "صرف كامل" },
        ],
        correctIndex: 0,
        explanation: { en: "Forex = Foreign Exchange", ur: "Forex یعنی Foreign Exchange", hi: "फॉरेक्स = विदेशी विनिमय", ar: "الفوركس = الصرف الأجنبي" },
      },
      {
        type: "MCQ",
        prompt: { en: "How many days per week is Forex open?", ur: "Forex مارکیٹ ہفتے میں کتنے دن کھلی رہتی ہے؟", hi: "फॉरेक्स हफ़्ते में कितने दिन खुला रहता है?", ar: "كم يوماً في الأسبوع يعمل الفوركس؟" },
        options: [
          { en: "3 days", ur: "3 دن", hi: "3 दिन", ar: "3 أيام" },
          { en: "5 days", ur: "5 دن", hi: "5 दिन", ar: "5 أيام" },
          { en: "6 days", ur: "6 دن", hi: "6 दिन", ar: "6 أيام" },
          { en: "7 days", ur: "7 دن", hi: "7 दिन", ar: "7 أيام" },
        ],
        correctIndex: 1,
        explanation: { en: "Forex is open 5 days a week (Mon–Fri)", ur: "Forex ہفتے میں 5 دن کھلی رہتی ہے", hi: "फॉरेक्स 5 दिन खुला रहता है", ar: "الفوركس يعمل 5 أيام أسبوعياً" },
      },
      {
        type: "MCQ",
        prompt: { en: "What do we buy and sell in Forex?", ur: "Forex میں ہم کیا خریدتے اور بیچتے ہیں؟", hi: "फॉरेक्स में हम क्या खरीदते हैं?", ar: "ماذا نشتري ونبيع في الفوركس؟" },
        options: [
          { en: "Gold", ur: "سونا", hi: "सोना", ar: "ذهب" },
          { en: "Currency", ur: "کرنسی", hi: "मुद्रा", ar: "عملة" },
          { en: "Shares", ur: "شیئر", hi: "शेयर", ar: "أسهم" },
          { en: "Oil", ur: "تیل", hi: "तेल", ar: "نفط" },
        ],
        correctIndex: 1,
        explanation: { en: "In Forex we trade currencies", ur: "Forex میں ہم کرنسی کا کاروبار کرتے ہیں", hi: "फॉरेक्स में हम मुद्रा ट्रेड करते हैं", ar: "نتداول العملات في الفوركس" },
      },
      {
        type: "MCQ",
        prompt: { en: "Which is the world's largest financial market?", ur: "دنیا کی سب سے بڑی مالیاتی مارکیٹ کون سی ہے؟", hi: "दुनिया का सबसे बड़ा वित्तीय बाज़ार कौन सा है?", ar: "ما هو أكبر سوق مالي في العالم؟" },
        options: [
          { en: "Stock Market", ur: "Stock Market", hi: "शेयर बाज़ार", ar: "سوق الأسهم" },
          { en: "Crypto Market", ur: "Crypto Market", hi: "क्रिप्टो बाज़ार", ar: "سوق العملات الرقمية" },
          { en: "Forex Market", ur: "Forex Market", hi: "फॉरेक्स बाज़ार", ar: "سوق الفوركس" },
          { en: "Gold Market", ur: "Gold Market", hi: "सोना बाज़ार", ar: "سوق الذهب" },
        ],
        correctIndex: 2,
        explanation: { en: "Forex is the largest financial market", ur: "Forex سب سے بڑی مالیاتی مارکیٹ ہے", hi: "फॉरेक्स सबसे बड़ा बाज़ार है", ar: "الفوركس أكبر سوق مالي" },
      },
    ],
  },

  {
    id: "eurusd-2",
    order: 2,
    title: { en: "Currency Pairs, Pips & Spread", ur: "Currency Pairs, Pips, Spread", hi: "मुद्रा जोड़े, पिप्स और स्प्रेड", ar: "أزواج العملات، النقاط والفارق" },
    summary: { en: "Learn pairs, pips and spread — the building blocks of Forex.", ur: "جوڑے، پپس اور اسپریڈ سیکھیں۔", hi: "जोड़े, पिप्स और स्प्रेड सीखें।", ar: "تعلم الأزواج والنقاط والفارق." },
    content: {
      en: `## Currency Pairs, Pips & Spread

In Forex we don't buy a currency alone — always in **pairs**.

### 1. Currency Pairs
Example: \`EUR/USD\` means buying Euro against Dollar.
If you buy \`EUR/USD\`, you're buying Euro and selling Dollar.

Popular pairs: \`EUR/USD\`, \`GBP/USD\`, \`USD/PKR\`, \`GBP/JPY\`

### 2. Pips
The smallest price change in a currency.
Example: \`EUR/USD\` goes from 1.1000 to 1.1001 = **1 Pip**

### 3. Spread
The difference between Buy and Sell price. This is the broker's fee.
Example: \`EUR/USD\` Buy = 1.1002, Sell = 1.1000 → Spread = **2 Pips**

### Example
You buy \`EUR/USD\` at 1.1000. TP at 1.1010. Difference = 10 Pips.
If you use 0.01 Lot, 10 Pips = **$1 Profit**`,
      ur: `## Currency Pairs, Pips, Spread

Forex میں ہم کرنسی کو اکیلے نہیں خریدتے۔ ہمیشہ "جوڑے" میں خریدتے ہیں۔

### 1. Currency Pairs = کرنسی کے جوڑے
مثال: \`EUR/USD\` یعنی Euro کو Dollar کے مقابلے میں خریدنا
اگر آپ \`EUR/USD\` خریدتے ہیں تو مطلب آپ Euro خرید رہے ہیں اور Dollar بیچ رہے ہیں۔

مشہور Pairs: \`EUR/USD\`, \`GBP/USD\`, \`USD/PKR\`, \`GBP/JPY\`

### 2. Pips = پِپس
یہ کرنسی کی قیمت میں سب سے چھوٹی تبدیلی ہے۔
مثال: \`EUR/USD\` 1.1000 سے 1.1001 ہوا = 1 Pip کا فرق

### 3. Spread = اسپریڈ
یہ Buy اور Sell کی قیمت کا فرق ہے۔ یہ بروکر کی فیس ہے۔
مثال: \`EUR/USD\` Buy = 1.1002 اور Sell = 1.1000
تو Spread = 2 Pips

### مثال
آپ نے \`EUR/USD\` کو 1.1000 پر Buy کیا۔
TP 1.1010 پر لگایا۔ فرق = 10 Pips
اگر 0.01 Lot لگائیں تو 10 Pips = $1 Profit بنے گا`,
      hi: `## मुद्रा जोड़े, पिप्स और स्प्रेड

फॉरेक्स में हम मुद्रा को अकेले नहीं खरीदते — हमेशा जोड़े में।`,
      ar: `## أزواج العملات، النقاط والفارق

في الفوركس لا نشتري عملة بمفردها — بل دائماً في **أزواج**.

### 1. أزواج العملات
مثال: \`EUR/USD\` يعني شراء اليورو مقابل الدولار.
إذا اشتريت \`EUR/USD\`، فأنت تشتري اليورو وتبيع الدولار.

أزواج مشهورة: \`EUR/USD\`, \`GBP/USD\`, \`USD/PKR\`, \`GBP/JPY\`

### 2. النقاط (Pips)
أصغر تغير في سعر العملة.
مثال: \`EUR/USD\` من 1.1000 إلى 1.1001 = **1 نقطة**

### 3. الفارق (Spread)
الفرق بين سعر الشراء والبيع. هذه رسوم الوسيط.
مثال: \`EUR/USD\` شراء = 1.1002، بيع = 1.1000 → الفارق = **2 نقطة**

### مثال
تشتري \`EUR/USD\` عند 1.1000. جني الأرباح عند 1.1010. الفرق = 10 نقاط.
إذا استخدمت 0.01 لوت، 10 نقاط = **1 دولار ربح**`,
    },
    durationMin: 6,
        isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "In EUR/USD, which is the base currency?", ur: "EUR/USD میں Base Currency کون سی ہے؟", hi: "EUR/USD में बेस मुद्रा कौन सी है?", ar: "في EUR/USD ما هي العملة الأساسية؟" },
        options: [
          { en: "USD", ur: "USD", hi: "USD", ar: "USD" },
          { en: "EUR", ur: "EUR", hi: "EUR", ar: "EUR" },
          { en: "Both", ur: "دونوں", hi: "दोनों", ar: "كلاهما" },
          { en: "None", ur: "کوئی نہیں", hi: "कोई नहीं", ar: "لا أحد" },
        ],
        correctIndex: 1,
        explanation: { en: "The first currency in a pair is the base currency", ur: "جوڑے میں پہلی کرنسی Base Currency ہوتی ہے", hi: "जोड़े में पहली मुद्रा बेस होती है", ar: "العملة الأولى هي الأساسية" },
      },
      {
        type: "MCQ",
        prompt: { en: "EUR/USD moves from 1.1000 to 1.1001 — how many pips?", ur: "EUR/USD 1.1000 سے 1.1001 ہوا تو کتنے Pips ہوئے؟", hi: "EUR/USD 1.1000 से 1.1001 — कितने पिप्स?", ar: "EUR/USD من 1.1000 إلى 1.1001 — كم نقطة؟" },
        options: [
          { en: "1 Pip", ur: "1 Pip", hi: "1 पिप", ar: "1 نقطة" },
          { en: "10 Pips", ur: "10 Pips", hi: "10 पिप", ar: "10 نقاط" },
          { en: "100 Pips", ur: "100 Pips", hi: "100 पिप", ar: "100 نقطة" },
          { en: "0 Pip", ur: "0 Pip", hi: "0 पिप", ar: "0 نقطة" },
        ],
        correctIndex: 0,
        explanation: { en: "0.0001 change = 1 pip", ur: "0.0001 کا فرق = 1 پپ", hi: "0.0001 बदलाव = 1 पिप", ar: "0.0001 تغيير = 1 نقطة" },
      },
      {
        type: "MCQ",
        prompt: { en: "What is Spread?", ur: "Spread کیا ہے؟", hi: "स्प्रेड क्या है?", ar: "ما هو الفارق؟" },
        options: [
          { en: "Difference between Buy and Sell price", ur: "Buy اور Sell قیمت کا فرق", hi: "खरीद और बिक्री मूल्य का अंतर", ar: "الفرق بين سعر الشراء والبيع" },
          { en: "Profit", ur: "Profit", hi: "लाभ", ar: "ربح" },
          { en: "Loss", ur: "Loss", hi: "हानि", ar: "خسارة" },
          { en: "Lot Size", ur: "Lot Size", hi: "लॉट आकार", ar: "حجم اللوت" },
        ],
        correctIndex: 0,
        explanation: { en: "Spread = Buy price - Sell price", ur: "Spread = Buy اور Sell قیمت کا فرق", hi: "स्प्रेड = खरीद-बिक्री मूल्य अंतर", ar: "الفارق = فرق سعر الشراء والبيع" },
      },
      {
        type: "MCQ",
        prompt: { en: "In a micro account, 100 pips on EUR/USD = how much $?", ur: "Micro Account میں EUR/USD پر 100 Pips = کتنے $؟", hi: "माइक्रो अकाउंट में 100 पिप्स = कितने $?", ar: "في حساب المايكرو 100 نقطة = كم دولار؟" },
        options: [
          { en: "$1", ur: "$1", hi: "$1", ar: "$1" },
          { en: "$10", ur: "$10", hi: "$10", ar: "$10" },
          { en: "$100", ur: "$100", hi: "$100", ar: "$100" },
          { en: "$0.10", ur: "$0.10", hi: "$0.10", ar: "$0.10" },
        ],
        correctIndex: 1,
        explanation: { en: "100 pips × 0.01 lot × $0.10/pip = $10", ur: "100 پپس × 0.01 لاٹ × $0.10 = $10", hi: "100 पिप्स × 0.01 लॉट × $0.10 = $10", ar: "100 نقطة × 0.01 لوت × $0.10 = $10" },
      },
    ],
  },

  {
    id: "eurusd-3",
    order: 3,
    title: { en: "Lot Size, Leverage & Margin", ur: "Lot Size, Leverage, Margin", hi: "लॉट, लीवरेज और मार्जिन", ar: "حجم اللوت، الرافعة والهامش" },
    summary: { en: "Control your risk and profit with lot size, leverage and margin.", ur: "اپنے Risk اور Profit کو کنٹرول کریں۔", hi: "अपने जोखिम और लाभ को नियंत्रित करें।", ar: "تحكم في مخاطرك وأرباحك." },
    content: {
      en: `## Lot Size, Leverage & Margin

These 3 things control your risk and profit.

### 1. Lot Size
The "size" of your trade. Bigger lot = bigger profit or loss.

- \`1.0 Lot\` = Standard Lot
- \`0.10 Lot\` = Mini Lot
- \`0.01 Lot\` = Micro Lot ← Best for beginners

### 2. Leverage
A "loan" from the broker. Lets you trade bigger with less money.
Example: Leverage 1:1000 — you have $10, you can trade $10,000.

### 3. Margin
The amount the broker holds as "security".
Formula: \`Margin = Lot Size × Contract Size / Leverage\`

### Example
\`EUR/USD\` with 0.01 Lot, Leverage 1:1000 → very low margin needed.
If it moves 100 pips → $10 profit.`,
      ur: `## Lot Size, Leverage, Margin

یہ 3 چیزیں آپ کے Risk اور Profit کو کنٹرول کرتی ہیں۔

### 1. Lot Size = لاٹ سائز
یہ آپ کے Trade کا "سائز" ہے۔ جتنا بڑا Lot، اتنا بڑا Profit یا Loss۔

- 1.0 Lot = Standard Lot
- 0.10 Lot = Mini Lot
- 0.01 Lot = Micro Lot ← Beginners کے لیے بہترین

### 2. Leverage = لیوریج
یہ بروکر کا دیا ہوا "قرض" ہے۔ اس سے آپ کم پیسوں سے بڑا Trade کر سکتے ہیں۔
مثال: Leverage 1:1000
آپ کے پاس $10 ہیں تو آپ $10,000 کا Trade کر سکتے ہیں۔

### 3. Margin = مارجن
یہ وہ رقم ہے جو بروکر آپ سے "سیکیورٹی" کے طور پر روک لیتا ہے۔
فارمولا: Margin = Lot Size x Contract Size / Leverage

### مثال
EUR/USD کا 0.01 Lot لگائیں
Leverage 1:1000 ہے تو Margin بہت کم لگے گا
اور 100 Pips چلیں تو $10 Profit بنے گا`,
      hi: `## लॉट, लीवरेज और मार्जिन

ये 3 चीज़ें आपके जोखिम और लाभ को नियंत्रित करती हैं।`,
      ar: `## حجم اللوت، الرافعة والهامش

هذه 3 أشياء تتحكم في مخاطرك وأرباحك.

### 1. حجم اللوت
"حجم" صفقتك. لوت أكبر = ربح أو خسارة أكبر.

- \`1.0 لوت\` = لوت قياسي
- \`0.10 لوت\` = لوت ميني
- \`0.01 لوت\` = لوت مايكرو ← الأفضل للمبتدئين

### 2. الرافعة المالية
"قرض" من الوسيط. يتيح لك التداول بمبالغ أكبر بمال أقل.
مثال: رافعة 1:1000 — لديك 10 دولار، يمكنك التداول بـ 10000 دولار.

### 3. الهامش
المبلغ الذي يحتجزه الوسيط كـ "ضمان".
المعادلة: \`الهامش = حجم اللوت × حجم العقد / الرافعة\`

### مثال
\`EUR/USD\` بـ 0.01 لوت، رافعة 1:1000 → هامش منخفض جداً.
إذا تحرك 100 نقطة → 10 دولار ربح.`,
    },
    durationMin: 6,
        isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "Which lot is safest for beginners?", ur: "Beginners کے لیے سب سے محفوظ Lot کون سا ہے؟", hi: "नौसिखिए के लिए सबसे सुरक्षित लॉट?", ar: "أي لوت هو الأكثر أماناً للمبتدئين؟" },
        options: [
          { en: "1.0 Lot", ur: "1.0 Lot", hi: "1.0 लॉट", ar: "1.0 لوت" },
          { en: "0.10 Lot", ur: "0.10 Lot", hi: "0.10 लॉट", ar: "0.10 لوت" },
          { en: "0.01 Lot", ur: "0.01 Lot", hi: "0.01 लॉट", ar: "0.01 لوت" },
          { en: "10.0 Lot", ur: "10.0 Lot", hi: "10.0 लॉट", ar: "10.0 لوت" },
        ],
        correctIndex: 2,
        explanation: { en: "0.01 Lot (Micro) is safest for beginners", ur: "0.01 Lot (Micro) Beginners کے لیے بہترین ہے", hi: "0.01 लॉट सबसे सुरक्षित है", ar: "0.01 لوت هو الأكثر أماناً" },
      },
      {
        type: "MCQ",
        prompt: { en: "Leverage 1:1000 means?", ur: "Leverage 1:1000 کا مطلب؟", hi: "लीवरेज 1:1000 का मतलब?", ar: "الرافعة 1:1000 تعني؟" },
        options: [
          { en: "$1 → $1000 trade", ur: "$1 سے $1000 کا Trade", hi: "$1 से $1000 का ट्रेड", ar: "$1 إلى $1000 صفقة" },
          { en: "$1000 → $1 trade", ur: "$1000 سے $1 کا Trade", hi: "$1000 से $1 का ट्रेड", ar: "$1000 إلى $1 صفقة" },
          { en: "No benefit", ur: "کوئی فائدہ نہیں", hi: "कोई लाभ नहीं", ar: "لا فائدة" },
          { en: "Only loss", ur: "صرف Loss", hi: "सिर्फ हानि", ar: "خسارة فقط" },
        ],
        correctIndex: 0,
        explanation: { en: "1:1000 means $1 controls $1000", ur: "1:1000 یعنی $1 سے $1000 کا Trade", hi: "1:1000 का मतलब $1 से $1000", ar: "1:1000 تعني $1 يتحكم بـ $1000" },
      },
      {
        type: "MCQ",
        prompt: { en: "What is Margin?", ur: "Margin کیا ہے؟", hi: "मार्जिन क्या है?", ar: "ما هو الهامش؟" },
        options: [
          { en: "Profit", ur: "Profit", hi: "लाभ", ar: "ربح" },
          { en: "Broker's security deposit", ur: "بروکر کی سیکیورٹی رقم", hi: "ब्रोकर की सुरक्षा राशि", ar: "ضمانة الوسيط" },
          { en: "Spread", ur: "Spread", hi: "स्प्रेड", ar: "الفارق" },
          { en: "Commission", ur: "Commission", hi: "कमीशन", ar: "عمولة" },
        ],
        correctIndex: 1,
        explanation: { en: "Margin is the broker's security hold", ur: "Margin بروکر کی سیکیورٹی رقم ہے", hi: "मार्जिन ब्रोकर की सुरक्षा राशि है", ar: "الهامش هو ضمانة الوسيط" },
      },
      {
        type: "MCQ",
        prompt: { en: "0.01 Lot is called?", ur: "0.01 Lot کو کیا کہتے ہیں؟", hi: "0.01 लॉट को क्या कहते हैं?", ar: "0.01 لوت يسمى؟" },
        options: [
          { en: "Standard Lot", ur: "Standard Lot", hi: "स्टैंडर्ड लॉट", ar: "لوت قياسي" },
          { en: "Mini Lot", ur: "Mini Lot", hi: "मिनी लॉट", ar: "لوت ميني" },
          { en: "Micro Lot", ur: "Micro Lot", hi: "माइक्रो लॉट", ar: "لوت مايكرو" },
          { en: "Nano Lot", ur: "Nano Lot", hi: "नैनो लॉट", ar: "لوت نانو" },
        ],
        correctIndex: 2,
        explanation: { en: "0.01 = Micro Lot", ur: "0.01 = Micro Lot", hi: "0.01 = माइक्रो लॉट", ar: "0.01 = لوت مايكرو" },
      },
    ],
  },

  {
    id: "eurusd-4",
    order: 4,
    title: { en: "Market Sessions - 24/5 Market", ur: "Market Sessions - 24/5 Market", hi: "मार्केट सेशन", ar: "جلسات السوق" },
    summary: { en: "Sydney, Tokyo, London, New York — when to trade EUR/USD.", ur: "EUR/USD کے لیے بہترین وقت کب ہے؟", hi: "EUR/USD के लिए सबसे अच्छा समय कब है?", ar: "متى أفضل وقت لتداول EUR/USD؟" },
    content: {
      en: `## Market Sessions

Forex is open Monday to Friday, 24 hours — because different countries' markets open in turns.

### 4 Major Sessions (Pakistan Time)

| Session | Pakistan Time | Note |
|---------|--------------|------|
| Sydney | 5:00 AM – 1:00 PM | Slow market |
| Tokyo | 8:00 AM – 4:00 PM | JPY, AUD movement |
| London | 1:00 PM – 9:00 PM | Most volatility |
| New York | 6:00 PM – 2:00 AM | Biggest USD movement |

### Best Time
**London + New York Overlap** = 6:00 PM – 9:00 PM Pakistan Time
This is when \`EUR/USD\` has the most movement.

### Example
If you trade \`EUR/USD\`, the best time is **6:00 PM to 9:00 PM**.`,
      ur: `## Market Sessions

Forex مارکیٹ پیر سے جمعہ تک 24 گھنٹے کھلی رہتی ہے کیونکہ دنیا کے مختلف ممالک کی مارکیٹیں باری باری کھلتی ہیں۔

### 4 بڑے سیشن (پاکستان کا وقت)

| سیشن | پاکستان کا وقت | نوٹ |
|------|----------------|-----|
| Sydney | صبح 5:00 سے دوپہر 1:00 | سست مارکیٹ |
| Tokyo | صبح 8:00 سے شام 4:00 | JPY, AUD کی موومنٹ |
| London | دوپہر 1:00 سے رات 9:00 | سب سے زیادہ Volatility |
| New York | شام 6:00 سے رات 2:00 | USD کی سب سے بڑی موومنٹ |

### اہم وقت
London + New York Overlap = شام 6:00 سے رات 9:00 پاکستان ٹائم
اس وقت EUR/USD میں سب سے زیادہ موومنٹ ہوتی ہے۔

### مثال
اگر آپ EUR/USD ٹریڈ کرتے ہیں تو بہترین وقت شام 6:00 سے رات 9:00 ہے`,
      hi: `## मार्केट सेशन

फॉरेक्स सोमवार से शुक्रवार तक 24 घंटे खुला रहता है।`,
      ar: `## جلسات السوق

سوق الفوركس مفتوح من الإثنين إلى الجمعة، 24 ساعة — لأن أسواق دول مختلفة تفتح بالتناوب.

### 4 جلسات رئيسية (بتوقيت باكستان)

| الجلسة | وقت باكستان | ملاحظة |
|---------|--------------|------|
| سيدني | 5:00 ص - 1:00 م | سوق بطيء |
| طوكيو | 8:00 ص - 4:00 م | حركة JPY, AUD |
| لندن | 1:00 م - 9:00 م | أعلى تذبذب |
| نيويورك | 6:00 م - 2:00 ص | أكبر حركة للدولار |

### أفضل وقت
**تداخل لندن + نيويورك** = 6:00 م - 9:00 م بتوقيت باكستان
هذا وقت حركة \`EUR/USD\` الأكبر.`,
    },
    durationMin: 5,
        isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "When does London session start (Pakistan time)?", ur: "پاکستان کے وقت London سیشن کب شروع ہوتا ہے؟", hi: "लंदन सेशन कब शुरू होता है (पाकिस्तान समय)?", ar: "متى يبدأ جلسة لندن (بتوقيت باكستان)؟" },
        options: [
          { en: "8:00 AM", ur: "صبح 8:00", hi: "सुबह 8:00", ar: "8:00 ص" },
          { en: "1:00 PM", ur: "دوپہر 1:00", hi: "दोपहर 1:00", ar: "1:00 م" },
          { en: "6:00 PM", ur: "شام 6:00", hi: "शाम 6:00", ar: "6:00 م" },
          { en: "12:00 AM", ur: "رات 12:00", hi: "रात 12:00", ar: "12:00 ص" },
        ],
        correctIndex: 1,
        explanation: { en: "London starts at 1:00 PM PKT", ur: "London دوپہر 1:00 بجے شروع ہوتا ہے", hi: "लंदन दोपहर 1:00 बजे शुरू", ar: "لندن تبدأ 1:00 م" },
      },
      {
        type: "MCQ",
        prompt: { en: "When is volatility highest?", ur: "سب سے زیادہ Volatility کس وقت ہوتی ہے؟", hi: "सबसे ज़्यादा अस्थिरता कब होती है?", ar: "متى تكون التذبذب أعلى؟" },
        options: [
          { en: "Sydney", ur: "Sydney", hi: "सिडनी", ar: "سيدني" },
          { en: "Tokyo", ur: "Tokyo", hi: "टोक्यो", ar: "طوكيو" },
          { en: "London + NY Overlap", ur: "London + New York Overlap", hi: "लंदन + NY ओवरलैप", ar: "تداخل لندن ونيويورك" },
          { en: "3:00 AM", ur: "رات 3 بجے", hi: "रात 3 बजे", ar: "3:00 ص" },
        ],
        correctIndex: 2,
        explanation: { en: "London + NY overlap has the most volatility", ur: "London + NY Overlap میں سب سے زیادہ Volatility ہوتی ہے", hi: "लंदन + NY ओवरलैप में सबसे ज़्यादा अस्थिरता", ar: "تداخل لندن ونيويورك أعلى تذبذب" },
      },
      {
        type: "MCQ",
        prompt: { en: "Best session for EUR/USD?", ur: "EUR/USD کے لیے بہترین سیشن کون سا ہے؟", hi: "EUR/USD के लिए सबसे अच्छा सेशन?", ar: "أفضل جلسة لـ EUR/USD؟" },
        options: [
          { en: "Sydney", ur: "Sydney", hi: "सिडनी", ar: "سيدني" },
          { en: "London + New York", ur: "London + New York", hi: "लंदन + न्यूयॉर्क", ar: "لندن + نيويورك" },
          { en: "Tokyo", ur: "Tokyo", hi: "टोक्यो", ar: "طوكيو" },
          { en: "Any", ur: "کوئی بھی", hi: "कोई भी", ar: "أي" },
        ],
        correctIndex: 1,
        explanation: { en: "London + NY is best for EUR/USD", ur: "London + NY سب سے بہترین ہے", hi: "लंदन + NY सर्वश्रेष्ठ है", ar: "لندن + نيويورك الأفضل" },
      },
      {
        type: "MCQ",
        prompt: { en: "When is Forex closed?", ur: "Forex مارکیٹ کب بند ہوتی ہے؟", hi: "फॉरेक्स कब बंद होता है?", ar: "متى يغلق الفوركس؟" },
        options: [
          { en: "Friday 2 AM", ur: "جمعہ رات 2 بجے", hi: "शुक्रवार रात 2 बजे", ar: "الجمعة 2 ص" },
          { en: "Saturday Sunday", ur: "ہفتہ اتوار", hi: "शनिवार रविवार", ar: "السبت والأحد" },
          { en: "Monday morning", ur: "پیر صبح", hi: "सोमवार सुबह", ar: "الإثنين صباحاً" },
          { en: "Never closes", ur: "کبھی بند نہیں ہوتی", hi: "कभी बंद नहीं", ar: "لا يغلق أبداً" },
        ],
        correctIndex: 1,
        explanation: { en: "Forex is closed Saturday & Sunday", ur: "Forex ہفتہ اور اتوار کو بند ہوتی ہے", hi: "फॉरेक्स शनिवार-रविवार बंद", ar: "يغلق السبت والأحد" },
      },
    ],
  },

  {
    id: "eurusd-5",
    order: 5,
    title: { en: "How to Read Candlesticks", ur: "Candlesticks کیسے پڑھیں؟", hi: "कैंडलस्टिक कैसे पढ़ें", ar: "كيف تقرأ الشموع اليابانية" },
    summary: { en: "Open, Close, High, Low — the 4 parts of every candle.", ur: "ایک کینڈل کے 4 حصے سمجھیں۔", hi: "एक कैंडल के 4 हिस्से समझें।", ar: "افهم أجزاء الشمعة الأربعة." },
    content: {
      en: `## How to Read Candlesticks

1 candle = 4 things: **Open, Close, High, Low**

### 2 Types
1. **Green / Bullish** = Close > Open = Buyers won
2. **Red / Bearish** = Close < Open = Sellers won

### Example
\`EUR/USD\` 1-hour candle:
Open 1.1000, High 1.1020, Low 1.0990, Close 1.1015
This is a **green candle** because 1.1015 > 1.1000. The Euro got stronger.`,
      ur: `## Candlesticks کیسے پڑھیں؟

1 کینڈل = 4 چیزیں: Open, Close, High, Low

### 2 قسم
1. سبز / Bullish = Close > Open = خریدار جیتے
2. سرخ / Bearish = Close < Open = بیچنے والے جیتے

### مثال
EUR/USD کی 1 گھنٹے والی کینڈل:
Open 1.1000, High 1.1020, Low 1.0990, Close 1.1015
یہ سبز کینڈل ہے کیونکہ 1.1015 > 1.1000۔ مطلب Euro طاقتور ہوا۔`,
      hi: `## कैंडलस्टिक कैसे पढ़ें

1 कैंडल = 4 चीज़ें: Open, Close, High, Low`,
      ar: `## كيف تقرأ الشموع اليابانية

شمعة واحدة = 4 أشياء: **الافتتاح، الإغلاق، الأعلى، الأدنى**

### نوعان
1. **خضراء / صاعدة** = الإغلاق > الافتتاح = المشترون فازوا
2. **حمراء / هابطة** = الإغلاق < الافتتاح = البائعون فازوا

### مثال
شمعة \`EUR/USD\` لساعة واحدة:
الافتتاح 1.1000، الأعلى 1.1020، الأدنى 1.0990، الإغلاق 1.1015
هذه شمعة **خضراء** لأن 1.1015 > 1.1000. اليورو قوي.`,
    },
    durationMin: 5,
        isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "Green candle means?", ur: "سبز کینڈل کا مطلب؟", hi: "हरी कैंडल का मतलब?", ar: "الشمعة الخضراء تعني؟" },
        options: [
          { en: "Price fell", ur: "قیمت گری", hi: "कीमत गिरी", ar: "السعر هبط" },
          { en: "Price rose", ur: "قیمت بڑھی", hi: "कीमत बढ़ी", ar: "السعر ارتفع" },
          { en: "No change", ur: "کوئی تبدیلی نہیں", hi: "कोई बदलाव नहीं", ar: "لا تغيير" },
          { en: "Market closed", ur: "مارکیٹ بند", hi: "बाज़ार बंद", ar: "السوق مغلق" },
        ],
        correctIndex: 1,
        explanation: { en: "Green = price went up (Bullish)", ur: "سبز = قیمت بڑھی (Bullish)", hi: "हरी = कीमत बढ़ी", ar: "أخضر = ارتفاع" },
      },
      {
        type: "MCQ",
        prompt: { en: "Which is NOT a candle part?", ur: "کینڈل کے 4 حصوں میں سے کون سا نہیں ہے؟", hi: "कैंडल का हिस्सा कौन सा नहीं है?", ar: "أي جزء ليس من الشمعة؟" },
        options: [
          { en: "Open", ur: "Open", hi: "Open", ar: "الافتتاح" },
          { en: "Close", ur: "Close", hi: "Close", ar: "الإغلاق" },
          { en: "Middle", ur: "Middle", hi: "Middle", ar: "الوسط" },
          { en: "High", ur: "High", hi: "High", ar: "الأعلى" },
        ],
        correctIndex: 2,
        explanation: { en: "There is no 'Middle' — it's Open/Close/High/Low", ur: "Middle نہیں ہوتا — Open/Close/High/Low ہوتے ہیں", hi: "Middle नहीं होता", ar: "لا يوجد 'وسط'" },
      },
      {
        type: "MCQ",
        prompt: { en: "Close > Open means which candle?", ur: "Close > Open ہو تو کون سی کینڈل بنے گی؟", hi: "Close > Open कौन सी कैंडल?", ar: "Close > Open أي شمعة؟" },
        options: [
          { en: "Bearish", ur: "Bearish", hi: "Bearish", ar: "هابطة" },
          { en: "Bullish", ur: "Bullish", hi: "Bullish", ar: "صاعدة" },
          { en: "Doji", ur: "Doji", hi: "Doji", ar: "دوجي" },
          { en: "Hammer", ur: "Hammer", hi: "Hammer", ar: "مطرقة" },
        ],
        correctIndex: 1,
        explanation: { en: "Close > Open = Bullish (green)", ur: "Close > Open = Bullish (سبز)", hi: "Close > Open = Bullish", ar: "Close > Open = صاعدة" },
      },
      {
        type: "MCQ",
        prompt: { en: "The top line of a candle is called?", ur: "کینڈل کی اوپر والی لکیر کو کیا کہتے ہیں؟", hi: "कैंडल की ऊपर वाली रेखा को क्या कहते हैं?", ar: "الخط العلوي للشمعة يسمى؟" },
        options: [
          { en: "Low", ur: "Low", hi: "Low", ar: "الأدنى" },
          { en: "Body", ur: "Body", hi: "Body", ar: "الجسم" },
          { en: "High", ur: "High", hi: "High", ar: "الأعلى" },
          { en: "Wick", ur: "Wick", hi: "Wick", ar: "الفتيل" },
        ],
        correctIndex: 2,
        explanation: { en: "The top = High", ur: "اوپر والی = High", hi: "ऊपर वाली = High", ar: "الأعلى = High" },
      },
    ],
  },

  {
    id: "eurusd-6",
    order: 6,
    title: { en: "Support & Resistance Zones", ur: "Support & Resistance | S&R Zones", hi: "सपोर्ट और रेज़िस्टेंस", ar: "الدعم والمقاومة" },
    summary: { en: "The floor and ceiling of price — where to buy and sell.", ur: "قیمت کا فرش اور چھت۔", hi: "कीमत का फर्श और छत।", ar: "أرضية وسقف السعر." },
    content: {
      en: `## Support & Resistance

**Support** = Floor — price bounces up from here
**Resistance** = Ceiling — price bounces down from here

### Example
\`EUR/USD\` comes to 1.0950 and goes back up = **Support**
\`EUR/USD\` goes to 1.1050 and comes back down = **Resistance**

### Trade Plan
- Buy at Support
- Sell at Resistance`,
      ur: `## Support & Resistance

Support = فرش = قیمت یہاں سے اوپر جاتی ہے
Resistance = چھت = قیمت یہاں سے نیچے آتی ہے

### مثال
EUR/USD بار 1.0950 پر آ کر اوپر گیا = یہ Support ہے
EUR/USD بار 1.1050 پر جا کر نیچے آیا = یہ Resistance ہے

### ٹریڈ پلان
Support پر Buy
Resistance پر Sell`,
      hi: `## सपोर्ट और रेज़िस्टेंस

Support = फर्श, Resistance = छत`,
      ar: `## الدعم والمقاومة

**الدعم** = أرضية — السعر يرتفع منها
**المقاومة** = سقف — السعر ينزل منها

### مثال
\`EUR/USD\` يصل إلى 1.0950 ويرتفع = **دعم**
\`EUR/USD\` يصل إلى 1.1050 وينزل = **مقاومة**

### خطة التداول
- اشترِ عند الدعم
- بِع عند المقاومة`,
    },
    durationMin: 5,
        isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "Support is called?", ur: "Support کو کیا کہا جاتا ہے؟", hi: "Support को क्या कहते हैं?", ar: "الدعم يسمى؟" },
        options: [
          { en: "Ceiling", ur: "چھت", hi: "छत", ar: "سقف" },
          { en: "Floor", ur: "فرش", hi: "फर्श", ar: "أرضية" },
          { en: "Wall", ur: "دیوار", hi: "दीवार", ar: "جدار" },
          { en: "Door", ur: "دروازہ", hi: "दरवाज़ा", ar: "باب" },
        ],
        correctIndex: 1,
        explanation: { en: "Support = Floor", ur: "Support = فرش", hi: "Support = फर्श", ar: "الدعم = أرضية" },
      },
      {
        type: "MCQ",
        prompt: { en: "If price breaks Resistance, it becomes?", ur: "قیمت Resistance توڑ دے تو وہ کیا بن جاتا ہے؟", hi: "अगर कीमत Resistance तोड़े तो?", ar: "إذا كسر السعر المقاومة تصبح؟" },
        options: [
          { en: "Nothing", ur: "کچھ نہیں", hi: "कुछ नहीं", ar: "لا شيء" },
          { en: "Support", ur: "Support", hi: "Support", ar: "دعم" },
          { en: "Trend", ur: "Trend", hi: "Trend", ar: "اتجاه" },
          { en: "Loss", ur: "Loss", hi: "Loss", ar: "خسارة" },
        ],
        correctIndex: 1,
        explanation: { en: "Broken resistance becomes support (role reversal)", ur: "ٹوٹی ہوئی Resistance Support بن جاتی ہے", hi: "टूटा Resistance Support बन जाता है", ar: "المقاوعة المكسورة تصبح دعماً" },
      },
      {
        type: "MCQ",
        prompt: { en: "What to do at Support?", ur: "Support پر کیا کرنا چاہیے؟", hi: "Support पर क्या करें?", ar: "ماذا تفعل عند الدعم؟" },
        options: [
          { en: "Sell", ur: "Sell", hi: "Sell", ar: "بيع" },
          { en: "Buy", ur: "Buy", hi: "Buy", ar: "شراء" },
          { en: "Hold", ur: "Hold", hi: "Hold", ar: "انتظار" },
          { en: "Close", ur: "Close", hi: "Close", ar: "إغلاق" },
        ],
        correctIndex: 1,
        explanation: { en: "Buy at Support", ur: "Support پر Buy کریں", hi: "Support पर Buy करें", ar: "اشترِ عند الدعم" },
      },
      {
        type: "MCQ",
        prompt: { en: "S&R means?", ur: "S&R کا مطلب؟", hi: "S&R का मतलब?", ar: "S&R تعني؟" },
        options: [
          { en: "Stop & Reverse", ur: "Stop & Reverse", hi: "Stop & Reverse", ar: "توقف وعكس" },
          { en: "Support & Resistance", ur: "Support & Resistance", hi: "Support & Resistance", ar: "دعم ومقاومة" },
          { en: "Sell & Repurchase", ur: "Sell & Repurchase", hi: "Sell & Repurchase", ar: "بيع وإعادة شراء" },
          { en: "Safe & Risk", ur: "Safe & Risk", hi: "Safe & Risk", ar: "آمن ومخاطرة" },
        ],
        correctIndex: 1,
        explanation: { en: "S&R = Support & Resistance", ur: "S&R = Support & Resistance", hi: "S&R = Support & Resistance", ar: "S&R = دعم ومقاومة" },
      },
    ],
  },

  {
    id: "eurusd-7",
    order: 7,
    title: { en: "Trend & Trend Lines", ur: "Trend اور Trend Lines", hi: "ट्रेंड और ट्रेंड लाइन्स", ar: "الاتجاه وخطوط الاتجاه" },
    summary: { en: "Uptrend, downtrend — trade with the trend, not against it.", ur: "Trend کے ساتھ ٹریڈ کریں۔", hi: "ट्रेंड के साथ ट्रेड करें।", ar: "تداول مع الاتجاه." },
    content: {
      en: `## Trend & Trend Lines

**Uptrend:** Higher Highs + Higher Lows → only look for Buy
**Downtrend:** Lower Lows + Lower Highs → only look for Sell

### Example
If \`EUR/USD\` keeps making higher lows: 1.0950, 1.0980, 1.1000 — it's an **uptrend**.
We buy on pullbacks.`,
      ur: `## Trend اور Trend Lines

Uptrend: اونچے High + اونچے Low → صرف Buy ڈھونڈیں
Downtrend: نیچے Low + نیچے High → صرف Sell ڈھونڈیں

### مثال
اگر EUR/USD لگاتار 1.0950, 1.0980, 1.1000 Low بنا رہا ہے تو یہ Uptrend ہے۔
ہم Pullback پر Buy لیں گے۔`,
      hi: `## ट्रेंड और ट्रेंड लाइन्स

Uptrend: ऊँचे High + ऊँचे Low → Buy
Downtrend: नीचे Low + नीचे High → Sell`,
      ar: `## الاتجاه وخطوط الاتجاه

**صاعد:** قمم أعلى + قيعان أعلى → ابحث فقط عن الشراء
**هابط:** قيعان أدنى + قمم أدنى → ابحث فقط عن البيع

### مثال
إذا كان \`EUR/USD\` يصنع قيعان أعلى باستمرار: 1.0950, 1.0980, 1.1000 — فهو اتجاه صاعد.
نشتري عند التصحيح.`,
    },
    durationMin: 5,
        isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "In an uptrend, what forms?", ur: "Uptrend میں کیا بنتا ہے؟", hi: "Uptrend में क्या बनता है?", ar: "في الاتجاه الصاعد ماذا يتكون؟" },
        options: [
          { en: "Lower Lows", ur: "نیچے Low", hi: "नीचे Low", ar: "قيعان أدنى" },
          { en: "Higher Highs + Higher Lows", ur: "اونچے High + اونچے Low", hi: "ऊँचे High + ऊँचे Low", ar: "قمم أعلى + قيعان أعلى" },
          { en: "Same price", ur: "ایک ہی قیمت", hi: "एक ही कीमत", ar: "نفس السعر" },
          { en: "Sideways", ur: "Sideways", hi: "Sideways", ar: "جانبي" },
        ],
        correctIndex: 1,
        explanation: { en: "Uptrend = Higher Highs + Higher Lows", ur: "Uptrend = اونچے High + اونچے Low", hi: "Uptrend = ऊँचे High + ऊँचे Low", ar: "صاعد = قمم أعلى + قيعان أعلى" },
      },
      {
        type: "MCQ",
        prompt: { en: "What should you do with the trend?", ur: "Trend کے ساتھ کیا کرنا چاہیے؟", hi: "ट्रेंड के साथ क्या करें?", ar: "ماذا تفعل مع الاتجاه؟" },
        options: [
          { en: "Trade against it", ur: "خلاف ٹریڈ", hi: "विरुद्ध ट्रेड", ar: "تداول ضد الاتجاه" },
          { en: "Trade with it", ur: "Trend کے ساتھ ٹریڈ", hi: "ट्रेंड के साथ ट्रेड", ar: "تداول مع الاتجاه" },
          { en: "No difference", ur: "کوئی فرق نہیں", hi: "कोई फ़र्क नहीं", ar: "لا فرق" },
          { en: "Leave market", ur: "مارکیٹ چھوڑ دیں", hi: "बाज़ार छोड़ दें", ar: "اترك السوق" },
        ],
        correctIndex: 1,
        explanation: { en: "Always trade with the trend", ur: "ہمیشہ Trend کے ساتھ ٹریڈ کریں", hi: "हमेशा ट्रेंड के साथ ट्रेड करें", ar: "تداول دائماً مع الاتجاه" },
      },
      {
        type: "MCQ",
        prompt: { en: "Minimum points for a trend line?", ur: "Trend Line لگانے کے لیے کم از کم کتنے پوائنٹ چاہیے؟", hi: "ट्रेंड लाइन के लिए कम से कम कितने पॉइंट?", ar: "كم نقطة كحد أدنى لخط الاتجاه؟" },
        options: [
          { en: "1", ur: "1", hi: "1", ar: "1" },
          { en: "2", ur: "2", hi: "2", ar: "2" },
          { en: "3", ur: "3", hi: "3", ar: "3" },
          { en: "4", ur: "4", hi: "4", ar: "4" },
        ],
        correctIndex: 1,
        explanation: { en: "Minimum 2 points to draw a trend line", ur: "کم از کم 2 پوائنٹ چاہیے", hi: "कम से कम 2 पॉइंट", ar: "على الأقل نقطتين" },
      },
      {
        type: "MCQ",
        prompt: { en: "Sideways market means?", ur: "Sideways مارکیٹ کا مطلب؟", hi: "Sideways बाज़ार का मतलब?", ar: "السوق الجانبي يعني؟" },
        options: [
          { en: "Fast up", ur: "تیز اوپر", hi: "तेज़ ऊपर", ar: "صعود سريع" },
          { en: "Fast down", ur: "تیز نیچے", hi: "तेज़ नीचे", ar: "هبوط سريع" },
          { en: "In a range", ur: "ایک رینج میں", hi: "एक रेंज में", ar: "في نطاق" },
          { en: "Market closed", ur: "مارکیٹ بند", hi: "बाज़ार बंद", ar: "السوق مغلق" },
        ],
        correctIndex: 2,
        explanation: { en: "Sideways = price moves in a range", ur: "Sideways = قیمت ایک رینج میں چلتی ہے", hi: "Sideways = रेंज में", ar: "جانبي = في نطاق" },
      },
    ],
  },

  {
    id: "eurusd-8",
    order: 8,
    title: { en: "Order Types: Market, Limit, Stop", ur: "Order Types: Market, Limit, Stop", hi: "ऑर्डर प्रकार", ar: "أنواع الأوامر" },
    summary: { en: "Market, Limit, Stop — when to use each order type.", ur: "کون سا آرڈر کب لگانا ہے؟", hi: "कौन सा ऑर्डर कब लगाना है?", ar: "متى تستخدم كل نوع؟" },
    content: {
      en: `## Order Types

### 1. Market Order
Buy/Sell right now at current price (e.g., buy at 1.1000)

### 2. Buy Limit
Buy at a lower price — e.g., buy when price comes to 1.0980 (Support)

### 3. Buy Stop
Buy above current price — e.g., buy at 1.1051 when Resistance (1.1050) breaks

### Note
\`EUR/USD\` typically has very low spread: 0.1 to 0.3 pips`,
      ur: `## Order Types

### 1. Market Order
ابھی 1.1000 پر Buy دبا دیا

### 2. Buy Limit
قیمت 1.0980 Support پر آئے تو Buy ہو جائے

### 3. Buy Stop
قیمت 1.1050 Resistance توڑے تو 1.1051 پر Buy ہو جائے

### نوٹ
EUR/USD میں Spread بہت کم ہوتا ہے 0.1 سے 0.3 Pips`,
      hi: `## ऑर्डर प्रकार

Market, Limit, Stop — कब उपयोग करें।`,
      ar: `## أنواع الأوامر

### 1. أمر السوق (Market Order)
شراء/بيع فوراً عند السعر الحالي (مثال: شراء عند 1.1000)

### 2. Buy Limit
شراء عند سعر أقل — مثال: شراء عندما يصل السعر إلى 1.0980 (دعم)

### 3. Buy Stop
شراء فوق السعر الحالي — مثال: شراء عند 1.1051 عندما يكسر المقاومة (1.1050)

### ملاحظة
\`EUR/USD\` عادةً له فارق منخفض جداً: 0.1 إلى 0.3 نقطة`,
    },
    durationMin: 5,
        isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "Immediate Buy/Sell is called?", ur: "فوری Buy/Sell کو کیا کہتے ہیں؟", hi: "तुरंत Buy/Sell को क्या कहते हैं?", ar: "الشراء/البيع الفوري يسمى؟" },
        options: [
          { en: "Limit Order", ur: "Limit Order", hi: "Limit Order", ar: "أمر حد" },
          { en: "Stop Order", ur: "Stop Order", hi: "Stop Order", ar: "أمر إيقاف" },
          { en: "Market Order", ur: "Market Order", hi: "Market Order", ar: "أمر سوق" },
          { en: "Pending Order", ur: "Pending Order", hi: "Pending Order", ar: "أمر معلق" },
        ],
        correctIndex: 2,
        explanation: { en: "Market Order = immediate execution", ur: "Market Order = فوری", hi: "Market Order = तुरंत", ar: "أمر السوق = فوري" },
      },
      {
        type: "MCQ",
        prompt: { en: "Which order for 'buy cheap'?", ur: '"سستی پر خریدو" کے لیے کون سا آرڈر؟', hi: '"सस्ता खरीदें" के लिए कौन सा ऑर्डर?', ar: 'أي أمر "للشراء الرخيص"؟' },
        options: [
          { en: "Buy Stop", ur: "Buy Stop", hi: "Buy Stop", ar: "Buy Stop" },
          { en: "Sell Limit", ur: "Sell Limit", hi: "Sell Limit", ar: "Sell Limit" },
          { en: "Buy Limit", ur: "Buy Limit", hi: "Buy Limit", ar: "Buy Limit" },
          { en: "Market", ur: "Market", hi: "Market", ar: "Market" },
        ],
        correctIndex: 2,
        explanation: { en: "Buy Limit = buy at lower price", ur: "Buy Limit = سستی قیمت پر Buy", hi: "Buy Limit = सस्ते में Buy", ar: "Buy Limit = شراء بسعر أدنى" },
      },
      {
        type: "MCQ",
        prompt: { en: "Which order for breakout?", ur: "بریک آؤٹ کے لیے کون سا آرڈر؟", hi: "ब्रेकआउट के लिए कौन सा ऑर्डर?", ar: "أي أمر للاختراق؟" },
        options: [
          { en: "Buy Limit", ur: "Buy Limit", hi: "Buy Limit", ar: "Buy Limit" },
          { en: "Buy Stop", ur: "Buy Stop", hi: "Buy Stop", ar: "Buy Stop" },
          { en: "Sell Limit", ur: "Sell Limit", hi: "Sell Limit", ar: "Sell Limit" },
          { en: "Market", ur: "Market", hi: "Market", ar: "Market" },
        ],
        correctIndex: 1,
        explanation: { en: "Buy Stop = buy above current price (breakout)", ur: "Buy Stop =Resistance توڑنے پر Buy", hi: "Buy Stop = ब्रेकआउट पर Buy", ar: "Buy Stop = شراء فوق السعر الحالي" },
      },
      {
        type: "MCQ",
        prompt: { en: "What's mandatory with every order?", ur: "ہر آرڈر کے ساتھ کیا لگانا لازمی ہے؟", hi: "हर ऑर्डर के साथ क्या अनिवार्य है?", ar: "ما الإلزامي مع كل أمر؟" },
        options: [
          { en: "Nothing", ur: "کچھ نہیں", hi: "कुछ नहीं", ar: "لا شيء" },
          { en: "Only TP", ur: "صرف TP", hi: "सिर्फ TP", ar: "فقط TP" },
          { en: "SL and TP", ur: "SL اور TP", hi: "SL और TP", ar: "SL و TP" },
          { en: "Only Comment", ur: "صرف Comment", hi: "सिर्फ Comment", ar: "فقط تعليق" },
        ],
        correctIndex: 2,
        explanation: { en: "Always use SL + TP", ur: "ہمیشہ SL اور TP لگائیں", hi: "हमेशा SL + TP लगाएं", ar: "استخدم دائماً SL + TP" },
      },
    ],
  },

  {
    id: "eurusd-9",
    order: 9,
    title: { en: "Risk Management - 2% Rule", ur: "Risk Management - 2% Rule", hi: "रिस्क मैनेजमेंट - 2% नियम", ar: "إدارة المخاطر - قاعدة 2%" },
    summary: { en: "Never risk more than 2% per trade. Stop loss + take profit.", ur: "ایک Trade میں 2% سے زیادہ Risk نہیں۔", hi: "एक ट्रेड में 2% से ज़्यादा जोखिम नहीं।", ar: "لا تخاطر بأكثر من 2%." },
    content: {
      en: `## Risk Management — 2% Rule

**2% Rule:** $100 account = max $2 risk per trade

### Example
Balance: $100
\`EUR/USD\` Buy at 1.1000, SL at 1.0980 = 20 pips risk = $2 risk
TP at 1.1040 = 40 pips profit = $4 profit
**Risk:Reward = 1:2** ✅

### Calculation
20 pips × 0.01 lot × $0.10 = $2`,
      ur: `## Risk Management — 2% Rule

2% Rule: $100 اکاؤنٹ = ایک Trade میں زیادہ سے زیادہ $2 Risk

### مثال
Balance $100
EUR/USD Buy 1.1000, SL 1.0980 = 20 Pips Risk = $2 Risk
TP 1.1040 = 40 Pips Profit = $4 Profit
Risk:Reward = 1:2 ✅

حساب: 20 Pips x 0.01 Lot x $0.10 = $2`,
      hi: `## रिस्क मैनेजमेंट — 2% नियम

$100 अकाउंट = अधिकतम $2 जोखिम प्रति ट्रेड`,
      ar: `## إدارة المخاطر — قاعدة 2%

**قاعدة 2%:** حساب 100 دولار = حد أقصى 2 دولار مخاطرة في الصفقة

### مثال
الرصيد: 100 دولار
\`EUR/USD\` شراء عند 1.1000، وقف الخسارة عند 1.0980 = 20 نقطة مخاطرة = 2 دولار
جني الأرباح عند 1.1040 = 40 نقطة ربح = 4 دولار
**المخاطرة:العائد = 1:2** ✅

### الحساب
20 نقطة × 0.01 لوت × 0.10 دولار = 2 دولار`,
    },
    durationMin: 5,
        isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What does the 2% rule say?", ur: "2% Rule کیا کہتا ہے؟", hi: "2% नियम क्या कहता है?", ar: "ماذا تقول قاعدة 2%؟" },
        options: [
          { en: "Daily 2% profit", ur: "روز 2% Profit", hi: "रोज़ 2% लाभ", ar: "2% ربح يومية" },
          { en: "Max 2% risk per trade", ur: "ایک Trade میں 2% سے زیادہ Risk نہیں", hi: "अधिकतम 2% जोखिम प्रति ट्रेड", ar: "حد أقصى 2% مخاطرة لكل صفقة" },
          { en: "2% commission", ur: "2% Commission", hi: "2% कमीशन", ar: "2% عمولة" },
          { en: "2 trades daily", ur: "2 Trade روزانہ", hi: "रोज़ 2 ट्रेड", ar: "2 صفقة يومياً" },
        ],
        correctIndex: 1,
        explanation: { en: "2% rule = max 2% risk per trade", ur: "2% Rule = ایک Trade میں 2% سے زیادہ Risk نہیں", hi: "2% नियम = अधिकतम 2% जोखिम", ar: "قاعدة 2% = حد أقصى 2% مخاطرة" },
      },
      {
        type: "MCQ",
        prompt: { en: "2% risk on $100 = how much $?", ur: "$100 اکاؤنٹ میں 2% Risk = کتنے $؟", hi: "$100 पर 2% जोखिम = कितने $?", ar: "2% مخاطرة على $100 = كم؟" },
        options: [
          { en: "$1", ur: "$1", hi: "$1", ar: "$1" },
          { en: "$2", ur: "$2", hi: "$2", ar: "$2" },
          { en: "$5", ur: "$5", hi: "$5", ar: "$5" },
          { en: "$10", ur: "$10", hi: "$10", ar: "$10" },
        ],
        correctIndex: 1,
        explanation: { en: "2% of $100 = $2", ur: "$100 کا 2% = $2", hi: "$100 का 2% = $2", ar: "2% من $100 = $2" },
      },
      {
        type: "MCQ",
        prompt: { en: "What does Stop Loss do?", ur: "Stop Loss کا کام؟", hi: "Stop Loss का काम?", ar: "ماذا يفمل وقف الخسارة؟" },
        options: [
          { en: "Increase profit", ur: "Profit بڑھانا", hi: "लाभ बढ़ाना", ar: "زيادة الربح" },
          { en: "Stop loss", ur: "Loss روکنا", hi: "हानि रोकना", ar: "إيقاف الخسارة" },
          { en: "Close trade", ur: "Trade بند کرنا", hi: "ट्रेड बंद करना", ar: "إغلاق الصفقة" },
          { en: "Increase leverage", ur: "Leverage بڑھانا", hi: "लीवरेज बढ़ाना", ar: "زيادة الرافعة" },
        ],
        correctIndex: 1,
        explanation: { en: "SL stops your loss", ur: "SL آپ کا Loss روکتا ہے", hi: "SL हानि रोकता है", ar: "SL يوقف الخسارة" },
      },
      {
        type: "MCQ",
        prompt: { en: "Best Risk:Reward ratio?", ur: "Risk:Reward کا بہترین Ratio؟", hi: "सर्वश्रेष्ठ Risk:Reward?", ar: "أفضل نسبة مخاطرة:عائد؟" },
        options: [
          { en: "1:1", ur: "1:1", hi: "1:1", ar: "1:1" },
          { en: "1:2", ur: "1:2", hi: "1:2", ar: "1:2" },
          { en: "2:1", ur: "2:1", hi: "2:1", ar: "2:1" },
          { en: "1:5", ur: "1:5", hi: "1:5", ar: "1:5" },
        ],
        correctIndex: 1,
        explanation: { en: "1:2 is the best Risk:Reward", ur: "1:2 بہترین Ratio ہے", hi: "1:2 सर्वश्रेष्ठ है", ar: "1:2 الأفضل" },
      },
    ],
  },

  {
    id: "eurusd-10",
    order: 10,
    title: { en: "Trading Psychology", ur: "Trading Psychology", hi: "ट्रेडिंग साइकोलॉजी", ar: "سيكولوجية التداول" },
    summary: { en: "Control greed and fear — the trader's biggest enemies.", ur: "لالچ اور خوف کو کنٹرول کریں۔", hi: "लालच और डर को नियंत्रित करें।", ar: "تحكم في الطمع والخوف." },
    content: {
      en: `## Trading Psychology

**Greed:** Made $4 profit, removed TP, price came back and hit SL
**Fear:** Lost 2 trades, closed the demo account

### Solution
- Never lose more than 2% per day
- 5 days a week, 2 trades per day — that's enough`,
      ur: `## Trading Psychology

لالچ: $4 Profit ہوا، TP ہٹا دیا۔ قیمت واپس آ کر SL ہٹ کر گیا
خوف: 2 Trade Loss ہوئے تو Demo بند کر دیا

### حل
روزانہ 2% سے زیادہ Loss نہیں کرنا۔ ہفتے میں 5 دن، روز 2 Trade بس۔`,
      hi: `## ट्रेडिंग साइकोलॉजी

लालच और डर — ट्रेडर के सबसे बड़े दुश्मन।`,
      ar: `## سيكولوجية التداول

**الطمع:** حققت 4 دولار ربح، أزلت جني الأرباح، عاد السعر وضرب وقف الخسارة
**الخوف:** خسرت صفقتين، أغلقت الحساب التجريبي

### الحل
- لا تخسر أكثر من 2% يومياً
- 5 أيام أسبوعياً، صفقتان يومياً — هذا يكفي`,
    },
    durationMin: 4,
        isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "Trader's biggest enemy?", ur: "ٹریڈر کا سب سے بڑا دشمن؟", hi: "ट्रेडर का सबसे बड़ा दुश्मन?", ar: "أكبر عدو للمتداول؟" },
        options: [
          { en: "Broker", ur: "بروکر", hi: "ब्रोकर", ar: "الوسيط" },
          { en: "Greed and fear", ur: "لالچ اور خوف", hi: "लालच और डर", ar: "الطمع والخوف" },
          { en: "Internet", ur: "انٹرنیٹ", hi: "इंटरनेट", ar: "الإنترنت" },
          { en: "Laptop", ur: "لیپ ٹاپ", hi: "लैपटॉप", ar: "الحاسوب" },
        ],
        correctIndex: 1,
        explanation: { en: "Greed and fear are the biggest enemies", ur: "لالچ اور خوف سب سے بڑے دشمن ہیں", hi: "लालच और डर सबसे बड़े दुश्मन", ar: "الطمع والخوف أكبر الأعداء" },
      },
      {
        type: "MCQ",
        prompt: { en: "Trading right after a loss is called?", ur: "Loss کے بعد فوراً Trade لینے کو کیا کہتے ہیں؟", hi: "हानि के बाद तुरंत ट्रेड को क्या कहते हैं?", ar: "التداول بعد الخسارة مباشرة يسمى؟" },
        options: [
          { en: "Smart Trading", ur: "Smart Trading", hi: "Smart Trading", ar: "تداول ذكي" },
          { en: "Revenge Trading", ur: "Revenge Trading", hi: "Revenge Trading", ar: "تداول انتقامي" },
          { en: "Scalping", ur: "Scalping", hi: "Scalping", ar: "سكالبينج" },
          { en: "Swing", ur: "Swing", hi: "Swing", ar: "سوينج" },
        ],
        correctIndex: 1,
        explanation: { en: "Revenge trading = trading out of anger after loss", ur: "Revenge Trading = Loss کے بعد غصے میں Trade", hi: "Revenge Trading = हानि के बाद ट्रेड", ar: "التداول الانتقامي = التداول بعد الخسارة" },
      },
      {
        type: "MCQ",
        prompt: { en: "What does a successful trader do?", ur: "کامیاب ٹریڈر کیا کرتا ہے؟", hi: "सफल ट्रेडर क्या करता है?", ar: "ماذا يفعل المتداول الناجح؟" },
        options: [
          { en: "Plans and follows it", ur: "پلان بنا کر اس پر چلتا ہے", hi: "योजना बनाकर उस पर चलता है", ar: "يخطط ويتبع خطته" },
          { en: "Trades on guesses", ur: "اندازے سے ٹریڈ کرتا ہے", hi: "अनुमान से ट्रेड करता है", ar: "يتداول بالتخمين" },
          { en: "20 trades daily", ur: "روز 20 Trade لیتا ہے", hi: "रोज़ 20 ट्रेड", ar: "20 صفقة يومياً" },
          { en: "Never trades news", ur: "News پر ٹریڈ نہیں کرتا", hi: "News पर ट्रेड नहीं", ar: "لا يتداول الأخبار" },
        ],
        correctIndex: 0,
        explanation: { en: "Successful traders plan and follow", ur: "کامیاب ٹریڈر پلان بنتے ہیں اور اس پر چلتے ہیں", hi: "सफल ट्रेडर योजना बनाते हैं", ar: "المتداولون الناجحون يخططون" },
      },
      {
        type: "MCQ",
        prompt: { en: "How many good trades per day are enough?", ur: "روزانہ کتنے اچھے Trade کافی ہیں؟", hi: "रोज़ कितने अच्छे ट्रेड काफी हैं?", ar: "كم صفقة جيدة يومياً كافية؟" },
        options: [
          { en: "10-15", ur: "10-15", hi: "10-15", ar: "10-15" },
          { en: "5-7", ur: "5-7", hi: "5-7", ar: "5-7" },
          { en: "2-3", ur: "2-3", hi: "2-3", ar: "2-3" },
          { en: "50", ur: "50", hi: "50", ar: "50" },
        ],
        correctIndex: 2,
        explanation: { en: "2-3 good trades per day is enough", ur: "2-3 اچھے Trade کافی ہیں", hi: "2-3 ट्रेड काफी हैं", ar: "2-3 صفقات كافية" },
      },
    ],
  },

  {
    id: "eurusd-11",
    order: 11,
    title: { en: "Demo Account Setup MT5", ur: "Demo Account Setup MT5", hi: "डेमो अकाउंट सेटअप MT5", ar: "إعداد حساب تجريبي MT5" },
    summary: { en: "Practice with $10,000 virtual money before going real.", ur: "$10,000 سے Practice کریں۔", hi: "$10,000 से अभ्यास करें।", ar: "تدرب بـ $10,000 وهمية." },
    content: {
      en: `## Demo Account Setup — MT5

### Step by Step
1. Open a Demo Account
2. **Platform:** MT5
3. **Account Type:** Micro or Cent
4. **Balance:** $10,000
5. **Leverage:** 1:1000
6. **Symbol:** Search \`EUR/USD\`

### 30-Day Practice Plan
- **Week 1:** Only \`EUR/USD\` with 0.01 Lot, London session
- **Week 2:** Support/Resistance + SL TP
- **Week 3:** Only 1:2 Risk Reward trades
- **Week 4:** If Balance is $10,500+ → start Real`,
      ur: `## Demo Account Setup — MT5

### Step by Step
1. Demo Account Open کریں
2. Platform: MT5
3. Account Type: Micro یا Cent
4. Balance: $10,000
5. Leverage: 1:1000
6. Symbol: EUR/USD سرچ کریں

### 30 دن Practice پلان
ہفتہ 1: صرف EUR/USD پر 0.01 Lot، London سیشن
ہفتہ 2: Support/Resistance + SL TP کے ساتھ
ہفتہ 3: صرف 1:2 Risk Reward والے Trade
ہفتہ 4: اگر Balance $10,500+ ہے تو Real سے شروع`,
      hi: `## डेमो अकाउंट सेटअप — MT5

$10,000 वर्चुअल पैसे से अभ्यास करें।`,
      ar: `## إعداد حساب تجريبي — MT5

### خطوة بخطوة
1. افتح حساب تجريبي
2. **المنصة:** MT5
3. **نوع الحساب:** مايكرو أو سنت
4. **الرصيد:** 10000 دولار
5. **الرافعة:** 1:1000
6. **الرمز:** ابحث عن \`EUR/USD\`

### خطة تدريب 30 يوم
- الأسبوع 1: فقط \`EUR/USD\` بـ 0.01 لوت، جلسة لندن
- الأسبوع 2: الدعم/المقاومة + وقف الخسارة وجني الأرباح
- الأسبوع 3: فقط صفقات بنسبة مخاطرة:عائد 1:2
- الأسبوع 4: إذا كان الرصيد 10500+ → ابدأ بحساب حقيقي`,
    },
    durationMin: 5,
        isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "How long should you demo before real?", ur: "Real سے پہلے کتنی دیر Demo کرنا چاہیے؟", hi: "रियल से पहले कितनी देर डेमो?", ar: "كم مدة الحساب التجريبي قبل الحقيقي؟" },
        options: [
          { en: "1 day", ur: "1 دن", hi: "1 दिन", ar: "1 يوم" },
          { en: "1 week", ur: "1 ہفتہ", hi: "1 हफ़्ता", ar: "1 أسبوع" },
          { en: "1 month", ur: "1 مہینہ", hi: "1 महीना", ar: "1 شهر" },
          { en: "Not needed", ur: "ضرورت نہیں", hi: "ज़रूरी नहीं", ar: "غير ضروري" },
        ],
        correctIndex: 2,
        explanation: { en: "At least 1 month of demo practice", ur: "کم از کم 1 مہینہ Demo کریں", hi: "कम से कम 1 महीना डेमो", ar: "على الأقل شهر واحد" },
      },
      {
        type: "MCQ",
        prompt: { en: "Best demo balance?", ur: "Demo میں کتنا Balance رکھنا بہتر ہے؟", hi: "डेमो में कितना बैलेंस?", ar: "أفضل رصيد تجريبي؟" },
        options: [
          { en: "$100", ur: "$100", hi: "$100", ar: "$100" },
          { en: "$1000", ur: "$1000", hi: "$1000", ar: "$1000" },
          { en: "$10,000", ur: "$10,000", hi: "$10,000", ar: "$10,000" },
          { en: "$1,000,000", ur: "$1,000,000", hi: "$1,000,000", ar: "$1,000,000" },
        ],
        correctIndex: 2,
        explanation: { en: "$10,000 is ideal for demo", ur: "$10,000 بہترین ہے", hi: "$10,000 सबसे अच्छा", ar: "$10,000 الأمثل" },
      },
      {
        type: "MCQ",
        prompt: { en: "Purpose of demo?", ur: "Demo کا مقصد کیا ہے؟", hi: "डेमो का उद्देश्य?", ar: "هدف الحساب التجريبي؟" },
        options: [
          { en: "Make money", ur: "پیسے کمانا", hi: "पैसे कमाना", ar: "كسب المال" },
          { en: "Practice & test strategy", ur: "Practice اور Strategy ٹیسٹ", hi: "अभ्यास और रणनीति परीक्षण", ar: "تدريب واختبار الاستراتيجية" },
          { en: "Waste time", ur: "وقت ضائع کرنا", hi: "समय बर्बाद", ar: "إضاعة الوقت" },
          { en: "Earn commission", ur: "Commission کمانا", hi: "कमीशन कमाना", ar: "كسب العمولة" },
        ],
        correctIndex: 1,
        explanation: { en: "Demo is for practice + strategy testing", ur: "Demo Practice اور Strategy ٹیسٹ کے لیے ہے", hi: "डेमो अभ्यास के लिए है", ar: "التجريبي للتدريب والاختبار" },
      },
      {
        type: "MCQ",
        prompt: { en: "What do you need to open MT5 demo?", ur: "MT5 میں Demo کھولنے کے لیے کیا چاہیے؟", hi: "MT5 डेमो खोलने के लिए क्या चाहिए?", ar: "ماذا تحتاج لفتح حساب تجريبي MT5؟" },
        options: [
          { en: "CNIC", ur: "CNIC", hi: "CNIC", ar: "هوية" },
          { en: "Money", ur: "پیسے", hi: "पैसे", ar: "مال" },
          { en: "Just email", ur: "صرف ای میل", hi: "सिर्फ ईमेल", ar: "فقط بريد إلكتروني" },
          { en: "Bank account", ur: "بینک اکاؤنٹ", hi: "बैंक खाता", ar: "حساب بنكي" },
        ],
        correctIndex: 2,
        explanation: { en: "Just an email to open demo", ur: "صرف ای میل سے Demo کھل جاتا ہے", hi: "सिर्फ ईमेल से डेमो खुलता है", ar: "فقط بريد إلكتروني لفتح التجريبي" },
      },
    ],
  },

  {
    id: "eurusd-12",
    order: 12,
    title: { en: "Quiz + Level 1 Test", ur: "Quiz + Level 1 Test", hi: "क्विज़ + लेवल 1 टेस्ट", ar: "اختبار + المستوى 1" },
    summary: { en: "Final test — pass 7/10 to earn your Beginner Certificate.", ur: "آخری ٹیسٹ — 7/10 پاس کریں۔", hi: "अंतिम परीक्षा — 7/10 पास करें।", ar: "الاختبار النهائي — اجتز 7/10." },
    content: {
      en: `## Level 1 Final Test

### 10 Questions — EUR/USD Version
1. What is the base currency in \`EUR/USD\`?
2. 50 pips on 0.01 lot = how much $? Answer: $5
3. \`EUR/USD\` moves from 1.1000 to 1.1010 = how many pips?
4. What time is London + NY overlap (Pakistan time)?
5. Give an example of the 2% rule
6. What does a red candle mean?
7. What happens when Resistance breaks?
8. When do you use Buy Stop?
9. What's the benefit of 1:1000 leverage?
10. Why is demo necessary before real?

**Passing:** 7 out of 10
**Certificate:** "Level 1: Beginner"`,
      ur: `## Level 1 Final Test

### 10 سوال - EUR/USD ورژن
1. EUR/USD میں Base Currency کون سی ہے؟
2. 0.01 Lot میں 50 Pips = کتنے $؟ جواب: $5
3. EUR/USD 1.1000 سے 1.1010 گیا = کتنے Pips؟
4. London + NY Overlap پاکستان کا کیا وقت ہے؟
5. 2% Rule کی مثال دیں
6. سرخ کینڈل کا مطلب؟
7. Resistance ٹوٹ جائے تو کیا بن جاتا ہے؟
8. Buy Stop کب لگاتے ہیں؟
9. Leverage 1:1000 سے کیا فائدہ؟
10. Real سے پہلے Demo کیوں ضروری؟

Passing: 10 میں سے 7
Certificate: "Level 1: Beginner"`,
      hi: `## लेवल 1 अंतिम परीक्षा

10 प्रश्न — EUR/USD संस्करण`,
      ar: `## الاختبار النهائي للمستوى 1

### 10 أسئلة — نسخة EUR/USD
1. ما هي العملة الأساسية في \`EUR/USD\`؟
2. 50 نقطة على 0.01 لوت = كم دولار؟ الإجابة: 5 دولار
3. \`EUR/USD\` من 1.1000 إلى 1.1010 = كم نقطة؟
4. ما وقت تداخل لندن + نيويورك (بتوقيت باكستان)؟
5. أعطِ مثالاً على قاعدة 2%
6. ماذا تعني الشمعة الحمراء؟
7. ماذا يحدث عندما تُكسر المقاومة؟
8. متى تستخدم Buy Stop؟
9. ما فائدة الرافعة 1:1000؟
10. لماذا الحساب التجريبي ضروري قبل الحقيقي؟

**النجاح:** 7 من 10
**الشهادة:** "المستوى 1: مبتدئ"`,
    },
    durationMin: 5,
        isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "How many points needed to pass Level 1?", ur: "Level 1 پاس کرنے کے لیے کتنے نمبر چاہیے؟", hi: "लेवल 1 पास करने के लिए कितने अंक?", ar: "كم نقطة لاجتياز المستوى 1؟" },
        options: [
          { en: "5/10", ur: "5/10", hi: "5/10", ar: "5/10" },
          { en: "6/10", ur: "6/10", hi: "6/10", ar: "6/10" },
          { en: "7/10", ur: "7/10", hi: "7/10", ar: "7/10" },
          { en: "10/10", ur: "10/10", hi: "10/10", ar: "10/10" },
        ],
        correctIndex: 2,
        explanation: { en: "Need 7/10 to pass Level 1", ur: "7/10 پاس کرنا ضروری ہے", hi: "7/10 पास करना ज़रूरी", ar: "تحتاج 7/10 لاجتياز المستوى 1" },
      },
      {
        type: "MCQ",
        prompt: { en: "1 pip value on 0.01 lot EUR/USD (micro)?", ur: "Micro Account میں EUR/USD پر 1 Pip کی ویلیو 0.01 Lot پر؟", hi: "0.01 लॉट EUR/USD पर 1 पिप का मूल्य?", ar: "قيمة 1 نقطة على 0.01 لوت EUR/USD؟" },
        options: [
          { en: "$0.01", ur: "$0.01", hi: "$0.01", ar: "$0.01" },
          { en: "$0.10", ur: "$0.10", hi: "$0.10", ar: "$0.10" },
          { en: "$1", ur: "$1", hi: "$1", ar: "$1" },
          { en: "$10", ur: "$10", hi: "$10", ar: "$10" },
        ],
        correctIndex: 1,
        explanation: { en: "1 pip on 0.01 lot = $0.10", ur: "0.01 Lot پر 1 Pip = $0.10", hi: "0.01 लॉट पर 1 पिप = $0.10", ar: "1 نقطة على 0.01 لوت = $0.10" },
      },
      {
        type: "MCQ",
        prompt: { en: "What's the next level?", ur: "اگلا Level کون سا ہے؟", hi: "अगला लेवल कौन सा है?", ar: "ما المستوى التالي؟" },
        options: [
          { en: "Level 0", ur: "Level 0", hi: "Level 0", ar: "المستوى 0" },
          { en: "Level 1", ur: "Level 1", hi: "Level 1", ar: "المستوى 1" },
          { en: "Level 2: Intermediate", ur: "Level 2: Intermediate", hi: "Level 2: Intermediate", ar: "المستوى 2: المتوسط" },
          { en: "Pro Level", ur: "Pro Level", hi: "Pro Level", ar: "مستوى المحترف" },
        ],
        correctIndex: 2,
        explanation: { en: "Next is Level 2: Intermediate", ur: "اگلا Level 2: Intermediate ہے", hi: "अगला Level 2: Intermediate", ar: "التالي المستوى 2: المتوسط" },
      },
      {
        type: "MCQ",
        prompt: { en: "What to do after getting the certificate?", ur: "Certificate ملنے کے بعد کیا کریں؟", hi: "प्रमाणपत्र मिलने के बाद क्या करें?", ar: "ماذا تفعل بعد الحصول على الشهادة؟" },
        options: [
          { en: "Deposit real $1000", ur: "Real $1000 ڈپازٹ", hi: "रियल $1000 जमा", ar: "إيداع $1000 حقيقي" },
          { en: "30 days demo practice", ur: "30 دن Demo Practice", hi: "30 दिन डेमो अभ्यास", ar: "30 يوم تدريب تجريبي" },
          { en: "Quit trading", ur: "ٹریڈنگ چھوڑ دیں", hi: "ट्रेडिंग छोड़ दें", ar: "اترك التداول" },
          { en: "Take a loan", ur: "Loan لیں", hi: "ऋण लें", ar: "خذ قرضاً" },
        ],
        correctIndex: 1,
        explanation: { en: "Do 30 days demo practice after certificate", ur: "Certificate کے بعد 30 دن Demo Practice کریں", hi: "प्रमाणपत्र के बाद 30 दिन डेमो", ar: "تدرب 30 يوم بعد الشهادة" },
      },
    ],
  },
]

export async function seedEurUsdLessons(db: PrismaClient) {
  // Get the Beginner category
  const beginner = await db.category.findUnique({ where: { slug: "beginner" } })
  if (!beginner) throw new Error("Beginner category not found — run main seed first")

  // Delete old beginner lessons + their quizzes/questions
  const oldLessons = await db.lesson.findMany({ where: { categoryId: beginner.id }, select: { id: true } })
  if (oldLessons.length > 0) {
    await db.lesson.deleteMany({ where: { id: { in: oldLessons.map((l) => l.id) } } })
  }

  let lessonCount = 0
  let quizCount = 0

  for (const ls of LESSONS) {
    const lesson = await db.lesson.create({
      data: {
        id: ls.id,
        categoryId: beginner.id,
        order: ls.order,
        titleEn: ls.title.en, titleUr: ls.title.ur, titleHi: ls.title.hi, titleAr: ls.title.ar,
        summaryEn: ls.summary.en, summaryUr: ls.summary.ur, summaryHi: ls.summary.hi, summaryAr: ls.summary.ar,
        contentEn: ls.content.en, contentUr: ls.content.ur, contentHi: ls.content.hi, contentAr: ls.content.ar,
        imageUrl: `/lessons/lesson-${ls.order}.png`,
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
