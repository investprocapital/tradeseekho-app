/* TradeSeekho Advanced Lessons — 16 lessons (30-45) + 80 quiz questions
   Run via POST /api/admin/seed-advanced (admin-gated)
   Adds Advanced (Level 3) lessons: SMC, Order Block, FVG, Liquidity,
   Breaker Block, BOS/CHOCH, Kill Zones, Pro Risk, Psychology, News+SMC,
   Top-Down Analysis, Pro Strategy, Crypto SMC, Funded Account, Final Test. */
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
  // ===== LESSON 30: Smart Money Concept (SMC) =====
  {
    id: "eurusd-30",
    order: 1,
    title: {
      en: "Smart Money Concept (SMC) | Retail vs Banks",
      ur: "Smart Money Concept (SMC) | Retail vs Banks",
      hi: "स्मार्ट मनी कॉन्सेप्ट (SMC) | Retail vs Banks",
      ar: "مفهوم المال الذكي (SMC) | المتداولون مقابل البنوك",
    },
    summary: {
      en: "Understand how 10% banks manipulate 90% retail traders using liquidity, then trade with the banks.",
      ur: "سمجھیں کہ 10% Banks کیسے 90% Retail Traders کو Liquidity کے ذریعے manipulate کرتے ہیں، پھر Bank کے ساتھ ٹریڈ کریں۔",
      hi: "समझें कि 10% बैंक 90% Retail Traders को Liquidity से कैसे manipulate करते हैं, फिर बैंक के साथ ट्रेड करें।",
      ar: "افهم كيف يقوم 10% من البنوك بالتلاعب بـ 90% من المتداولين عبر السيولة، ثم تداول مع البنوك.",
    },
    content: {
      en: `## Smart Money Concept (SMC) | Retail vs Banks

In Forex there are 2 types of people. 90% Retail Traders (like us) who trade Support/Resistance. And 10% Smart Money (Banks) who run the market. SMC means following the footsteps of the banks.

Retail thinks: Resistance broke = Buy. But Smart Money first takes the Stop Loss placed above that Resistance (Liquidity Grab) and then dumps the price down.

### 3 Main Concepts
1. **Liquidity:** Where everyone's SL sits (above Equal Highs / below Equal Lows)
2. **Manipulation:** Price intentionally goes to eat the SL
3. **Distribution:** The real move starts after that

### Example: EUR/USD
EUR/USD is at 1.1050 Resistance. Everyone is Selling with SL at 1.1055. Bank will push price to 1.1060, eat everyone's SL, then bring it down to 1.0950. This is SMC.`,
      ur: `## Smart Money Concept (SMC) | Retail vs Banks

Forex میں 2 قسم کے لوگ ہیں۔ 90% Retail Traders (جیسے ہم) جو Support Resistance پر ٹریڈ کرتے ہیں۔ اور 10% Smart Money (Banks) جو مارکیٹ کو چلاتے ہیں۔ SMC کا مطلب ہے Bank کے قدموں پر چلنا۔

Retail سوچتا ہے: Resistance ٹوٹا = Buy۔ لیکن Smart Money پہلے اس Resistance کے اوپر لگے Stop Loss کھاتا ہے (Liquidity Grab) پھر نیچے گراتا ہے۔

### 3 Main Concepts
1. **Liquidity:** جہاں سب کے SL پڑے ہیں (Equal Highs / Equal Lows کے اوپر/نیچے)
2. **Manipulation:** Price جان بوجھ کر SL کھانے جاتی ہے
3. **Distribution:** اصل move اس کے بعد شروع ہوتا ہے

### مثال: EUR/USD
EUR/USD 1.1050 Resistance پر ہے۔ سب Retail 1.1055 پر SL رکھ کر Sell کر رہے ہیں۔ Bank price کو 1.1060 تک لے جائے گا، سب کا SL کھائے گا، پھر 1.0950 تک نیچے لائے گا۔ یہی SMC ہے۔`,
      hi: `## स्मार्ट मनी कॉन्सेप्ट (SMC) | Retail vs Banks

Forex में 2 तरह के लोग होते हैं। 90% Retail Traders (हम जैसे) जो Support/Resistance पर ट्रेड करते हैं। और 10% Smart Money (Banks) जो बाज़ार चलाते हैं। SMC का मतलब है बैंक के कदमों पर चलना।

Retail सोचता है: Resistance टूटा = Buy। लेकिन Smart Money पहले उस Resistance के ऊपर लगे Stop Loss खाता है (Liquidity Grab) फिर नीचे गिराता है।

### 3 मुख्य अवधारणाएं
1. **Liquidity:** जहाँ सबके SL पड़े हैं (Equal Highs / Equal Lows के ऊपर/नीचे)
2. **Manipulation:** Price जान-बूझकर SL खाने जाती है
3. **Distribution:** असली move इसके बाद शुरू होता है

### उदाहरण: EUR/USD
EUR/USD 1.1050 Resistance पर है। सब Retail 1.1055 पर SL रखकर Sell कर रहे हैं। Bank price को 1.1060 तक ले जाएगा, सबका SL खाएगा, फिर 1.0950 तक नीचे लाएगा। यही SMC है।`,
      ar: `## مفهوم المال الذكي (SMC) | المتداولون مقابل البنوك

في الفوركس يوجد نوعان من الناس. 90% متداولون تجزئة (مثلنا) يتداولون الدعم والمقاومة. و10% مال ذكي (البنوك) يحركون السوق. SMC يعني اتباع خطوات البنوك.

المتداول التجزئة يظن: كسرت المقاومة = شراء. لكن المال الذكي يأخذ أولاً وقف الخسارة الموضوع فوق تلك المقاومة (التقاط السيولة) ثم يهبط بالسعر.

### 3 مفاهيم رئيسية
1. **السيولة:** حيث تقف وقف الخسائر للجميع (فوق القمم المتساوية / تحت القيعان المتساوية)
2. **التلاعب:** السعر يذهب عمداً لأكل وقف الخسارة
3. **التوزيع:** الحركة الحقيقية تبدأ بعد ذلك

### مثال: EUR/USD
EUR/USD عند مقاومة 1.1050. الجميع يبيع بوقف خسارة عند 1.1055. البنك سيدفع السعر إلى 1.1060، يأكل وقف خسارة الجميع، ثم ينزله إلى 1.0950. هذا هو SMC.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What does SMC stand for?", ur: "SMC کا مطلب کیا ہے؟", hi: "SMC का मतलब क्या है?", ar: "ماذا يعني SMC؟" },
        options: [
          { en: "Smart Money Concept", ur: "Smart Money Concept", hi: "स्मार्ट मनी कॉन्सेप्ट", ar: "مفهوم المال الذكي" },
          { en: "Simple Market Chart", ur: "Simple Market Chart", hi: "सिंपल मार्केट चार्ट", ar: "رسم سوق بسيط" },
          { en: "Speed Money Control", ur: "Speed Money Control", hi: "स्पीड मनी कंट्रोल", ar: "تحكم سرعة المال" },
          { en: "System Market Code", ur: "System Market Code", hi: "सिस्टम मार्केट कोड", ar: "كود نظام السوق" },
        ],
        correctIndex: 0,
        explanation: { en: "SMC = Smart Money Concept — trading like banks.", ur: "SMC = Smart Money Concept — Bank کی طرح ٹریڈنگ۔", hi: "SMC = स्मार्ट मनी कॉन्सेप्ट — बैंक की तरह ट्रेडिंग।", ar: "SMC = مفهوم المال الذكي — التداول مثل البنوك." },
      },
      {
        type: "MCQ",
        prompt: { en: "What percentage of retail traders lose money to Smart Money?", ur: "Retail Traders کا کتنا فیصد Smart Money کو پیسہ دیتے ہیں؟", hi: "Retail Traders का कितना प्रतिशत Smart Money को पैसा देते हैं?", ar: "كم نسبة المتداولين التجزئة الذين يخسرون لصالح المال الذكي؟" },
        options: [
          { en: "10%", ur: "10%", hi: "10%", ar: "10%" },
          { en: "50%", ur: "50%", hi: "50%", ar: "50%" },
          { en: "90%", ur: "90%", hi: "90%", ar: "90%" },
          { en: "100%", ur: "100%", hi: "100%", ar: "100%" },
        ],
        correctIndex: 2,
        explanation: { en: "90% retail traders lose — they are the liquidity for the 10% banks.", ur: "90% Retail Traders ہارتے ہیں — وہ 10% Banks کے لیے Liquidity ہیں۔", hi: "90% Retail Traders हारते हैं — वे 10% Banks के लिए Liquidity हैं।", ar: "90% من المتداولين التجزئة يخسرون — هم السيولة للـ 10% من البنوك." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is a Liquidity Grab?", ur: "Liquidity Grab کیا ہے؟", hi: "Liquidity Grab क्या है?", ar: "ما هو التقاط السيولة؟" },
        options: [
          { en: "Price reversing at support", ur: "Support پر reverse ہونا", hi: "Support पर reverse होना", ar: "انعكاس السعر عند الدعم" },
          { en: "Price taking Stop Losses above/below key levels then reversing", ur: "Key Levels کے اوپر/نیچے SL کھا کر reverse ہونا", hi: "Key Levels के ऊपर/नीचे SL खाकर reverse होना", ar: "أخذ السعر لوقف الخسائر فوق/تحت المستويات المهمة ثم الانعكاس" },
          { en: "A moving average cross", ur: "Moving Average کا cross", hi: "Moving Average का cross", ar: "تقاطع المتوسط المتحرك" },
          { en: "A news event", ur: "News event", hi: "News event", ar: "حدث إخباري" },
        ],
        correctIndex: 1,
        explanation: { en: "Liquidity Grab = Price hits SLs above resistance or below support, then reverses.", ur: "Liquidity Grab = Price Resistance کے اوپر یا Support کے نیچے SL کھاتی ہے، پھر reverse ہوتی ہے۔", hi: "Liquidity Grab = Price Resistance के ऊपर या Support के नीचे SL खाती है, फिर reverse होती है।", ar: "التقاط السيولة = السعر يضرب وقف الخسائر فوق المقاومة أو تحت الدعم ثم ينعكس." },
      },
      {
        type: "MCQ",
        prompt: { en: "In the EUR/USD example, where does the bank push price after eating SLs?", ur: "EUR/USD مثال میں Bank SL کھانے کے بعد price کہاں لے جاتا ہے؟", hi: "EUR/USD उदाहरण में Bank SL खाने के बाद price कहाँ ले जाता है?", ar: "في مثال EUR/USD، أين يدفع البنك السعر بعد أكل وقف الخسارة؟" },
        options: [
          { en: "Higher to 1.1100", ur: "اوپر 1.1100 تک", hi: "ऊपर 1.1100 तक", ar: "أعلى إلى 1.1100" },
          { en: "Sideways at 1.1050", ur: "Side 1.1050 پر", hi: "Side 1.1050 पर", ar: "جانبي عند 1.1050" },
          { en: "Down to 1.0950", ur: "نیچے 1.0950 تک", hi: "नीचे 1.0950 तक", ar: "أسفل إلى 1.0950" },
          { en: "It stays at 1.1060", ur: "1.1060 پر رہتا ہے", hi: "1.1060 पर रहता है", ar: "يبقى عند 1.1060" },
        ],
        correctIndex: 2,
        explanation: { en: "After eating Buy SLs at 1.1060, bank pushes price down to 1.0950.", ur: "1.1060 پر SL کھانے کے بعد Bank price کو 1.0950 تک نیچے لاتا ہے۔", hi: "1.1060 पर SL खाने के बाद Bank price को 1.0950 तक नीचे लाता है।", ar: "بعد أكل وقف الخسارة عند 1.1060، يدفع البنك السعر إلى 1.0950." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the correct order of SMC phases?", ur: "SMC کے Phases کی صحیح ترتیب کیا ہے؟", hi: "SMC के Phases की सही क्रम क्या है?", ar: "ما هو الترتيب الصحيح لمراحل SMC؟" },
        options: [
          { en: "Distribution → Liquidity → Manipulation", ur: "Distribution → Liquidity → Manipulation", hi: "Distribution → Liquidity → Manipulation", ar: "التوزيع ← السيولة ← التلاعب" },
          { en: "Liquidity → Manipulation → Distribution", ur: "Liquidity → Manipulation → Distribution", hi: "Liquidity → Manipulation → Distribution", ar: "السيولة ← التلاعب ← التوزيع" },
          { en: "Manipulation → Distribution → Liquidity", ur: "Manipulation → Distribution → Liquidity", hi: "Manipulation → Distribution → Liquidity", ar: "التلاعب ← التوزيع ← السيولة" },
          { en: "Distribution → Manipulation → Liquidity", ur: "Distribution → Manipulation → Liquidity", hi: "Distribution → Manipulation → Liquidity", ar: "التوزيع ← التلاعب ← السيولة" },
        ],
        correctIndex: 1,
        explanation: { en: "First Liquidity forms, then Manipulation (SL grab), then Distribution (real move).", ur: "پہلے Liquidity بنتی ہے، پھر Manipulation (SL grab)، پھر Distribution (اصل move)۔", hi: "पहले Liquidity बनती है, फिर Manipulation (SL grab), फिर Distribution (असली move)।", ar: "أولاً تتشكل السيولة، ثم التلاعب (أخذ الوقف)، ثم التوزيع (الحركة الحقيقية)." },
      },
    ],
  },

  // ===== LESSON 31: Order Block (OB) =====
  {
    id: "eurusd-31",
    order: 2,
    title: {
      en: "Order Block (OB) | Where Banks Take Entry",
      ur: "Order Block (OB) | Bank کہاں سے Entry لیتے ہیں",
      hi: "ऑर्डर ब्लॉक (OB) | Bank कहाँ से Entry लेते हैं",
      ar: "بلوك الأوامر (OB) | أين تأخذ البنوك الدخول",
    },
    summary: {
      en: "Order Block is the last opposite candle before a strong move — banks leave their footprints here.",
      ur: "Order Block وہ آخری opposite candle ہے جو تیز move سے پہلے بنتی ہے — Bank یہاں اپنے نقوش چھوڑتے ہیں۔",
      hi: "Order Block वह आखिरी opposite candle है जो तेज़ move से पहले बनती है — Bank यहाँ अपने निशान छोड़ते हैं।",
      ar: "بلوك الأوامر هو آخر شمعة معاكسة قبل حركة قوية — تترك البنوك بصماتها هنا.",
    },
    content: {
      en: `## Order Block (OB) | Where Banks Take Entry

Order Block is the last candle from where the bank placed a big order. Price comes back to that same block and reacts.

### 2 Types
1. **Bullish OB:** The last Bearish candle before going up. A Buy order sits here.
2. **Bearish OB:** The last Bullish candle before going down. A Sell order sits here.

### How to Mark?
Open H4 timeframe. See a fast move. The candle of opposite color before that move = Order Block (its high-low).

### Example: EUR/USD
On H4 EUR/USD quickly went from 1.0900 to 1.1000. At 1.0905 there was a small Bearish candle. That is the Bullish OB. Next time price returns to 1.0905, you Buy. SL: 10 pips below the OB.`,
      ur: `## Order Block (OB) | Bank کہاں سے Entry لیتے ہیں

Order Block وہ last candle ہے جہاں سے Bank نے بڑا order لگایا تھا۔ Price واپس اسی Block پر آکر react کرتا ہے۔

### 2 Types
1. **Bullish OB:** نیچے جانے سے پہلے والی آخری Bearish Candle۔ اس پر Buy کا order ہے۔
2. **Bearish OB:** اوپر جانے سے پہلے والی آخری Bullish Candle۔ اس پر Sell کا order ہے۔

### کیسے Mark کریں؟
H4 timeframe کھولیں۔ ایک تیزی سے move دیکھیں۔ Move سے پہلے جو opposite color کی candle ہے، اس کا high-low = Order Block۔

### مثال: EUR/USD
H4 پر EUR/USD 1.0900 سے 1.1000 تیزی سے گیا۔ 1.0905 پر ایک چھوٹی Bearish Candle تھی۔ وہی Bullish OB ہے۔ اگلی بار price 1.0905 پر آئے گی تو Buy کریں گے۔ SL: OB کے 10 pips نیچے۔`,
      hi: `## ऑर्डर ब्लॉक (OB) | Bank कहाँ से Entry लेते हैं

Order Block वह आखिरी candle है जहाँ से Bank ने बड़ा order लगाया था। Price वापस उसी Block पर आकर react करता है।

### 2 प्रकार
1. **Bullish OB:** ऊपर जाने से पहले वाली आखिरी Bearish Candle। इस पर Buy का order है।
2. **Bearish OB:** नीचे जाने से पहले वाली आखिरी Bullish Candle। इस पर Sell का order है।

### कैसे Mark करें?
H4 timeframe खोलें। एक तेज़ी से move देखें। Move से पहले जो opposite color की candle है, उसका high-low = Order Block।

### उदाहरण: EUR/USD
H4 पर EUR/USD 1.0900 से 1.1000 तेज़ी से गया। 1.0905 पर एक छोटी Bearish Candle थी। वही Bullish OB है। अगली बार price 1.0905 पर आएगी तो Buy करेंगे। SL: OB के 10 pips नीचे।`,
      ar: `## بلوك الأوامر (OB) | أين تأخذ البنوك الدخول

بلوك الأوامر هو آخر شمعة حيث وضع البنك أمراً كبيراً. السعر يعود إلى نفس البلوك ويتفاعل معه.

### نوعان
1. **OB صعودي:** آخر شمعة هبوطية قبل الصعود. يوجد أمر شراء هنا.
2. **OB هبوطي:** آخر شمعة صعودية قبل الهبوط. يوجد أمر بيع هنا.

### كيف تحدده؟
افتح إطار H4. شاهد حركة سريعة. الشمعة ذات اللون المعاكس قبل تلك الحركة = بلوك الأوامر (أعلاها-أدناها).

### مثال: EUR/USD
على H4، صعد EUR/USD بسرعة من 1.0900 إلى 1.1000. عند 1.0905 كانت هناك شمعة هبوطية صغيرة. هذه هي OB الصعودي. المرة القادمة عند عودة السعر إلى 1.0905، تشتري. وقف الخسارة: 10 نقاط تحت OB.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What is a Bullish Order Block?", ur: "Bullish Order Block کیا ہے؟", hi: "Bullish Order Block क्या है?", ar: "ما هو بلوك الأوامر الصعودي؟" },
        options: [
          { en: "Last Bearish candle before an up move", ur: "اوپر جانے سے پہلے آخری Bearish Candle", hi: "ऊपर जाने से पहले आखिरी Bearish Candle", ar: "آخر شمعة هبوطية قبل الحركة الصاعدة" },
          { en: "Last Bullish candle before a down move", ur: "نیچے جانے سے پہلے آخری Bullish Candle", hi: "नीचे जाने से पहले आखिरी Bullish Candle", ar: "آخر شمعة صعودية قبل الحركة الهبوطية" },
          { en: "A doji candle", ur: "Doji candle", hi: "Doji candle", ar: "شمعة دوجي" },
          { en: "A moving average", ur: "Moving Average", hi: "Moving Average", ar: "متوسط متحرك" },
        ],
        correctIndex: 0,
        explanation: { en: "Bullish OB = last Bearish candle before a strong bullish move.", ur: "Bullish OB = تیز bullish move سے پہلے آخری Bearish Candle۔", hi: "Bullish OB = तेज़ bullish move से पहले आखिरी Bearish Candle।", ar: "OB الصعودي = آخر شمعة هبوطية قبل حركة صعودية قوية." },
      },
      {
        type: "MCQ",
        prompt: { en: "Which timeframe is recommended for marking Order Blocks?", ur: "Order Block mark کرنے کے لیے کون سی timeframe بہترین ہے؟", hi: "Order Block mark करने के लिए कौन सी timeframe सर्वोत्तम है?", ar: "ما هو الإطار الزمني الموصى به لتحديد بلك الأوامر؟" },
        options: [
          { en: "M1", ur: "M1", hi: "M1", ar: "M1" },
          { en: "M5", ur: "M5", hi: "M5", ar: "M5" },
          { en: "H4", ur: "H4", hi: "H4", ar: "H4" },
          { en: "Monthly", ur: "Monthly", hi: "Monthly", ar: "شهري" },
        ],
        correctIndex: 2,
        explanation: { en: "H4 is recommended for marking Order Blocks — clear structure, less noise.", ur: "Order Block mark کرنے کے لیے H4 بہترین ہے — clear structure، کم شور۔", hi: "Order Block mark करने के लिए H4 सर्वोत्तम है — clear structure, कम शोर।", ar: "يُوصى بإطار H4 لتحديد بلك الأوامر — هيكل واضح، ضوضاء أقل." },
      },
      {
        type: "MCQ",
        prompt: { en: "In the EUR/USD example, where is the Bullish OB?", ur: "EUR/USD مثال میں Bullish OB کہاں ہے؟", hi: "EUR/USD उदाहरण में Bullish OB कहाँ है?", ar: "في مثال EUR/USD، أين يقع OB الصعودي؟" },
        options: [
          { en: "1.1000", ur: "1.1000", hi: "1.1000", ar: "1.1000" },
          { en: "1.0905", ur: "1.0905", hi: "1.0905", ar: "1.0905" },
          { en: "1.0900", ur: "1.0900", hi: "1.0900", ar: "1.0900" },
          { en: "1.1100", ur: "1.1100", hi: "1.1100", ar: "1.1100" },
        ],
        correctIndex: 1,
        explanation: { en: "The small Bearish candle at 1.0905 (before the up move to 1.1000) is the Bullish OB.", ur: "1.0905 پر چھوٹی Bearish Candle (1.1000 تک کے up move سے پہلے) Bullish OB ہے۔", hi: "1.0905 पर छोटी Bearish Candle (1.1000 तक के up move से पहले) Bullish OB है।", ar: "الشمعة الهبوطية الصغيرة عند 1.0905 (قبل الصعود إلى 1.1000) هي OB الصعودي." },
      },
      {
        type: "MCQ",
        prompt: { en: "Where do you place SL on a Bullish OB entry?", ur: "Bullish OB entry پر SL کہاں رکھتے ہیں؟", hi: "Bullish OB entry पर SL कहाँ रखते हैं?", ar: "أين تضع وقف الخسارة عند الدخول على OB صعودي؟" },
        options: [
          { en: "Above the OB", ur: "OB کے اوپر", hi: "OB के ऊपर", ar: "فوق OB" },
          { en: "10 pips below the OB", ur: "OB کے 10 pips نیچے", hi: "OB के 10 pips नीचे", ar: "10 نقاط تحت OB" },
          { en: "At the previous high", ur: "پچھلے high پر", hi: "पिछले high पर", ar: "عند القمة السابقة" },
          { en: "No SL needed", ur: "SL کی ضرورت نہیں", hi: "SL की ज़रूरत नहीं", ar: "لا حاجة لوقف الخسارة" },
        ],
        correctIndex: 1,
        explanation: { en: "SL goes 10 pips below the OB so it has room to breathe.", ur: "SL، OB کے 10 pips نیچے رکھتے ہیں تاکہ اسے سانس لینے کی گنجائش ہو۔", hi: "SL, OB के 10 pips नीचे रखते हैं ताकि उसे साँस लेने की गुंजाइश हो।", ar: "يوضع وقف الخسارة 10 نقاط تحت OB ليعطيه مجالاً للتنفس." },
      },
      {
        type: "MCQ",
        prompt: { en: "Why does price return to the Order Block?", ur: "Price Order Block پر واپس کیوں آتا ہے؟", hi: "Price Order Block पर वापस क्यों आता है?", ar: "لماذا يعود السعر إلى بلك الأوامر؟" },
        options: [
          { en: "Because banks have unfilled orders there", ur: "کیونکہ Bank کے وہاں unfilled orders ہوتے ہیں", hi: "क्योंकि Bank के वहाँ unfilled orders होते हैं", ar: "لأن البنوك لديها أوامر غير مملوءة هناك" },
          { en: "Because of moving averages", ur: "Moving Averages کی وجہ سے", hi: "Moving Averages की वजह से", ar: "بسبب المتوسطات المتحركة" },
          { en: "Because of news", ur: "News کی وجہ سے", hi: "News की वजह से", ar: "بسبب الأخبار" },
          { en: "Randomly", ur: "بے ترتیب", hi: "बेतरतीब", ar: "عشوائياً" },
        ],
        correctIndex: 0,
        explanation: { en: "Banks leave unfilled orders at the OB — price returns to fill them.", ur: "Bank OB پر unfilled orders چھوڑتے ہیں — Price واپس آکر انہیں fill کرتا ہے۔", hi: "Bank OB पर unfilled orders छोड़ते हैं — Price वापस आकर उन्हें fill करता है।", ar: "تترك البنوك أوامر غير مملوءة عند OB — يعود السعر لملئها." },
      },
    ],
  },

  // ===== LESSON 32: Fair Value Gap (FVG) =====
  {
    id: "eurusd-32",
    order: 3,
    title: {
      en: "Fair Value Gap (FVG) / Imbalance",
      ur: "Fair Value Gap (FVG) / Imbalance",
      hi: "फेयर वैल्यू गैप (FVG) / Imbalance",
      ar: "فجوة القيمة العادلة (FVG) / عدم التوازن",
    },
    summary: {
      en: "FVG is the gap left behind during fast moves — the market returns 70% of the time to fill it.",
      ur: "FVG تیز move کے دوران چھوڑا گیا gap ہے — مارکیٹ 70% وقت واپس آکر اسے fill کرتی ہے۔",
      hi: "FVG तेज़ move के दौरान छोड़ा गया gap है — बाज़ार 70% समय वापस आकर इसे fill करता है।",
      ar: "FVG هي الفجوة التي تُترك أثناء الحركات السريعة — يعود السوق 70% من الوقت لملئها.",
    },
    content: {
      en: `## Fair Value Gap (FVG) / Imbalance

When the market moves very fast, it leaves a gap in between. This gap is called FVG. The market comes back 70% of the time to fill this gap.

### Identification
3 candles. The wicks of the first and third candle do not overlap. The middle candle is large.

### Rule
When price enters the FVG, take entry. SL outside the FVG.

### Example: EUR/USD
On M15 EUR/USD went from 1.1000 to 1.1020. A gap formed between 1.1005 - 1.1015. Price came back to 1.1010 = Buy from Bullish FVG. TP = next High.`,
      ur: `## Fair Value Gap (FVG) / Imbalance

جب مارکیٹ بہت تیزی سے چلتی ہے تو بیچ میں ایک gap چھوڑ دیتی ہے۔ اس gap کو FVG کہتے ہیں۔ مارکیٹ 70% time واپس آکر اس gap کو fill کرتی ہے۔

### پہچان
3 Candles۔ پہلی اور تیسری candle کی wick overlap نہیں کرتی۔ بیچ کی candle بڑی ہوتی ہے۔

### Rule
Price FVG میں آئے تو Entry لینی ہے، SL FVG کے باہر۔

### مثال: EUR/USD
M15 پر EUR/USD 1.1000 سے 1.1020 گیا۔ بیچ میں 1.1005 - 1.1015 کا gap بنا۔ Price واپس 1.1010 پر آیا = Bullish FVG سے Buy۔ TP اگلا High۔`,
      hi: `## फेयर वैल्यू गैप (FVG) / Imbalance

जब बाज़ार बहुत तेज़ी से चलता है तो बीच में एक gap छोड़ देता है। इस gap को FVG कहते हैं। बाज़ार 70% समय वापस आकर इस gap को fill करता है।

### पहचान
3 Candles। पहली और तीसरी candle की wick overlap नहीं करती। बीच की candle बड़ी होती है।

### नियम
Price FVG में आए तो Entry लेनी है, SL FVG के बाहर।

### उदाहरण: EUR/USD
M15 पर EUR/USD 1.1000 से 1.1020 गया। बीच में 1.1005 - 1.1015 का gap बना। Price वापस 1.1010 पर आया = Bullish FVG से Buy। TP अगला High।`,
      ar: `## فجوة القيمة العادلة (FVG) / عدم التوازن

عندما يتحرك السوق بسرعة كبيرة، يترك فجوة بين الشموع. تسمى هذه الفجوة FVG. يعود السوق 70% من الوقت لملء هذه الفجوة.

### التحديد
3 شموع. فتائل الشمعة الأولى والثالثة لا تتداخل. الشمعة الوسطى كبيرة.

### القاعدة
عند دخول السعر في FVG، خذ دخولاً. وقف الخسارة خارج FVG.

### مثال: EUR/USD
على M15، تحرك EUR/USD من 1.1000 إلى 1.1020. تكونت فجوة بين 1.1005 - 1.1015. عاد السعر إلى 1.1010 = شراء من FVG الصعودي. الهدف = القمة التالية.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "How many candles are needed to identify an FVG?", ur: "FVG کو پہچاننے کے لیے کتنے candles چاہیے؟", hi: "FVG को पहचानने के लिए कितने candles चाहिए?", ar: "كم شمعة تحتاج لتحديد FVG؟" },
        options: [
          { en: "1 candle", ur: "1 candle", hi: "1 candle", ar: "شمعة واحدة" },
          { en: "2 candles", ur: "2 candles", hi: "2 candles", ar: "شمعتان" },
          { en: "3 candles", ur: "3 candles", hi: "3 candles", ar: "3 شموع" },
          { en: "5 candles", ur: "5 candles", hi: "5 candles", ar: "5 شموع" },
        ],
        correctIndex: 2,
        explanation: { en: "FVG needs 3 candles — first and third wicks don't overlap, middle candle is big.", ur: "FVG کے لیے 3 candles چاہیے — پہلی اور تیسری کی wick overlap نہیں کرتی، بیچ والی بڑی ہوتی ہے۔", hi: "FVG के लिए 3 candles चाहिए — पहली और तीसरी की wick overlap नहीं करती, बीच वाली बड़ी होती है।", ar: "FVG يحتاج 3 شموع — فتائل الأولى والثالثة لا تتداخل، والوسطى كبيرة." },
      },
      {
        type: "MCQ",
        prompt: { en: "What percentage of the time does the market return to fill the FVG?", ur: "مارکیٹ کتنا فیصد وقت FVG کو fill کرنے واپس آتی ہے؟", hi: "बाज़ार कितना प्रतिशत समय FVG को fill करने वापस आता है?", ar: "كم نسبة الوقت يعود فيها السوق لملء FVG؟" },
        options: [
          { en: "30%", ur: "30%", hi: "30%", ar: "30%" },
          { en: "50%", ur: "50%", hi: "50%", ar: "50%" },
          { en: "70%", ur: "70%", hi: "70%", ar: "70%" },
          { en: "100%", ur: "100%", hi: "100%", ar: "100%" },
        ],
        correctIndex: 2,
        explanation: { en: "The market returns 70% of the time to fill the FVG.", ur: "مارکیٹ 70% وقت FVG کو fill کرنے واپس آتی ہے۔", hi: "बाज़ार 70% समय FVG को fill करने वापस आता है।", ar: "يعود السوق 70% من الوقت لملء FVG." },
      },
      {
        type: "MCQ",
        prompt: { en: "Where should the SL be placed on an FVG entry?", ur: "FVG entry پر SL کہاں رکھنا چاہیے؟", hi: "FVG entry पर SL कहाँ रखना चाहिए?", ar: "أين يوضع وقف الخسارة عند الدخول على FVG؟" },
        options: [
          { en: "Inside the FVG", ur: "FVG کے اندر", hi: "FVG के अंदर", ar: "داخل FVG" },
          { en: "Outside the FVG", ur: "FVG کے باہر", hi: "FVG के बाहर", ar: "خارج FVG" },
          { en: "At the previous high", ur: "پچھلے high پر", hi: "पिछले high पर", ar: "عند القمة السابقة" },
          { en: "No SL needed", ur: "SL کی ضرورت نہیں", hi: "SL की ज़रूरत नहीं", ar: "لا حاجة لوقف الخسارة" },
        ],
        correctIndex: 1,
        explanation: { en: "SL goes outside the FVG so the gap can still hold.", ur: "SL، FVG کے باہر رکھتے ہیں تاکہ gap برقرار رہے۔", hi: "SL, FVG के बाहर रखते हैं ताकि gap बना रहे।", ar: "يوضع وقف الخسارة خارج FVG ليبقى الفجوة سارية." },
      },
      {
        type: "MCQ",
        prompt: { en: "In the EUR/USD example, what is the FVG range?", ur: "EUR/USD مثال میں FVG کی range کیا ہے؟", hi: "EUR/USD उदाहरण में FVG की range क्या है?", ar: "في مثال EUR/USD، ما هو نطاق FVG؟" },
        options: [
          { en: "1.1000 - 1.1020", ur: "1.1000 - 1.1020", hi: "1.1000 - 1.1020", ar: "1.1000 - 1.1020" },
          { en: "1.1005 - 1.1015", ur: "1.1005 - 1.1015", hi: "1.1005 - 1.1015", ar: "1.1005 - 1.1015" },
          { en: "1.1010 - 1.1030", ur: "1.1010 - 1.1030", hi: "1.1010 - 1.1030", ar: "1.1010 - 1.1030" },
          { en: "1.0990 - 1.1000", ur: "1.0990 - 1.1000", hi: "1.0990 - 1.1000", ar: "1.0990 - 1.1000" },
        ],
        correctIndex: 1,
        explanation: { en: "The FVG is between 1.1005 and 1.1015 (the gap left during the fast up move).", ur: "FVG 1.1005 اور 1.1015 کے بیچ ہے (تیز up move کے دوران چھوڑا گیا gap)۔", hi: "FVG 1.1005 और 1.1015 के बीच है (तेज़ up move के दौरान छोड़ा गया gap)।", ar: "FVG بين 1.1005 و 1.1015 (الفجوة المتبقية أثناء الحركة الصاعدة السريعة)." },
      },
      {
        type: "MCQ",
        prompt: { en: "What does FVG indicate about the market?", ur: "FVG مارکیٹ کے بارے میں کیا بتاتا ہے؟", hi: "FVG बाज़ार के बारे में क्या बताता है?", ar: "ماذا يشير FVG عن السوق؟" },
        options: [
          { en: "Slow and balanced market", ur: "سست اور balanced مارکیٹ", hi: "सुस्त और balanced बाज़ार", ar: "سوق بطيء ومتوازن" },
          { en: "Imbalance and aggressive institutional buying/selling", ur: "Imbalance اور تیز institutional buying/selling", hi: "Imbalance और तेज़ institutional buying/selling", ar: "عدم توازن وشراء/بيع مؤسسي قوي" },
          { en: "News event time", ur: "News event کا وقت", hi: "News event का समय", ar: "وقت حدث إخباري" },
          { en: "Random noise", ur: "بے ترتیب شور", hi: "बेतरतीब शोर", ar: "ضوضاء عشوائية" },
        ],
        correctIndex: 1,
        explanation: { en: "FVG = imbalance, aggressive institutional move that the market wants to rebalance.", ur: "FVG = imbalance، تیز institutional move جسے مارکیٹ دوبارہ balance کرنا چاہتی ہے۔", hi: "FVG = imbalance, तेज़ institutional move जिसे बाज़ार दोबारा balance करना चाहता है।", ar: "FVG = عدم توازن، حركة مؤسسية قوية يريد السوق إعادة توازنها." },
      },
    ],
  },

  // ===== LESSON 33: Buy Side & Sell Side Liquidity =====
  {
    id: "eurusd-33",
    order: 4,
    title: {
      en: "Buy Side & Sell Side Liquidity",
      ur: "Buy Side & Sell Side Liquidity",
      hi: "Buy Side & Sell Side Liquidity",
      ar: "سيولة جهة الشراء وسيولة جهة البيع",
    },
    summary: {
      en: "Liquidity is where Stop Losses sit. Banks hunt them to fuel their moves — BSL above highs, SSL below lows.",
      ur: "Liquidity وہ جگہ ہے جہاں SL پڑے ہیں۔ Bank اپنے moves کے لیے انہیں کھاتے ہیں — BSL highs کے اوپر، SSL lows کے نیچے۔",
      hi: "Liquidity वह जगह है जहाँ SL पड़े हैं। Bank अपने moves के लिए उन्हें खाते हैं — BSL highs के ऊपर, SSL lows के नीचे।",
      ar: "السيولة هي المكان الذي توجد فيه وقف الخسارة. تصطادها البنوك لتغذية حركاتها — BSL فوق القمم، SSL تحت القيعان.",
    },
    content: {
      en: `## Buy Side & Sell Side Liquidity

Liquidity = pool of Stop Losses. Bank needs money to move, so it takes money by eating SLs.

### Buy Side Liquidity (BSL)
Above Equal Highs. Everyone's Buy SL sits here.

### Sell Side Liquidity (SSL)
Below Equal Lows. Everyone's Sell SL sits here.

### Golden Rule
In an uptrend, the bank first takes Sell Side Liquidity, then goes up.

### Example: EUR/USD
EUR/USD made the same low at 1.0950 three times. Everyone placed SL at 1.0945. Bank will push price to 1.0940, eat everyone's SL, then go up to 1.1050.`,
      ur: `## Buy Side & Sell Side Liquidity

Liquidity = SL کا جھنجھنا۔ Bank کو چلنے کے لیے پیسوں کی ضرورت ہوتی ہے، وہ SL کھا کر paisa لیتی ہے۔

### Buy Side Liquidity (BSL)
Equal Highs کے اوپر۔ سب کے Buy SL وہاں ہیں۔

### Sell Side Liquidity (SSL)
Equal Lows کے نیچے۔ سب کے Sell SL وہاں ہیں۔

### Golden Rule
Uptrend میں پہلے Sell Side Liquidity لیتی ہے، پھر اوپر جاتی ہے۔

### مثال: EUR/USD
EUR/USD نے 1.0950 پر 3 بار same low بنایا۔ سب نے 1.0945 پر SL رکھا۔ Bank price کو 1.0940 تک لے جائے گا، سب SL کھائے گا، پھر 1.1050 تک اوپر۔`,
      hi: `## Buy Side & Sell Side Liquidity

Liquidity = SL का झुंड। Bank को चलने के लिए पैसों की ज़रूरत होती है, वह SL खाकर पैसा लेती है।

### Buy Side Liquidity (BSL)
Equal Highs के ऊपर। सबके Buy SL वहाँ हैं।

### Sell Side Liquidity (SSL)
Equal Lows के नीचे। सबके Sell SL वहाँ हैं।

### Golden Rule
Uptrend में पहले Sell Side Liquidity लेती है, फिर ऊपर जाती है।

### उदाहरण: EUR/USD
EUR/USD ने 1.0950 पर 3 बार same low बनाया। सबने 1.0945 पर SL रखा। Bank price को 1.0940 तक ले जाएगा, सब SL खाएगा, फिर 1.1050 तक ऊपर।`,
      ar: `## سيولة جهة الشراء وسيولة جهة البيع

السيولة = بركة من وقف الخسارة. البنك يحتاج المال للحركة، فيأخذ المال بأكل وقف الخسارة.

### سيولة جهة الشراء (BSL)
فوق القمم المتساوية. وقف خسارة شراء الجميع هنا.

### سيولة جهة البيع (SSL)
تحت القيعان المتساوية. وقف خسارة بيع الجميع هنا.

### القاعدة الذهبية
في الاتجاه الصعودي، يأخذ البنك أولاً سيولة جهة البيع، ثم يصعد.

### مثال: EUR/USD
صنع EUR/USD نفس القاع عند 1.0950 ثلاث مرات. وضع الجميع وقف الخسارة عند 1.0945. سيدفع البنك السعر إلى 1.0940، يأكل وقف خسارة الجميع، ثم يصعد إلى 1.1050.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "Where is Buy Side Liquidity (BSL) located?", ur: "Buy Side Liquidity (BSL) کہاں ہوتی ہے؟", hi: "Buy Side Liquidity (BSL) कहाँ होती है?", ar: "أين توجد سيولة جهة الشراء (BSL)؟" },
        options: [
          { en: "Below equal lows", ur: "Equal lows کے نیچے", hi: "Equal lows के नीचे", ar: "تحت القيعان المتساوية" },
          { en: "Above equal highs", ur: "Equal highs کے اوپر", hi: "Equal highs के ऊपर", ar: "فوق القمم المتساوية" },
          { en: "At the open price", ur: "Open price پر", hi: "Open price पर", ar: "عند سعر الافتتاح" },
          { en: "At EMA 200", ur: "EMA 200 پر", hi: "EMA 200 पर", ar: "عند EMA 200" },
        ],
        correctIndex: 1,
        explanation: { en: "BSL sits above equal highs — where Buy SLs are placed.", ur: "BSL، Equal highs کے اوپر ہوتی ہے — جہاں Buy SL رکھے جاتے ہیں۔", hi: "BSL, Equal highs के ऊपर होती है — जहाँ Buy SL रखे जाते हैं।", ar: "BSL تقع فوق القمم المتساوية — حيث توضع وقف خسارة الشراء." },
      },
      {
        type: "MCQ",
        prompt: { en: "Where is Sell Side Liquidity (SSL) located?", ur: "Sell Side Liquidity (SSL) کہاں ہوتی ہے؟", hi: "Sell Side Liquidity (SSL) कहाँ होती है?", ar: "أين توجد سيولة جهة البيع (SSL)؟" },
        options: [
          { en: "Above equal highs", ur: "Equal highs کے اوپر", hi: "Equal highs के ऊपर", ar: "فوق القمم المتساوية" },
          { en: "Below equal lows", ur: "Equal lows کے نیچے", hi: "Equal lows के नीचे", ar: "تحت القيعان المتساوية" },
          { en: "At news time", ur: "News کے وقت", hi: "News के समय", ar: "وقت الأخبار" },
          { en: "At pivot point", ur: "Pivot point پر", hi: "Pivot point पर", ar: "عند النقطة المحورية" },
        ],
        correctIndex: 1,
        explanation: { en: "SSL sits below equal lows — where Sell SLs are placed.", ur: "SSL، Equal lows کے نیچے ہوتی ہے — جہاں Sell SL رکھے جاتے ہیں۔", hi: "SSL, Equal lows के नीचे होती है — जहाँ Sell SL रखे जाते हैं।", ar: "SSL تقع تحت القيعان المتساوية — حيث توضع وقف خسارة البيع." },
      },
      {
        type: "MCQ",
        prompt: { en: "In an uptrend, which liquidity does the bank take first?", ur: "Uptrend میں Bank پہلے کون سی liquidity لیتی ہے؟", hi: "Uptrend में Bank पहले कौन सी liquidity लेती है?", ar: "في الاتجاه الصعودي، أي سيولة يأخذها البنك أولاً؟" },
        options: [
          { en: "Buy Side Liquidity", ur: "Buy Side Liquidity", hi: "Buy Side Liquidity", ar: "سيولة جهة الشراء" },
          { en: "Sell Side Liquidity", ur: "Sell Side Liquidity", hi: "Sell Side Liquidity", ar: "سيولة جهة البيع" },
          { en: "Both at the same time", ur: "دونوں ایک ساتھ", hi: "दोनों एक साथ", ar: "كلاهما معاً" },
          { en: "Neither", ur: "کوئی بھی نہیں", hi: "कोई भी नहीं", ar: "لا واحدة" },
        ],
        correctIndex: 1,
        explanation: { en: "In an uptrend, bank first takes Sell Side Liquidity (below lows), then pushes up.", ur: "Uptrend میں Bank پہلے Sell Side Liquidity (lows کے نیچے) لیتی ہے، پھر اوپر لے جاتی ہے۔", hi: "Uptrend में Bank पहले Sell Side Liquidity (lows के नीचे) लेती है, फिर ऊपर ले जाती है।", ar: "في الاتجاه الصعودي، يأخذ البنك أولاً سيولة جهة البيع (تحت القيعان)، ثم يدفع للأعلى." },
      },
      {
        type: "MCQ",
        prompt: { en: "In the EUR/USD example, where will the bank push price to grab SSL?", ur: "EUR/USD مثال میں Bank SSL grab کرنے کے لیے price کہاں لے جائے گا؟", hi: "EUR/USD उदाहरण में Bank SSL grab करने के लिए price कहाँ ले जाएगा?", ar: "في مثال EUR/USD، أين سيدفع البنك السعر لالتقاط SSL؟" },
        options: [
          { en: "1.0950", ur: "1.0950", hi: "1.0950", ar: "1.0950" },
          { en: "1.0945", ur: "1.0945", hi: "1.0945", ar: "1.0945" },
          { en: "1.0940", ur: "1.0940", hi: "1.0940", ar: "1.0940" },
          { en: "1.1050", ur: "1.1050", hi: "1.1050", ar: "1.1050" },
        ],
        correctIndex: 2,
        explanation: { en: "Bank pushes price to 1.0940 — below the SL at 1.0945 — to grab the SSL.", ur: "Bank price کو 1.0940 تک لے جاتا ہے — 1.0945 پر رکھے SL کے نیچے — SSL grab کرنے۔", hi: "Bank price को 1.0940 तक ले जाता है — 1.0945 पर रखे SL के नीचे — SSL grab करने।", ar: "يدفع البنك السعر إلى 1.0940 — تحت وقف الخسارة عند 1.0945 — لالتقاط SSL." },
      },
      {
        type: "MCQ",
        prompt: { en: "Why does the bank need liquidity?", ur: "Bank کو liquidity کی ضرورت کیوں ہوتی ہے؟", hi: "Bank को liquidity की ज़रूरत क्यों होती है?", ar: "لماذا يحتاج البنك إلى السيولة؟" },
        options: [
          { en: "To show on the chart", ur: "Chart پر دکھانے کے لیے", hi: "Chart पर दिखाने के लिए", ar: "للإظهار على الرسم" },
          { en: "To fuel its move — needs money to push price", ur: "اپنے move کو ایندھن دینے — price دھکیلنے کے لیے paisa", hi: "अपने move को ईंधन देने — price धकेलने के लिए पैसा", ar: "لتغذية حركته — يحتاج المال لدفع السعر" },
          { en: "To please retail traders", ur: "Retail traders کو خوش کرنے", hi: "Retail traders को खुश करने", ar: "لإرضاء المتداولين التجزئة" },
          { en: "It doesn't need liquidity", ur: "اسے liquidity کی ضرورت نہیں", hi: "इसे liquidity की ज़रूरत नहीं", ar: "لا يحتاج السيولة" },
        ],
        correctIndex: 1,
        explanation: { en: "Banks need liquidity (money from SLs) to fuel large moves — they can't move without it.", ur: "Banks کو اپنے بڑے moves کے لیے liquidity (SLs سے paisa) درکار ہے — بغیر اس کے وہ move نہیں کر سکتے۔", hi: "Banks को अपने बड़े moves के लिए liquidity (SLs से पैसा) चाहिए — बिना इसके वे move नहीं कर सकते।", ar: "تحتاج البنوك السيولة (مال من وقف الخسارة) لتغذية الحركات الكبيرة — لا يمكنها التحرك بدونها." },
      },
    ],
  },

  // ===== LESSON 34: Breaker Block & Mitigation Block =====
  {
    id: "eurusd-34",
    order: 5,
    title: {
      en: "Breaker Block & Mitigation Block",
      ur: "Breaker Block & Mitigation Block",
      hi: "Breaker Block & Mitigation Block",
      ar: "بلوك الكسر وبلوك التخفيف",
    },
    summary: {
      en: "Advanced OB concepts — when an OB fails it becomes a Breaker, and failed swings become Mitigation blocks.",
      ur: "OB کا advance version — جب OB fail ہو جائے تو Breaker بن جاتا ہے، اور failed swings Mitigation block بن جاتے ہیں۔",
      hi: "OB का advance version — जब OB fail हो जाए तो Breaker बन जाता है, और failed swings Mitigation block बन जाते हैं।",
      ar: "نسخة متقدمة من OB — عندما يفشل OB يصبح Breaker، والقمم/القيعان الفاشلة تصبح بلوك تخفيف.",
    },
    content: {
      en: `## Breaker Block & Mitigation Block

This is the advanced version of Order Block.

### Breaker Block
When a Bullish OB breaks (price closes below it), the same OB now becomes a Bearish Breaker. Now you Sell from there.

### Mitigation Block
A failed swing high/low that now acts as support/resistance.

### Example: EUR/USD
EUR/USD Bullish OB was at 1.0900. Price closed at 1.0890 = OB failed. Now 1.0900 - 1.0910 becomes a Breaker Block = Sell Zone.`,
      ur: `## Breaker Block & Mitigation Block

یہ Order Block کا advance version ہے۔

### Breaker Block
جب Bullish OB ٹوٹ جائے (price نیچے close ہو جائے) تو وہی OB اب Bearish Breaker بن جاتا ہے۔ اب وہاں سے Sell کریں گے۔

### Mitigation Block
Failed swing high/low جو اب support/resistance بن جائے۔

### مثال: EUR/USD
EUR/USD کا Bullish OB 1.0900 تھا۔ Price 1.0890 پر close ہوا = OB fail۔ اب 1.0900 - 1.0910 Breaker Block = Sell Zone۔`,
      hi: `## Breaker Block & Mitigation Block

यह Order Block का advance version है।

### Breaker Block
जब Bullish OB टूट जाए (price नीचे close हो जाए) तो वही OB अब Bearish Breaker बन जाता है। अब वहाँ से Sell करेंगे।

### Mitigation Block
Failed swing high/low जो अब support/resistance बन जाए।

### उदाहरण: EUR/USD
EUR/USD का Bullish OB 1.0900 था। Price 1.0890 पर close हुआ = OB fail। अब 1.0900 - 1.0910 Breaker Block = Sell Zone।`,
      ar: `## بلوك الكسر وبلوك التخفيف

هذا هو الإصدار المتقدم من بلك الأوامر.

### بلوك الكسر
عندما يكسر OB الصعودي (يغلق السعر تحته)، يصبح نفس OB الآن كسراً هبوطياً. الآن تبيع منه.

### بلوك التخفيف
قمة/قاع فاشل أصبح الآن دعماً/مقاومة.

### مثال: EUR/USD
كان OB الصعودي لـ EUR/USD عند 1.0900. أغلق السعر عند 1.0890 = فشل OB. الآن 1.0900 - 1.0910 يصبح بلوك كسر = منطقة بيع.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "When does a Bullish OB become a Bearish Breaker?", ur: "Bullish OB Bearish Breaker کب بن جاتا ہے؟", hi: "Bullish OB Bearish Breaker कब बन जाता है?", ar: "متى يصبح OB الصعودي كسراً هبوطياً؟" },
        options: [
          { en: "When price closes above it", ur: "جب price اوپر close ہو", hi: "जब price ऊपर close हो", ar: "عندما يغلق السعر فوقه" },
          { en: "When price closes below it", ur: "جب price نیچے close ہو", hi: "जब price नीचे close हो", ar: "عندما يغلق السعر تحته" },
          { en: "When RSI is oversold", ur: "جب RSI oversold ہو", hi: "जब RSI oversold हो", ar: "عندما يكون RSI تشبع بيعي" },
          { en: "Never", ur: "کبھی نہیں", hi: "कभी नहीं", ar: "أبداً" },
        ],
        correctIndex: 1,
        explanation: { en: "When price closes below a Bullish OB, it fails and becomes a Bearish Breaker.", ur: "جب price Bullish OB کے نیچے close ہو، OB fail ہو کر Bearish Breaker بن جاتا ہے۔", hi: "जब price Bullish OB के नीचे close हो, OB fail होकर Bearish Breaker बन जाता है।", ar: "عندما يغلق السعر تحت OB الصعودي، يفشل ويصبح كسراً هبوطياً." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is a Mitigation Block?", ur: "Mitigation Block کیا ہے؟", hi: "Mitigation Block क्या है?", ar: "ما هو بلوك التخفيف؟" },
        options: [
          { en: "A failed swing high/low that becomes support/resistance", ur: "Failed swing high/low جو support/resistance بن جائے", hi: "Failed swing high/low जो support/resistance बन जाए", ar: "قمة/قاع فاشل أصبح دعماً/مقاومة" },
          { en: "A large bullish candle", ur: "بڑی bullish candle", hi: "बड़ी bullish candle", ar: "شمعة صعودية كبيرة" },
          { en: "A news event", ur: "News event", hi: "News event", ar: "حدث إخباري" },
          { en: "A doji candle", ur: "Doji candle", hi: "Doji candle", ar: "شمعة دوجي" },
        ],
        correctIndex: 0,
        explanation: { en: "Mitigation Block = failed swing high/low that now acts as S/R.", ur: "Mitigation Block = failed swing high/low جو اب S/R کا کام دیتا ہے۔", hi: "Mitigation Block = failed swing high/low जो अब S/R का काम देता है।", ar: "بلوك التخفيف = قمة/قاع فاشل يعمل الآن كدعم/مقاومة." },
      },
      {
        type: "MCQ",
        prompt: { en: "In the EUR/USD example, what happens at 1.0890?", ur: "EUR/USD مثال میں 1.0890 پر کیا ہوتا ہے؟", hi: "EUR/USD उदाहरण में 1.0890 पर क्या होता है?", ar: "في مثال EUR/USD، ماذا يحدث عند 1.0890؟" },
        options: [
          { en: "Bullish OB forms", ur: "Bullish OB بنتا ہے", hi: "Bullish OB बनता है", ar: "يتكون OB صعودي" },
          { en: "Price bounces up", ur: "Price اوپر bounce ہوتا ہے", hi: "Price ऊपर bounce होता है", ar: "يرتد السعر للأعلى" },
          { en: "OB fails — price closes below OB", ur: "OB fail — price OB کے نیچے close", hi: "OB fail — price OB के नीचे close", ar: "يفشل OB — يغلق السعر تحته" },
          { en: "Nothing happens", ur: "کچھ نہیں ہوتا", hi: "कुछ नहीं होता", ar: "لا شيء يحدث" },
        ],
        correctIndex: 2,
        explanation: { en: "Price closes at 1.0890 — below the OB at 1.0900 — so the OB fails.", ur: "Price 1.0890 پر close ہوتا ہے — 1.0900 پر OB کے نیچے — تو OB fail ہو جاتا ہے۔", hi: "Price 1.0890 पर close होता है — 1.0900 पर OB के नीचे — तो OB fail हो जाता है।", ar: "يغلق السعر عند 1.0890 — تحت OB عند 1.0900 — فيفشل OB." },
      },
      {
        type: "MCQ",
        prompt: { en: "After OB fails in the example, what is the new Sell Zone?", ur: "مثال میں OB fail ہونے کے بعد نیا Sell Zone کیا ہے؟", hi: "उदाहरण में OB fail होने के बाद नया Sell Zone क्या है?", ar: "بعد فشل OB في المثال، ما هي منطقة البيع الجديدة؟" },
        options: [
          { en: "1.0880 - 1.0890", ur: "1.0880 - 1.0890", hi: "1.0880 - 1.0890", ar: "1.0880 - 1.0890" },
          { en: "1.0900 - 1.0910", ur: "1.0900 - 1.0910", hi: "1.0900 - 1.0910", ar: "1.0900 - 1.0910" },
          { en: "1.0920 - 1.0930", ur: "1.0920 - 1.0930", hi: "1.0920 - 1.0930", ar: "1.0920 - 1.0930" },
          { en: "1.1000 - 1.1010", ur: "1.1000 - 1.1010", hi: "1.1000 - 1.1010", ar: "1.1000 - 1.1010" },
        ],
        correctIndex: 1,
        explanation: { en: "The failed OB at 1.0900 - 1.0910 becomes the new Breaker Block Sell Zone.", ur: "1.0900 - 1.0910 پر fail ہونے والا OB نیا Breaker Block Sell Zone بنتا ہے۔", hi: "1.0900 - 1.0910 पर fail होने वाला OB नया Breaker Block Sell Zone बनता है।", ar: "OB الفاشل عند 1.0900 - 1.0910 يصبح منطقة بيع بلك الكسر الجديدة." },
      },
      {
        type: "MCQ",
        prompt: { en: "What does a Breaker Block represent?", ur: "Breaker Block کیا ظاہر کرتا ہے؟", hi: "Breaker Block क्या दर्शाता है?", ar: "ماذا يمثل بلك الكسر؟" },
        options: [
          { en: "A confirmed trend continuation zone", ur: "Confirm trend continuation zone", hi: "Confirm trend continuation zone", ar: "منطقة استمرار اتجاه مؤكدة" },
          { en: "A failed OB that now reverses its original role", ur: "Failed OB جو اب اپنا role reverse کر دے", hi: "Failed OB जो अब अपना role reverse कर दे", ar: "OB فاشل عكس دوره الأصلي" },
          { en: "A news event", ur: "News event", hi: "News event", ar: "حدث إخباري" },
          { en: "A gap in price", ur: "Price میں gap", hi: "Price में gap", ar: "فجوة في السعر" },
        ],
        correctIndex: 1,
        explanation: { en: "A Breaker = failed OB that now plays the opposite role (Buy zone becomes Sell zone, or vice versa).", ur: "Breaker = failed OB جو اب opposite role ادا کرتا ہے (Buy zone Sell zone بن جاتا ہے یا اس کے برعکس)۔", hi: "Breaker = failed OB जो अब opposite role निभाता है (Buy zone Sell zone बन जाता है या इसके विपरीत)।", ar: "الكسر = OB فاشل يلعب الآن الدور المعاكس (منطقة شراء تصبح منطقة بيع أو العكس)." },
      },
    ],
  },

  // ===== LESSON 35: Market Structure - BOS & CHOCH =====
  {
    id: "eurusd-35",
    order: 6,
    title: {
      en: "Market Structure - BOS & CHOCH",
      ur: "Market Structure - BOS & CHOCH",
      hi: "मार्केट स्ट्रक्चर - BOS & CHOCH",
      ar: "هيكل السوق - BOS و CHOCH",
    },
    summary: {
      en: "BOS confirms trend continuation, CHOCH signals the first trend change — two key SMC terms.",
      ur: "BOS trend continuation کی تصدیق کرتا ہے، CHOCH trend change کا پہلا signal ہے — SMC کے 2 اہم الفاظ۔",
      hi: "BOS trend continuation की पुष्टि करता है, CHOCH trend change का पहला signal है — SMC के 2 ज़रूरी शब्द।",
      ar: "BOS يؤكد استمرار الاتجاه، CHOCH يشير إلى أول تغير في الاتجاه — مصطلحان رئيسيان في SMC.",
    },
    content: {
      en: `## Market Structure - BOS & CHOCH

These are 2 words to understand the trend.

### BOS (Break of Structure)
A signal that the trend continues. In an uptrend, a new high breaks = BOS = keep Buying.

### CHOCH (Change of Character)
The first signal of a trend change. In an uptrend, a new low breaks = CHOCH = now look for Sells.

### Example: EUR/USD
Price made highs at 1.1000, 1.1020, 1.1040 = BOS. Suddenly the low at 1.1020 broke = CHOCH = uptrend over, now Sell.`,
      ur: `## Market Structure - BOS & CHOCH

یہ trend کو سمجھنے کے 2 لفظ ہیں۔

### BOS (Break of Structure)
Trend continue کا signal۔ Uptrend میں نیا High ٹوٹا = BOS = Buy جاری رکھو۔

### CHOCH (Change of Character)
Trend change کا پہلا signal۔ Uptrend میں نیا Low ٹوٹا = CHOCH = اب Sell ڈھونڈو۔

### مثال: EUR/USD
Price 1.1000, 1.1020, 1.1040 High بنا رہا = BOS۔ اچانک 1.1020 کا Low ٹوٹا = CHOCH = Uptrend ختم، اب Sell۔`,
      hi: `## मार्केट स्ट्रक्चर - BOS & CHOCH

ये trend को समझने के 2 शब्द हैं।

### BOS (Break of Structure)
Trend continue का signal। Uptrend में नया High टूटा = BOS = Buy जारी रखो।

### CHOCH (Change of Character)
Trend change का पहला signal। Uptrend में नया Low टूटा = CHOCH = अब Sell ढूंढो।

### उदाहरण: EUR/USD
Price 1.1000, 1.1020, 1.1040 High बना रहा = BOS। अचानक 1.1020 का Low टूटा = CHOCH = Uptrend ख़त्म, अब Sell।`,
      ar: `## هيكل السوق - BOS و CHOCH

هذان مصطلحان لفهم الاتجاه.

### BOS (Break of Structure)
إشارة استمرار الاتجاه. في الاتجاه الصعودي، كسر قمة جديدة = BOS = استمر بالشراء.

### CHOCH (Change of Character)
أول إشارة لتغير الاتجاه. في الاتجاه الصعودي، كسر قاع جديد = CHOCH = ابحث عن البيع الآن.

### مثال: EUR/USD
صنع السعر قمم عند 1.1000، 1.1020، 1.1040 = BOS. فجأة كسر القاع عند 1.1020 = CHOCH = انتهى الصعود، الآن بيع.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What does BOS stand for?", ur: "BOS کا مطلب کیا ہے؟", hi: "BOS का मतलब क्या है?", ar: "ماذا يعني BOS؟" },
        options: [
          { en: "Break of Structure", ur: "Break of Structure", hi: "Break of Structure", ar: "كسر الهيكل" },
          { en: "Buy or Sell", ur: "Buy or Sell", hi: "Buy or Sell", ar: "شراء أو بيع" },
          { en: "Bank Order System", ur: "Bank Order System", hi: "Bank Order System", ar: "نظام أوامر البنك" },
          { en: "Best Open Signal", ur: "Best Open Signal", hi: "Best Open Signal", ar: "أفضل إشارة افتتاح" },
        ],
        correctIndex: 0,
        explanation: { en: "BOS = Break of Structure — trend continuation signal.", ur: "BOS = Break of Structure — trend continuation signal۔", hi: "BOS = Break of Structure — trend continuation signal।", ar: "BOS = كسر الهيكل — إشارة استمرار الاتجاه." },
      },
      {
        type: "MCQ",
        prompt: { en: "What does CHOCH stand for?", ur: "CHOCH کا مطلب کیا ہے؟", hi: "CHOCH का मतलब क्या है?", ar: "ماذا يعني CHOCH؟" },
        options: [
          { en: "Change of Character", ur: "Change of Character", hi: "Change of Character", ar: "تغير الطابع" },
          { en: "Chart Order Channel", ur: "Chart Order Channel", hi: "Chart Order Channel", ar: "قناة أمر الرسم" },
          { en: "Close Order Candles High", ur: "Close Order Candles High", hi: "Close Order Candles High", ar: "إغلاق أمر شموع عالية" },
          { en: "CHOCH means nothing", ur: "CHOCH کا کوئی مطلب نہیں", hi: "CHOCH का कोई मतलब नहीं", ar: "CHOCH لا يعني شيئاً" },
        ],
        correctIndex: 0,
        explanation: { en: "CHOCH = Change of Character — first signal of trend change.", ur: "CHOCH = Change of Character — trend change کا پہلا signal۔", hi: "CHOCH = Change of Character — trend change का पहला signal।", ar: "CHOCH = تغير الطابع — أول إشارة لتغير الاتجاه." },
      },
      {
        type: "MCQ",
        prompt: { en: "In an uptrend, what does a new high break signal?", ur: "Uptrend میں نیا high ٹوٹنا کیا signal ہے؟", hi: "Uptrend में नया high टूटना क्या signal है?", ar: "في الاتجاه الصعودي، ماذا تشير كسر قمة جديدة؟" },
        options: [
          { en: "CHOCH — Sell", ur: "CHOCH — Sell", hi: "CHOCH — Sell", ar: "CHOCH — بيع" },
          { en: "BOS — keep Buying", ur: "BOS — Buy جاری رکھو", hi: "BOS — Buy जारी रखो", ar: "BOS — استمر بالشراء" },
          { en: "Reversal", ur: "Reversal", hi: "Reversal", ar: "انعكاس" },
          { en: "Stop trading", ur: "ٹریڈنگ بند", hi: "ट्रेडिंग बंद", ar: "إيقاف التداول" },
        ],
        correctIndex: 1,
        explanation: { en: "New high break in uptrend = BOS = trend continues, keep Buying.", ur: "Uptrend میں نیا high ٹوٹنا = BOS = trend جاری، Buy جاری رکھو۔", hi: "Uptrend में नया high टूटना = BOS = trend जारी, Buy जारी रखो।", ar: "كسر قمة جديدة في الصعود = BOS = الاتجاه مستمر، استمر بالشراء." },
      },
      {
        type: "MCQ",
        prompt: { en: "In an uptrend, what does a new low break signal?", ur: "Uptrend میں نیا low ٹوٹنا کیا signal ہے؟", hi: "Uptrend में नया low टूटना क्या signal है?", ar: "في الاتجاه الصعودي، ماذا يشير كسر قاع جديد؟" },
        options: [
          { en: "BOS — keep Buying", ur: "BOS — Buy جاری رکھو", hi: "BOS — Buy जारी रखो", ar: "BOS — استمر بالشراء" },
          { en: "CHOCH — Sell now", ur: "CHOCH — اب Sell", hi: "CHOCH — अब Sell", ar: "CHOCH — بيع الآن" },
          { en: "Range market", ur: "Range مارکیٹ", hi: "Range बाज़ार", ar: "سوق عرضي" },
          { en: "Nothing", ur: "کچھ نہیں", hi: "कुछ नहीं", ar: "لا شيء" },
        ],
        correctIndex: 1,
        explanation: { en: "New low break in uptrend = CHOCH = trend changing, look for Sells.", ur: "Uptrend میں نیا low ٹوٹنا = CHOCH = trend بدل رہا، Sell ڈھونڈو۔", hi: "Uptrend में नया low टूटना = CHOCH = trend बदल रहा, Sell ढूंढो।", ar: "كسر قاع جديد في الصعود = CHOCH = الاتجاه يتغير، ابحث عن البيع." },
      },
      {
        type: "MCQ",
        prompt: { en: "In the EUR/USD example, what happens at 1.1020 (low break)?", ur: "EUR/USD مثال میں 1.1020 (low break) پر کیا ہوتا ہے؟", hi: "EUR/USD उदाहरण में 1.1020 (low break) पर क्या होता है?", ar: "في مثال EUR/USD، ماذا يحدث عند 1.1020 (كسر القاع)؟" },
        options: [
          { en: "BOS up", ur: "BOS up", hi: "BOS up", ar: "BOS صعودي" },
          { en: "CHOCH — uptrend over, now Sell", ur: "CHOCH — uptrend ختم، اب Sell", hi: "CHOCH — uptrend ख़त्म, अब Sell", ar: "CHOCH — انتهى الصعود، الآن بيع" },
          { en: "Sideways move", ur: "Side move", hi: "Side move", ar: "حركة جانبية" },
          { en: "News event", ur: "News event", hi: "News event", ar: "حدث إخباري" },
        ],
        correctIndex: 1,
        explanation: { en: "Low break at 1.1020 in an uptrend = CHOCH = uptrend is over, look for Sells.", ur: "Uptrend میں 1.1020 پر low ٹوٹنا = CHOCH = uptrend ختم، Sell ڈھونڈو۔", hi: "Uptrend में 1.1020 पर low टूटना = CHOCH = uptrend ख़त्म, Sell ढूंढो।", ar: "كسر القاع عند 1.1020 في الصعود = CHOCH = انتهى الصعود، ابحث عن البيع." },
      },
    ],
  },

  // ===== LESSON 36: London Kill Zone =====
  {
    id: "eurusd-36",
    order: 7,
    title: {
      en: "London Kill Zone - 12 PM to 3 PM Pak Time",
      ur: "London Kill Zone - 12 PM to 3 PM Pak Time",
      hi: "लंदन किल ज़ोन - दोपहर 12 बजे से 3 बजे Pak समय",
      ar: "منطقة قتل لندن - 12 ظهراً إلى 3 عصراً بتوقيت باكستان",
    },
    summary: {
      en: "The first hour of the London session is the Kill Zone — high volatility and manipulation opportunities.",
      ur: "London session کا پہلا گھنٹہ Kill Zone کہلاتا ہے — زیادہ volatility اور manipulation کے مواقع۔",
      hi: "London session का पहला घंटा Kill Zone कहलाता है — अधिक volatility और manipulation के अवसर।",
      ar: "الساعة الأولى من جلسة لندن تسمى منطقة القتل — تقلب عالٍ وفرص تلاعب.",
    },
    content: {
      en: `## London Kill Zone - 12 PM to 3 PM Pak Time

The London session is the most volatile. Its first hour is called the "Kill Zone" because manipulation happens here.

### Strategy
- 12pm - 1pm: Mark the range
- 1pm - 3pm: Take opposite trade on the range High/Low liquidity grab

### Example: EUR/USD
At 12pm range is 1.1000 - 1.1010. At 1:30 price went to 1.1015 (took BSL) then quickly came to 1.0990. This was London manipulation. Sell profit.`,
      ur: `## London Kill Zone - 12 PM to 3 PM Pak Time

London session سب سے زیادہ volatile ہے۔ اس کا پہلا گھنٹہ "Kill Zone" کہلاتا ہے کیونکہ یہاں manipulation ہوتا ہے۔

### Strategy
- 12pm - 1pm: Range mark کرو
- 1pm - 3pm: Range کے High/Low کی liquidity grab پر opposite trade لو

### مثال: EUR/USD
12pm کو range 1.1000 - 1.1010۔ 1:30 پر price 1.1015 گئی (BSL لی) پھر تیزی سے 1.0990 آئی۔ یہ London manipulation تھا۔ Sell profit۔`,
      hi: `## लंदन किल ज़ोन - दोपहर 12 बजे से 3 बजे Pak समय

London session सबसे ज़्यादा volatile है। इसका पहला घंटा "Kill Zone" कहलाता है क्योंकि यहाँ manipulation होता है।

### Strategy
- 12pm - 1pm: Range mark करो
- 1pm - 3pm: Range के High/Low की liquidity grab पर opposite trade लो

### उदाहरण: EUR/USD
12pm को range 1.1000 - 1.1010। 1:30 पर price 1.1015 गई (BSL ली) फिर तेज़ी से 1.0990 आई। यह London manipulation था। Sell profit।`,
      ar: `## منطقة قتل لندن - 12 ظهراً إلى 3 عصراً بتوقيت باكستان

جلسة لندن هي الأكثر تقلباً. ساعتها الأولى تسمى "منطقة القتل" لأن التلاعب يحدث هنا.

### الاستراتيجية
- 12 ظهراً - 1 مساءً: حدد النطاق
- 1 مساءً - 3 مساءً: خذ صفقة معاكسة عند التقاط سيولة أعلى/أدنى النطاق

### مثال: EUR/USD
عند الظهر النطاق 1.1000 - 1.1010. عند 1:30 ذهب السعر إلى 1.1015 (التقط BSL) ثم عاد بسرعة إلى 1.0990. هذا كان تلاعب لندن. بيع رابح.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What is the London Kill Zone timing in Pak time?", ur: "London Kill Zone کا وقت Pak time میں کیا ہے؟", hi: "London Kill Zone का समय Pak time में क्या है?", ar: "ما هو توقيت منطقة قتل لندن بتوقيت باكستان؟" },
        options: [
          { en: "6 AM - 9 AM", ur: "6 AM - 9 AM", hi: "6 AM - 9 AM", ar: "6 ص - 9 ص" },
          { en: "12 PM - 3 PM", ur: "12 PM - 3 PM", hi: "12 PM - 3 PM", ar: "12 ظهراً - 3 عصراً" },
          { en: "6 PM - 9 PM", ur: "6 PM - 9 PM", hi: "6 PM - 9 PM", ar: "6 مساءً - 9 مساءً" },
          { en: "9 PM - 12 AM", ur: "9 PM - 12 AM", hi: "9 PM - 12 AM", ar: "9 مساءً - 12 منتصف الليل" },
        ],
        correctIndex: 1,
        explanation: { en: "London Kill Zone = 12 PM to 3 PM Pak time.", ur: "London Kill Zone = 12 PM to 3 PM Pak time۔", hi: "London Kill Zone = 12 PM to 3 PM Pak time।", ar: "منطقة قتل لندن = 12 ظهراً إلى 3 عصراً بتوقيت باكستان." },
      },
      {
        type: "MCQ",
        prompt: { en: "Why is the first hour of London called the Kill Zone?", ur: "London کے پہلے گھنٹے کو Kill Zone کیوں کہتے ہیں؟", hi: "London के पहले घंटे को Kill Zone क्यों कहते हैं?", ar: "لماذا تسمى الساعة الأولى من لندن منطقة القتل؟" },
        options: [
          { en: "Because banks are closed", ur: "کیونکہ Banks بند ہوتے ہیں", hi: "क्योंकि Banks बंद होते हैं", ar: "لأن البنوك مغلقة" },
          { en: "Because manipulation happens here", ur: "کیونکہ یہاں manipulation ہوتا ہے", hi: "क्योंकि यहाँ manipulation होता है", ar: "لأن التلاعب يحدث هنا" },
          { en: "Because there is no volume", ur: "کیونکہ volume نہیں ہوتا", hi: "क्योंकि volume नहीं होता", ar: "لأنه لا يوجد حجم" },
          { en: "It's just a name", ur: "صرف نام ہے", hi: "सिर्फ़ नाम है", ar: "إنه مجرد اسم" },
        ],
        correctIndex: 1,
        explanation: { en: "London's first hour is the Kill Zone because manipulation happens here — banks hunt liquidity.", ur: "London کا پہلا گھنٹہ Kill Zone ہے کیونکہ یہاں manipulation ہوتا ہے — Bank liquidity hunt کرتے ہیں۔", hi: "London का पहला घंटा Kill Zone है क्योंकि यहाँ manipulation होता है — Bank liquidity hunt करते हैं।", ar: "الساعة الأولى من لندن هي منطقة القتل لأن التلاعب يحدث هنا — تصطاد البنوك السيولة." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the strategy during 12 PM - 1 PM?", ur: "12 PM - 1 PM کے دوران strategy کیا ہے؟", hi: "12 PM - 1 PM के दौरान strategy क्या है?", ar: "ما هي الاستراتيجية خلال 12 ظهراً - 1 مساءً؟" },
        options: [
          { en: "Open trades immediately", ur: "فوراً trade کھولو", hi: "तुरंत trade खोलो", ar: "افتح الصفقات فوراً" },
          { en: "Mark the range", ur: "Range mark کرو", hi: "Range mark करो", ar: "حدد النطاق" },
          { en: "Close all trades", ur: "تمام trades بند", hi: "सभी trades बंद", ar: "أغلق كل الصفقات" },
          { en: "Sleep", ur: "سو جاؤ", hi: "सो जाओ", ar: "نم" },
        ],
        correctIndex: 1,
        explanation: { en: "12 PM - 1 PM is for marking the range, then trade the manipulation in 1 PM - 3 PM.", ur: "12 PM - 1 PM range mark کرنے کے لیے، پھر 1 PM - 3 PM میں manipulation پر trade کرو۔", hi: "12 PM - 1 PM range mark करने के लिए, फिर 1 PM - 3 PM में manipulation पर trade करो।", ar: "12 ظهراً - 1 مساءً لتحديد النطاق، ثم تداول التلاعب في 1 - 3 مساءً." },
      },
      {
        type: "MCQ",
        prompt: { en: "In the EUR/USD example, what happens at 1:30 PM?", ur: "EUR/USD مثال میں 1:30 PM پر کیا ہوتا ہے؟", hi: "EUR/USD उदाहरण में 1:30 PM पर क्या होता है?", ar: "في مثال EUR/USD، ماذا يحدث عند 1:30 مساءً؟" },
        options: [
          { en: "Price stays in range", ur: "Price range میں رہتا ہے", hi: "Price range में रहता है", ar: "يبقى السعر في النطاق" },
          { en: "Price goes to 1.1015 (BSL grab) then drops to 1.0990", ur: "Price 1.1015 جاتا ہے (BSL grab) پھر 1.0990 گرتا ہے", hi: "Price 1.1015 जाता है (BSL grab) फिर 1.0990 गिरता है", ar: "يذهب السعر إلى 1.1015 (التقاط BSL) ثم يهبط إلى 1.0990" },
          { en: "Price moves sideways", ur: "Price side move", hi: "Price side move", ar: "يتحرك السعر جانبياً" },
          { en: "Market closes", ur: "مارکیٹ بند", hi: "बाज़ार बंद", ar: "السوق مغلق" },
        ],
        correctIndex: 1,
        explanation: { en: "At 1:30 price grabs BSL at 1.1015 then quickly drops to 1.0990 — classic London manipulation.", ur: "1:30 پر price 1.1015 پر BSL grab کرتا ہے پھر تیزی سے 1.0990 آتا ہے — classic London manipulation۔", hi: "1:30 पर price 1.1015 पर BSL grab करता है फिर तेज़ी से 1.0990 आता है — classic London manipulation।", ar: "عند 1:30 يلتقط السعر BSL عند 1.1015 ثم يهبط بسرعة إلى 1.0990 — تلاعب لندن كلاسيكي." },
      },
      {
        type: "MCQ",
        prompt: { en: "What direction should you trade after a London manipulation grab?", ur: "London manipulation grab کے بعد کس direction میں trade کرنا چاہیے؟", hi: "London manipulation grab के बाद किस direction में trade करना चाहिए?", ar: "ما هو الاتجاه الذي يجب أن تتداوله بعد التقاط تلاعب لندن؟" },
        options: [
          { en: "Same direction as the manipulation", ur: "Manipulation کی same direction", hi: "Manipulation की same direction", ar: "نفس اتجاه التلاعب" },
          { en: "Opposite direction of the manipulation", ur: "Manipulation کی opposite direction", hi: "Manipulation की opposite direction", ar: "الاتجاه المعاكس للتلاعب" },
          { en: "Wait for next day", ur: "اگلے دن کا انتظار", hi: "अगले दिन का इंतज़ार", ar: "انتظر لليوم التالي" },
          { en: "Don't trade", ur: "Trade نہ کریں", hi: "Trade न करें", ar: "لا تتداول" },
        ],
        correctIndex: 1,
        explanation: { en: "Trade opposite to the manipulation — the manipulation is just SL grab, real move is opposite.", ur: "Manipulation کے opposite trade کریں — manipulation صرف SL grab ہے، اصل move opposite ہے۔", hi: "Manipulation के opposite trade करें — manipulation सिर्फ़ SL grab है, असली move opposite है।", ar: "تداول عكس التلاعب — التلاعب مجرد التقاط وقف، الحركة الحقيقية معاكسة." },
      },
    ],
  },

  // ===== LESSON 37: New York Kill Zone & Silver Bullet =====
  {
    id: "eurusd-37",
    order: 8,
    title: {
      en: "New York Kill Zone & Silver Bullet - 6 PM to 9 PM",
      ur: "New York Kill Zone & Silver Bullet - 6 PM to 9 PM",
      hi: "न्यूयॉर्क किल ज़ोन और सिल्वर बुलेट - शाम 6 बजे से 9 बजे",
      ar: "منطقة قتل نيويورك والرصاصة الفضية - 6 مساءً إلى 9 مساءً",
    },
    summary: {
      en: "London + New York overlap (6-9 PM Pak time) is the best for EUR/USD with the Silver Bullet setup.",
      ur: "London + New York overlap (6-9 PM Pak time) EUR/USD کے لیے بہترین ہے، Silver Bullet setup کے ساتھ۔",
      hi: "London + New York overlap (6-9 PM Pak time) EUR/USD के लिए सर्वोत्तम है, Silver Bullet setup के साथ।",
      ar: "تداخل لندن + نيويورك (6-9 مساءً بتوقيت باكستان) هو الأفضل لـ EUR/USD مع نموذج الرصاصة الفضية.",
    },
    content: {
      en: `## New York Kill Zone & Silver Bullet - 6 PM to 9 PM

From 6-9 PM London + New York overlap happens. This is the best time for EUR/USD. Here the Silver Bullet setup forms.

### Silver Bullet
A 3-candle reversal after NY open. First candle takes liquidity, second candle does BOS, third candle gives FVG.

### Rule
Only look for SMC setups in this time, don't watch the chart all day.`,
      ur: `## New York Kill Zone & Silver Bullet - 6 PM to 9 PM

شام 6-9 بجے London + New York overlap ہوتا ہے۔ سب سے best time EUR/USD کے لیے۔ اس میں Silver Bullet setup بنتا ہے۔

### Silver Bullet
NY open کے بعد 3 candle کا reversal۔ پہلی liquidity لیتی ہے، دوسری BOS کرتی ہے، تیسری FVG دیتی ہے۔

### Rule
صرف اس time پر SMC setup ڈھونڈو، پورا دن chart مت دیکھو۔`,
      hi: `## न्यूयॉर्क किल ज़ोन और सिल्वर बुलेट - शाम 6 बजे से 9 बजे

शाम 6-9 बजे London + New York overlap होता है। EUR/USD के लिए सबसे best time। इसमें Silver Bullet setup बनता है।

### Silver Bullet
NY open के बाद 3 candle का reversal। पहली liquidity लेती है, दूसरी BOS करती है, तीसरी FVG देती है।

### नियम
सिर्फ़ इस time पर SMC setup ढूंढो, पूरा दिन chart मत देखो।`,
      ar: `## منطقة قتل نيويورك والرصاصة الفضية - 6 مساءً إلى 9 مساءً

من 6-9 مساءً يحدث تداخل لندن + نيويورك. هذا أفضل وقت لـ EUR/USD. هنا يتشكل نموذج الرصاصة الفضية.

### الرصاصة الفضية
انعكاس من 3 شموع بعد افتتاح نيويورك. الشمعة الأولى تأخذ السيولة، الثانية تعمل BOS، الثالثة تعطي FVG.

### القاعدة
ابحث عن نماذج SMC فقط في هذا الوقت، لا تنظر إلى الرسم طوال اليوم.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What time is the New York Kill Zone in Pak time?", ur: "New York Kill Zone کا وقت Pak time میں کیا ہے؟", hi: "New York Kill Zone का समय Pak time में क्या है?", ar: "ما هو توقيت منطقة قتل نيويورك بتوقيت باكستان؟" },
        options: [
          { en: "6 AM - 9 AM", ur: "6 AM - 9 AM", hi: "6 AM - 9 AM", ar: "6 ص - 9 ص" },
          { en: "12 PM - 3 PM", ur: "12 PM - 3 PM", hi: "12 PM - 3 PM", ar: "12 ظهراً - 3 عصراً" },
          { en: "6 PM - 9 PM", ur: "6 PM - 9 PM", hi: "6 PM - 9 PM", ar: "6 مساءً - 9 مساءً" },
          { en: "12 AM - 3 AM", ur: "12 AM - 3 AM", hi: "12 AM - 3 AM", ar: "12 منتصف الليل - 3 صباحاً" },
        ],
        correctIndex: 2,
        explanation: { en: "NY Kill Zone = 6 PM - 9 PM Pak time (London + NY overlap).", ur: "NY Kill Zone = 6 PM - 9 PM Pak time (London + NY overlap)۔", hi: "NY Kill Zone = 6 PM - 9 PM Pak time (London + NY overlap)।", ar: "منطقة قتل نيويورك = 6 مساءً - 9 مساءً بتوقيت باكستان (تداخل لندن + نيويورك)." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the Silver Bullet setup?", ur: "Silver Bullet setup کیا ہے؟", hi: "Silver Bullet setup क्या है?", ar: "ما هو نموذج الرصاصة الفضية؟" },
        options: [
          { en: "A 10-candle trend", ur: "10 candle کا trend", hi: "10 candle का trend", ar: "اتجاه من 10 شموع" },
          { en: "A 3-candle reversal after NY open (Liquidity → BOS → FVG)", ur: "NY open کے بعد 3 candle reversal (Liquidity → BOS → FVG)", hi: "NY open के बाद 3 candle reversal (Liquidity → BOS → FVG)", ar: "انعكاس من 3 شموع بعد افتتاح NY (سيولة ← BOS ← FVG)" },
          { en: "A moving average cross", ur: "Moving average cross", hi: "Moving average cross", ar: "تقاطع متوسط متحرك" },
          { en: "A news spike", ur: "News spike", hi: "News spike", ar: "ارتفاع أخبار" },
        ],
        correctIndex: 1,
        explanation: { en: "Silver Bullet = 3-candle reversal after NY open — first takes liquidity, second does BOS, third gives FVG.", ur: "Silver Bullet = NY open کے بعد 3-candle reversal — پہلی liquidity لیتی، دوسری BOS کرتی، تیسری FVG دیتی۔", hi: "Silver Bullet = NY open के बाद 3-candle reversal — पहली liquidity लेती, दूसरी BOS करती, तीसरी FVG देती।", ar: "الرصاصة الفضية = انعكاس 3 شموع بعد افتتاح NY — الأولى تأخذ السيولة، الثانية تعمل BOS، الثالثة تعطي FVG." },
      },
      {
        type: "MCQ",
        prompt: { en: "Why is 6-9 PM best for EUR/USD?", ur: "6-9 PM EUR/USD کے لیے بہترین کیوں ہے؟", hi: "6-9 PM EUR/USD के लिए सर्वोत्तम क्यों है?", ar: "لماذا 6-9 مساءً هو الأفضل لـ EUR/USD؟" },
        options: [
          { en: "Because London + New York sessions overlap", ur: "کیونکہ London + New York sessions overlap ہوتے ہیں", hi: "क्योंकि London + New York sessions overlap होते हैं", ar: "لأن جلسات لندن + نيويورك تتداخل" },
          { en: "Because markets are closed", ur: "کیونکہ مارکیٹس بند ہیں", hi: "क्योंकि बाज़ार बंद हैं", ar: "لأن الأسواق مغلقة" },
          { en: "Because there is no news", ur: "کیونکہ news نہیں ہوتا", hi: "क्योंकि news नहीं होता", ar: "لأنه لا توجد أخبار" },
          { en: "Random reason", ur: "بے ترتیب وجہ", hi: "बेतरतीब कारण", ar: "سبب عشوائي" },
        ],
        correctIndex: 0,
        explanation: { en: "6-9 PM Pak time = London + NY overlap = highest volume and best moves for EUR/USD.", ur: "6-9 PM Pak time = London + NY overlap = سب سے زیادہ volume اور EUR/USD کے بہترین moves۔", hi: "6-9 PM Pak time = London + NY overlap = सबसे ज़्यादा volume और EUR/USD के सर्वोत्तम moves।", ar: "6-9 مساءً بتوقيت باكستان = تداخل لندن + نيويورك = أعلى حجم وأفضل حركات لـ EUR/USD." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the rule for the New York Kill Zone?", ur: "New York Kill Zone کا rule کیا ہے؟", hi: "New York Kill Zone का rule क्या है?", ar: "ما هي قاعدة منطقة قتل نيويورك؟" },
        options: [
          { en: "Trade all day", ur: "پورا دن trade کریں", hi: "पूरा दिन trade करें", ar: "تداول طوال اليوم" },
          { en: "Only look for SMC setups in this time", ur: "صرف اس time پر SMC setup ڈھونڈو", hi: "सिर्फ़ इस time पर SMC setup ढूंढो", ar: "ابحث عن نماذج SMC فقط في هذا الوقت" },
          { en: "Never trade in this time", ur: "اس time میں trade نہ کریں", hi: "इस time में trade न करें", ar: "لا تتداول في هذا الوقت" },
          { en: "Only trade news", ur: "صرف news پر trade", hi: "सिर्फ़ news पर trade", ar: "تداول الأخبار فقط" },
        ],
        correctIndex: 1,
        explanation: { en: "Only look for SMC setups in the Kill Zone — don't watch the chart all day.", ur: "صرف Kill Zone میں SMC setup ڈھونڈو — پورا دن chart مت دیکھو۔", hi: "सिर्फ़ Kill Zone में SMC setup ढूंढो — पूरा दिन chart मत देखो।", ar: "ابحث عن نماذج SMC فقط في منطقة القتل — لا تنظر للرسم طوال اليوم." },
      },
      {
        type: "MCQ",
        prompt: { en: "In Silver Bullet, what does the second candle do?", ur: "Silver Bullet میں دوسری candle کیا کرتی ہے؟", hi: "Silver Bullet में दूसरी candle क्या करती है?", ar: "في الرصاصة الفضية، ماذا تفعل الشمعة الثانية؟" },
        options: [
          { en: "Takes liquidity", ur: "Liquidity لیتی ہے", hi: "Liquidity लेती है", ar: "تأخذ السيولة" },
          { en: "Does BOS", ur: "BOS کرتی ہے", hi: "BOS करती है", ar: "تعمل BOS" },
          { en: "Gives FVG", ur: "FVG دیتی ہے", hi: "FVG देती है", ar: "تعطي FVG" },
          { en: "Closes the trade", ur: "Trade close کرتی ہے", hi: "Trade close करती है", ar: "تغلق الصفقة" },
        ],
        correctIndex: 1,
        explanation: { en: "Second candle does BOS — confirms the structure break after liquidity grab.", ur: "دوسری candle BOS کرتی ہے — liquidity grab کے بعد structure break کی تصدیق۔", hi: "दूसरी candle BOS करती है — liquidity grab के बाद structure break की पुष्टि।", ar: "الشمعة الثانية تعمل BOS — تأكيد كسر الهيكل بعد التقاط السيولة." },
      },
    ],
  },

  // ===== LESSON 38: Pro Risk Management =====
  {
    id: "eurusd-38",
    order: 9,
    title: {
      en: "Pro Risk Management - 0.5% to 2% Scaling Plan",
      ur: "Pro Risk Management - 0.5% to 2% Scaling Plan",
      hi: "प्रो रिस्क मैनेजमेंट - 0.5% से 2% Scaling Plan",
      ar: "إدارة المخاطر الاحترافية - خطة التدرج 0.5% إلى 2%",
    },
    summary: {
      en: "Advanced traders start with 0.5% risk, scale up to 2% as account grows — prop firm safe plan.",
      ur: "Advanced trader 2% risk نہیں، 0.5% risk سے شروع کرتا ہے، account بڑھنے کے ساتھ 2% تک — prop firm safe plan۔",
      hi: "Advanced trader 2% risk नहीं, 0.5% risk से शुरू करता है, account बढ़ने पर 2% तक — prop firm safe plan।",
      ar: "المتداول المتقدم لا يخاطر بـ 2%، يبدأ بـ 0.5%، يصل إلى 2% بنمو الحساب — خطة آمنة لشركات التمويل.",
    },
    content: {
      en: `## Pro Risk Management - 0.5% to 2% Scaling Plan

Advanced trader doesn't risk 2%, starts with 0.5% risk.

### Scaling
- $100 Account = 0.5% Risk = $0.50 per trade = 0.01 Lot, 20 pips SL
- $500 Account = 1% Risk
- $1000 Account = 1.5% Risk

### Prop Firm Rule
Never open 2 trades at the same time. Daily loss limit $10.

### Formula
Lot Size = Risk $ / (SL Pips × 0.10)`,
      ur: `## Pro Risk Management - 0.5% to 2% Scaling Plan

Advanced trader 2% risk نہیں، 0.5% risk سے شروع کرتا ہے۔

### Scaling
- $100 Account = 0.5% Risk = $0.50 per trade = 0.01 Lot, 20 pips SL
- $500 Account = 1% Risk
- $1000 Account = 1.5% Risk

### Prop Firm Rule
کبھی بھی 2 trades ایک ساتھ مت کھولو۔ Daily loss limit $10۔

### Formula
Lot Size = Risk $ / (SL Pips × 0.10)`,
      hi: `## प्रो रिस्क मैनेजमेंट - 0.5% से 2% Scaling Plan

Advanced trader 2% risk नहीं, 0.5% risk से शुरू करता है।

### Scaling
- $100 Account = 0.5% Risk = $0.50 per trade = 0.01 Lot, 20 pips SL
- $500 Account = 1% Risk
- $1000 Account = 1.5% Risk

### Prop Firm Rule
कभी भी 2 trades एक साथ मत खोलो। Daily loss limit $10।

### Formula
Lot Size = Risk $ / (SL Pips × 0.10)`,
      ar: `## إدارة المخاطر الاحترافية - خطة التدرج 0.5% إلى 2%

المتداول المتقدم لا يخاطر بـ 2%، يبدأ بـ 0.5%.

### التدرج
- حساب $100 = مخاطرة 0.5% = $0.50 لكل صفقة = 0.01 لوت، 20 نقطة وقف
- حساب $500 = مخاطرة 1%
- حساب $1000 = مخاطرة 1.5%

### قاعدة شركة التمويل
لا تفتح صفقتين في نفس الوقت أبداً. حد الخسارة اليومي $10.

### المعادلة
حجم اللوت = المخاطرة $ / (نقاط الوقف × 0.10)`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What risk should an advanced trader start with?", ur: "Advanced trader کو کتنا risk سے شروع کرنا چاہیے؟", hi: "Advanced trader को कितना risk से शुरू करना चाहिए?", ar: "بكم يبدأ المتداول المتقدم المخاطرة؟" },
        options: [
          { en: "5%", ur: "5%", hi: "5%", ar: "5%" },
          { en: "2%", ur: "2%", hi: "2%", ar: "2%" },
          { en: "0.5%", ur: "0.5%", hi: "0.5%", ar: "0.5%" },
          { en: "10%", ur: "10%", hi: "10%", ar: "10%" },
        ],
        correctIndex: 2,
        explanation: { en: "Advanced trader starts with 0.5% risk and scales up as account grows.", ur: "Advanced trader 0.5% risk سے شروع کرتا ہے اور account بڑھنے کے ساتھ اسے بڑھاتا ہے۔", hi: "Advanced trader 0.5% risk से शुरू करता है और account बढ़ने पर इसे बढ़ाता है।", ar: "المتداول المتقدم يبدأ بمخاطرة 0.5% ويزيد مع نمو الحساب." },
      },
      {
        type: "MCQ",
        prompt: { en: "On a $100 account with 0.5% risk and 20 pips SL, what is the lot size?", ur: "$100 account پر 0.5% risk اور 20 pips SL سے lot size کیا ہے؟", hi: "$100 account पर 0.5% risk और 20 pips SL से lot size क्या है?", ar: "على حساب $100 بمخاطرة 0.5% ووقف 20 نقطة، ما هو حجم اللوت؟" },
        options: [
          { en: "0.01", ur: "0.01", hi: "0.01", ar: "0.01" },
          { en: "0.10", ur: "0.10", hi: "0.10", ar: "0.10" },
          { en: "0.50", ur: "0.50", hi: "0.50", ar: "0.50" },
          { en: "1.00", ur: "1.00", hi: "1.00", ar: "1.00" },
        ],
        correctIndex: 0,
        explanation: { en: "$0.50 risk / (20 × 0.10) = 0.01 lot — small and safe for $100.", ur: "$0.50 risk / (20 × 0.10) = 0.01 lot — $100 کے لیے چھوٹا اور safe۔", hi: "$0.50 risk / (20 × 0.10) = 0.01 lot — $100 के लिए छोटा और safe।", ar: "$0.50 مخاطرة / (20 × 0.10) = 0.01 لوت — صغير وآمن لـ $100." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the prop firm rule about multiple trades?", ur: "Prop firm کا multiple trades کا rule کیا ہے؟", hi: "Prop firm का multiple trades का rule क्या है?", ar: "ما هي قاعدة شركة التمويل بخصوص الصفقات المتعددة؟" },
        options: [
          { en: "Open as many as you want", ur: "جتنی چاہیں کھولیں", hi: "जितनी चाहें खोलें", ar: "افتح ما تريد" },
          { en: "Never open 2 trades at the same time", ur: "کبھی 2 trades ایک ساتھ مت کھولو", hi: "कभी 2 trades एक साथ मत खोलो", ar: "لا تفتح صفقتين في نفس الوقت أبداً" },
          { en: "Open minimum 5 trades", ur: "کم از کم 5 trades کھولیں", hi: "कम से कम 5 trades खोलें", ar: "افتح 5 صفقات على الأقل" },
          { en: "Only open trades at news", ur: "صرف news پر trades کھولیں", hi: "सिर्फ़ news पर trades खोलें", ar: "افتح صفقات فقط عند الأخبار" },
        ],
        correctIndex: 1,
        explanation: { en: "Prop firm rule: never open 2 trades at the same time — protects the daily loss limit.", ur: "Prop firm rule: کبھی 2 trades ایک ساتھ مت کھولو — daily loss limit کی حفاظت۔", hi: "Prop firm rule: कभी 2 trades एक साथ मत खोलो — daily loss limit की सुरक्षा।", ar: "قاعدة شركة التمويل: لا تفتح صفقتين في نفس الوقت أبداً — يحمي حد الخسارة اليومي." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the formula for lot size?", ur: "Lot size کا formula کیا ہے؟", hi: "Lot size का formula क्या है?", ar: "ما هي معادلة حجم اللوت؟" },
        options: [
          { en: "Lot Size = Risk $ × SL Pips", ur: "Lot Size = Risk $ × SL Pips", hi: "Lot Size = Risk $ × SL Pips", ar: "حجم اللوت = المخاطرة $ × نقاط الوقف" },
          { en: "Lot Size = Risk $ / (SL Pips × 0.10)", ur: "Lot Size = Risk $ / (SL Pips × 0.10)", hi: "Lot Size = Risk $ / (SL Pips × 0.10)", ar: "حجم اللوت = المخاطرة $ / (نقاط الوقف × 0.10)" },
          { en: "Lot Size = SL Pips / Risk $", ur: "Lot Size = SL Pips / Risk $", hi: "Lot Size = SL Pips / Risk $", ar: "حجم اللوت = نقاط الوقف / المخاطرة $" },
          { en: "Lot Size = Risk $ + SL Pips", ur: "Lot Size = Risk $ + SL Pips", hi: "Lot Size = Risk $ + SL Pips", ar: "حجم اللوت = المخاطرة $ + نقاط الوقف" },
        ],
        correctIndex: 1,
        explanation: { en: "Lot Size = Risk $ / (SL Pips × 0.10) — gives correct lot for the desired risk.", ur: "Lot Size = Risk $ / (SL Pips × 0.10) — مطلوبہ risk کے لیے صحیح lot دیتا ہے۔", hi: "Lot Size = Risk $ / (SL Pips × 0.10) — वांछित risk के लिए सही lot देता है।", ar: "حجم اللوت = المخاطرة $ / (نقاط الوقف × 0.10) — يعطي اللوت الصحيح للمخاطرة المطلوبة." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the daily loss limit on a prop firm?", ur: "Prop firm پر daily loss limit کیا ہے؟", hi: "Prop firm पर daily loss limit क्या है?", ar: "ما هو حد الخسارة اليومي على شركة التمويل؟" },
        options: [
          { en: "$1", ur: "$1", hi: "$1", ar: "$1" },
          { en: "$10", ur: "$10", hi: "$10", ar: "$10" },
          { en: "$100", ur: "$100", hi: "$100", ar: "$100" },
          { en: "$1000", ur: "$1000", hi: "$1000", ar: "$1000" },
        ],
        correctIndex: 1,
        explanation: { en: "Daily loss limit = $10 — protect your account, stop trading after hitting it.", ur: "Daily loss limit = $10 — account محفوظ رکھو، حد پہنچنے کے بعد trade بند کر دو۔", hi: "Daily loss limit = $10 — account सुरक्षित रखो, सीमा पहुँचने के बाद trade बंद कर दो।", ar: "حد الخسارة اليومي = $10 — احم حسابك، أوقف التداول بعد بلوغه." },
      },
    ],
  },

  // ===== LESSON 39: Advanced Psychology =====
  {
    id: "eurusd-39",
    order: 10,
    title: {
      en: "Advanced Psychology - FOMO, Revenge, Overtrading",
      ur: "Advanced Psychology - FOMO, Revenge, Overtrading",
      hi: "एडवांस्ड साइकोलॉजी - FOMO, Revenge, Overtrading",
      ar: "علم النفس المتقدم - FOMO، الانتقام، الإفراط في التداول",
    },
    summary: {
      en: "Strategy is 10%, psychology is 90%. Defeat FOMO, revenge trading, and overtrading to survive.",
      ur: "Strategy 10% ہے، Psychology 90% ہے۔ FOMO، revenge trading، اور overtrading کو شکست دو۔",
      hi: "Strategy 10% है, Psychology 90% है। FOMO, revenge trading, और overtrading को हराओ।",
      ar: "الاستراتيجية 10%، وعلم النفس 90%. اهزم FOMO، الانتقام، والإفراط في التداول للبقاء.",
    },
    content: {
      en: `## Advanced Psychology - FOMO, Revenge, Overtrading

Strategy is 10%, Psychology is 90%.

### 3 Enemies
1. **FOMO:** Train has left, don't jump on it now. Next train will come.
2. **Revenge:** Taking big lot to take revenge after a loss = Account wash
3. **Overtrading:** Taking 10 trades a day = Casino

### Remedy
Only 2 trades per day. Close laptop after 1 win or 2 losses. Write in journal "Today I was greedy".`,
      ur: `## Advanced Psychology - FOMO, Revenge, Overtrading

Strategy 10% ہے، Psychology 90% ہے۔

### 3 Dushman
1. **FOMO:** Train نکل گئی، اب کود کر نہیں بیٹھنا۔ اگلی train آئے گی۔
2. **Revenge:** Loss کے بعد بدلا لینے کے لیے بڑی lot لگانا = Account wash
3. **Overtrading:** روز 10 trade لینا = Casino

### Ilaaj
روز صرف 2 Trade۔ 1 Win یا 2 Loss کے بعد laptop بند۔ Journal میں لکھو "آج لالچ کیا"۔`,
      hi: `## एडवांस्ड साइकोलॉजी - FOMO, Revenge, Overtrading

Strategy 10% है, Psychology 90% है।

### 3 दुश्मन
1. **FOMO:** Train निकल गई, अब कूद कर नहीं बैठना। अगली train आएगी।
2. **Revenge:** Loss के बाद बदला लेने के लिए बड़ी lot लगाना = Account wash
3. **Overtrading:** रोज़ 10 trade लेना = Casino

### इलाज
रोज़ सिर्फ़ 2 Trade। 1 Win या 2 Loss के बाद laptop बंद। Journal में लिखो "आज लालच किया"।`,
      ar: `## علم النفس المتقدم - FOMO، الانتقام، الإفراط في التداول

الاستراتيجية 10%، وعلم النفس 90%.

### 3 أعداء
1. **FOMO:** القطار غادر، لا تقفز عليه الآن. القطار القادم سيأتي.
2. **الانتقام:** فتح لوت كبير للانتقام بعد خسارة = تدمير الحساب
3. **الإفراط في التداول:** فتح 10 صفقات يومياً = كازينو

### العلاج
صفقتان فقط يومياً. أغلق اللابتوب بعد ربح واحد أو خسارتين. اكتب في اليوميات "اليوم كنت طماعاً".`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What percentage of trading success is psychology?", ur: "ٹریڈنگ کی کامیابی میں Psychology کا کتنا فیصد ہے؟", hi: "ट्रेडिंग की सफलता में Psychology का कितना प्रतिशत है?", ar: "كم نسبة علم النفس من نجاح التداول؟" },
        options: [
          { en: "10%", ur: "10%", hi: "10%", ar: "10%" },
          { en: "50%", ur: "50%", hi: "50%", ar: "50%" },
          { en: "90%", ur: "90%", hi: "90%", ar: "90%" },
          { en: "0%", ur: "0%", hi: "0%", ar: "0%" },
        ],
        correctIndex: 2,
        explanation: { en: "Strategy is 10%, Psychology is 90% — mindset matters most.", ur: "Strategy 10% ہے، Psychology 90% ہے — mindset سب سے اہم ہے۔", hi: "Strategy 10% है, Psychology 90% है — mindset सबसे ज़रूरी है।", ar: "الاستراتيجية 10%، علم النفس 90% — العقلية هي الأهم." },
      },
      {
        type: "MCQ",
        prompt: { en: "What does FOMO mean in trading?", ur: "ٹریڈنگ میں FOMO کا کیا مطلب ہے؟", hi: "ट्रेडिंग में FOMO का क्या मतलब है?", ar: "ماذا يعني FOMO في التداول؟" },
        options: [
          { en: "Fear Of Missing Out — chasing missed moves", ur: "Fear Of Missing Out — چھوٹے ہوئے moves کے پیچھے بھاگنا", hi: "Fear Of Missing Out — छूटे हुए moves के पीछे भागना", ar: "الخوف من تفويت الفرصة — مطاردة الحركات الفائتة" },
          { en: "Fast Order Move Out", ur: "Fast Order Move Out", hi: "Fast Order Move Out", ar: "خروج أمر سريع" },
          { en: "Free Order Money Out", ur: "Free Order Money Out", hi: "Free Order Money Out", ar: "خروج مال مجاني" },
          { en: "Full Order Manual Open", ur: "Full Order Manual Open", hi: "Full Order Manual Open", ar: "فتح أمر كامل يدوي" },
        ],
        correctIndex: 0,
        explanation: { en: "FOMO = Fear Of Missing Out — chasing a move that already happened, leads to bad entries.", ur: "FOMO = Fear Of Missing Out — پہلے سے ہو چکے move کے پیچھے بھاگنا، خراب entries لاتا ہے۔", hi: "FOMO = Fear Of Missing Out — पहले से हो चुके move के पीछे भागना, बुरी entries लाता है।", ar: "FOMO = الخوف من تفويت الفرصة — مطاردة حركة حدثت بالفعل، تؤدي لمداخل سيئة." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is Revenge Trading?", ur: "Revenge Trading کیا ہے؟", hi: "Revenge Trading क्या है?", ar: "ما هو التداول الانتقامي؟" },
        options: [
          { en: "Trading with a friend", ur: "Friend کے ساتھ trade", hi: "Friend के साथ trade", ar: "التداول مع صديق" },
          { en: "Taking big lot to recover a loss", ur: "Loss recover کرنے کے لیے بڑی lot لینا", hi: "Loss recover करने के लिए बड़ी lot लेना", ar: "فتح لوت كبير لتعويض خسارة" },
          { en: "Trading only news", ur: "صرف news پر trade", hi: "सिर्फ़ news पर trade", ar: "التداول على الأخبار فقط" },
          { en: "Trading demo account", ur: "Demo account پر trade", hi: "Demo account पर trade", ar: "التداول على حساب تجريبي" },
        ],
        correctIndex: 1,
        explanation: { en: "Revenge = taking a big lot to recover a loss — usually destroys the account.", ur: "Revenge = loss recover کرنے کے لیے بڑی lot لینا — عموماً account تباہ کر دیتا ہے۔", hi: "Revenge = loss recover करने के लिए बड़ी lot लेना — आमतौर पर account तबाह कर देता है।", ar: "الانتقام = فتح لوت كبير لتعويض خسارة — عادة يدمر الحساب." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the remedy for overtrading?", ur: "Overtrading کا ilaaj کیا ہے؟", hi: "Overtrading का ilaaj क्या है?", ar: "ما هو علاج الإفراط في التداول؟" },
        options: [
          { en: "Take more trades to recover", ur: "recover کرنے کے لیے زیادہ trade لیں", hi: "recover करने के लिए ज़्यादा trade लें", ar: "افتح صفقات أكثر للتعويض" },
          { en: "Only 2 trades per day, close laptop after 1 win or 2 losses", ur: "روز صرف 2 trade، 1 win یا 2 loss کے بعد laptop بند", hi: "रोज़ सिर्फ़ 2 trade, 1 win या 2 loss के बाद laptop बंद", ar: "صفقتان فقط يومياً، أغلق اللابتوب بعد ربح أو خسارتين" },
          { en: "Trade 24 hours", ur: "24 گھنٹے trade کریں", hi: "24 घंटे trade करें", ar: "تداول 24 ساعة" },
          { en: "Increase lot size", ur: "Lot size بڑھائیں", hi: "Lot size बढ़ाएं", ar: "زد حجم اللوت" },
        ],
        correctIndex: 1,
        explanation: { en: "Only 2 trades per day, close laptop after 1 win or 2 losses — discipline beats greed.", ur: "روز صرف 2 trade، 1 win یا 2 loss کے بعد laptop بند — discipline لالچ پر بھاری۔", hi: "रोज़ सिर्फ़ 2 trade, 1 win या 2 loss के बाद laptop बंद — discipline लालच पर भारी।", ar: "صفقتان فقط يومياً، أغلق اللابتوب بعد ربح أو خسارتين — الانضباط يهزم الطمع." },
      },
      {
        type: "MCQ",
        prompt: { en: "Why is journaling important?", ur: "Journal لکھنا کیوں ضروری ہے؟", hi: "Journal लिखना क्यों ज़रूरी है?", ar: "لماذا كتابة اليوميات مهمة؟" },
        options: [
          { en: "To show off to others", ur: "دوسروں کو دکھانے کے لیے", hi: "दूसरों को दिखाने के लिए", ar: "للتباهي أمام الآخرين" },
          { en: "To track mistakes and emotions like greed", ur: "غلطیوں اور لالچ جیسے emotions کو track کرنے", hi: "गलतियों और लालच जैसे emotions को track करने", ar: "لتتبع الأخطاء والمشاعر مثل الطمع" },
          { en: "It is not important", ur: "یہ ضروری نہیں", hi: "यह ज़रूरी नहीं", ar: "ليست مهمة" },
          { en: "Only for tax purposes", ur: "صرف tax کے لیے", hi: "सिर्फ़ tax के लिए", ar: "لأغراض الضرائب فقط" },
        ],
        correctIndex: 1,
        explanation: { en: "Journaling tracks mistakes and emotions — helps you spot and fix the patterns that lose money.", ur: "Journal غلطیوں اور emotions کو track کرتا ہے — پیسہ ہرانے والے patterns کو پہچاننے اور fix کرنے میں مدد۔", hi: "Journal गलतियों और emotions को track करता है — पैसा हारने वाले patterns को पहचानने और fix करने में मदद।", ar: "اليوميات تتبع الأخطاء والمشاعر — تساعدك على اكتشاف وإصلاح الأنماط الخاسرة." },
      },
    ],
  },

  // ===== LESSON 40: News + SMC =====
  {
    id: "eurusd-40",
    order: 11,
    title: {
      en: "News + SMC - NFP, CPI, FOMC",
      ur: "News + SMC - NFP, CPI, FOMC",
      hi: "News + SMC - NFP, CPI, FOMC",
      ar: "الأخبار + SMC - NFP، CPI، FOMC",
    },
    summary: {
      en: "SMC works best on news — price takes liquidity before news, then goes opposite (Judas Swing).",
      ur: "News پر SMC سب سے زیادہ اچھا کام کرتا ہے — price news سے پہلے liquidity لیتی، پھر opposite جاتی (Judas Swing)۔",
      hi: "News पर SMC सबसे अच्छा काम करता है — price news से पहले liquidity लेती, फिर opposite जाती (Judas Swing)।",
      ar: "يعمل SMC بشكل أفضل على الأخبار — السعر يأخذ السيولة قبل الخبر ثم يذهب عكسياً (تأرجح يهوذا).",
    },
    content: {
      en: `## News + SMC - NFP, CPI, FOMC

SMC works best on news.

### What Happens?
Before news, price takes liquidity on one side, on news it goes opposite. This is called the "Judas Swing".

### Rule
No trade 15 minutes before or after news. After news, take entry on the FVG that forms.

### Example: EUR/USD
Before NFP, price went up. NFP came and price dropped 100 pips. Those who bought first got their SL eaten.`,
      ur: `## News + SMC - NFP, CPI, FOMC

News پر SMC سب سے زیادہ اچھا کام کرتا ہے۔

### Kya Hota Hai?
News سے پہلے price ایک طرف liquidity لیتی ہے، news پر opposite جاتی ہے۔ اس کو "Judas Swing" کہتے ہیں۔

### Rule
News کے 15 min پہلے اور بعد کوئی trade نہیں۔ News کے بعد جو FVG بنتا ہے اس پر entry لو۔

### مثال: EUR/USD
NFP سے پہلے price اوپر گئی، NFP آیا تو 100 pips نیچے۔ جو لوگ پہلے Buy کیے تھے ان کا SL کھایا۔`,
      hi: `## News + SMC - NFP, CPI, FOMC

News पर SMC सबसे अच्छा काम करता है।

### क्या होता है?
News से पहले price एक तरफ liquidity लेती है, news पर opposite जाती है। इसे "Judas Swing" कहते हैं।

### नियम
News के 15 min पहले और बाद कोई trade नहीं। News के बाद जो FVG बनता है उस पर entry लो।

### उदाहरण: EUR/USD
NFP से पहले price ऊपर गई, NFP आया तो 100 pips नीचे। जो लोग पहले Buy किए थे उनका SL खाया।`,
      ar: `## الأخبار + SMC - NFP، CPI، FOMC

يعمل SMC بشكل أفضل على الأخبار.

### ماذا يحدث؟
قبل الخبر، يأخذ السعر السيولة من جانب واحد، وعند الخبر يذهب عكسياً. هذا يسمى "تأرجح يهوذا".

### القاعدة
لا تداول 15 دقيقة قبل أو بعد الخبر. بعد الخبر، خذ دخولاً على FVG الذي يتشكل.

### مثال: EUR/USD
قبل NFP، صعد السعر. جاء NFP فهبط 100 نقطة. الذين اشتروا أولاً أُكل وقف خسارتهم.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What is the Judas Swing?", ur: "Judas Swing کیا ہے؟", hi: "Judas Swing क्या है?", ar: "ما هو تأرجح يهوذا؟" },
        options: [
          { en: "Price going with the news direction", ur: "Price news کی direction میں جانا", hi: "Price news की direction में जाना", ar: "السعر يذهب مع اتجاه الخبر" },
          { en: "Price taking liquidity on one side, then reversing on news", ur: "Price ایک طرف liquidity لینا، پھر news پر reverse ہونا", hi: "Price एक तरफ liquidity लेना, फिर news पर reverse होना", ar: "السعر يأخذ السيولة من جهة ثم ينعكس عند الخبر" },
          { en: "A type of candle", ur: "Candle کی قسم", hi: "Candle का प्रकार", ar: "نوع من الشموع" },
          { en: "A moving average", ur: "Moving average", hi: "Moving average", ar: "متوسط متحرك" },
        ],
        correctIndex: 1,
        explanation: { en: "Judas Swing = fake move before news that takes liquidity, then price reverses on the news.", ur: "Judas Swing = news سے پہلے fake move جو liquidity لیتی، پھر news پر reverse۔", hi: "Judas Swing = news से पहले fake move जो liquidity लेती, फिर news पर reverse।", ar: "تأرجح يهوذا = حركة وهمية قبل الخبر تأخذ السيولة، ثم ينعكس السعر عند الخبر." },
      },
      {
        type: "MCQ",
        prompt: { en: "When should you NOT trade around news?", ur: "News کے اردگرد trade نہیں کرنا چاہیے؟", hi: "News के आसपास trade नहीं करना चाहिए?", ar: "متى يجب ألا تتداول حول الأخبار؟" },
        options: [
          { en: "15 min before and after news", ur: "News سے 15 min پہلے اور بعد", hi: "News से 15 min पहले और बाद", ar: "15 دقيقة قبل وبعد الخبر" },
          { en: "1 hour after news only", ur: "صرف news کے 1 گھنٹے بعد", hi: "सिर्फ़ news के 1 घंटे बाद", ar: "ساعة واحدة بعد الخبر فقط" },
          { en: "Never trade news", ur: "News پر کبھی trade نہ کریں", hi: "News पर कभी trade न करें", ar: "لا تتداول الأخبار أبداً" },
          { en: "Only trade during news", ur: "صرف news کے دوران trade", hi: "सिर्फ़ news के दौरान trade", ar: "تداول فقط أثناء الأخبار" },
        ],
        correctIndex: 0,
        explanation: { en: "Avoid trading 15 minutes before and after news — let volatility settle, then trade the FVG.", ur: "News سے 15 min پہلے اور بعد trade سے گریز — volatility settle ہونے دیں، پھر FVG پر trade۔", hi: "News से 15 min पहले और बाद trade से बचें — volatility settle होने दें, फिर FVG पर trade।", ar: "تجنب التداول 15 دقيقة قبل وبعد الخبر — اترك التقلب يستقر، ثم تداول على FVG." },
      },
      {
        type: "MCQ",
        prompt: { en: "Where do you take entry after news?", ur: "News کے بعد entry کہاں لیں؟", hi: "News के बाद entry कहाँ लें?", ar: "أين تأخذ الدخول بعد الأخبار؟" },
        options: [
          { en: "Immediately at news release", ur: "News release پر فوراً", hi: "News release पर तुरंत", ar: "فوراً عند صدور الخبر" },
          { en: "On the FVG that forms after news", ur: "News کے بعد بننے والے FVG پر", hi: "News के बाद बनने वाले FVG पर", ar: "على FVG الذي يتشكل بعد الخبر" },
          { en: "On the high of the news spike", ur: "News spike کے high پر", hi: "News spike के high पर", ar: "على قمة ارتفاع الخبر" },
          { en: "On the low of the news spike", ur: "News spike کے low پر", hi: "News spike के low पर", ar: "على قاع ارتفاع الخبر" },
        ],
        correctIndex: 1,
        explanation: { en: "After news, wait for FVG to form, then take entry on it — cleaner and safer.", ur: "News کے بعد FVG بننے کا انتظار، پھر اس پر entry — صاف اور safe۔", hi: "News के बाद FVG बनने का इंतज़ार, फिर उस पर entry — साफ़ और safe।", ar: "بعد الخبر، انتظر تشكل FVG، ثم خذ دخولاً عليه — أنظف وأأمن." },
      },
      {
        type: "MCQ",
        prompt: { en: "In the EUR/USD NFP example, what happens to those who bought first?", ur: "EUR/USD NFP مثال میں پہلے Buy کرنے والوں کا کیا ہوتا ہے؟", hi: "EUR/USD NFP उदाहरण में पहले Buy करने वालों का क्या होता है?", ar: "في مثال EUR/USD NFP، ماذا يحدث لمن اشتروا أولاً؟" },
        options: [
          { en: "They make profit", ur: "Profit ہوتا ہے", hi: "Profit होता है", ar: "يربحون" },
          { en: "Their SL gets eaten", ur: "ان کا SL کھایا جاتا ہے", hi: "उनका SL खाया जाता है", ar: "يُؤكل وقف خسارتهم" },
          { en: "Nothing happens to them", ur: "ان کا کچھ نہیں ہوتا", hi: "उनका कुछ नहीं होता", ar: "لا يحدث لهم شيء" },
          { en: "They get a bonus", ur: "Bonus ملتا ہے", hi: "Bonus मिलता है", ar: "يحصلون على مكافأة" },
        ],
        correctIndex: 1,
        explanation: { en: "Their SL gets eaten — price went up before NFP (liquidity), then dumped 100 pips on NFP.", ur: "ان کا SL کھایا جاتا ہے — NFP سے پہلے price اوپر گئی (liquidity)، پھر NFP پر 100 pips گری۔", hi: "उनका SL खाया जाता है — NFP से पहले price ऊपर गई (liquidity), फिर NFP पर 100 pips गिरी।", ar: "يُؤكل وقف خسارتهم — صعد السعر قبل NFP (سيولة)، ثم هبط 100 نقطة عند NFP." },
      },
      {
        type: "MCQ",
        prompt: { en: "Which 3 major news events are mentioned in this lesson?", ur: "اس lesson میں کون سی 3 بڑی news events ہیں؟", hi: "इस lesson में कौन से 3 बड़े news events हैं?", ar: "ما هي الأحداث الإخبارية الثلاثة الرئيسية المذكورة في هذا الدرس؟" },
        options: [
          { en: "NFP, CPI, FOMC", ur: "NFP, CPI, FOMC", hi: "NFP, CPI, FOMC", ar: "NFP، CPI، FOMC" },
          { en: "GDP, PPI, ECB", ur: "GDP, PPI, ECB", hi: "GDP, PPI, ECB", ar: "GDP، PPI، ECB" },
          { en: "EUR, USD, JPY", ur: "EUR, USD, JPY", hi: "EUR, USD, JPY", ar: "EUR، USD، JPY" },
          { en: "Open, High, Low", ur: "Open, High, Low", hi: "Open, High, Low", ar: "Open، High، Low" },
        ],
        correctIndex: 0,
        explanation: { en: "The 3 major news events are NFP (Non-Farm Payrolls), CPI (Consumer Price Index), and FOMC.", ur: "3 بڑی news events ہیں: NFP, CPI اور FOMC۔", hi: "3 बड़े news events हैं: NFP, CPI और FOMC।", ar: "الأحداث الإخبارية الثلاثة الرئيسية هي NFP، CPI، و FOMC." },
      },
    ],
  },

  // ===== LESSON 41: Top-Down Analysis =====
  {
    id: "eurusd-41",
    order: 12,
    title: {
      en: "Top-Down Analysis - Daily Bias > H1 > M15",
      ur: "Top-Down Analysis - Daily Bias > H1 > M15",
      hi: "टॉप-डाउन एनालिसिस - Daily Bias > H1 > M15",
      ar: "التحليل من الأعلى للأسفل - تحيز يومي > H1 > M15",
    },
    summary: {
      en: "Pro traders read market top-down: Daily bias first, H1 structure next, M15 entry — never the other way.",
      ur: "Pro trader نیچے سے اوپر نہیں، اوپر سے نیچے دیکھتا ہے: پہلے Daily bias، پھر H1 structure، پھر M15 entry۔",
      hi: "Pro trader नीचे से ऊपर नहीं, ऊपर से नीचे देखता है: पहले Daily bias, फिर H1 structure, फिर M15 entry।",
      ar: "المتداول المحترف يقرأ السوق من الأعلى للأسفل: التحيز اليومي أولاً، ثم هيكل H1، ثم دخول M15.",
    },
    content: {
      en: `## Top-Down Analysis - Daily Bias > H1 > M15

A pro trader doesn't read from bottom to top — they read top-down.

### Step 1 - Daily Bias
Is the Daily chart uptrend or downtrend? Decide using EMA 50.

### Step 2 - H1 Structure
Where is the BOS / CHOCH on H1? Decide entry direction.

### Step 3 - M15 Entry
Find OB / FVG on M15.

### Example
Daily Uptrend, H1 has not done CHOCH, Bullish OB on M15 = Confirmed Buy.`,
      ur: `## Top-Down Analysis - Daily Bias > H1 > M15

Pro trader نیچے سے اوپر نہیں، اوپر سے نیچے دیکھتا ہے۔

### Step 1 - Daily Bias
Daily chart uptrend ہے یا downtrend؟ EMA 50 سے decide کرو۔

### Step 2 - H1 Structure
H1 پر BOS / CHOCH کہاں ہے؟ Entry direction decide کرو۔

### Step 3 - M15 Entry
M15 پر OB / FVG ڈھونڈو۔

### مثال
Daily Uptrend، H1 نے CHOCH نہیں کیا، M15 پر Bullish OB = Confirm Buy۔`,
      hi: `## टॉप-डाउन एनालिसिस - Daily Bias > H1 > M15

Pro trader नीचे से ऊपर नहीं, ऊपर से नीचे देखता है।

### Step 1 - Daily Bias
Daily chart uptrend है या downtrend? EMA 50 से decide करो।

### Step 2 - H1 Structure
H1 पर BOS / CHOCH कहाँ है? Entry direction decide करो।

### Step 3 - M15 Entry
M15 पर OB / FVG ढूंढो।

### उदाहरण
Daily Uptrend, H1 ने CHOCH नहीं किया, M15 पर Bullish OB = Confirm Buy।`,
      ar: `## التحليل من الأعلى للأسفل - تحيز يومي > H1 > M15

المتداول المحترف لا يقرأ من الأسفل للأعلى — بل من الأعلى للأسفل.

### الخطوة 1 - التحيز اليومي
هل الرسم اليومي صاعد أم هابط؟ حدد باستخدام EMA 50.

### الخطوة 2 - هيكل H1
أين يوجد BOS / CHOCH على H1؟ حدد اتجاه الدخول.

### الخطوة 3 - دخول M15
ابحث عن OB / FVG على M15.

### مثال
صعود يومي، H1 لم يصنع CHOCH، OB صعودي على M15 = شراء مؤكد.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What is the correct order of Top-Down Analysis?", ur: "Top-Down Analysis کی صحیح ترتیب کیا ہے؟", hi: "Top-Down Analysis की सही क्रम क्या है?", ar: "ما هو الترتيب الصحيح للتحليل من الأعلى للأسفل؟" },
        options: [
          { en: "M15 → H1 → Daily", ur: "M15 → H1 → Daily", hi: "M15 → H1 → Daily", ar: "M15 ← H1 ← يومي" },
          { en: "Daily → H1 → M15", ur: "Daily → H1 → M15", hi: "Daily → H1 → M15", ar: "يومي ← H1 ← M15" },
          { en: "H1 → M15 → Daily", ur: "H1 → M15 → Daily", hi: "H1 → M15 → Daily", ar: "H1 ← M15 ← يومي" },
          { en: "Any order", ur: "کوئی بھی ترتیب", hi: "कोई भी क्रम", ar: "أي ترتيب" },
        ],
        correctIndex: 1,
        explanation: { en: "Top-down = Daily (bias) → H1 (structure) → M15 (entry). Always start from higher TF.", ur: "Top-down = Daily (bias) → H1 (structure) → M15 (entry)۔ ہمیشہ بڑے TF سے شروع کریں۔", hi: "Top-down = Daily (bias) → H1 (structure) → M15 (entry)। हमेशा बड़े TF से शुरू करें।", ar: "من الأعلى للأسفل = يومي (تحيز) ← H1 (هيكل) ← M15 (دخول). ابدأ دائماً من الإطار الأعلى." },
      },
      {
        type: "MCQ",
        prompt: { en: "What indicator is used to decide Daily bias?", ur: "Daily bias decide کرنے کے لیے کون سا indicator استعمال ہوتا ہے؟", hi: "Daily bias decide करने के लिए कौन सा indicator इस्तेमाल होता है?", ar: "ما هو المؤشر المستخدم لتحديد التحيز اليومي؟" },
        options: [
          { en: "RSI", ur: "RSI", hi: "RSI", ar: "RSI" },
          { en: "EMA 50", ur: "EMA 50", hi: "EMA 50", ar: "EMA 50" },
          { en: "Bollinger Bands", ur: "Bollinger Bands", hi: "Bollinger Bands", ar: "بولينجر باند" },
          { en: "MACD", ur: "MACD", hi: "MACD", ar: "MACD" },
        ],
        correctIndex: 1,
        explanation: { en: "EMA 50 on Daily decides the bias — price above EMA 50 = uptrend bias.", ur: "Daily پر EMA 50 bias decide کرتا ہے — price EMA 50 کے اوپر = uptrend bias۔", hi: "Daily पर EMA 50 bias decide करता है — price EMA 50 के ऊपर = uptrend bias।", ar: "EMA 50 على اليومي يحدد التحيز — السعر فوق EMA 50 = تحيز صعودي." },
      },
      {
        type: "MCQ",
        prompt: { en: "On which timeframe do you find BOS / CHOCH for entry direction?", ur: "Entry direction کے لیے کس timeframe پر BOS / CHOCH ڈھونڈتے ہیں؟", hi: "Entry direction के लिए किस timeframe पर BOS / CHOCH ढूंढते हैं?", ar: "على أي إطار زمني تجد BOS / CHOCH لاتجاه الدخول؟" },
        options: [
          { en: "Monthly", ur: "Monthly", hi: "Monthly", ar: "شهري" },
          { en: "H1", ur: "H1", hi: "H1", ar: "H1" },
          { en: "M1", ur: "M1", hi: "M1", ar: "M1" },
          { en: "Weekly", ur: "Weekly", hi: "Weekly", ar: "أسبوعي" },
        ],
        correctIndex: 1,
        explanation: { en: "H1 is used to find BOS / CHOCH — it gives the entry direction.", ur: "H1 پر BOS / CHOCH ڈھونڈتے ہیں — entry direction ملتا ہے۔", hi: "H1 पर BOS / CHOCH ढूंढते हैं — entry direction मिलता है।", ar: "يُستخدم H1 لإيجاد BOS / CHOCH — يعطي اتجاه الدخول." },
      },
      {
        type: "MCQ",
        prompt: { en: "On which timeframe do you find the entry OB / FVG?", ur: "Entry OB / FVG کس timeframe پر ڈھونڈتے ہیں؟", hi: "Entry OB / FVG किस timeframe पर ढूंढते हैं?", ar: "على أي إطار زمني تجد OB / FVG للدخول؟" },
        options: [
          { en: "M15", ur: "M15", hi: "M15", ar: "M15" },
          { en: "Daily", ur: "Daily", hi: "Daily", ar: "يومي" },
          { en: "Weekly", ur: "Weekly", hi: "Weekly", ar: "أسبوعي" },
          { en: "Monthly", ur: "Monthly", hi: "Monthly", ar: "شهري" },
        ],
        correctIndex: 0,
        explanation: { en: "M15 is used for entry — find OB / FVG here for precise entry.", ur: "M15 entry کے لیے استعمال ہوتا ہے — یہاں OB / FVG ڈھونڈو precise entry کے لیے۔", hi: "M15 entry के लिए इस्तेमाल होता है — यहाँ OB / FVG ढूंढो precise entry के लिए।", ar: "يُستخدم M15 للدخول — ابحث عن OB / FVG هنا لدخول دقيق." },
      },
      {
        type: "MCQ",
        prompt: { en: "In the example, what makes a Confirmed Buy?", ur: "مثال میں Confirm Buy کیا بنتا ہے؟", hi: "उदाहरण में Confirm Buy क्या बनता है?", ar: "في المثال، ما الذي يجعل شراءً مؤكداً؟" },
        options: [
          { en: "Daily Uptrend + H1 no CHOCH + Bullish OB on M15", ur: "Daily Uptrend + H1 no CHOCH + M15 پر Bullish OB", hi: "Daily Uptrend + H1 no CHOCH + M15 पर Bullish OB", ar: "صعود يومي + لا CHOCH على H1 + OB صعودي على M15" },
          { en: "Daily Downtrend + H1 CHOCH + Bearish OB on M15", ur: "Daily Downtrend + H1 CHOCH + M15 پر Bearish OB", hi: "Daily Downtrend + H1 CHOCH + M15 पर Bearish OB", ar: "هبوط يومي + CHOCH على H1 + OB هبوطي على M15" },
          { en: "Random entry", ur: "بے ترتیب entry", hi: "बेतरतीब entry", ar: "دخول عشوائي" },
          { en: "Only M15 candle color", ur: "صرف M15 candle color", hi: "सिर्फ़ M15 candle color", ar: "لون شمعة M15 فقط" },
        ],
        correctIndex: 0,
        explanation: { en: "Confirmed Buy = Daily Uptrend + H1 has not done CHOCH + Bullish OB on M15.", ur: "Confirm Buy = Daily Uptrend + H1 نے CHOCH نہیں کیا + M15 پر Bullish OB۔", hi: "Confirm Buy = Daily Uptrend + H1 ने CHOCH नहीं किया + M15 पर Bullish OB।", ar: "شراء مؤكد = صعود يومي + لا CHOCH على H1 + OB صعودي على M15." },
      },
    ],
  },

  // ===== LESSON 42: Apni Pro Strategy Banana =====
  {
    id: "eurusd-42",
    order: 13,
    title: {
      en: "Build Your Pro Strategy - 1 Pair, 1 Setup",
      ur: "Apni Pro Strategy Banana - 1 Pair, 1 Setup",
      hi: "अपनी प्रो स्ट्रेटेजी बनाओ - 1 Pair, 1 Setup",
      ar: "اصنع استراتيجيتك الاحترافية - زوج واحد، نموذج واحد",
    },
    summary: {
      en: "100 strategies won't make money — mastery of 1 strategy on 1 pair will. Backtest 100 times.",
      ur: "100 strategy یاد کرنے سے paisa نہیں بنتا، 1 strategy پر مہر ہونے سے بنتا ہے۔ 100 backtest کرو۔",
      hi: "100 strategy याद करने से पैसा नहीं बनता, 1 strategy पर महारत से बनता है। 100 backtest करो।",
      ar: "حفظ 100 استراتيجية لن يصنع المال — إتقان استراتيجية واحدة على زوج واحد يصنع. اختبر 100 مرة.",
    },
    content: {
      en: `## Build Your Pro Strategy - 1 Pair, 1 Setup

Learning 100 strategies doesn't make money — mastery of 1 strategy does.

### Fix Your Strategy
1. **Pair:** Only EUR/USD
2. **Session:** Only London Kill Zone (1pm-4pm)
3. **Setup:** Bullish OB + Bullish FVG + BSL Sweep

### Task
Backtest this setup 100 times on TradingView. If you get 60% win rate, this is your Pro Strategy.`,
      ur: `## Apni Pro Strategy Banana - 1 Pair, 1 Setup

100 strategy یاد کرنے سے paisa نہیں بنتا، 1 strategy پر مہیر ہونے سے بنتا ہے۔

### Apni Strategy Fix Karo
1. **Pair:** صرف EUR/USD
2. **Session:** صرف London Kill Zone (1pm-4pm)
3. **Setup:** Bullish OB + Bullish FVG + BSL Sweep

### Task
اس setup کے 100 backtest کرو TradingView پر۔ 60% win rate آیا تو یہ آپ کی Pro Strategy ہے۔`,
      hi: `## अपनी प्रो स्ट्रेटेजी बनाओ - 1 Pair, 1 Setup

100 strategy याद करने से पैसा नहीं बनता, 1 strategy पर महारत से बनता है।

### अपनी Strategy Fix करो
1. **Pair:** सिर्फ़ EUR/USD
2. **Session:** सिर्फ़ London Kill Zone (1pm-4pm)
3. **Setup:** Bullish OB + Bullish FVG + BSL Sweep

### Task
इस setup के 100 backtest करो TradingView पर। 60% win rate आया तो यह आपकी Pro Strategy है।`,
      ar: `## اصنع استراتيجيتك الاحترافية - زوج واحد، نموذج واحد

حفظ 100 استراتيجية لا يصنع المال — إتقان استراتيجية واحدة يصنعه.

### ثبّت استراتيجيتك
1. **الزوج:** فقط EUR/USD
2. **الجلسة:** فقط منطقة قتل لندن (1-4 مساءً)
3. **النموذج:** OB صعودي + FVG صعودي + التقاط BSL

### المهمة
اختبر هذا النموذج 100 مرة على TradingView. إذا حصلت على معدل ربح 60%، فهذه استراتيجيتك الاحترافية.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "How many strategies should a pro trader master?", ur: "Pro trader کو کتنے strategies پر مہر حاصل کرنی چاہیے؟", hi: "Pro trader को कितने strategies पर महारत हासिल करनी चाहिए?", ar: "كم استراتيجية يجب أن يتقنها المتداول المحترف؟" },
        options: [
          { en: "100 strategies", ur: "100 strategies", hi: "100 strategies", ar: "100 استراتيجية" },
          { en: "50 strategies", ur: "50 strategies", hi: "50 strategies", ar: "50 استراتيجية" },
          { en: "1 strategy", ur: "1 strategy", hi: "1 strategy", ar: "استراتيجية واحدة" },
          { en: "10 strategies", ur: "10 strategies", hi: "10 strategies", ar: "10 استراتيجيات" },
        ],
        correctIndex: 2,
        explanation: { en: "Mastery of 1 strategy makes money — not 100 strategies half-learned.", ur: "1 strategy پر مہر پیسہ بناتی ہے — 100 strategies نصف سیکھی ہوئی نہیں۔", hi: "1 strategy पर महारत पैसा बनाती है — 100 strategies आधी-अधूरी नहीं।", ar: "إتقان استراتيجية واحدة يصنع المال — ليس 100 استراتيجية نصف متعلمة." },
      },
      {
        type: "MCQ",
        prompt: { en: "Which pair should be your focus?", ur: "آپ کا focus کون سا pair ہونا چاہیے؟", hi: "आपका focus कौन सा pair होना चाहिए?", ar: "أي زوج يجب أن يكون تركيزك؟" },
        options: [
          { en: "GBP/JPY", ur: "GBP/JPY", hi: "GBP/JPY", ar: "GBP/JPY" },
          { en: "EUR/USD", ur: "EUR/USD", hi: "EUR/USD", ar: "EUR/USD" },
          { en: "AUD/NZD", ur: "AUD/NZD", hi: "AUD/NZD", ar: "AUD/NZD" },
          { en: "All pairs", ur: "تمام pairs", hi: "सभी pairs", ar: "كل الأزواج" },
        ],
        correctIndex: 1,
        explanation: { en: "Focus on EUR/USD only — master one pair, learn its personality.", ur: "صرف EUR/USD پر focus — ایک pair پر مہر حاصل کرو، اس کی personality سیکھو۔", hi: "सिर्फ़ EUR/USD पर focus — एक pair पर महारत हासिल करो, उसकी personality सीखो।", ar: "ركز على EUR/USD فقط — أتقن زوجاً واحداً، تعلم شخصيته." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the recommended setup combination?", ur: "Recommend کردہ setup combination کیا ہے؟", hi: "Recommended setup combination क्या है?", ar: "ما هو تركيب النموذج الموصى به؟" },
        options: [
          { en: "RSI + MACD + Bollinger", ur: "RSI + MACD + Bollinger", hi: "RSI + MACD + Bollinger", ar: "RSI + MACD + بولينجر" },
          { en: "Bullish OB + Bullish FVG + BSL Sweep", ur: "Bullish OB + Bullish FVG + BSL Sweep", hi: "Bullish OB + Bullish FVG + BSL Sweep", ar: "OB صعودي + FVG صعودي + التقاط BSL" },
          { en: "Moving average cross only", ur: "صرف Moving average cross", hi: "सिर्फ़ Moving average cross", ar: "تقاطع المتوسط المتحرك فقط" },
          { en: "News trading only", ur: "صرف News trading", hi: "सिर्फ़ News trading", ar: "تداول الأخبار فقط" },
        ],
        correctIndex: 1,
        explanation: { en: "Setup = Bullish OB + Bullish FVG + BSL Sweep — strong SMC combination.", ur: "Setup = Bullish OB + Bullish FVG + BSL Sweep — مضبوط SMC combination۔", hi: "Setup = Bullish OB + Bullish FVG + BSL Sweep — मज़बूत SMC combination।", ar: "النموذج = OB صعودي + FVG صعودي + التقاط BSL — تركيب SMC قوي." },
      },
      {
        type: "MCQ",
        prompt: { en: "How many backtests are required to confirm a Pro Strategy?", ur: "Pro Strategy confirm کرنے کے لیے کتنے backtests چاہیے؟", hi: "Pro Strategy confirm करने के लिए कितने backtests चाहिए?", ar: "كم اختباراً مطلوب لتأكيد الاستراتيجية الاحترافية؟" },
        options: [
          { en: "10", ur: "10", hi: "10", ar: "10" },
          { en: "25", ur: "25", hi: "25", ar: "25" },
          { en: "100", ur: "100", hi: "100", ar: "100" },
          { en: "1000", ur: "1000", hi: "1000", ar: "1000" },
        ],
        correctIndex: 2,
        explanation: { en: "100 backtests give enough data — statistical confidence in the strategy.", ur: "100 backtests کافی data دیتے ہیں — strategy میں statistical اعتماد۔", hi: "100 backtests पर्याप्त data देते हैं — strategy में statistical भरोसा।", ar: "100 اختبار يعطي بيانات كافية — ثقة إحصائية في الاستراتيجية." },
      },
      {
        type: "MCQ",
        prompt: { en: "What win rate makes a Pro Strategy?", ur: "Pro Strategy بننے کے لیے win rate کیا ہونی چاہیے؟", hi: "Pro Strategy बनने के लिए win rate क्या होनी चाहिए?", ar: "ما معدل الربح الذي يجعل الاستراتيجية احترافية؟" },
        options: [
          { en: "30%", ur: "30%", hi: "30%", ar: "30%" },
          { en: "60%", ur: "60%", hi: "60%", ar: "60%" },
          { en: "100%", ur: "100%", hi: "100%", ar: "100%" },
          { en: "10%", ur: "10%", hi: "10%", ar: "10%" },
        ],
        correctIndex: 1,
        explanation: { en: "60% win rate over 100 backtests = Pro Strategy — profitable and consistent.", ur: "100 backtests پر 60% win rate = Pro Strategy — profitable اور consistent۔", hi: "100 backtests पर 60% win rate = Pro Strategy — profitable और consistent।", ar: "معدل ربح 60% على 100 اختبار = استراتيجية احترافية — رابحة ومتسقة." },
      },
    ],
  },

  // ===== LESSON 43: BTC & Crypto SMC =====
  {
    id: "eurusd-43",
    order: 14,
    title: {
      en: "BTC & Crypto - How to Apply SMC",
      ur: "BTC & Crypto Me SMC Kaise Lagayein",
      hi: "BTC और Crypto में SMC कैसे लगाएं",
      ar: "BTC والعملات الرقمية - كيف تطبق SMC",
    },
    summary: {
      en: "SMC works on BTC even better than Forex — bigger liquidity, bigger FVGs (300-500$).",
      ur: "SMC صرف Forex نہیں، BTC پر بھی کام کرتا ہے، بلکہ زیادہ اچھا — بڑی liquidity، بڑے FVGs (300-500$)۔",
      hi: "SMC सिर्फ़ Forex नहीं, BTC पर भी काम करता है, बल्कि ज़्यादा अच्छा — बड़ी liquidity, बड़े FVGs (300-500$)।",
      ar: "يعمل SMC على BTC أفضل من الفوركس — سيولة أكبر، فجوات FVG أكبر (300-500$).",
    },
    content: {
      en: `## BTC & Crypto - How to Apply SMC

SMC is not only for Forex, it also works on BTC — even better because crypto has more liquidity.

### Difference
In EUR/USD FVG is 10-15 pips, in BTC it is 300-500$.

### BTC Example
BTC is making Equal Highs at $60,000. At $60,500 there is BSL. Price will go to $60,600, eat SL, then come to $58,000.

### Rule
In BTC keep SL big and Lot small.`,
      ur: `## BTC & Crypto Me SMC Kaise Lagayein

SMC صرف Forex نہیں، BTC پر بھی کام کرتا ہے، بلکہ زیادہ اچھا کام کرتا ہے کیونکہ Crypto میں liquidity زیادہ ہے۔

### Farq
EUR/USD میں FVG 10-15 pips کا، BTC میں 300-500$ کا ہوتا ہے۔

### Misaal BTC
BTC $60,000 پر Equal Highs بنا رہا ہے۔ 60,500 پر BSL ہے۔ Price 60,600 جائے گا SL کھائے گا پھر 58,000 آئے گا۔

### Rule
BTC میں SL بڑا رکھو، Lot چھوٹا۔`,
      hi: `## BTC और Crypto में SMC कैसे लगाएं

SMC सिर्फ़ Forex नहीं, BTC पर भी काम करता है, बल्कि ज़्यादा अच्छा करता है क्योंकि Crypto में liquidity ज़्यादा है।

### फ़र्क
EUR/USD में FVG 10-15 pips का, BTC में 300-500$ का होता है।

### उदाहरण BTC
BTC $60,000 पर Equal Highs बना रहा है। 60,500 पर BSL है। Price 60,600 जाएगा SL खाएगा फिर 58,000 आएगा।

### नियम
BTC में SL बड़ा रखो, Lot छोटा।`,
      ar: `## BTC والعملات الرقمية - كيف تطبق SMC

SMC ليس للفوركس فقط، يعمل على BTC — بل أفضل لأن العملات الرقمية لها سيولة أكبر.

### الفرق
في EUR/USD يكون FVG بـ 10-15 نقطة، في BTC بـ 300-500$.

### مثال BTC
يصنع BTC قمماً متساوية عند $60,000. عند $60,500 يوجد BSL. سيذهب السعر إلى $60,600، يأكل وقف الخسارة، ثم يأتي إلى $58,000.

### القاعدة
في BTC اجعل وقف الخسارة كبيراً واللوت صغيراً.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "Does SMC work on BTC?", ur: "کیا SMC BTC پر کام کرتا ہے؟", hi: "क्या SMC BTC पर काम करता है?", ar: "هل يعمل SMC على BTC؟" },
        options: [
          { en: "No, only Forex", ur: "نہیں، صرف Forex", hi: "नहीं, सिर्फ़ Forex", ar: "لا، فقط الفوركس" },
          { en: "Yes, even better than Forex", ur: "ہاں، Forex سے بھی بہتر", hi: "हाँ, Forex से भी बेहतर", ar: "نعم، بل أفضل من الفوركس" },
          { en: "Only on weekends", ur: "صرف weekends پر", hi: "सिर्फ़ weekends पर", ar: "فقط في عطلات نهاية الأسبوع" },
          { en: "Only on news", ur: "صرف news پر", hi: "सिर्फ़ news पर", ar: "فقط على الأخبار" },
        ],
        correctIndex: 1,
        explanation: { en: "SMC works on BTC, even better — crypto has bigger liquidity pools.", ur: "SMC BTC پر کام کرتا ہے، بلکہ بہتر — Crypto میں liquidity زیادہ ہوتی ہے۔", hi: "SMC BTC पर काम करता है, बल्कि बेहतर — Crypto में liquidity ज़्यादा होती है।", ar: "يعمل SMC على BTC، بل أفضل — العملات الرقمية لها برك سيولة أكبر." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the typical FVG size in BTC?", ur: "BTC میں typical FVG size کیا ہے؟", hi: "BTC में typical FVG size क्या है?", ar: "ما هو حجم FVG النموذجي في BTC؟" },
        options: [
          { en: "1-2 pips", ur: "1-2 pips", hi: "1-2 pips", ar: "1-2 نقطة" },
          { en: "10-15 pips", ur: "10-15 pips", hi: "10-15 pips", ar: "10-15 نقطة" },
          { en: "300-500$", ur: "300-500$", hi: "300-500$", ar: "300-500$" },
          { en: "1-2$", ur: "1-2$", hi: "1-2$", ar: "1-2$" },
        ],
        correctIndex: 2,
        explanation: { en: "BTC FVG is typically 300-500$ — much bigger than Forex FVGs.", ur: "BTC کا FVG عموماً 300-500$ ہوتا ہے — Forex کے FVGs سے کہیں بڑا۔", hi: "BTC का FVG आमतौर पर 300-500$ होता है — Forex के FVGs से कहीं बड़ा।", ar: "FVG في BTC عادة 300-500$ — أكبر بكثير من فجوات الفوركس." },
      },
      {
        type: "MCQ",
        prompt: { en: "In the BTC example, where is BSL located?", ur: "BTC مثال میں BSL کہاں ہے؟", hi: "BTC उदाहरण में BSL कहाँ है?", ar: "في مثال BTC، أين يقع BSL؟" },
        options: [
          { en: "$58,000", ur: "$58,000", hi: "$58,000", ar: "$58,000" },
          { en: "$60,000", ur: "$60,000", hi: "$60,000", ar: "$60,000" },
          { en: "$60,500", ur: "$60,500", hi: "$60,500", ar: "$60,500" },
          { en: "$70,000", ur: "$70,000", hi: "$70,000", ar: "$70,000" },
        ],
        correctIndex: 2,
        explanation: { en: "BSL is at $60,500 — above the equal highs at $60,000.", ur: "BSL $60,500 پر ہے — $60,000 کے equal highs کے اوپر۔", hi: "BSL $60,500 पर है — $60,000 के equal highs के ऊपर।", ar: "BSL عند $60,500 — فوق القمم المتساوية عند $60,000." },
      },
      {
        type: "MCQ",
        prompt: { en: "In the BTC example, where will price go after eating SL?", ur: "BTC مثال میں SL کھانے کے بعد price کہاں جائے گا؟", hi: "BTC उदाहरण में SL खाने के बाद price कहाँ जाएगा?", ar: "في مثال BTC، أين سيذهب السعر بعد أكل وقف الخسارة؟" },
        options: [
          { en: "$70,000", ur: "$70,000", hi: "$70,000", ar: "$70,000" },
          { en: "$58,000", ur: "$58,000", hi: "$58,000", ar: "$58,000" },
          { en: "$60,000", ur: "$60,000", hi: "$60,000", ar: "$60,000" },
          { en: "Stays at $60,600", ur: "$60,600 پر رہے گا", hi: "$60,600 पर रहेगा", ar: "يبقى عند $60,600" },
        ],
        correctIndex: 1,
        explanation: { en: "After taking BSL at $60,600, price drops to $58,000 — classic liquidity grab + reversal.", ur: "$60,600 پر BSL لینے کے بعد price $58,000 آتا ہے — classic liquidity grab + reversal۔", hi: "$60,600 पर BSL लेने के बाद price $58,000 आता है — classic liquidity grab + reversal।", ar: "بعد أخذ BSL عند $60,600، يهبط السعر إلى $58,000 — التقاط سيولة كلاسيكي + انعكاس." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the rule for SL and Lot in BTC?", ur: "BTC میں SL اور Lot کا rule کیا ہے؟", hi: "BTC में SL और Lot का rule क्या है?", ar: "ما هي قاعدة وقف الخسارة واللوت في BTC؟" },
        options: [
          { en: "Small SL, big Lot", ur: "چھوٹا SL، بڑی Lot", hi: "छोटा SL, बड़ी Lot", ar: "وقف صغير، لوت كبير" },
          { en: "Big SL, small Lot", ur: "بڑا SL، چھوٹی Lot", hi: "बड़ा SL, छोटी Lot", ar: "وقف كبير، لوت صغير" },
          { en: "No SL", ur: "SL نہیں", hi: "SL नहीं", ar: "بدون وقف" },
          { en: "Maximum Lot", ur: "Maximum Lot", hi: "Maximum Lot", ar: "أقصى لوت" },
        ],
        correctIndex: 1,
        explanation: { en: "BTC is volatile — keep SL big to survive the swings, and Lot small to control risk.", ur: "BTC volatile ہے — swings سے بچنے کے لیے SL بڑا، risk control کے لیے Lot چھوٹا۔", hi: "BTC volatile है — swings से बचने के लिए SL बड़ा, risk control के लिए Lot छोटा।", ar: "BTC متقلب — اجعل الوقف كبيراً لتحمل التأرجحات، واللوت صغيراً للتحكم في المخاطر." },
      },
    ],
  },

  // ===== LESSON 44: $100 to Funded Account =====
  {
    id: "eurusd-44",
    order: 15,
    title: {
      en: "$100 to Funded Account - Challenge Pass Formula",
      ur: "$100 to Funded Account - Challenge Pass Formula",
      hi: "$100 से Funded Account - Challenge Pass Formula",
      ar: "$100 إلى حساب ممول - معادلة اجتياز التحدي",
    },
    summary: {
      en: "Phase 1 = 8% in 30 days, Phase 2 = 5% in 60 days. 0.5% risk, 1:2 RR, 1 trade/day = pass.",
      ur: "Phase 1 = 8% profit 30 دن میں، Phase 2 = 5% profit 60 دن میں۔ 0.5% risk، 1:2 RR، 1 trade/day = pass۔",
      hi: "Phase 1 = 8% profit 30 दिन में, Phase 2 = 5% profit 60 दिन में। 0.5% risk, 1:2 RR, 1 trade/day = pass।",
      ar: "المرحلة 1 = 8% ربح في 30 يوماً، المرحلة 2 = 5% ربح في 60 يوماً. 0.5% مخاطرة، 1:2 RR، صفقة/يوم = اجتياز.",
    },
    content: {
      en: `## $100 to Funded Account - Challenge Pass Formula

Now you are no longer retail — you are ready to become a funded trader.

### Challenge Rule
Phase 1 = 8% profit in 30 days, Phase 2 = 5% profit in 60 days. Daily loss 5% max.

### Formula to Pass
Daily 0.5% risk, 1:2 RR. 1 trade per day. 16 winning trades = Challenge pass. Take a break on loss, no revenge.

### Example
$10,000 funded account = daily $50 risk = 0.05 lot on EUR/USD with 20 pips SL.`,
      ur: `## $100 to Funded Account - Challenge Pass Formula

اب آپ retail نہیں رہے، اب آپ funded trader بننے کے لیے ready ہیں۔

### Challenge Rule
Phase 1 = 8% profit 30 دن میں، Phase 2 = 5% profit 60 دن میں۔ Daily loss 5% max۔

### Formula Pass Karne Ka
روز 0.5% risk، 1:2 RR۔ روز 1 trade۔ 16 winning trade = Challenge pass۔ Loss ہو تو break لو، revenge نہیں۔

### Example
$10,000 funded account = روز $50 risk = 0.05 lot EUR/USD پر 20 pips SL۔`,
      hi: `## $100 से Funded Account - Challenge Pass Formula

अब आप retail नहीं रहे, अब आप funded trader बनने के लिए ready हैं।

### Challenge Rule
Phase 1 = 8% profit 30 दिन में, Phase 2 = 5% profit 60 दिन में। Daily loss 5% max।

### Formula Pass Karne Ka
रोज़ 0.5% risk, 1:2 RR। रोज़ 1 trade। 16 winning trade = Challenge pass। Loss हो तो break लो, revenge नहीं।

### Example
$10,000 funded account = रोज़ $50 risk = 0.05 lot EUR/USD पर 20 pips SL।`,
      ar: `## $100 إلى حساب ممول - معادلة اجتياز التحدي

الآن لم تعد متداول تجزئة — أنت مستعد لتصبح متداول ممول.

### قاعدة التحدي
المرحلة 1 = 8% ربح في 30 يوماً، المرحلة 2 = 5% ربح في 60 يوماً. حد الخسارة اليومي 5% كحد أقصى.

### معادلة الاجتياز
مخاطرة يومية 0.5%، 1:2 RR. صفقة واحدة يومياً. 16 صفقة رابحة = اجتياز التحدي. خذ استراحة عند الخسارة، لا انتقام.

### مثال
حساب ممول $10,000 = مخاطرة يومية $50 = 0.05 لوت على EUR/USD بوقف 20 نقطة.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What is the Phase 1 profit target for a prop firm challenge?", ur: "Prop firm challenge کا Phase 1 profit target کیا ہے؟", hi: "Prop firm challenge का Phase 1 profit target क्या है?", ar: "ما هو هدف ربح المرحلة 1 لتحدي شركة التمويل؟" },
        options: [
          { en: "2% in 30 days", ur: "2% 30 دن میں", hi: "2% 30 दिन में", ar: "2% في 30 يوماً" },
          { en: "5% in 60 days", ur: "5% 60 دن میں", hi: "5% 60 दिन में", ar: "5% في 60 يوماً" },
          { en: "8% in 30 days", ur: "8% 30 دن میں", hi: "8% 30 दिन में", ar: "8% في 30 يوماً" },
          { en: "20% in 10 days", ur: "20% 10 دن میں", hi: "20% 10 दिन में", ar: "20% في 10 يوماً" },
        ],
        correctIndex: 2,
        explanation: { en: "Phase 1 = 8% profit in 30 days.", ur: "Phase 1 = 30 دن میں 8% profit۔", hi: "Phase 1 = 30 दिन में 8% profit।", ar: "المرحلة 1 = 8% ربح في 30 يوماً." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the Phase 2 profit target?", ur: "Phase 2 profit target کیا ہے؟", hi: "Phase 2 profit target क्या है?", ar: "ما هو هدف ربح المرحلة 2؟" },
        options: [
          { en: "8% in 30 days", ur: "8% 30 دن میں", hi: "8% 30 दिन में", ar: "8% في 30 يوماً" },
          { en: "5% in 60 days", ur: "5% 60 دن میں", hi: "5% 60 दिन में", ar: "5% في 60 يوماً" },
          { en: "10% in 90 days", ur: "10% 90 دن میں", hi: "10% 90 दिन में", ar: "10% في 90 يوماً" },
          { en: "15% in 10 days", ur: "15% 10 دن میں", hi: "15% 10 दिन में", ar: "15% في 10 يوماً" },
        ],
        correctIndex: 1,
        explanation: { en: "Phase 2 = 5% profit in 60 days — slower and easier.", ur: "Phase 2 = 60 دن میں 5% profit — آہستہ اور آسان۔", hi: "Phase 2 = 60 दिन में 5% profit — धीमा और आसान।", ar: "المرحلة 2 = 5% ربح في 60 يوماً — أبطأ وأسهل." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the maximum daily loss in a prop challenge?", ur: "Prop challenge میں maximum daily loss کیا ہے؟", hi: "Prop challenge में maximum daily loss क्या है?", ar: "ما هي أقصى خسارة يومية في تحدي التمويل؟" },
        options: [
          { en: "1%", ur: "1%", hi: "1%", ar: "1%" },
          { en: "5%", ur: "5%", hi: "5%", ar: "5%" },
          { en: "10%", ur: "10%", hi: "10%", ar: "10%" },
          { en: "20%", ur: "20%", hi: "20%", ar: "20%" },
        ],
        correctIndex: 1,
        explanation: { en: "Daily loss max = 5% — break this and you fail the challenge.", ur: "Daily loss max = 5% — اس سے تجاوز کرنے پر challenge fail۔", hi: "Daily loss max = 5% — इससे पार करने पर challenge fail।", ar: "أقصى خسارة يومية = 5% — تجاوزها تفشل في التحدي." },
      },
      {
        type: "MCQ",
        prompt: { en: "How many winning trades pass the challenge?", ur: "Challenge pass کرنے کے لیے کتنے winning trades چاہیے؟", hi: "Challenge pass करने के लिए कितने winning trades चाहिए?", ar: "كم صفقة رابحة تجتاز التحدي؟" },
        options: [
          { en: "5", ur: "5", hi: "5", ar: "5" },
          { en: "10", ur: "10", hi: "10", ar: "10" },
          { en: "16", ur: "16", hi: "16", ar: "16" },
          { en: "100", ur: "100", hi: "100", ar: "100" },
        ],
        correctIndex: 2,
        explanation: { en: "16 winning trades with 0.5% risk and 1:2 RR = challenge pass.", ur: "0.5% risk اور 1:2 RR کے ساتھ 16 winning trades = challenge pass۔", hi: "0.5% risk और 1:2 RR के साथ 16 winning trades = challenge pass।", ar: "16 صفقة رابحة بمخاطرة 0.5% و 1:2 RR = اجتياز التحدي." },
      },
      {
        type: "MCQ",
        prompt: { en: "On a $10,000 funded account, what is the daily risk amount?", ur: "$10,000 funded account پر daily risk amount کیا ہے؟", hi: "$10,000 funded account पर daily risk amount क्या है?", ar: "على حساب ممول $10,000، ما هو مبلغ المخاطرة اليومي؟" },
        options: [
          { en: "$5", ur: "$5", hi: "$5", ar: "$5" },
          { en: "$50", ur: "$50", hi: "$50", ar: "$50" },
          { en: "$500", ur: "$500", hi: "$500", ar: "$500" },
          { en: "$1000", ur: "$1000", hi: "$1000", ar: "$1000" },
        ],
        correctIndex: 1,
        explanation: { en: "$10,000 × 0.5% = $50 daily risk — small enough to survive losing streaks.", ur: "$10,000 × 0.5% = $50 daily risk — losing streaks سے بچنے کے لیے کافی چھوٹا۔", hi: "$10,000 × 0.5% = $50 daily risk — losing streaks से बचने के लिए काफी छोटा।", ar: "$10,000 × 0.5% = $50 مخاطرة يومية — صغير بما يكفي للنجاة من سلاسل الخسارة." },
      },
    ],
  },

  // ===== LESSON 45: Grand Final Test + Certificate =====
  {
    id: "eurusd-45",
    order: 16,
    title: {
      en: "Grand Final Test + ADVANCED SMC TRADER Certificate",
      ur: "Grand Final Test + ADVANCED SMC TRADER Certificate",
      hi: "ग्रैंड फाइनल टेस्ट + ADVANCED SMC TRADER Certificate",
      ar: "الاختبار النهائي الكبير + شهادة متداول SMC متقدم",
    },
    summary: {
      en: "Final test in 3 parts: 15 MCQ, 3 chart markings, 1 live plan. Pass at 80% to earn the certificate.",
      ur: "Final test 3 حصوں میں: 15 MCQ، 3 chart marking، 1 live plan۔ 80% پر certificate حاصل کریں۔",
      hi: "Final test 3 हिस्सों में: 15 MCQ, 3 chart marking, 1 live plan। 80% पर certificate पाएं।",
      ar: "الاختبار النهائي في 3 أجزاء: 15 سؤال، 3 تحديد رسم، خطة حية. اجتز بنسبة 80% للحصول على الشهادة.",
    },
    content: {
      en: `## Grand Final Test + ADVANCED SMC TRADER Certificate

Congratulations! This is your last lecture.

### Final Test Format - 3 Parts

**Part 1: Theory - 15 MCQ**
From OB, FVG, BOS, CHOCH, Liquidity, Kill Zone.

**Part 2: Chart Marking - 3 Charts**
I will give you EUR/USD charts, you need to mark OB, FVG, BSL, SSL.

**Part 3: Live Plan**
"If tomorrow in London session EUR/USD is Daily Bullish and Sell Side Liquidity was taken on H1, what will be your plan? Tell Entry, SL, TP."

### Passing: 80%
### Certificate: "ADVANCED SMC TRADER - Level 3"

### Next Step
Live Trading + Journal + Funded Account.`,
      ur: `## Grand Final Test + ADVANCED SMC TRADER Certificate

مبارک ہو! یہ آپ کا آخری lecture ہے۔

### Final Test Format - 3 Hisse

**Hissa 1: Theory - 15 MCQ**
OB, FVG, BOS, CHOCH, Liquidity, Kill Zone سے۔

**Hissa 2: Chart Marking - 3 Chart**
Me EUR/USD کا chart دونگا، آپ نے OB, FVG, BSL, SSL mark کرنا ہے۔

**Hissa 3: Live Plan**
"اگر کل London session میں EUR/USD Daily Bullish ہے اور H1 پر Sell Side Liquidity لی گئی ہے تو آپ کا plan کیا ہوگا؟ Entry, SL, TP بتاؤ۔"

### Passing: 80%
### Certificate: "ADVANCED SMC TRADER - Level 3"

### Next Step
Live Trading + Journal + Funded Account۔`,
      hi: `## ग्रैंड फाइनल टेस्ट + ADVANCED SMC TRADER Certificate

बधाई हो! यह आपका आखिरी lecture है।

### Final Test Format - 3 हिस्से

**हिस्सा 1: Theory - 15 MCQ**
OB, FVG, BOS, CHOCH, Liquidity, Kill Zone से।

**हिस्सा 2: Chart Marking - 3 Chart**
मैं EUR/USD का chart दूंगा, आपको OB, FVG, BSL, SSL mark करना है।

**हिस्सा 3: Live Plan**
"अगर कल London session में EUR/USD Daily Bullish है और H1 पर Sell Side Liquidity ली गई है तो आपका plan क्या होगा? Entry, SL, TP बताओ।"

### Passing: 80%
### Certificate: "ADVANCED SMC TRADER - Level 3"

### Next Step
Live Trading + Journal + Funded Account।`,
      ar: `## الاختبار النهائي الكبير + شهادة متداول SMC متقدم

مبروك! هذه محاضرتك الأخيرة.

### تنسيق الاختبار النهائي - 3 أجزاء

**الجزء 1: النظرية - 15 سؤال**
من OB، FVG، BOS، CHOCH، السيولة، منطقة القتل.

**الجزء 2: تحديد الرسم - 3 رسوم**
سأعطيك رسم EUR/USD، تحتاج إلى تحديد OB، FVG، BSL، SSL.

**الجزء 3: خطة حية**
"إذا غداً في جلسة لندن كان EUR/USD صاعداً يومياً وأُخذت سيولة جهة البيع على H1، فما هي خطتك؟ أخبر الدخول، وقف الخسارة، الهدف."

### النجاح: 80%
### الشهادة: "متداول SMC متقدم - المستوى 3"

### الخطوة التالية
تداول مباشر + يوميات + حساب ممول.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "How many parts are in the Final Test?", ur: "Final Test میں کتنے حصے ہیں؟", hi: "Final Test में कितने हिस्से हैं?", ar: "كم عدد أجزاء الاختبار النهائي؟" },
        options: [
          { en: "1 part", ur: "1 حصہ", hi: "1 हिस्सा", ar: "جزء واحد" },
          { en: "2 parts", ur: "2 حصے", hi: "2 हिस्से", ar: "جزءان" },
          { en: "3 parts", ur: "3 حصے", hi: "3 हिस्से", ar: "3 أجزاء" },
          { en: "5 parts", ur: "5 حصے", hi: "5 हिस्से", ar: "5 أجزاء" },
        ],
        correctIndex: 2,
        explanation: { en: "Final Test has 3 parts: Theory (15 MCQ), Chart Marking (3 charts), Live Plan.", ur: "Final Test کے 3 حصے ہیں: Theory (15 MCQ)، Chart Marking (3 charts)، Live Plan۔", hi: "Final Test के 3 हिस्से हैं: Theory (15 MCQ), Chart Marking (3 charts), Live Plan।", ar: "الاختبار النهائي 3 أجزاء: النظرية (15 سؤال)، تحديد الرسم (3 رسوم)، خطة حية." },
      },
      {
        type: "MCQ",
        prompt: { en: "How many MCQs are in Part 1 (Theory)?", ur: "Part 1 (Theory) میں کتنے MCQs ہیں؟", hi: "Part 1 (Theory) में कितने MCQs हैं?", ar: "كم سؤال في الجزء 1 (النظرية)؟" },
        options: [
          { en: "5", ur: "5", hi: "5", ar: "5" },
          { en: "10", ur: "10", hi: "10", ar: "10" },
          { en: "15", ur: "15", hi: "15", ar: "15" },
          { en: "50", ur: "50", hi: "50", ar: "50" },
        ],
        correctIndex: 2,
        explanation: { en: "Part 1 has 15 MCQs from OB, FVG, BOS, CHOCH, Liquidity, Kill Zone.", ur: "Part 1 میں 15 MCQs ہیں — OB, FVG, BOS, CHOCH, Liquidity, Kill Zone سے۔", hi: "Part 1 में 15 MCQs हैं — OB, FVG, BOS, CHOCH, Liquidity, Kill Zone से।", ar: "الجزء 1 به 15 سؤالاً من OB، FVG، BOS، CHOCH، السيولة، منطقة القتل." },
      },
      {
        type: "MCQ",
        prompt: { en: "How many charts are in Part 2 (Chart Marking)?", ur: "Part 2 (Chart Marking) میں کتنے charts ہیں؟", hi: "Part 2 (Chart Marking) में कितने charts हैं?", ar: "كم رسماً في الجزء 2 (تحديد الرسم)؟" },
        options: [
          { en: "1", ur: "1", hi: "1", ar: "1" },
          { en: "2", ur: "2", hi: "2", ar: "2" },
          { en: "3", ur: "3", hi: "3", ar: "3" },
          { en: "10", ur: "10", hi: "10", ar: "10" },
        ],
        correctIndex: 2,
        explanation: { en: "Part 2 has 3 charts — you mark OB, FVG, BSL, SSL on each.", ur: "Part 2 میں 3 charts ہیں — ہر ایک پر OB, FVG, BSL, SSL mark کریں۔", hi: "Part 2 में 3 charts हैं — हर एक पर OB, FVG, BSL, SSL mark करें।", ar: "الجزء 2 به 3 رسوم — تحدد OB، FVG، BSL، SSL على كل منها." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the passing percentage for the Final Test?", ur: "Final Test کا passing percentage کیا ہے؟", hi: "Final Test का passing percentage क्या है?", ar: "ما هي نسبة النجاح في الاختبار النهائي؟" },
        options: [
          { en: "50%", ur: "50%", hi: "50%", ar: "50%" },
          { en: "60%", ur: "60%", hi: "60%", ar: "60%" },
          { en: "80%", ur: "80%", hi: "80%", ar: "80%" },
          { en: "100%", ur: "100%", hi: "100%", ar: "100%" },
        ],
        correctIndex: 2,
        explanation: { en: "Passing = 80% — high bar because this is advanced level.", ur: "Passing = 80% — high standard کیونکہ یہ advanced level ہے۔", hi: "Passing = 80% — high standard क्योंकि यह advanced level है।", ar: "النجاح = 80% — معيار عالٍ لأن هذا مستوى متقدم." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the certificate name on passing?", ur: "Pass ہونے پر certificate کا نام کیا ہے؟", hi: "Pass होने पर certificate का नाम क्या है?", ar: "ما هو اسم الشهادة عند النجاح؟" },
        options: [
          { en: "Beginner Trader", ur: "Beginner Trader", hi: "Beginner Trader", ar: "متداول مبتدئ" },
          { en: "Forex Master", ur: "Forex Master", hi: "Forex Master", ar: "سيد الفوركس" },
          { en: "ADVANCED SMC TRADER - Level 3", ur: "ADVANCED SMC TRADER - Level 3", hi: "ADVANCED SMC TRADER - Level 3", ar: "متداول SMC متقدم - المستوى 3" },
          { en: "Crypto Expert", ur: "Crypto Expert", hi: "Crypto Expert", ar: "خبير عملات رقمية" },
        ],
        correctIndex: 2,
        explanation: { en: "Certificate = ADVANCED SMC TRADER - Level 3 — your advanced SMC qualification.", ur: "Certificate = ADVANCED SMC TRADER - Level 3 — آپ کی advanced SMC qualification۔", hi: "Certificate = ADVANCED SMC TRADER - Level 3 — आपकी advanced SMC qualification।", ar: "الشهادة = متداول SMC متقدم - المستوى 3 — مؤهلك المتقدم في SMC." },
      },
    ],
  },
]

export async function seedAdvancedLessons(db: PrismaClient) {
  // Get the Advanced category
  const advanced = await db.category.findUnique({ where: { slug: "advanced" } })
  if (!advanced) throw new Error("Advanced category not found — run main seed first")

  // Delete old advanced lessons + their quizzes/questions
  const oldLessons = await db.lesson.findMany({ where: { categoryId: advanced.id }, select: { id: true } })
  if (oldLessons.length > 0) {
    await db.lesson.deleteMany({ where: { id: { in: oldLessons.map((l) => l.id) } } })
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
