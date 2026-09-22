/* TradeSeekho Intermediate Lessons — 10 lessons (13-22) + 40 quiz questions
   Run via POST /api/admin/seed-intermediate (admin-gated)
   Adds Intermediate lessons: MA/EMA, RSI, MACD, Bollinger, Chart Patterns,
   Fibonacci, Price Action, Fundamental Analysis (News/Interest Rate/CPI). */
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
  // ===== LESSON 13: Moving Averages =====
  {
    id: "eurusd-13",
    order: 1,
    title: {
      en: "Moving Averages — MA & EMA | Catching the Trend",
      ur: "Moving Averages - MA, EMA | ٹرینڈ پکڑنا",
      hi: "मूविंग एवरेज - MA, EMA | ट्रेंड पकड़ना",
      ar: "المتوسطات المتحركة - MA و EMA | التقاط الاتجاه",
    },
    summary: {
      en: "Filter the noise and find the real market direction with SMA & EMA.",
      ur: "شور فلٹر کریں اور مارکیٹ کا اصل رخ SMA اور EMA سے پکڑیں۔",
      hi: "शोर को फ़िल्टर करें और SMA व EMA से बाज़ार की असली दिशा पकड़ें।",
      ar: "صفِّ الضوضاء واكتشف الاتجاه الحقيقي للسوق باستخدام SMA و EMA.",
    },
    content: {
      en: `## Moving Averages — MA & EMA

**Moving Average** means "average of price". It tells us the real direction of the market and filters out the noise.

### Two Main Types

**1. SMA = Simple Moving Average**
Adds up the prices of the last X candles and divides by X. It is slow.

**2. EMA = Exponential Moving Average**
Gives more weight to the latest price. It gives faster signals. Traders prefer EMA.

### Most Popular Settings
1. **EMA 50** = Short-term trend
2. **EMA 200** = Long-term trend. Also called the "Golden Line"

### Trend Rules
1. **Uptrend:** price is above EMA 200
2. **Downtrend:** price is below EMA 200
3. **Golden Cross:** EMA 50 cuts EMA 200 from below = Buy signal
4. **Death Cross:** EMA 50 cuts EMA 200 from above = Sell signal

### Example — EUR/USD 1H chart
Price is at 1.0980 and EMA 200 is also at 1.0980.
Price moves above EMA 200 and EMA 50 cuts EMA 200.
**Signal:** Buy opportunity. SL = 20 pips below EMA 200`,
      ur: `## Moving Averages - MA, EMA

Moving Average کا مطلب ہے "قیمت کی اوسط"۔ یہ ہمیں بتاتا ہے کہ مارکیٹ کا اصل رخ کیا ہے۔ شور فلٹر کر دیتا ہے۔

### 2 بڑی قسمیں

**1. SMA = Simple Moving Average**
گزشتہ X کینڈل کی قیمت کو جمع کر کے اوسط نکالتا ہے۔ سست ہوتا ہے۔

**2. EMA = Exponential Moving Average**
نئی قیمت کو زیادہ وزن دیتا ہے۔ تیز سگنل دیتا ہے۔ ٹریڈر EMA کو زیادہ پسند کرتے ہیں۔

### سب سے مشہور سیٹنگ
1. **EMA 50** = شارٹ ٹرم ٹرینڈ
2. **EMA 200** = لانگ ٹرم ٹرینڈ۔ اسے "Golden Line" بھی کہتے ہیں

### ٹرینڈ رول
1. **Uptrend:** قیمت EMA 200 کے اوپر ہو
2. **Downtrend:** قیمت EMA 200 کے نیچے ہو
3. **Golden Cross:** EMA 50، EMA 200 کو اوپر سے کاٹے = Buy سگنل
4. **Death Cross:** EMA 50، EMA 200 کو نیچے سے کاٹے = Sell سگنل

### مثال: EUR/USD 1H چارٹ
قیمت 1.0980 ہے اور EMA 200 بھی 1.0980 پر ہے۔
قیمت EMA 200 کے اوپر گئی اور EMA 50 نے EMA 200 کو کاٹا۔
**سگنل:** Buy کا موقع۔ SL = EMA 200 کے نیچے 20 Pips`,
      hi: `## मूविंग एवरेज - MA और EMA

**मूविंग एवरेज** का मतलब है "कीमत का औसत"। यह हमें बताता है कि बाज़ार का असली रुख क्या है। यह शोर को फ़िल्टर कर देता है।

### 2 मुख्य प्रकार

**1. SMA = Simple Moving Average**
पिछली X कैंडल की कीमत को जोड़कर औसत निकालता है। यह धीमा होता है।

**2. EMA = Exponential Moving Average**
नई कीमत को ज़्यादा वज़न देता है। तेज़ सिग्नल देता है। ट्रेडर EMA को ज़्यादा पसंद करते हैं।

### सबसे मशहूर सेटिंग
1. **EMA 50** = शॉर्ट टर्म ट्रेंड
2. **EMA 200** = लॉन्ग टर्म ट्रेंड। इसे "Golden Line" भी कहते हैं

### ट्रेंड नियम
1. **Uptrend:** कीमत EMA 200 के ऊपर हो
2. **Downtrend:** कीमत EMA 200 के नीचे हो
3. **Golden Cross:** EMA 50, EMA 200 को ऊपर से काटे = Buy सिग्नल
4. **Death Cross:** EMA 50, EMA 200 को नीचे से काटे = Sell सिग्नल

### उदाहरण: EUR/USD 1H चार्ट
कीमत 1.0980 है और EMA 200 भी 1.0980 पर है।
कीमत EMA 200 के ऊपर गई और EMA 50 ने EMA 200 को काटा।
**सिग्नल:** Buy का मौका। SL = EMA 200 के नीचे 20 Pips`,
      ar: `## المتوسطات المتحركة - MA و EMA

**المتوسط المتحرك** يعني "متوسط السعر". يخبرنا بالاتجاه الحقيقي للسوق ويرشح الضوضاء.

### نوعان رئيسيان

**1. SMA = المتوسط المتحرك البسيط**
يجمع أسعار آخر X شموع ويقسم على X. بطيء.

**2. EMA = المتوسط المتحرك الأسي**
يعطي وزناً أكبر للسعر الأخير. يعطي إشارات أسرع. يفضله المتداولون.

### أشهر الإعدادات
1. **EMA 50** = اتجاه قصير المدى
2. **EMA 200** = اتجاه طويل المدى. يسمى أيضاً "الخط الذهبي"

### قواعد الاتجاه
1. **صاعد:** السعر فوق EMA 200
2. **هابط:** السعر تحت EMA 200
3. **التقاطع الذهبي:** EMA 50 يقطع EMA 200 من الأسفل = إشارة شراء
4. **تقاطع الموت:** EMA 50 يقطع EMA 200 من الأعلى = إشارة بيع

### مثال: EUR/USD رسم 1S
السعر عند 1.0980 و EMA 200 أيضاً عند 1.0980.
السعر صعد فوق EMA 200 و EMA 50 قطع EMA 200.
**الإشارة:** فرصة شراء. SL = 20 نقطة تحت EMA 200`,
    },
    durationMin: 6,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What is the difference between EMA and SMA?", ur: "EMA اور SMA میں فرق کیا ہے؟", hi: "EMA और SMA में अंतर क्या है?", ar: "ما الفرق بين EMA و SMA؟" },
        options: [
          { en: "EMA is slow, SMA is fast", ur: "EMA سست ہے، SMA تیز ہے", hi: "EMA धीमा है, SMA तेज़ है", ar: "EMA بطيء، SMA سريع" },
          { en: "EMA gives more weight to the latest price", ur: "EMA نئی قیمت کو زیادہ وزن دیتا ہے", hi: "EMA नई कीमत को ज़्यादा वज़न देता है", ar: "EMA يعطي وزناً أكبر للسعر الجديد" },
          { en: "Both are the same", ur: "دونوں ایک جیسے ہیں", hi: "दोनों एक जैसे हैं", ar: "كلاهما متساوي" },
          { en: "EMA only works on Daily chart", ur: "EMA صرف Daily پر کام کرتا ہے", hi: "EMA केवल Daily पर काम करता है", ar: "EMA يعمل فقط على الديلي" },
        ],
        correctIndex: 1,
        explanation: { en: "EMA gives more weight to the latest price, so it reacts faster than SMA.", ur: "EMA نئی قیمت کو زیادہ وزن دیتا ہے، اس لیے SMA سے تیز ردعمل دیتا ہے۔", hi: "EMA नई कीमत को ज़्यादा वज़न देता है, इसलिए SMA से तेज़ प्रतिक्रिया देता है।", ar: "EMA يعطي وزناً أكبر للسعر الجديد، لذا يتفاعل أسرع من SMA." },
      },
      {
        type: "MCQ",
        prompt: { en: "Which EMA is called the 'Golden Line'?", ur: "Golden Line کس EMA کو کہتے ہیں؟", hi: "Golden Line किस EMA को कहते हैं?", ar: "أي EMA يسمى الخط الذهبي؟" },
        options: [
          { en: "EMA 20", ur: "EMA 20", hi: "EMA 20", ar: "EMA 20" },
          { en: "EMA 50", ur: "EMA 50", hi: "EMA 50", ar: "EMA 50" },
          { en: "EMA 200", ur: "EMA 200", hi: "EMA 200", ar: "EMA 200" },
          { en: "EMA 100", ur: "EMA 100", hi: "EMA 100", ar: "EMA 100" },
        ],
        correctIndex: 2,
        explanation: { en: "EMA 200 is called the Golden Line — it shows the long-term trend.", ur: "EMA 200 کو Golden Line کہتے ہیں — یہ لانگ ٹرم ٹرینڈ دکھاتا ہے۔", hi: "EMA 200 को Golden Line कहते हैं — यह लॉन्ग टर्म ट्रेंड दिखाता है।", ar: "EMA 200 يسمى الخط الذهبي — يظهر الاتجاه طويل المدى." },
      },
      {
        type: "MCQ",
        prompt: { en: "What does a Golden Cross mean?", ur: "Golden Cross کا مطلب کیا ہے؟", hi: "Golden Cross का मतलब क्या है?", ar: "ماذا يعني التقاطع الذهبي؟" },
        options: [
          { en: "EMA 200 cuts EMA 50", ur: "EMA 200، EMA 50 کو کاٹے", hi: "EMA 200, EMA 50 को काटे", ar: "EMA 200 يقطع EMA 50" },
          { en: "EMA 50 cuts EMA 200 from above = Sell", ur: "EMA 50، EMA 200 کو اوپر سے کاٹے = Sell", hi: "EMA 50, EMA 200 को ऊपर से काटे = Sell", ar: "EMA 50 يقطع EMA 200 من الأعلى = بيع" },
          { en: "Price goes below EMA", ur: "قیمت EMA کے نیچے جائے", hi: "कीमत EMA के नीचे जाए", ar: "السعر ينزل تحت EMA" },
          { en: "Market closes", ur: "مارکیٹ بند ہو جائے", hi: "बाज़ार बंद हो जाए", ar: "السوق يغلق" },
        ],
        correctIndex: 1,
        explanation: { en: "Golden Cross = EMA 50 cuts EMA 200 from above = Sell signal.", ur: "Golden Cross = EMA 50 کا EMA 200 کو اوپر سے کاٹنا = Sell سگنل۔", hi: "Golden Cross = EMA 50 का EMA 200 को ऊपर से काटना = Sell सिग्नल।", ar: "التقاطع الذهبي = EMA 50 يقطع EMA 200 من الأعلى = إشارة بيع." },
      },
      {
        type: "MCQ",
        prompt: { en: "If price is above EMA 200, the market is…", ur: "اگر قیمت EMA 200 کے اوپر ہے تو مارکیٹ؟", hi: "अगर कीमत EMA 200 के ऊपर है तो बाज़ार?", ar: "إذا كان السعر فوق EMA 200، فالسوق…؟" },
        options: [
          { en: "Downtrend", ur: "Downtrend", hi: "Downtrend", ar: "هابط" },
          { en: "Uptrend", ur: "Uptrend", hi: "Uptrend", ar: "صاعد" },
          { en: "Sideways", ur: "Sideways", hi: "Sideways", ar: "عرضي" },
          { en: "Closed", ur: "بند", hi: "बंद", ar: "مغلق" },
        ],
        correctIndex: 1,
        explanation: { en: "Price above EMA 200 = Uptrend (long-term bullish).", ur: "قیمت EMA 200 کے اوپر = Uptrend (لانگ ٹرم بولش)۔", hi: "कीमत EMA 200 के ऊपर = Uptrend (लॉन्ग टर्म बुलिश)।", ar: "السعر فوق EMA 200 = صاعد (طويل المدى)." },
      },
      {
        type: "MCQ",
        prompt: { en: "EUR/USD at 1.1000, EMA 50 cuts EMA 200 upward. Signal?", ur: "EUR/USD 1.1000 پر ہے۔ EMA 50 نے EMA 200 کو اوپر کاٹا۔ سگنل؟", hi: "EUR/USD 1.1000 पर है। EMA 50 ने EMA 200 को ऊपर काटा। सिग्नल?", ar: "EUR/USD عند 1.1000، EMA 50 قطع EMA 200 صعوداً. الإشارة؟" },
        options: [
          { en: "Sell", ur: "Sell", hi: "Sell", ar: "بيع" },
          { en: "Buy", ur: "Buy", hi: "Buy", ar: "شراء" },
          { en: "Hold", ur: "Hold", hi: "Hold", ar: "انتظار" },
          { en: "No signal", ur: "کوئی سگنل نہیں", hi: "कोई सिग्नल नहीं", ar: "بلا إشارة" },
        ],
        correctIndex: 1,
        explanation: { en: "EMA 50 cutting EMA 200 upward = Golden Cross = Buy signal.", ur: "EMA 50 کا EMA 200 کو اوپر کاٹنا = Golden Cross = Buy سگنل۔", hi: "EMA 50 का EMA 200 को ऊपर काटना = Golden Cross = Buy सिग्नल।", ar: "EMA 50 يقطع EMA 200 صعوداً = تقاطع ذهبي = إشارة شراء." },
      },
    ],
  },

  // ===== LESSON 14: RSI =====
  {
    id: "eurusd-14",
    order: 2,
    title: {
      en: "RSI Indicator | Overbought & Oversold",
      ur: "RSI Indicator | Overbought & Oversold",
      hi: "RSI इंडिकेटर | ओवरबॉट और ओवरसोल्ड",
      ar: "مؤشر RSI | الإفراط في الشراء والبيع",
    },
    summary: {
      en: "Find out if price was bought too much or sold too much — RSI 0 to 100.",
      ur: "جانیں قیمت زیادہ خریدی گئی یا زیادہ بیچی گئی — RSI 0 سے 100۔",
      hi: "जानें कीमत ज़्यादा खरीदी गई या ज़्यादा बेची गई — RSI 0 से 100।",
      ar: "اكتشف إن كان السعر اشتري كثيراً أو بيع كثيراً — RSI من 0 إلى 100.",
    },
    content: {
      en: `## RSI Indicator | Overbought & Oversold

**RSI = Relative Strength Index.** It tells us whether price was "overbought" or "oversold".
Range: 0 to 100.

### 3 Zones
1. **0 – 30 = Oversold zone** = price fell too much. Reversal or Buy opportunity
2. **30 – 70 = Neutral zone** = normal market
3. **70 – 100 = Overbought zone** = price went too high. Reversal or Sell opportunity

### RSI Setting
Leave the default at **14**.

### 2 Important Signals

**1. Divergence**
Price makes a new Low but RSI makes a higher Low = Buy signal

**2. 50 Line Cross**
RSI goes above 50 = Bullish. Below 50 = Bearish

### Example — EUR/USD
\`EUR/USD\` reaches 1.1050 Resistance. RSI is at 82 = Overbought.
At the same time price makes a new High but RSI does NOT = Bearish Divergence.
**Signal:** Sell opportunity. TP = next Support 1.1000`,
      ur: `## RSI Indicator | Overbought & Oversold

RSI = Relative Strength Index۔ یہ بتاتا ہے قیمت "زیادہ خریدی" گئی ہے یا "زیادہ بیچی" گئی ہے۔
رینج: 0 سے 100 تک

### 3 زون
1. **0 - 30 = Oversold زون** = قیمت بہت گر گئی۔ ریورسل یا Buy کا موقع
2. **30 - 70 = Neutral زون** = نارمل مارکیٹ
3. **70 - 100 = Overbought زون** = قیمت بہت اوپر چلی گئی۔ ریورسل یا Sell کا موقع

### RSI کی سیٹنگ
14 ڈیفالٹ رہنے دیں۔

### 2 اہم سگنل

**1. Divergence = ڈائیورجنس**
قیمت نیا Low بنا رہی ہو لیکن RSI اونچا Low بنا رہا ہو = Buy سگنل

**2. 50 لائن کراس**
RSI 50 کے اوپر جائے = Bullish۔ نیچے جائے = Bearish

### مثال: EUR/USD
\`EUR/USD\` 1.1050 Resistance پر گیا۔ RSI 82 پر ہے = Overbought
ساتھ ہی قیمت نے نیا High بنایا لیکن RSI نے نیا High نہیں بنایا = Bearish Divergence
**سگنل:** Sell کا موقع۔ TP = اگلی Support 1.1000`,
      hi: `## RSI इंडिकेटर | ओवरबॉट और ओवरसोल्ड

**RSI = Relative Strength Index।** यह बताता है कीमत "ज़्यादा खरीदी" गई या "ज़्यादा बेची" गई।
रेंज: 0 से 100।

### 3 ज़ोन
1. **0 – 30 = ओवरसोल्ड ज़ोन** = कीमत बहुत गिर गई। रिवर्सल या Buy मौका
2. **30 – 70 = न्यूट्रल ज़ोन** = सामान्य बाज़ार
3. **70 – 100 = ओवरबॉट ज़ोन** = कीमत बहुत ऊपर चली गई। रिवर्सल या Sell मौका

### RSI की सेटिंग
14 डिफ़ॉल्ट रहने दें।

### 2 ज़रूरी सिग्नल

**1. Divergence = डाइवर्जेंस**
कीमत नया Low बना रही हो लेकिन RSI ऊपर वाला Low बना रहा हो = Buy सिग्नल

**2. 50 लाइन क्रॉस**
RSI 50 के ऊपर जाए = Bullish। नीचे जाए = Bearish

### उदाहरण: EUR/USD
\`EUR/USD\` 1.1050 Resistance पर पहुँचा। RSI 82 पर है = ओवरबॉट
साथ ही कीमत ने नया High बनाया लेकिन RSI ने नया High नहीं बनाया = Bearish Divergence
**सिग्नल:** Sell का मौका। TP = अगली Support 1.1000`,
      ar: `## مؤشر RSI | الإفراط في الشراء والبيع

**RSI = مؤشر القوة النسبية.** يخبرنا إن كان السعر "اشتري كثيراً" أو "بيع كثيراً".
النطاق: من 0 إلى 100.

### 3 مناطق
1. **0 – 30 = منطقة بيع مفرط** = السعر هبط كثيراً. انعكاس أو فرصة شراء
2. **30 – 70 = منطقة محايدة** = سوق عادي
3. **70 – 100 = منطقة شراء مفرط** = السعر ارتفع كثيراً. انعكاس أو فرصة بيع

### إعداد RSI
اترك الافتراضي عند **14**.

### إشارتان مهمتان

**1. التباعد**
السعر يصنع قاعًا جديداً لكن RSI يصنع قاعاً أعلى = إشارة شراء

**2. عبور خط 50**
RSI فوق 50 = صعودي. تحت 50 = هبوطي

### مثال: EUR/USD
\`EUR/USD\` وصل إلى مقاومة 1.1050. RSI عند 82 = شراء مفرط.
في نفس الوقت السعر صنع قمة جديدة لكن RSI لم يصنع = تباعد هبوطي.
**الإشارة:** فرصة بيع. الهدف = الدعم التالي 1.1000`,
    },
    durationMin: 6,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What is RSI's range?", ur: "RSI کی رینج کیا ہے؟", hi: "RSI की रेंज क्या है?", ar: "ما هو نطاق RSI؟" },
        options: [
          { en: "0 to 50", ur: "0 سے 50", hi: "0 से 50", ar: "0 إلى 50" },
          { en: "0 to 100", ur: "0 سے 100", hi: "0 से 100", ar: "0 إلى 100" },
          { en: "-100 to +100", ur: "-100 سے +100", hi: "-100 से +100", ar: "-100 إلى +100" },
          { en: "10 to 90", ur: "10 سے 90", hi: "10 से 90", ar: "10 إلى 90" },
        ],
        correctIndex: 1,
        explanation: { en: "RSI ranges from 0 to 100.", ur: "RSI کی رینج 0 سے 100 تک ہے۔", hi: "RSI की रेंज 0 से 100 तक है।", ar: "نطاق RSI من 0 إلى 100." },
      },
      {
        type: "MCQ",
        prompt: { en: "RSI at 80 — which zone is this?", ur: "RSI 80 پر ہے تو یہ کون سا زون ہے؟", hi: "RSI 80 पर है तो यह कौन सा ज़ोन है?", ar: "RSI عند 80 — أي منطقة هذه؟" },
        options: [
          { en: "Oversold", ur: "Oversold", hi: "ओवरसोल्ड", ar: "بيع مفرط" },
          { en: "Neutral", ur: "Neutral", hi: "न्यूट्रल", ar: "محايد" },
          { en: "Overbought", ur: "Overbought", hi: "ओवरबॉट", ar: "شراء مفرط" },
          { en: "Breakout", ur: "Breakout", hi: "ब्रेकआउट", ar: "اختراق" },
        ],
        correctIndex: 2,
        explanation: { en: "RSI 70-100 = Overbought zone (price too high, possible reversal).", ur: "RSI 70-100 = Overbought زون (قیمت بہت اوپر، ریورسل ممکن)۔", hi: "RSI 70-100 = ओवरबॉट ज़ोन (कीमत बहुत ऊपर, रिवर्सल संभव)।", ar: "RSI 70-100 = منطقة شراء مفرط (السعر مرتفع جداً، انعكاس محتمل)." },
      },
      {
        type: "MCQ",
        prompt: { en: "When does Bearish Divergence form?", ur: "Bearish Divergence کب بنتی ہے؟", hi: "Bearish Divergence कब बनती है?", ar: "متى يتشكل التباعد الهبوطي؟" },
        options: [
          { en: "Price makes Low, RSI makes High", ur: "قیمت Low بنائے، RSI High بنائے", hi: "कीमत Low बनाए, RSI High बनाए", ar: "السعر قاع، RSI قمة" },
          { en: "Price makes High, RSI does not make High", ur: "قیمت High بنائے، RSI High نہ بنائے", hi: "कीमत High बनाए, RSI High न बनाए", ar: "السعر قمة، RSI لا يصنع قمة" },
          { en: "RSI crosses 50", ur: "RSI 50 کراس کرے", hi: "RSI 50 क्रॉस करे", ar: "RSI يقطع 50" },
          { en: "RSI goes below 30", ur: "RSI 30 سے نیچے جائے", hi: "RSI 30 से नीचे जाए", ar: "RSI ينزل تحت 30" },
        ],
        correctIndex: 1,
        explanation: { en: "Bearish Divergence = price makes new High but RSI does NOT = Sell signal.", ur: "Bearish Divergence = قیمت نیا High بنائے لیکن RSI نہ بنائے = Sell سگنل۔", hi: "Bearish Divergence = कीमत नया High बनाए लेकिन RSI न बनाए = Sell सिग्नल।", ar: "التباعد الهبوطي = السعر قمة جديدة لكن RSI لا = إشارة بيع." },
      },
      {
        type: "MCQ",
        prompt: { en: "RSI at 25 — what should you do?", ur: "RSI 25 پر ہے تو کیا کرنا چاہیے؟", hi: "RSI 25 पर है तो क्या करना चाहिए?", ar: "RSI عند 25 — ماذا تفعل؟" },
        options: [
          { en: "Sell", ur: "Sell", hi: "Sell", ar: "بيع" },
          { en: "Look for Buy opportunity", ur: "Buy کا موقع دیکھیں", hi: "Buy का मौका देखें", ar: "ابحث عن فرصة شراء" },
          { en: "Do nothing", ur: "کچھ نہ کریں", hi: "कुछ न करें", ar: "لا تفعل شيئاً" },
          { en: "Increase lot size", ur: "Lot بڑھا دیں", hi: "Lot बढ़ा दें", ar: "زد حجم الصفقة" },
        ],
        correctIndex: 1,
        explanation: { en: "RSI 0-30 = Oversold = price fell too much = look for Buy (reversal).", ur: "RSI 0-30 = Oversold = قیمت بہت گر گئی = Buy کا موقع دیکھیں (ریورسل)۔", hi: "RSI 0-30 = ओवरसोल्ड = कीमत बहुत गिरी = Buy का मौका देखें (रिवर्सल)।", ar: "RSI 0-30 = بيع مفرط = السعر هبط كثيراً = ابحث عن شراء (انعكاس)." },
      },
      {
        type: "MCQ",
        prompt: { en: "What does the RSI 50 line mean?", ur: "RSI 50 لائن کا کیا مطلب ہے؟", hi: "RSI 50 लाइन का क्या मतलब है?", ar: "ماذا يعني خط RSI 50؟" },
        options: [
          { en: "Overbought", ur: "Overbought", hi: "ओवरबॉट", ar: "شراء مفرط" },
          { en: "Oversold", ur: "Oversold", hi: "ओवरसोल्ड", ar: "بيع مفرط" },
          { en: "Bullish/Bearish dividing line", ur: "Bullish/Bearish کی تقسیم لائن", hi: "Bullish/Bearish का विभाजन रेखा", ar: "خط فصل صعودي/هبوطي" },
          { en: "TP level", ur: "TP لیول", hi: "TP लेवल", ar: "مستوى الهدف" },
        ],
        correctIndex: 2,
        explanation: { en: "RSI 50 = dividing line. Above 50 = Bullish, below 50 = Bearish.", ur: "RSI 50 = تقسیم لائن۔ 50 کے اوپر = Bullish، نیچے = Bearish۔", hi: "RSI 50 = विभाजन रेखा। 50 के ऊपर = Bullish, नीचे = Bearish।", ar: "RSI 50 = خط فصل. فوق 50 = صعودي، تحت 50 = هبوطي." },
      },
    ],
  },

  // ===== LESSON 15: MACD =====
  {
    id: "eurusd-15",
    order: 3,
    title: {
      en: "MACD Indicator | Momentum Strategy",
      ur: "MACD Indicator | Momentum Strategy",
      hi: "MACD इंडिकेटर | मोमेंटम स्ट्रेटेजी",
      ar: "مؤشر MACD | استراتيجية الزخم",
    },
    summary: {
      en: "MACD checks both momentum and trend in one indicator.",
      ur: "MACD ایک ہی انڈیکیٹر میں Momentum اور ٹرینڈ دونوں چیک کرتا ہے۔",
      hi: "MACD एक ही इंडिकेटर में मोमेंटम और ट्रेंड दोनों जाँचता है।",
      ar: "MACD يفحص الزخم والاتجاه معاً في مؤشر واحد.",
    },
    content: {
      en: `## MACD Indicator | Momentum Strategy

**MACD = Moving Average Convergence Divergence.** It checks both momentum and trend.

### 3 Parts of MACD
1. **MACD Line** = blue line
2. **Signal Line** = red line
3. **Histogram** = bars going up and down

### Setting
Default **12, 26, 9**

### 3 Big Signals

**1. Crossover**
MACD Line cuts Signal Line from below = Buy
MACD Line cuts Signal Line from above = Sell

**2. Zero Line Cross**
MACD line goes above 0 = Uptrend starts
MACD line goes below 0 = Downtrend starts

**3. Divergence**
Like RSI. Price makes a High but MACD does not = Reversal

### Example — EUR/USD 4H chart
Price is above EMA 200 = Uptrend.
MACD Line cuts Signal Line and Histogram goes up.
**Signal:** Buy confirmed. TP = next Resistance`,
      ur: `## MACD Indicator | Momentum Strategy

MACD = Moving Average Convergence Divergence۔ یہ Momentum اور ٹرینڈ دونوں چیک کرتا ہے۔

### MACD کے 3 حصے
1. **MACD Line** = نیلی لکیر
2. **Signal Line** = سرخ لکیر
3. **Histogram** = اوپر نیچے والے بار

### سیٹنگ
12, 26, 9 ڈیفالٹ

### 3 بڑے سگنل

**1. Crossover**
MACD Line، Signal Line کو نیچے سے اوپر کاٹے = Buy
MACD Line، Signal Line کو اوپر سے نیچے کاٹے = Sell

**2. Zero Line Cross**
MACD لائن 0 کے اوپر جائے = Uptrend شروع
MACD لائن 0 کے نیچے جائے = Downtrend شروع

**3. Divergence**
RSI کی طرح۔ قیمت High بنا رہی، MACD نہیں = ریورسل

### مثال: EUR/USD 4H چارٹ
قیمت EMA 200 کے اوپر ہے = Uptrend
MACD Line نے Signal Line کو کاٹا اور Histogram اوپر گیا
**سگنل:** Buy کی تصدیق۔ TP = اگلی Resistance`,
      hi: `## MACD इंडिकेटर | मोमेंटम स्ट्रेटेजी

**MACD = Moving Average Convergence Divergence।** यह मोमेंटम और ट्रेंड दोनों जाँचता है।

### MACD के 3 हिस्से
1. **MACD Line** = नीली लाइन
2. **Signal Line** = लाल लाइन
3. **Histogram** = ऊपर नीचे वाली बार

### सेटिंग
12, 26, 9 डिफ़ॉल्ट

### 3 बड़े सिग्नल

**1. Crossover**
MACD Line, Signal Line को नीचे से ऊपर काटे = Buy
MACD Line, Signal Line को ऊपर से नीचे काटे = Sell

**2. Zero Line Cross**
MACD लाइन 0 के ऊपर जाए = Uptrend शुरू
MACD लाइन 0 के नीचे जाए = Downtrend शुरू

**3. Divergence**
RSI की तरह। कीमत High बना रही, MACD नहीं = रिवर्सल

### उदाहरण: EUR/USD 4H चार्ट
कीमत EMA 200 के ऊपर है = Uptrend
MACD Line ने Signal Line को काटा और Histogram ऊपर गया
**सिग्नल:** Buy की पुष्टि। TP = अगली Resistance`,
      ar: `## مؤشر MACD | استراتيجية الزخم

**MACD = تقارب وتباعد المتوسط المتحرك.** يفحص الزخم والاتجاه معاً.

### 3 أجزاء من MACD
1. **خط MACD** = الخط الأزرق
2. **خط الإشارة** = الخط الأحمر
3. **الهيستوغرام** = أعمدة صاعدة وهابطة

### الإعداد
الافتراضي **12, 26, 9**

### 3 إشارات كبيرة

**1. التقاطع**
خط MACD يقطع خط الإشارة من الأسفل = شراء
خط MACD يقطع خط الإشارة من الأعلى = بيع

**2. عبور خط الصفر**
خط MACD فوق 0 = بداية اتجاه صاعد
خط MACD تحت 0 = بداية اتجاه هابط

**3. التباعد**
مثل RSI. السعر يصنع قمة لكن MACD لا = انعكاس

### مثال: EUR/USD رسم 4س
السعر فوق EMA 200 = اتجاه صاعد.
خط MACD قطع خط الإشارة والهيستوغرام صعد.
**الإشارة:** تأكيد شراء. الهدف = المقاومة التالية`,
    },
    durationMin: 6,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "How many lines + Histogram does MACD have?", ur: "MACD میں کتنی لائنیں + Histogram ہوتے ہیں؟", hi: "MACD में कितनी लाइनें + Histogram होते हैं?", ar: "كم عدد الخطوط + الهيستوغرام في MACD؟" },
        options: [
          { en: "1 line", ur: "1 لائن", hi: "1 लाइन", ar: "خط واحد" },
          { en: "2 lines + Histogram", ur: "2 لائن + Histogram", hi: "2 लाइनें + Histogram", ar: "خطان + هيستوغرام" },
          { en: "3 lines", ur: "3 لائن", hi: "3 लाइनें", ar: "3 خطوط" },
          { en: "Only Histogram", ur: "صرف Histogram", hi: "सिर्फ़ Histogram", ar: "فقط هيستوغرام" },
        ],
        correctIndex: 1,
        explanation: { en: "MACD = MACD Line + Signal Line + Histogram (2 lines + Histogram).", ur: "MACD = MACD Line + Signal Line + Histogram (2 لائنیں + Histogram)۔", hi: "MACD = MACD Line + Signal Line + Histogram (2 लाइनें + Histogram)।", ar: "MACD = خط MACD + خط الإشارة + الهيستوغرام (خطان + هيستوغرام)." },
      },
      {
        type: "MCQ",
        prompt: { en: "When does MACD give a Buy signal?", ur: "MACD Buy سگنل کب ملتا ہے؟", hi: "MACD Buy सिग्नल कब मिलता है?", ar: "متى يعطي MACD إشارة شراء؟" },
        options: [
          { en: "MACD cuts Signal from above", ur: "MACD، Signal کو اوپر سے کاٹے", hi: "MACD, Signal को ऊपर से काटे", ar: "MACD يقطع الإشارة من الأعلى" },
          { en: "MACD cuts Signal from below", ur: "MACD، Signal کو نیچے سے کاٹے", hi: "MACD, Signal को नीचे से काटे", ar: "MACD يقطع الإشارة من الأسفل" },
          { en: "Histogram goes down", ur: "Histogram نیچے جائے", hi: "Histogram नीचे जाए", ar: "الهيستوغرام يهبط" },
          { en: "MACD goes below 0", ur: "MACD 0 سے نیچے جائے", hi: "MACD 0 से नीचे जाए", ar: "MACD يهبط تحت 0" },
        ],
        correctIndex: 1,
        explanation: { en: "MACD cutting Signal from below = Buy signal.", ur: "MACD کا Signal کو نیچے سے کاٹنا = Buy سگنل۔", hi: "MACD का Signal को नीचे से काटना = Buy सिग्नल।", ar: "قطع MACD لخط الإشارة من الأسفل = إشارة شراء." },
      },
      {
        type: "MCQ",
        prompt: { en: "If MACD line is above 0, then?", ur: "MACD لائن 0 کے اوپر ہے تو؟", hi: "MACD लाइन 0 के ऊपर है तो?", ar: "إذا كان خط MACD فوق 0 فـ؟" },
        options: [
          { en: "Downtrend", ur: "Downtrend", hi: "Downtrend", ar: "اتجاه هابط" },
          { en: "Uptrend", ur: "Uptrend", hi: "Uptrend", ar: "اتجاه صاعد" },
          { en: "Sideways", ur: "Sideways", hi: "Sideways", ar: "عرضي" },
          { en: "News", ur: "News", hi: "News", ar: "أخبار" },
        ],
        correctIndex: 1,
        explanation: { en: "MACD above 0 = Uptrend (bullish momentum).", ur: "MACD 0 کے اوپر = Uptrend (بولش Momentum)۔", hi: "MACD 0 के ऊपर = Uptrend (बुलिश Momentum)।", ar: "MACD فوق 0 = اتجاه صاعد (زخم صاعد)." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the default setting of MACD?", ur: "MACD کی ڈیفالٹ سیٹنگ کیا ہے؟", hi: "MACD की डिफ़ॉल्ट सेटिंग क्या है?", ar: "ما هو الإعداد الافتراضي لـ MACD؟" },
        options: [
          { en: "14, 14, 14", ur: "14, 14, 14", hi: "14, 14, 14", ar: "14, 14, 14" },
          { en: "12, 26, 9", ur: "12, 26, 9", hi: "12, 26, 9", ar: "12, 26, 9" },
          { en: "20, 2, 2", ur: "20, 2, 2", hi: "20, 2, 2", ar: "20, 2, 2" },
          { en: "50, 200, 9", ur: "50, 200, 9", hi: "50, 200, 9", ar: "50, 200, 9" },
        ],
        correctIndex: 1,
        explanation: { en: "MACD default = 12, 26, 9.", ur: "MACD ڈیفالٹ = 12, 26, 9۔", hi: "MACD डिफ़ॉल्ट = 12, 26, 9।", ar: "MACD الافتراضي = 12, 26, 9." },
      },
      {
        type: "MCQ",
        prompt: { en: "If both MACD + EMA 200 give Buy, then?", ur: "MACD + EMA 200 دونوں Buy دے رہے ہوں تو؟", hi: "MACD + EMA 200 दोनों Buy दे रहे हों तो?", ar: "إذا أعطى كلٌ من MACD + EMA 200 إشارة Buy فـ؟" },
        options: [
          { en: "Weak signal", ur: "سگنل کمزور ہے", hi: "सिग्नल कमज़ोर है", ar: "إشارة ضعيفة" },
          { en: "Strong confirmed signal", ur: "سگنل طاقتور تصدیق ہے", hi: "सिग्नल मज़बूत पुष्टि है", ar: "إشارة قوية مؤكدة" },
          { en: "Don't take trade", ur: "Trade نہ لیں", hi: "Trade न लें", ar: "لا تتداول" },
          { en: "Only Sell", ur: "صرف Sell", hi: "सिर्फ़ Sell", ar: "فقط بيع" },
        ],
        correctIndex: 1,
        explanation: { en: "MACD + EMA 200 both Buy = strong confirmation (Confluence).", ur: "MACD + EMA 200 دونوں Buy = طاقتور تصدیق (Confluence)۔", hi: "MACD + EMA 200 दोनों Buy = मज़बूत पुष्टि (Confluence)।", ar: "MACD + EMA 200 كلاهما Buy = تأكيد قوي (Confluence)." },
      },
    ],
  },

  // ===== LESSON 16: Bollinger Bands =====
  {
    id: "eurusd-16",
    order: 4,
    title: {
      en: "Bollinger Bands | Volatility Trade",
      ur: "Bollinger Bands | Volatility Trade",
      hi: "बोलिंगर बैंड्स | वोलैटिलिटी ट्रेड",
      ar: "بولينجر باند | تداول التقلب",
    },
    summary: {
      en: "3 bands that show market volatility and big breakouts.",
      ur: "3 بینڈ جو مارکیٹ کی Volatility اور بڑے Breakout دکھاتے ہیں۔",
      hi: "3 बैंड जो बाज़ार की वोलैटिलिटी और बड़े ब्रेकआउट दिखाते हैं।",
      ar: "3 فرقانات تُظهر تقلب السوق والاختراقات الكبيرة.",
    },
    content: {
      en: `## Bollinger Bands | Volatility Trade

**Bollinger Bands** consist of 3 lines. They show how much volatility is in the market.

### 3 Lines
1. **Middle Band** = EMA 20
2. **Upper Band** = EMA 20 + 2× Standard Deviation
3. **Lower Band** = EMA 20 − 2× Standard Deviation

### Setting
Default **20, 2**

### 3 Rules

**1. Squeeze**
When all 3 bands come close together = a big move is coming. Wait for the breakout.

**2. Bounce Trade**
Price touches the Lower Band and comes back = Buy
Price touches the Upper Band and comes back = Sell

**3. Walk the Band**
In an uptrend, price walks along the Upper Band = trend is strong

### Example — EUR/USD
Market was sideways. Bands squeezed.
Suddenly price broke the Upper Band and closed above it.
**Signal:** Buy Stop order above the Upper Band. This is a breakout trade.`,
      ur: `## Bollinger Bands | Volatility Trade

Bollinger Bands 3 لائنوں پر مشتمل ہے۔ یہ بتاتا ہے مارکیٹ میں Volatility کتنی ہے۔

### 3 لائنیں
1. **Middle Band** = EMA 20
2. **Upper Band** = EMA 20 + 2x Standard Deviation
3. **Lower Band** = EMA 20 - 2x Standard Deviation

### سیٹنگ
20, 2 ڈیفالٹ

### 3 رول

**1. Squeeze = سکویز**
جب 3وں بینڈ قریب آ جائیں = بڑی موومنٹ آنے والی ہے۔ بریک آؤٹ کا انتظار کریں

**2. Bounce Trade**
قیمت Lower Band کو ٹچ کرے اور واپس آئے = Buy
قیمت Upper Band کو ٹچ کرے اور واپس آئے = Sell

**3. Walk the Band**
Uptrend میں قیمت Upper Band کے ساتھ چلے = ٹرینڈ طاقتور ہے

### مثال: EUR/USD
مارکیٹ سائیڈ وے تھی۔ بینڈ سکویز ہو گئے۔
اچانک قیمت نے Upper Band توڑا اور اس کے اوپر بند ہوئی۔
**سگنل:** Buy Stop آرڈر Upper Band کے اوپر۔ یہ بریک آؤٹ ٹریڈ ہے۔`,
      hi: `## बोलिंगर बैंड्स | वोलैटिलिटी ट्रेड

**बोलिंगर बैंड्स** 3 लाइनों से बने हैं। ये दिखाते हैं कि बाज़ार में कितनी वोलैटिलिटी है।

### 3 लाइनें
1. **Middle Band** = EMA 20
2. **Upper Band** = EMA 20 + 2× Standard Deviation
3. **Lower Band** = EMA 20 − 2× Standard Deviation

### सेटिंग
डिफ़ॉल्ट **20, 2**

### 3 नियम

**1. Squeeze = स्क्वीज़**
जब तीनों बैंड पास आ जाएँ = बड़ा मूवमेंट आने वाला है। ब्रेकआउट का इंतज़ार करें।

**2. Bounce Trade**
कीमत Lower Band को छुए और वापस आए = Buy
कीमत Upper Band को छुए और वापस आए = Sell

**3. Walk the Band**
Uptrend में कीमत Upper Band के साथ चले = ट्रेंड मज़बूत है

### उदाहरण: EUR/USD
बाज़ार साइडवे था। बैंड स्क्वीज़ हो गए।
अचानक कीमत ने Upper Band तोड़ा और उसके ऊपर बंद हुआ।
**सिग्नल:** Buy Stop ऑर्डर Upper Band के ऊपर। यह ब्रेकआउट ट्रेड है।`,
      ar: `## بولينجر باند | تداول التقلب

**بولينجر باند** يتكون من 3 خطوط. تُظهر مقدار التقلب في السوق.

### 3 خطوط
1. **الخط الأوسط** = EMA 20
2. **الخط العلوي** = EMA 20 + 2× الانحراف المعياري
3. **الخط السفلي** = EMA 20 − 2× الانحراف المعياري

### الإعداد
الافتراضي **20, 2**

### 3 قواعد

**1. الانضغاط**
عندما تقترب الفرقانات الثلاثة = حركة كبيرة قادمة. انتظر الاختراق.

**2. تداول الارتداد**
السعر يلمس الخط السفلي ويرتد = شراء
السعر يلمس الخط العلوي ويرتد = بيع

**3. المشي مع الباند**
في اتجاه صاعد، السعر يمشي مع الخط العلوي = الاتجاه قوي

### مثال: EUR/USD
السوق كان عرضي. الفرقانات انضغطت.
فجأة السعر كسر الخط العلوي وأغلق فوقه.
**الإشارة:** أمر Buy Stop فوق الخط العلوي. هذا تداول اختراق.`,
    },
    durationMin: 6,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "How many lines are in Bollinger Bands?", ur: "Bollinger Bands میں کتنی لائنیں ہوتی ہیں؟", hi: "Bollinger Bands में कितनी लाइनें होती हैं?", ar: "كم عدد الخطوط في بولينجر باند؟" },
        options: [
          { en: "1", ur: "1", hi: "1", ar: "1" },
          { en: "2", ur: "2", hi: "2", ar: "2" },
          { en: "3", ur: "3", hi: "3", ar: "3" },
          { en: "4", ur: "4", hi: "4", ar: "4" },
        ],
        correctIndex: 2,
        explanation: { en: "Bollinger Bands has 3 lines (Middle, Upper, Lower).", ur: "Bollinger Bands میں 3 لائنیں ہوتی ہیں (Middle, Upper, Lower)۔", hi: "Bollinger Bands में 3 लाइनें होती हैं (Middle, Upper, Lower)।", ar: "بولينجر باند به 3 خطوط (الأوسط، العلوي، السفلي)." },
      },
      {
        type: "MCQ",
        prompt: { en: "What does Squeeze mean?", ur: "Squeeze کا مطلب؟", hi: "Squeeze का मतलब?", ar: "ماذا يعني الانضغاط (Squeeze)؟" },
        options: [
          { en: "Big move ended", ur: "بڑی موومنٹ ختم", hi: "बड़ा मूवमेंट खत्म", ar: "حركة كبيرة انتهت" },
          { en: "Big move coming", ur: "بڑی موومنٹ آنے والی ہے", hi: "बड़ा मूवमेंट आने वाला है", ar: "حركة كبيرة قادمة" },
          { en: "Market closed", ur: "مارکیٹ بند", hi: "बाज़ार बंद", ar: "السوق مغلق" },
          { en: "News coming", ur: "News آ رہی ہے", hi: "News आ रही है", ar: "أخبار قادمة" },
        ],
        correctIndex: 1,
        explanation: { en: "Squeeze = bands coming close together = big move coming.", ur: "Squeeze = بینڈ قریب آنا = بڑی موومنٹ آنے والی ہے۔", hi: "Squeeze = बैंड पास आना = बड़ा मूवमेंट आने वाला है।", ar: "Squeeze = اقتراب الفرقانات = حركة كبيرة قادمة." },
      },
      {
        type: "MCQ",
        prompt: { en: "If price touches the Lower Band and comes back?", ur: "قیمت Lower Band کو ٹچ کر کے واپس آئے تو؟", hi: "कीमत Lower Band को टच करके वापस आए तो?", ar: "إذا لمس السعر الخط السفلي وعاد؟" },
        options: [
          { en: "Sell", ur: "Sell", hi: "Sell", ar: "بيع" },
          { en: "Buy", ur: "Buy", hi: "Buy", ar: "شراء" },
          { en: "Hold", ur: "Hold", hi: "Hold", ar: "انتظار" },
          { en: "Close", ur: "Close", hi: "Close", ar: "إغلاق" },
        ],
        correctIndex: 1,
        explanation: { en: "Bounce from Lower Band = Buy signal.", ur: "Lower Band سے Bounce = Buy سگنل۔", hi: "Lower Band से Bounce = Buy सिग्नल।", ar: "الارتداد من الخط السفلي = إشارة شراء." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the default setting of Bollinger?", ur: "Bollinger کی ڈیفالٹ سیٹنگ؟", hi: "Bollinger की डिफ़ॉल्ट सेटिंग?", ar: "ما هو الإعداد الافتراضي لبولينجر؟" },
        options: [
          { en: "50, 2", ur: "50, 2", hi: "50, 2", ar: "50, 2" },
          { en: "20, 2", ur: "20, 2", hi: "20, 2", ar: "20, 2" },
          { en: "14, 3", ur: "14, 3", hi: "14, 3", ar: "14, 3" },
          { en: "200, 1", ur: "200, 1", hi: "200, 1", ar: "200, 1" },
        ],
        correctIndex: 1,
        explanation: { en: "Bollinger default = 20, 2.", ur: "Bollinger ڈیفالٹ = 20, 2۔", hi: "Bollinger डिफ़ॉल्ट = 20, 2।", ar: "بولينجر الافتراضي = 20, 2." },
      },
      {
        type: "MCQ",
        prompt: { en: "In Uptrend, price moves with which band?", ur: "Uptrend میں قیمت کس بینڈ کے ساتھ چلتی ہے؟", hi: "Uptrend में कीमत किस बैंड के साथ चलती है?", ar: "في الاتجاه الصاعد، السعر يمشي مع أي خط؟" },
        options: [
          { en: "Lower Band", ur: "Lower Band", hi: "Lower Band", ar: "الخط السفلي" },
          { en: "Middle Band", ur: "Middle Band", hi: "Middle Band", ar: "الخط الأوسط" },
          { en: "Upper Band", ur: "Upper Band", hi: "Upper Band", ar: "الخط العلوي" },
          { en: "None", ur: "کوئی نہیں", hi: "कोई नहीं", ar: "لا شيء" },
        ],
        correctIndex: 2,
        explanation: { en: "In Uptrend, price moves with the Upper Band (Walk the Band).", ur: "Uptrend میں قیمت Upper Band کے ساتھ چلتی ہے (Walk the Band)۔", hi: "Uptrend में कीमत Upper Band के साथ चलती है (Walk the Band)।", ar: "في الاتجاه الصاعد، السعر يمشي مع الخط العلوي (Walk the Band)." },
      },
    ],
  },

  // ===== LESSON 17: Chart Patterns 1 - Head & Shoulders, Double Top/Bottom =====
  {
    id: "eurusd-17",
    order: 5,
    title: {
      en: "Chart Patterns 1: Head & Shoulders, Double Top/Bottom",
      ur: "Chart Patterns 1: Head & Shoulders, Double Top/Bottom",
      hi: "चार्ट पैटर्न 1: हेड और शोल्डर, डबल टॉप/बॉटम",
      ar: "أنماط الرسم 1: الرأس والكتفين، القمة/القاع المزدوج",
    },
    summary: {
      en: "Reversal patterns that repeat again and again — Head & Shoulders and Double Top/Bottom.",
      ur: "ریورسل پیٹرن جو بار بار بنتے ہیں — Head & Shoulders اور Double Top/Bottom۔",
      hi: "रिवर्सल पैटर्न जो बार-बार बनते हैं — Head & Shoulders और Double Top/Bottom।",
      ar: "أنماط انعكاس تتكرر مراراً — الرأس والكتفين والقمة/القاع المزدوج.",
    },
    content: {
      en: `## Chart Patterns 1: Head & Shoulders, Double Top/Bottom

A **chart pattern** is a shape of price that forms again and again. These tell us about reversals.

### 1. Head & Shoulders
Forms at the end of an Uptrend = Bearish reversal
**Shape:** Left shoulder, higher head, right shoulder. Neckline below.
**Confirm:** When price breaks the Neckline → Sell

### 2. Inverse Head & Shoulders
Forms at the end of a Downtrend = Bullish reversal
**Confirm:** Neckline breaks → Buy

### 3. Double Top
Reaches the same Resistance twice and pulls back = Sell signal
**Confirm:** Middle Support breaks

### 4. Double Bottom
Reaches the same Support twice and goes up = Buy signal
**Confirm:** Middle Resistance breaks

### Example — EUR/USD Daily
\`EUR/USD\` made a Head at 1.1100. Then shoulder at 1.1050, head at 1.1090, shoulder at 1.1040.
Neckline was 1.1000. Price broke it.
**Signal:** Sell. TP = distance from Head to Neckline, projected down`,
      ur: `## Chart Patterns 1: Head & Shoulders, Double Top/Bottom

Chart Pattern قیمت کا وہ نقشہ ہے جو بار بار بنتا ہے۔ یہ ہمیں ریورسل بتاتے ہیں۔

### 1. Head & Shoulders = سر اور کندھے
یہ Uptrend کے آخر میں بنتا ہے = Bearish ریورسل
**شکل:** بائیں کندھا، اونچا سر، دائیں کندھا۔ نیچے Neckline
**تصدیق:** جب قیمت Neckline توڑے تو Sell

### 2. Inverse Head & Shoulders
یہ Downtrend کے آخر میں بنتا ہے = Bullish ریورسل
**تصدیق:** Neckline ٹوٹے تو Buy

### 3. Double Top = ڈبل ٹاپ
ایک ہی Resistance پر 2 بار جا کر واپس آیا = Sell سگنل
**تصدیق:** درمیان والی Support ٹوٹے

### 4. Double Bottom = ڈبل باٹم
ایک ہی Support پر 2 بار جا کر اوپر گیا = Buy سگنل
**تصدیق:** درمیان والی Resistance ٹوٹے

### مثال: EUR/USD Daily
\`EUR/USD\` 1.1100 پر Head بنا۔ پھر 1.1050 پر کندھا، پھر 1.1090 پر سر، پھر 1.1040 پر کندھا
Neckline 1.1000 تھی۔ قیمت نے توڑا۔
**سگنل:** Sell۔ TP = Head سے Neckline کا فاصلہ نیچے`,
      hi: `## चार्ट पैटर्न 1: हेड और शोल्डर, डबल टॉप/बॉटम

**चार्ट पैटर्न** कीमत का वह आकार है जो बार-बार बनता है। ये हमें रिवर्सल बताते हैं।

### 1. Head & Shoulders = सिर और कंधे
यह Uptrend के अंत में बनता है = Bearish रिवर्सल
**आकार:** बायाँ कंधा, ऊँचा सिर, दायाँ कंधा। नीचे Neckline
**पुष्टि:** जब कीमत Neckline तोड़े तो Sell

### 2. Inverse Head & Shoulders
यह Downtrend के अंत में बनता है = Bullish रिवर्सल
**पुष्टि:** Neckline टूटे तो Buy

### 3. Double Top = डबल टॉप
एक ही Resistance पर 2 बार जाकर वापस आया = Sell सिग्नल
**पुष्टि:** बीच वाली Support टूटे

### 4. Double Bottom = डबल बॉटम
एक ही Support पर 2 बार जाकर ऊपर गया = Buy सिग्नल
**पुष्टि:** बीच वाली Resistance टूटे

### उदाहरण: EUR/USD Daily
\`EUR/USD\` 1.1100 पर Head बना। फिर 1.1050 पर कंधा, फिर 1.1090 पर सिर, फिर 1.1040 पर कंधा
Neckline 1.1000 थी। कीमत ने तोड़ा।
**सिग्नल:** Sell। TP = Head से Neckline की दूरी नीचे`,
      ar: `## أنماط الرسم 1: الرأس والكتفين، القمة/القاع المزدوج

**نمط الرسم** هو شكل للسعر يتكرر مراراً. تخبرنا عن الانعكاسات.

### 1. الرأس والكتفين
يتشكل في نهاية اتجاه صاعد = انعكاس هبوطي
**الشكل:** كتف أيسر، رأس أعلى، كتف أيمن. خط العنق أسفل.
**التأكيد:** عندما يكسر السعر خط العنق → بيع

### 2. الرأس والكتفين المقلوب
يتشكل في نهاية اتجاه هابط = انعكاس صعودي
**التأكيد:** كسر خط العنق → شراء

### 3. القمة المزدوجة
يصل لنفس المقاومة مرتين ويرتد = إشارة بيع
**التأكيد:** كسر الدعم الأوسط

### 4. القاع المزدوج
يصل لنفس الدعم مرتين ويصعد = إشارة شراء
**التأكيد:** كسر المقاومة الوسطى

### مثال: EUR/USD يومي
\`EUR/USD\` صنع رأساً عند 1.1100. ثم كتف عند 1.1050، ثم رأس عند 1.1090، ثم كتف عند 1.1040.
خط العنق كان 1.1000. السعر كسره.
**الإشارة:** بيع. الهدف = مسافة الرأس إلى خط العنق للأسفل`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "When does Head & Shoulders form?", ur: "Head & Shoulders کب بنتا ہے؟", hi: "Head & Shoulders कब बनता है?", ar: "متى يتشكل نمط الرأس والكتفين؟" },
        options: [
          { en: "At the end of Downtrend", ur: "Downtrend کے آخر میں", hi: "Downtrend के अंत में", ar: "في نهاية الاتجاه الهابط" },
          { en: "At the end of Uptrend", ur: "Uptrend کے آخر میں", hi: "Uptrend के अंत में", ar: "في نهاية الاتجاه الصاعد" },
          { en: "In Sideways", ur: "Sideways میں", hi: "Sideways में", ar: "في السوق العرضي" },
          { en: "During News", ur: "News کے دوران", hi: "News के दौरान", ar: "أثناء الأخبار" },
        ],
        correctIndex: 1,
        explanation: { en: "Head & Shoulders forms at the end of Uptrend = Bearish reversal.", ur: "Head & Shoulders Uptrend کے آخر میں بنتا ہے = Bearish ریورسل۔", hi: "Head & Shoulders Uptrend के अंत में बनता है = Bearish रिवर्सल।", ar: "الرأس والكتفين يتشكل في نهاية الاتجاه الصاعد = انعكاس هبوطي." },
      },
      {
        type: "MCQ",
        prompt: { en: "What signal comes after a Double Top?", ur: "Double Top کے بعد کیا سگنل ملتا ہے؟", hi: "Double Top के बाद क्या सिग्नल मिलता है?", ar: "ما هي الإشارة بعد القمة المزدوجة؟" },
        options: [
          { en: "Buy", ur: "Buy", hi: "Buy", ar: "شراء" },
          { en: "Sell", ur: "Sell", hi: "Sell", ar: "بيع" },
          { en: "Hold", ur: "Hold", hi: "Hold", ar: "انتظار" },
          { en: "None", ur: "کوئی نہیں", hi: "कोई नहीं", ar: "لا شيء" },
        ],
        correctIndex: 1,
        explanation: { en: "Double Top = Sell signal (price rejected at Resistance twice).", ur: "Double Top = Sell سگنل (قیمت 2 بار Resistance پر رد ہوئی)۔", hi: "Double Top = Sell सिग्नल (कीमत 2 बार Resistance पर अस्वीकृत हुई)।", ar: "القمة المزدوجة = إشارة بيع (السعر رُفض عند المقاومة مرتين)." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is necessary to confirm a pattern?", ur: "Pattern کی تصدیق کے لیے کیا ضروری ہے؟", hi: "Pattern की पुष्टि के लिए क्या ज़रूरी है?", ar: "ما اللازم لتأكيد النمط؟" },
        options: [
          { en: "Just the shape forms", ur: "صرف شکل بنے", hi: "सिर्फ़ आकार बने", ar: "فقط يتشكل الشكل" },
          { en: "Neckline or Support/Resistance break", ur: "Neckline یا Support/Resistance کا Break", hi: "Neckline या Support/Resistance का Break", ar: "كسر خط العنق أو الدعم/المقاومة" },
          { en: "Big lot", ur: "بڑا Lot", hi: "बड़ा Lot", ar: "حجم كبير" },
          { en: "News", ur: "News", hi: "News", ar: "أخبار" },
        ],
        correctIndex: 1,
        explanation: { en: "To confirm a pattern, a Neckline or Support/Resistance break is necessary.", ur: "Pattern کی تصدیق کے لیے Neckline یا Support/Resistance کا Break ضروری ہے۔", hi: "Pattern की पुष्टि के लिए Neckline या Support/Resistance का Break ज़रूरी है।", ar: "لتأكيد النمط، كسر خط العنق أو الدعم/المقاومة ضروري." },
      },
      {
        type: "MCQ",
        prompt: { en: "What does an Inverse Head & Shoulders give?", ur: "Inverse Head & Shoulders کیا دیتا ہے؟", hi: "Inverse Head & Shoulders क्या देता है?", ar: "ماذا يعطي النمط المعاكس للرأس والكتفين؟" },
        options: [
          { en: "Bearish reversal", ur: "Bearish ریورسل", hi: "Bearish रिवर्सल", ar: "انعكاس هبوطي" },
          { en: "Bullish reversal", ur: "Bullish ریورسل", hi: "Bullish रिवर्सल", ar: "انعكاس صاعد" },
          { en: "Continuation", ur: "Continuation", hi: "Continuation", ar: "استمرار" },
          { en: "No difference", ur: "کوئی فرق نہیں", hi: "कोई फ़र्क नहीं", ar: "بلا فرق" },
        ],
        correctIndex: 1,
        explanation: { en: "Inverse Head & Shoulders = Bullish reversal (at the end of Downtrend).", ur: "Inverse Head & Shoulders = Bullish ریورسل (Downtrend کے آخر میں)۔", hi: "Inverse Head & Shoulders = Bullish रिवर्सल (Downtrend के अंत में)।", ar: "النمط المعاكس للرأس والكتفين = انعكاس صاعد (في نهاية الاتجاه الهابط)." },
      },
      {
        type: "MCQ",
        prompt: { en: "EUR/USD touched 1.1100 twice and came back. Which pattern is this?", ur: "EUR/USD نے 2 بار 1.1100 ٹچ کیا اور واپس آیا۔ یہ کون سا پیٹرن؟", hi: "EUR/USD ने 2 बार 1.1100 टच किया और वापस आया। यह कौन सा पैटर्न है?", ar: "لمس EUR/USD مستوى 1.1100 مرتين وعاد. ما هذا النمط؟" },
        options: [
          { en: "Double Bottom", ur: "Double Bottom", hi: "Double Bottom", ar: "قاع مزدوج" },
          { en: "Head & Shoulders", ur: "Head & Shoulders", hi: "Head & Shoulders", ar: "رأس وكتفين" },
          { en: "Double Top", ur: "Double Top", hi: "Double Top", ar: "قمة مزدوجة" },
          { en: "Triangle", ur: "Triangle", hi: "Triangle", ar: "مثلث" },
        ],
        correctIndex: 2,
        explanation: { en: "Going to the same Resistance twice = Double Top = Sell signal.", ur: "ایک ہی Resistance پر 2 بار جانا = Double Top = Sell سگنل۔", hi: "एक ही Resistance पर 2 बार जाना = Double Top = Sell सिग्नल।", ar: "الذهاب لنفس المقاومة مرتين = قمة مزدوجة = إشارة بيع." },
      },
    ],
  },

  // ===== LESSON 18: Chart Patterns 2 - Triangles, Flags, Wedges =====
  {
    id: "eurusd-18",
    order: 6,
    title: {
      en: "Chart Patterns 2: Triangles, Flags, Wedges | Continuation",
      ur: "Chart Patterns 2: Triangles, Flags, Wedges | Continuation Patterns",
      hi: "चार्ट पैटर्न 2: ट्राएंगल्स, फ्लैग्स, वेज | कंटिन्यूएशन पैटर्न",
      ar: "أنماط الرسم 2: المثلثات، الأعلام، الإسفين | أنماط الاستمرار",
    },
    summary: {
      en: "Continuation patterns — the trend pauses, then continues in the same direction.",
      ur: "Continuation پیٹرن — ٹرینڈ تھوڑا رک کر پھر اسی رخ میں چلے گا۔",
      hi: "कंटिन्यूएशन पैटर्न — ट्रेंड रुककर उसी दिशा में चलता है।",
      ar: "أنماط الاستمرار — يتوقف الاتجاه ثم يستمر بنفس الاتجاه.",
    },
    content: {
      en: `## Chart Patterns 2: Triangles, Flags, Wedges

These are **Continuation Patterns**. The trend pauses briefly, then continues in the same direction. They form during a trend.

### 1. Triangles
**3 types:**
1. **Symmetrical Triangle:** top line down, bottom line up. Wait for breakout. Breaks in the trend's direction.
2. **Ascending Triangle:** flat Resistance on top, rising Support below. Bullish. Higher chance of breaking up.
3. **Descending Triangle:** flat Support below, falling Resistance above. Bearish. Higher chance of breaking down.

### 2. Flags
A small sideways channel after a fast move. Like the market paused to rest.
**Rule:** When price breaks against the flag, the trend continues. Target = length of the Flag Pole.

### 3. Wedges
Like triangles but both lines go in the same direction.
**Rising Wedge:** both lines go up = Bearish reversal
**Falling Wedge:** both lines go down = Bullish reversal

### Example — EUR/USD 1H
\`EUR/USD\` went from 1.0900 to 1.1000 = Flag Pole
Then a Flag formed between 1.0980 and 1.1000.
Price broke above the Flag.
**Signal:** Buy. TP = 1.1000 + 100 pips = 1.1100`,
      ur: `## Chart Patterns 2: Triangles, Flags, Wedges

یہ "Continuation Patterns" ہیں۔ مطلب ٹرینڈ تھوڑا رک کر پھر اسی رخ میں چلے گا۔ یہ ٹرینڈ کے درمیان بنتے ہیں۔

### 1. Triangles = تکون
**3 قسمیں:**
1. **Symmetrical Triangle:** اوپر والی لائن نیچے، نیچے والی اوپر۔ بریک آؤٹ کا انتظار کریں۔ ٹرینڈ کی سمت میں بریک ہوگا۔
2. **Ascending Triangle:** اوپر فلیٹ Resistance، نیچے اونچی Support۔ Bullish ہے۔ اوپر بریک کا چانس زیادہ۔
3. **Descending Triangle:** نیچے فلیٹ Support، اوپر نیچی Resistance۔ Bearish ہے۔ نیچے بریک کا چانس زیادہ۔

### 2. Flags = جھنڈا
تیز موومنٹ کے بعد چھوٹا سا سائیڈ وے چینل۔ جیسے تھک کر رکا ہو۔
**رول:** Flag کے خلاف بریک ہو تو ٹرینڈ جاری رہے گا۔ Flag کے بعد ٹارگٹ = Flag Pole کی لمبائی۔

### 3. Wedges = پچر
Triangles کی طرح لیکن دونوں لائنیں ایک ہی سمت میں جا رہی ہوں۔
**Rising Wedge:** دونوں اوپر جا رہی ہیں = Bearish ریورسل
**Falling Wedge:** دونوں نیچے جا رہی ہیں = Bullish ریورسل

### مثال: EUR/USD 1H
\`EUR/USD\` 1.0900 سے 1.1000 گیا = Flag Pole
پھر 1.0980 اور 1.1000 کے درمیان Flag بنا۔
قیمت نے Flag کے اوپر بریک کیا۔
**سگنل:** Buy۔ TP = 1.1000 + 100 Pips = 1.1100`,
      hi: `## चार्ट पैटर्न 2: ट्राएंगल्स, फ्लैग्स, वेज

ये **Continuation Patterns** हैं। मतलब ट्रेंड थोड़ा रुककर फिर उसी दिशा में चलेगा। ये ट्रेंड के बीच में बनते हैं।

### 1. Triangles = त्रिकोण
**3 प्रकार:**
1. **Symmetrical Triangle:** ऊपर वाली लाइन नीचे, नीचे वाली ऊपर। ब्रेकआउट का इंतज़ार करें। ट्रेंड की दिशा में ब्रेक होगा।
2. **Ascending Triangle:** ऊपर फ्लैट Resistance, नीचे ऊपर उठती Support। Bullish है। ऊपर ब्रेक का चांस ज़्यादा।
3. **Descending Triangle:** नीचे फ्लैट Support, ऊपर गिरती Resistance। Bearish है। नीचे ब्रेक का चांस ज़्यादा।

### 2. Flags = झंडा
तेज़ मूवमेंट के बाद छोटा साइडवे चैनल। जैसे थककर रुक गया।
**नियम:** Flag के खिलाफ़ ब्रेक हो तो ट्रेंड जारी रहेगा। Flag के बाद टार्गेट = Flag Pole की लंबाई।

### 3. Wedges = वेज
Triangles की तरह लेकिन दोनों लाइनें एक ही दिशा में जाती हैं।
**Rising Wedge:** दोनों ऊपर जा रही हैं = Bearish रिवर्सल
**Falling Wedge:** दोनों नीचे जा रही हैं = Bullish रिवर्सल

### उदाहरण: EUR/USD 1H
\`EUR/USD\` 1.0900 से 1.1000 गया = Flag Pole
फिर 1.0980 और 1.1000 के बीच Flag बना।
कीमत ने Flag के ऊपर ब्रेक किया।
**सिग्नल:** Buy। TP = 1.1000 + 100 Pips = 1.1100`,
      ar: `## أنماط الرسم 2: المثلثات، الأعلام، الإسفين

هذه **أنماط استمرار**. أي يتوقف الاتجاه ثم يستمر بنفس الاتجاه. تتشكل أثناء الاتجاه.

### 1. المثلثات
**3 أنواع:**
1. **المثلث المتماثل:** الخط العلوي هابط، الخط السفلي صاعد. انتظر الاختراق. يخترق في اتجاه السوق.
2. **المثلث الصاعد:** مقاومة مسطحة بالأعلى، دعم صاعد بالأسفل. صعودي. فرصة اختراق علوي أكبر.
3. **المثلث الهابط:** دعم مسطح بالأسفل، مقاومة هابطة بالأعلى. هبوطي. فرصة اختراق سفلي أكبر.

### 2. الأعلام
قناة عرضية صغيرة بعد حركة سريعة. كأن السوق توقف للراحة.
**القاعدة:** عند الاختراق ضد العلم، يستمر الاتجاه. الهدف = طول سارية العلم.

### 3. الإسفين
مثل المثلثات لكن كلا الخطين يسيران في نفس الاتجاه.
**إسفين صاعد:** كلاهما يصعد = انعكاس هبوطي
**إسفين هابط:** كلاهما يهبط = انعكاس صعودي

### مثال: EUR/USD 1س
\`EUR/USD\` صعد من 1.0900 إلى 1.1000 = سارية العلم
ثم تشكل علم بين 1.0980 و 1.1000.
السعر اخترق فوق العلم.
**الإشارة:** شراء. الهدف = 1.1000 + 100 نقطة = 1.1100`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What does Continuation Pattern mean?", ur: "Continuation Pattern کا مطلب کیا ہے؟", hi: "Continuation Pattern का मतलब क्या है?", ar: "ماذا يعني نمط الاستمرار؟" },
        options: [
          { en: "Trend will reverse", ur: "ٹرینڈ ریورس ہو جائے گا", hi: "ट्रेंड रिवर्स हो जाएगा", ar: "سيعكس الاتجاه" },
          { en: "Trend pauses then continues same direction", ur: "ٹرینڈ تھوڑا رک کر پھر اسی رخ میں جائے گا", hi: "ट्रेंड रुक कर फिर उसी दिशा में जाएगा", ar: "يتوقف الاتجاه ثم يكمل بنفس الاتجاه" },
          { en: "Market will close", ur: "مارکیٹ بند ہو جائے گی", hi: "बाज़ार बंद हो जाएगी", ar: "سيغلق السوق" },
          { en: "News will come", ur: "News آئے گی", hi: "News आएगी", ar: "ستأتي الأخبار" },
        ],
        correctIndex: 1,
        explanation: { en: "Continuation = trend pauses then continues in the same direction.", ur: "Continuation = ٹرینڈ رک کر اسی رخ میں جاری رہے گا۔", hi: "Continuation = ट्रेंड रुक कर उसी दिशा में जारी रहेगा।", ar: "الاستمرار = يتوقف الاتجاه ثم يكمل بنفس الاتجاه." },
      },
      {
        type: "MCQ",
        prompt: { en: "How is an Ascending Triangle formed?", ur: "Ascending Triangle کیسا ہوتا ہے؟", hi: "Ascending Triangle कैसा होता है?", ar: "كيف يتشكل المثلث الصاعد؟" },
        options: [
          { en: "Both Resistance top and bottom", ur: "اوپر نیچے دونوں Resistance", hi: "ऊपर नीचे दोनों Resistance", ar: "مقاومة علوية وسفلية معاً" },
          { en: "Flat Resistance on top, rising Support below", ur: "اوپر فلیٹ Resistance، نیچے اونچی Support", hi: "ऊपर फ्लैट Resistance, नीचे ऊपर उठती Support", ar: "مقاومة مسطحة أعلى، ودعم صاعد أسفل" },
          { en: "Both Support", ur: "دونوں Support", hi: "दोनों Support", ar: "كلاهما دعم" },
          { en: "Round shape", ur: "گول شکل", hi: "गोल आकार", ar: "شكل دائري" },
        ],
        correctIndex: 1,
        explanation: { en: "Ascending Triangle = flat Resistance on top, rising Support below = Bullish.", ur: "Ascending Triangle = اوپر فلیٹ Resistance، نیچے اونچی Support = Bullish۔", hi: "Ascending Triangle = ऊपर फ्लैट Resistance, नीचे ऊपर उठती Support = Bullish।", ar: "المثلث الصاعد = مقاومة مسطحة أعلى، ودعم صاعد أسفل = صاعد." },
      },
      {
        type: "MCQ",
        prompt: { en: "How to find the target after a Flag Pattern?", ur: "Flag Pattern کے بعد ٹارگٹ کیسے نکالیں گے؟", hi: "Flag Pattern के बाद टार्गेट कैसे निकालेंगे?", ar: "كيف نحدد الهدف بعد نمط العلم؟" },
        options: [
          { en: "50 pips fixed", ur: "50 Pips فکس", hi: "50 Pips फिक्स", ar: "50 نقطة ثابتة" },
          { en: "Flag Pole length", ur: "Flag Pole کی لمبائی", hi: "Flag Pole की लंबाई", ar: "طول عمود العلم" },
          { en: "By guess", ur: "اندازے سے", hi: "अंदाज़े से", ar: "بالتخمين" },
          { en: "Looking at RSI", ur: "RSI دیکھ کر", hi: "RSI देख कर", ar: "بالنظر إلى RSI" },
        ],
        correctIndex: 1,
        explanation: { en: "Flag target = Flag Pole length projected from the breakout.", ur: "Flag کا ٹارگٹ = Flag Pole کی لمبائی بریک سے-projected۔", hi: "Flag का टार्गेट = Flag Pole की लंबाई ब्रेक से प्रोजेक्टेड।", ar: "هدف العلم = طول عمود العلم مسقط من الكسر." },
      },
      {
        type: "MCQ",
        prompt: { en: "What signal does a Falling Wedge give?", ur: "Falling Wedge کیا سگنل دیتا ہے؟", hi: "Falling Wedge क्या सिग्नल देता है?", ar: "ما الإشارة التي يعطيها الوتد الهابط؟" },
        options: [
          { en: "Bearish reversal", ur: "Bearish ریورسل", hi: "Bearish रिवर्सल", ar: "انعكاس هبوطي" },
          { en: "Bullish reversal", ur: "Bullish ریورسل", hi: "Bullish रिवर्सल", ar: "انعكاس صاعد" },
          { en: "Sideways", ur: "Sideways", hi: "Sideways", ar: "عرضي" },
          { en: "No signal", ur: "کوئی سگنل نہیں", hi: "कोई सिग्नल नहीं", ar: "بلا إشارة" },
        ],
        correctIndex: 1,
        explanation: { en: "Falling Wedge (both lines pointing down) = Bullish reversal.", ur: "Falling Wedge (دونوں لائنیں نیچے) = Bullish ریورسل۔", hi: "Falling Wedge (दोनों लाइनें नीचे) = Bullish रिवर्सल।", ar: "الوتد الهابط (كلا الخطين للأسفل) = انعكاس صاعد." },
      },
      {
        type: "MCQ",
        prompt: { en: "EUR/USD went up 100 pips then formed a sideways channel. Which pattern is this?", ur: "EUR/USD 100 Pips اوپر گیا پھر سائیڈ وے چینل بنا۔ یہ کون سا پیٹرن؟", hi: "EUR/USD 100 Pips ऊपर गया फिर साइडवेच चैनल बना। यह कौन सा पैटर्न है?", ar: "صعد EUR/USD 100 نقطة ثم كوّن قناة عرضية. ما هذا النمط؟" },
        options: [
          { en: "Triangle", ur: "Triangle", hi: "Triangle", ar: "مثلث" },
          { en: "Head & Shoulders", ur: "Head & Shoulders", hi: "Head & Shoulders", ar: "رأس وكتفين" },
          { en: "Flag", ur: "Flag", hi: "Flag", ar: "علم" },
          { en: "Double Top", ur: "Double Top", hi: "Double Top", ar: "قمة مزدوجة" },
        ],
        correctIndex: 2,
        explanation: { en: "Sideways channel after a fast move = Flag Pattern.", ur: "تیز موومنٹ کے بعد سائیڈ وے چینل = Flag Pattern۔", hi: "तेज़ मूवमेंट के बाद साइडवेच चैनल = Flag Pattern।", ar: "قناة عرضية بعد حركة سريعة = نمط العلم." },
      },
    ],
  },

  // ===== LESSON 19: Fibonacci Retracement =====
  {
    id: "eurusd-19",
    order: 7,
    title: {
      en: "Fibonacci Retracement | Finding Entry Points",
      ur: "Fibonacci Retracement | Entry Points ڈھونڈنا",
      hi: "फिबोनैचि रिट्रेसमेंट | एंट्री पॉइंट ढूँढना",
      ar: "تصحيح فيبوناتشي | إيجاد نقاط الدخول",
    },
    summary: {
      en: "Big traders use Fibonacci to find where price may stop after a correction.",
      ur: "بڑے ٹریڈر Fibonacci سے بتاتے ہیں کہ Correction کے بعد قیمت کہاں رک سکتی ہے۔",
      hi: "बड़े ट्रेडर Fibonacci से बताते हैं कि Correction के बाद कीमत कहाँ रुक सकती है।",
      ar: "المتداولون الكبار يستخدمون فيبوناتشي لمعرفة أين قد يتوقف السعر بعد التصحيح.",
    },
    content: {
      en: `## Fibonacci Retracement | Finding Entry Points

**Fibonacci** tells us where price may stop after a correction. Big traders watch these levels.

### Most Important Levels
23.6%, 38.2%, 50%, 61.8%, 78.6%
**Most powerful:** 61.8% = "Golden Ratio"

### How to Draw It?
1. **In Uptrend:** draw Fib from Swing Low to Swing High
2. **In Downtrend:** draw Fib from Swing High to Swing Low

### Trading Rule
Price reaches 61.8% or 50% and rejects → take Entry there. SL = below 78.6%

### Fib + Confluence = Best
If the 61.8% Fib and a Support level are at the same place, that zone becomes very powerful.

### Example — EUR/USD 4H
\`EUR/USD\` went from 1.0800 to 1.1000. Now a correction came.
We drew Fib from 1.0800 to 1.1000.
Price reached 61.8% = 1.0876. A Support + Bullish Pin Bar formed there.
**Signal:** Buy at 1.0876. SL 1.0840. TP 1.1000`,
      ur: `## Fibonacci Retracement | Entry Points ڈھونڈنا

Fibonacci ہمیں بتاتا ہے کہ قیمت Correction کے بعد کہاں رک سکتی ہے۔ بڑے ٹریڈر یہی لیول دیکھتے ہیں۔

### سب سے اہم لیول
23.6%, 38.2%, 50%, 61.8%, 78.6%
**سب سے طاقتور:** 61.8% = "Golden Ratio"

### کیسے لگائیں؟
1. **Uptrend میں:** سوئنگ Low سے سوئنگ High تک Fib کھینچیں
2. **Downtrend میں:** سوئنگ High سے سوئنگ Low تک Fib کھینچیں

### ٹریڈنگ رول
قیمت 61.8% یا 50% پر آ کر ریجیکٹ ہو = وہاں سے Entry لیں۔ SL = 78.6% کے نیچے

### Fib + Confluence = سب سے بہترین
اگر 61.8% Fib اور Support ایک جگہ پر ہوں تو وہ زون بہت طاقتور بن جاتا ہے۔

### مثال: EUR/USD 4H
\`EUR/USD\` 1.0800 سے 1.1000 گیا۔ اب Correction آئی۔
ہم نے Fib 1.0800 سے 1.1000 تک لگایا۔
قیمت 61.8% پر آئی = 1.0876۔ وہاں Support + Bullish Pin Bar بنی۔
**سگنل:** Buy 1.0876۔ SL 1.0840۔ TP 1.1000`,
      hi: `## फिबोनैचि रिट्रेसमेंट | एंट्री पॉइंट ढूँढना

**Fibonacci** हमें बताता है कि Correction के बाद कीमत कहाँ रुक सकती है। बड़े ट्रेडर इन्हीं लेवल को देखते हैं।

### सबसे ज़रूरी लेवल
23.6%, 38.2%, 50%, 61.8%, 78.6%
**सबसे शक्तिशाली:** 61.8% = "Golden Ratio"

### कैसे लगाएँ?
1. **Uptrend में:** Swing Low से Swing High तक Fib खींचें
2. **Downtrend में:** Swing High से Swing Low तक Fib खींचें

### ट्रेडिंग नियम
कीमत 61.8% या 50% पर आकर रिजेक्ट हो = वहाँ से Entry लें। SL = 78.6% के नीचे

### Fib + Confluence = सबसे अच्छा
अगर 61.8% Fib और Support एक जगह हों तो वह ज़ोन बहुत शक्तिशाली बन जाता है।

### उदाहरण: EUR/USD 4H
\`EUR/USD\` 1.0800 से 1.1000 गया। अब Correction आई।
हमने Fib 1.0800 से 1.1000 तक लगाया।
कीमत 61.8% पर आई = 1.0876। वहाँ Support + Bullish Pin Bar बनी।
**सिग्नल:** Buy 1.0876। SL 1.0840। TP 1.1000`,
      ar: `## تصحيح فيبوناتشي | إيجاد نقاط الدخول

**فيبوناتشي** يخبرنا أين قد يتوقف السعر بعد التصحيح. المتداولون الكبار يراقبون هذه المستويات.

### أهم المستويات
23.6%, 38.2%, 50%, 61.8%, 78.6%
**الأقوى:** 61.8% = "النسبة الذهبية"

### كيف نرسمه؟
1. **في اتجاه صاعد:** ارسم فيبوناتشي من القاع إلى القمة
2. **في اتجاه هابط:** ارسم فيبوناتشي من القمة إلى القاع

### قاعدة التداول
السعر يصل إلى 61.8% أو 50% ويرتد → خذ الدخول هناك. SL = تحت 78.6%

### فيبوناتشي + تلاقي = الأفضل
إذا كان 61.8% فيبوناتشي والدعم في نفس المكان، تصبح تلك المنطقة قوية جداً.

### مثال: EUR/USD 4س
\`EUR/USD\` صعد من 1.0800 إلى 1.1000. الآن جاء تصحيح.
رسمنا فيبوناتشي من 1.0800 إلى 1.1000.
السعر وصل إلى 61.8% = 1.0876. تشكل هناك دعم + شمعة دبوس صعودية.
**الإشارة:** شراء عند 1.0876. SL 1.0840. الهدف 1.1000`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "Which is the most powerful Fibonacci level?", ur: "Fibonacci کا سب سے طاقتور لیول کون سا ہے؟", hi: "Fibonacci का सबसे शक्तिशाली स्तर कौन सा है?", ar: "ما هو أقوى مستوى فيبوناتشي؟" },
        options: [
          { en: "23.6%", ur: "23.6%", hi: "23.6%", ar: "23.6%" },
          { en: "38.2%", ur: "38.2%", hi: "38.2%", ar: "38.2%" },
          { en: "50%", ur: "50%", hi: "50%", ar: "50%" },
          { en: "61.8%", ur: "61.8%", hi: "61.8%", ar: "61.8%" },
        ],
        correctIndex: 3,
        explanation: { en: "61.8% = Golden Ratio = most powerful Fib level.", ur: "61.8% = Golden Ratio = سب سے طاقتور Fib لیول۔", hi: "61.8% = Golden Ratio = सबसे शक्तिशाली Fib स्तर।", ar: "61.8% = النسبة الذهبية = أقوى مستوى فيبوناتشي." },
      },
      {
        type: "MCQ",
        prompt: { en: "In Uptrend, from where to where do you draw Fib?", ur: "Uptrend میں Fib کہاں سے کہاں لگائیں گے؟", hi: "Uptrend में Fib कहाँ से कहाँ लगाएँगे?", ar: "في الاتجاه الصاعد، من أين إلى أين نرسم الفيبوناتشي؟" },
        options: [
          { en: "High to Low", ur: "High سے Low", hi: "High से Low", ar: "من القمة إلى القاع" },
          { en: "Low to High", ur: "Low سے High", hi: "Low से High", ar: "من القاع إلى القمة" },
          { en: "In the middle", ur: "بیچ میں", hi: "बीच में", ar: "في المنتصف" },
          { en: "Anywhere", ur: "کہیں بھی", hi: "कहीं भी", ar: "أي مكان" },
        ],
        correctIndex: 1,
        explanation: { en: "In Uptrend, Fib = from Swing Low to Swing High.", ur: "Uptrend میں Fib = Swing Low سے Swing High تک۔", hi: "Uptrend में Fib = Swing Low से Swing High तक।", ar: "في الاتجاه الصاعد، الفيبوناتشي = من القاع المتأرجح إلى القمة المتأرجحة." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is 61.8% called?", ur: "61.8% کو کیا کہتے ہیں؟", hi: "61.8% को क्या कहते हैं?", ar: "ماذا يُسمى 61.8%؟" },
        options: [
          { en: "Silver Ratio", ur: "Silver Ratio", hi: "Silver Ratio", ar: "النسبة الفضية" },
          { en: "Golden Ratio", ur: "Golden Ratio", hi: "Golden Ratio", ar: "النسبة الذهبية" },
          { en: "Normal Ratio", ur: "Normal Ratio", hi: "Normal Ratio", ar: "نسبة عادية" },
          { en: "Risk Ratio", ur: "Risk Ratio", hi: "Risk Ratio", ar: "نسبة المخاطرة" },
        ],
        correctIndex: 1,
        explanation: { en: "61.8% = Golden Ratio (most powerful).", ur: "61.8% = Golden Ratio (سب سے طاقتور)۔", hi: "61.8% = Golden Ratio (सबसे शक्तिशाली)।", ar: "61.8% = النسبة الذهبية (الأقوى)." },
      },
      {
        type: "MCQ",
        prompt: { en: "What does Fib + Confluence mean?", ur: "Fib + Confluence کا مطلب؟", hi: "Fib + Confluence का मतलब?", ar: "ماذا يعني Fib + Confluence؟" },
        options: [
          { en: "2 indicators together", ur: "2 Indicator ایک ساتھ", hi: "2 Indicator एक साथ", ar: "مؤشران معاً" },
          { en: "Fib level and Support/Resistance at the same place", ur: "Fib لیول اور Support/Resistance ایک جگہ ہوں", hi: "Fib स्तर और Support/Resistance एक जगह हों", ar: "مستوى Fib و الدعم/المقاومة في نفس المكان" },
          { en: "2 news together", ur: "2 News ایک ساتھ", hi: "2 News एक साथ", ar: "خبران معاً" },
          { en: "2 lots placed", ur: "2 Lot لگانا", hi: "2 Lot लगाना", ar: "وضع 2 لوت" },
        ],
        correctIndex: 1,
        explanation: { en: "Fib + Support/Resistance at same place = Confluence = strong zone.", ur: "Fib + Support/Resistance ایک جگہ = Confluence = طاقتور زون۔", hi: "Fib + Support/Resistance एक जगह = Confluence = मज़बूत ज़ोन।", ar: "Fib + الدعم/المقاومة في نفس المكان = Confluence = منطقة قوية." },
      },
      {
        type: "MCQ",
        prompt: { en: "If price comes to 61.8% and forms a Bullish Pin, the signal is?", ur: "قیمت 61.8% پر آ کر Bullish Pin بنائے تو سگنل؟", hi: "कीमत 61.8% पर आकर Bullish Pin बनाए तो सिग्नल?", ar: "إذا وصل السعر إلى 61.8% وكوّن Pin صاعد فالإشارة؟" },
        options: [
          { en: "Sell", ur: "Sell", hi: "Sell", ar: "بيع" },
          { en: "Buy", ur: "Buy", hi: "Buy", ar: "شراء" },
          { en: "Hold", ur: "Hold", hi: "Hold", ar: "انتظار" },
          { en: "Close", ur: "Close", hi: "Close", ar: "إغلاق" },
        ],
        correctIndex: 1,
        explanation: { en: "61.8% + Bullish Pin = Confluence = Buy signal.", ur: "61.8% + Bullish Pin = Confluence = Buy سگنل۔", hi: "61.8% + Bullish Pin = Confluence = Buy सिग्नल।", ar: "61.8% + Pin صاعد = Confluence = إشارة شراء." },
      },
    ],
  },

  // ===== LESSON 20: Price Action - Pin Bar, Engulfing =====
  {
    id: "eurusd-20",
    order: 8,
    title: {
      en: "Price Action — Pin Bar & Engulfing | Without Indicators",
      ur: "Price Action - Pin Bar, Engulfing | بغیر Indicator کے",
      hi: "प्राइस एक्शन - पिन बार, एनगल्फिंग | बिना इंडिकेटर के",
      ar: "حركة السعر - شمعة الدبوس والابتلاع | بدون مؤشرات",
    },
    summary: {
      en: "Trade by reading candles only — no indicators needed.",
      ur: "صرف کینڈل دیکھ کر ٹریڈ کریں — کوئی Indicator نہیں چاہیے۔",
      hi: "केवल कैंडल देखकर ट्रेड करें — किसी इंडिकेटर की ज़रूरत नहीं।",
      ar: "تداول بقراءة الشموع فقط — بدون مؤشرات.",
    },
    content: {
      en: `## Price Action — Pin Bar & Engulfing | Without Indicators

**Price Action** means "making decisions by just looking at candles". No indicators.

### 1. Pin Bar
Long wick + small body. Shows rejection.
**Bullish Pin:** long wick below = sellers failed. Buy signal
**Bearish Pin:** long wick above = buyers failed. Sell signal
**Condition:** works 90% of the time when it forms at Support/Resistance.

### 2. Engulfing
**Bullish Engulfing:** a small red candle, then a big green candle that swallows the whole red = Buy
**Bearish Engulfing:** a small green candle, then a big red candle that swallows the whole green = Sell

### Golden Rule of Price Action
Never trade on a single candle alone. Always look for confluence with S&R, Trend, or Fib.

### Example — EUR/USD Daily
Price reached 1.0800 Support. A Bearish Pin Bar formed there with a long wick above.
The next candle was a Bearish Engulfing.
**Signal:** Sell. SL = above the Pin Bar's high. TP = next Support`,
      ur: `## Price Action - Pin Bar, Engulfing | بغیر Indicator کے

Price Action کا مطلب ہے "صرف کینڈل دیکھ کر فیصلہ"۔ کوئی Indicator نہیں۔

### 1. Pin Bar = پن بار
لمبی Wick + چھوٹی Body۔ یہ ریجیکشن دکھاتی ہے۔
**Bullish Pin:** نیچے لمبی Wick = Sellers فیل۔ Buy سگنل
**Bearish Pin:** اوپر لمبی Wick = Buyers فیل۔ Sell سگنل
**شرط:** Support/Resistance پر بنے تو 90% کام کرتی ہے۔

### 2. Engulfing = نگل جانے والی کینڈل
**Bullish Engulfing:** چھوٹی سرخ کینڈل کے بعد بڑی سبز کینڈل جو پوری سرخ کو نگل جائے = Buy
**Bearish Engulfing:** چھوٹی سبز کے بعد بڑی سرخ جو پوری سبز کو نگل جائے = Sell

### Price Action کا گولڈن رول
کبھی اکیلی کینڈل پر ٹریڈ نہ کریں۔ ہمیشہ S&R, Trend, Fib کے ساتھ Confluence دیکھیں۔

### مثال: EUR/USD Daily
قیمت 1.0800 Support پر آئی۔ وہاں Bearish Pin Bar بنی اوپر لمبی Wick کے ساتھ۔
اگلی کینڈل Bearish Engulfing بنی۔
**سگنل:** Sell۔ SL = Pin Bar کی High کے اوپر۔ TP = اگلی Support`,
      hi: `## प्राइस एक्शन - पिन बार, एनगल्फिंग | बिना इंडिकेटर के

**Price Action** का मतलब है "केवल कैंडल देखकर फ़ैसला"। कोई इंडिकेटर नहीं।

### 1. Pin Bar = पिन बार
लंबी Wick + छोटी Body। यह रिजेक्शन दिखाती है।
**Bullish Pin:** नीचे लंबी Wick = Sellers फ़ेल। Buy सिग्नल
**Bearish Pin:** ऊपर लंबी Wick = Buyers फ़ेल। Sell सिग्नल
**शर्त:** Support/Resistance पर बने तो 90% काम करती है।

### 2. Engulfing = निगल जाने वाली कैंडल
**Bullish Engulfing:** छोटी लाल कैंडल के बाद बड़ी हरी कैंडल जो पूरी लाल को निगल जाए = Buy
**Bearish Engulfing:** छोटी हरी के बाद बड़ी लाल जो पूरी हरी को निगल जाए = Sell

### Price Action का गोल्डन रूल
कभी अकेली कैंडल पर ट्रेड न करें। हमेशा S&R, Trend, Fib के साथ Confluence देखें।

### उदाहरण: EUR/USD Daily
कीमत 1.0800 Support पर आई। वहाँ Bearish Pin Bar बनी ऊपर लंबी Wick के साथ।
अगली कैंडल Bearish Engulfing बनी।
**सिग्नल:** Sell। SL = Pin Bar की High के ऊपर। TP = अगली Support`,
      ar: `## حركة السعر - شمعة الدبوس والابتلاع | بدون مؤشرات

**حركة السعر** تعني "اتخاذ القرار بالنظر إلى الشموع فقط". بدون مؤشرات.

### 1. شمعة الدبوس
ظل طويل + جسم صغير. تُظهر الرفض.
**الدبوس الصعودي:** ظل طويل بالأسفل = فشل البائعين. إشارة شراء
**الدبوس الهبوطي:** ظل طويل بالأعلى = فشل المشترين. إشارة بيع
**الشرط:** تعمل 90% من الوقت عند الدعم/المقاومة.

### 2. الابتلاع
**الابتلاع الصعودي:** شمعة حمراء صغيرة، ثم شمعة خضراء كبيرة تبتلع الحمراء بالكامل = شراء
**الابتلاع الهبوطي:** شمعة خضراء صغيرة، ثم شمعة حمراء كبيرة تبتلع الخضراء بالكامل = بيع

### القاعدة الذهبية لحركة السعر
لا تتداول أبداً على شمعة واحدة فقط. ابحث دائماً عن تلاقي مع الدعم/المقاومة، الاتجاه، أو فيبوناتشي.

### مثال: EUR/USD يومي
السعر وصل إلى دعم 1.0800. تشكلت هناك شمعة دبوس هبوطية بظل طويل بالأعلى.
الشمعة التالية كانت ابتلاع هبوطي.
**الإشارة:** بيع. SL = فوق قمة الدبوس. الهدف = الدعم التالي`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What is the identification of a Pin Bar?", ur: "Pin Bar کی پہچان کیا ہے؟", hi: "Pin Bar की पहचान क्या है?", ar: "ما هي علامة Pin Bar؟" },
        options: [
          { en: "Big body", ur: "بڑی Body", hi: "बड़ी Body", ar: "جسم كبير" },
          { en: "Long wick + small body", ur: "لمبی Wick + چھوٹی Body", hi: "लंबी Wick + छोटी Body", ar: "ظل طويل + جسم صغير" },
          { en: "Doji", ur: "Doji", hi: "Doji", ar: "دوجي" },
          { en: "3 candles", ur: "3 کینڈل", hi: "3 कैंडल", ar: "3 شموع" },
        ],
        correctIndex: 1,
        explanation: { en: "Pin Bar = long wick + small body (shows rejection).", ur: "Pin Bar = لمبی Wick + چھوٹی Body (ریجیکشن دکھاتی ہے)۔", hi: "Pin Bar = लंबी Wick + छोटी Body (अस्वीकरण दिखाती है)।", ar: "Pin Bar = ظل طويل + جسم صغير (يُظهر الرفض)." },
      },
      {
        type: "MCQ",
        prompt: { en: "Where is a Bullish Pin Bar best formed?", ur: "Bullish Pin Bar کہاں بنے تو سب سے بہتر ہے؟", hi: "Bullish Pin Bar कहाँ बने तो सबसे अच्छा है?", ar: "أين يتشكل Pin Bar الصاعد بأفضل صورة؟" },
        options: [
          { en: "At Resistance", ur: "Resistance پر", hi: "Resistance पर", ar: "عند المقاومة" },
          { en: "At Support", ur: "Support پر", hi: "Support पर", ar: "عند الدعم" },
          { en: "In the middle", ur: "بیچ میں", hi: "बीच में", ar: "في المنتصف" },
          { en: "No difference", ur: "کوئی فرق نہیں", hi: "कोई फ़र्क नहीं", ar: "بلا فرق" },
        ],
        correctIndex: 1,
        explanation: { en: "A Bullish Pin Bar formed at Support works 90% of the time.", ur: "Bullish Pin Bar Support پر بنے تو 90% کام کرتی ہے۔", hi: "Bullish Pin Bar Support पर बने तो 90% काम करती है।", ar: "Pin Bar الصاعد المتشكل عند الدعم يعمل 90% من الوقت." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is a Bullish Engulfing?", ur: "Bullish Engulfing کیا ہے؟", hi: "Bullish Engulfing क्या है?", ar: "ما هو الابتلاع الصاعد؟" },
        options: [
          { en: "Small green, big red", ur: "چھوٹی سبز، بڑی سرخ", hi: "छोटी हरी, बड़ी लाल", ar: "خضراء صغيرة، حمراء كبيرة" },
          { en: "Big green swallows small red", ur: "بڑی سبز، چھوٹی سرخ کو نگل لے", hi: "बड़ी हरी, छोटी लाल को निगल ले", ar: "خضراء كبيرة تبتلع حمراء صغيرة" },
          { en: "2 Doji", ur: "2 Doji", hi: "2 Doji", ar: "2 دوجي" },
          { en: "3 red candles", ur: "3 سرخ کینڈل", hi: "3 लाल कैंडल", ar: "3 شموع حمراء" },
        ],
        correctIndex: 1,
        explanation: { en: "Bullish Engulfing = big green candle swallows small red = Buy.", ur: "Bullish Engulfing = بڑی سبز کینڈل چھوٹی سرخ کو نگل لے = Buy۔", hi: "Bullish Engulfing = बड़ी हरी कैंडल छोटी लाल को निगल ले = Buy।", ar: "الابتلاع الصاعد = شمعة خضراء كبيرة تبتلع حمراء صغيرة = Buy." },
      },
      {
        type: "MCQ",
        prompt: { en: "What is the Golden Rule of Price Action?", ur: "Price Action کا گولڈن رول کیا ہے؟", hi: "Price Action का गोल्डन रूल क्या है?", ar: "ما هي القاعدة الذهبية لـ Price Action؟" },
        options: [
          { en: "Trade on a single candle", ur: "اکیلی کینڈل پر ٹریڈ کریں", hi: "अकेली कैंडल पर ट्रेड करें", ar: "تداول على شمعة واحدة" },
          { en: "Always use confluence", ur: "ہمیشہ Confluence کے ساتھ دیکھیں", hi: "हमेशा Confluence के साथ देखें", ar: "استخدم دائماً Confluence" },
          { en: "Only look at wick", ur: "صرف Wick دیکھیں", hi: "सिर्फ़ Wick देखें", ar: "انظر إلى الظل فقط" },
          { en: "Keep big lot", ur: "Lot بڑا رکھیں", hi: "Lot बड़ा रखें", ar: "ضع لوت كبير" },
        ],
        correctIndex: 1,
        explanation: { en: "Price Action Golden Rule = always use Confluence (S&R, Trend, Fib).", ur: "Price Action کا گولڈن رول = ہمیشہ Confluence (S&R, Trend, Fib) کے ساتھ دیکھیں۔", hi: "Price Action का गोल्डन रूल = हमेशा Confluence (S&R, Trend, Fib) के साथ देखें।", ar: "القاعدة الذهبية لـ Price Action = استخدم دائماً Confluence (S&R, Trend, Fib)." },
      },
      {
        type: "MCQ",
        prompt: { en: "What does a Pin Bar with a long upper wick give?", ur: "اوپر لمبی Wick والی Pin Bar کیا دیتی ہے؟", hi: "ऊपर लंबी Wick वाली Pin Bar क्या देती है?", ar: "ماذا تعطي Pin Bar بظل علوي طويل؟" },
        options: [
          { en: "Buy signal", ur: "Buy سگنل", hi: "Buy सिग्नल", ar: "إشارة شراء" },
          { en: "Sell signal", ur: "Sell سگنل", hi: "Sell सिग्नल", ar: "إشارة بيع" },
          { en: "No signal", ur: "کوئی سگنل نہیں", hi: "कोई सिग्नल नहीं", ar: "بلا إشارة" },
          { en: "TP level", ur: "TP لیول", hi: "TP स्तर", ar: "مستوى TP" },
        ],
        correctIndex: 1,
        explanation: { en: "Pin Bar with long upper wick = Bearish Pin = Sell signal.", ur: "اوپر لمبی Wick والی Pin Bar = Bearish Pin = Sell سگنل۔", hi: "ऊपर लंबी Wick वाली Pin Bar = Bearish Pin = Sell सिग्नल।", ar: "Pin Bar بظل علوي طويل = Bearish Pin = إشارة بيع." },
      },
    ],
  },

  // ===== LESSON 21: Fundamental Analysis 1 - News, GDP, NFP =====
  {
    id: "eurusd-21",
    order: 9,
    title: {
      en: "Fundamental Analysis 1: News, GDP, NFP",
      ur: "Fundamental Analysis 1: News, GDP, NFP",
      hi: "फंडामेंटल एनालिसिस 1: न्यूज़, GDP, NFP",
      ar: "التحليل الأساسي 1: الأخبار، الناتج المحلي، NFP",
    },
    summary: {
      en: "Trade based on real economic news — NFP, GDP and high-impact events.",
      ur: "اصل معاشی خبروں پر ٹریڈ — NFP، GDP اور High-Impact نیوز۔",
      hi: "असली आर्थिक न्यूज़ पर ट्रेड — NFP, GDP और High-Impact घटनाएँ।",
      ar: "تداول بناءً على أخبار اقتصادية حقيقية — NFP، الناتج المحلي، والأحداث عالية التأثير.",
    },
    content: {
      en: `## Fundamental Analysis 1: News, GDP, NFP

**Fundamental Analysis** = "trading based on news". It asks: how is the country's economy doing?

### 3 Big News That Move EUR/USD

**1. NFP = Non-Farm Payrolls**
Comes on the first Friday of every month in the US. How many new jobs were created.
**Result:** Good NFP = USD strong = EUR/USD down. Bad NFP = USD weak = EUR/USD up.

**2. GDP = Gross Domestic Product**
The country's total production. Every 3 months.
Good GDP = currency stronger.

**3. High Impact News**
Red-colored news on Forex Factory. CPI, Interest Rate Decision, FOMC.

### News Trading Rules
1. No trade 15 minutes before news
2. Wait 30 minutes after news, then read the market direction
3. Always use a Stop Loss because spread widens a lot

### Example
NFP came at 500K while expectation was 200K. Very good.
**Result:** USD strong. EUR/USD dropped 50 pips in 1 minute.`,
      ur: `## Fundamental Analysis 1: News, GDP, NFP

Fundamental Analysis = "خبر کی بنیاد پر ٹریڈ"۔ یہ پوچھتا ہے کہ ملک کی معیشت کیسی ہے؟

### 3 بڑی نیوز جو EUR/USD ہلاتی ہیں

**1. NFP = Non Farm Payrolls**
امریکہ میں ہر مہینے کی پہلی جمعہ کو آتا ہے۔ نئی نوکریاں کتنی بنیں۔
**رزلٹ:** NFP اچھا = USD طاقتور = EUR/USD نیچے۔ NFP برا = USD کمزور = EUR/USD اوپر۔

**2. GDP = Gross Domestic Product**
ملک کی کل پیداوار۔ ہر 3 مہینے بعد۔
GDP اچھا = کرنسی مضبوط۔

**3. High Impact News**
لال رنگ کی خبر Forex Factory پر۔ CPI, Interest Rate Decision, FOMC۔

### نیوز ٹریڈنگ کا رول
1. نیوز سے 15 منٹ پہلے کوئی Trade نہیں
2. نیوز کے بعد 30 منٹ انتظار کریں پھر مارکیٹ کی سمت دیکھیں
3. Stop Loss لازمی لگائیں کیونکہ Spread بہت بڑھ جاتا ہے

### مثال
NFP آیا 500K جبکہ Expectation تھی 200K۔ بہت اچھا۔
**ریزلٹ:** USD مضبوط۔ EUR/USD 50 Pips نیچے 1 منٹ میں گرا۔`,
      hi: `## फंडामेंटल एनालिसिस 1: न्यूज़, GDP, NFP

**Fundamental Analysis** = "खबर की आधार पर ट्रेड"। यह पूछता है कि देश की अर्थव्यवस्था कैसी है?

### 3 बड़ी न्यूज़ जो EUR/USD हिलाती हैं

**1. NFP = Non-Farm Payrolls**
अमेरिका में हर महीने की पहली शुक्रवार को आता है। कितनी नई नौकरियाँ बनीं।
**परिणाम:** NFP अच्छा = USD मज़बूत = EUR/USD नीचे। NFP बुरा = USD कमज़ोर = EUR/USD ऊपर।

**2. GDP = Gross Domestic Product**
देश का कुल उत्पादन। हर 3 महीने में।
GDP अच्छा = मुद्रा मज़बूत।

**3. High Impact News**
Forex Factory पर लाल रंग की खबरें। CPI, Interest Rate Decision, FOMC।

### न्यूज़ ट्रेडिंग नियम
1. न्यूज़ से 15 मिनट पहले कोई ट्रेड नहीं
2. न्यूज़ के बाद 30 मिनट इंतज़ार करें फिर बाज़ार की दिशा देखें
3. हमेशा Stop Loss लगाएँ क्योंकि Spread बहुत बढ़ जाता है

### उदाहरण
NFP 500K आया जबकि अनुमान 200K था। बहुत अच्छा।
**परिणाम:** USD मज़बूत। EUR/USD 50 Pips नीचे 1 मिनट में गिरा।`,
      ar: `## التحليل الأساسي 1: الأخبار، الناتج المحلي، NFP

**التحليل الأساسي** = "التداول بناءً على الأخبار". يسأل: كيف اقتصاد البلد؟

### 3 أخبار كبيرة تحرك EUR/USD

**1. NFP = توظيف غير القطاع الزراعي**
يأتي أول جمعة من كل شهر في أمريكا. كم وظيفة جديدة أُنشئت.
**النتيجة:** NFP جيد = دولار قوي = EUR/USD هبوط. NFP سيء = دولار ضعيف = EUR/USD صعود.

**2. GDP = الناتج المحلي الإجمالي**
إجمالي إنتاج البلد. كل 3 أشهر.
GDP جيد = عملة أقوى.

**3. أخبار عالية التأثير**
الأخبار الحمراء على Forex Factory. CPI، قرار سعر الفائدة، FOMC.

### قواعد تداول الأخبار
1. لا تداول قبل 15 دقيقة من الخبر
2. انتظر 30 دقيقة بعد الخبر، ثم اقرأ اتجاه السوق
3. استخدم دائماً Stop Loss لأن السبريد يتسع كثيراً

### مثال
جاء NFP عند 500K بينما التوقع كان 200K. جيد جداً.
**النتيجة:** دولار قوي. EUR/USD هبط 50 نقطة في دقيقة واحدة.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "When does NFP come?", ur: "NFP کب آتا ہے؟", hi: "NFP कब आता है?", ar: "متى يصدر NFP؟" },
        options: [
          { en: "Every Monday", ur: "ہر پیر", hi: "हर सोमवार", ar: "كل اثنين" },
          { en: "First Friday of the month", ur: "مہینے کی پہلی جمعہ", hi: "महीने की पहली शुक्रवार", ar: "الجمعة الأولى من الشهر" },
          { en: "Daily", ur: "روزانہ", hi: "रोज़ाना", ar: "يومياً" },
          { en: "Once a year", ur: "سال میں 1 بار", hi: "साल में 1 बार", ar: "مرة في السنة" },
        ],
        correctIndex: 1,
        explanation: { en: "NFP comes on the first Friday of every month in the US.", ur: "NFP امریکہ میں ہر مہینے کی پہلی جمعہ کو آتا ہے۔", hi: "NFP अमेरिका में हर महीने की पहली शुक्रवार को आता है।", ar: "يصدر NFP في الجمعة الأولى من كل شهر في أمريكا." },
      },
      {
        type: "MCQ",
        prompt: { en: "If NFP is good, what happens to EUR/USD?", ur: "NFP اچھا آیا تو EUR/USD کا کیا ہوگا؟", hi: "NFP अच्छा आया तो EUR/USD का क्या होगा?", ar: "إذا كان NFP جيداً، ماذا يحدث لـ EUR/USD؟" },
        options: [
          { en: "Will go up", ur: "اوپر جائے گا", hi: "ऊपर जाएगा", ar: "سيصعد" },
          { en: "Will fall", ur: "نیچے گرے گا", hi: "नीचे गिरेगा", ar: "سيهبط" },
          { en: "No difference", ur: "کوئی فرق نہیں", hi: "कोई फ़र्क नहीं", ar: "بلا فرق" },
          { en: "Will close", ur: "بند ہو جائے گا", hi: "बंद हो जाएगा", ar: "سيغلق" },
        ],
        correctIndex: 1,
        explanation: { en: "Good NFP = USD strong = EUR/USD will fall.", ur: "NFP اچھا = USD طاقتور = EUR/USD نیچے گرے گا۔", hi: "NFP अच्छा = USD मज़बूत = EUR/USD नीचे गिरेगा।", ar: "NFP جيد = USD قوي = EUR/USD سيهبط." },
      },
      {
        type: "MCQ",
        prompt: { en: "What does GDP tell us?", ur: "GDP کیا بتاتا ہے؟", hi: "GDP क्या बताता है?", ar: "ماذا يخبرنا GDP؟" },
        options: [
          { en: "Inflation", ur: "مہنگائی", hi: "महँगाई", ar: "التضخم" },
          { en: "Country's total production", ur: "ملک کی کل پیداوار", hi: "देश की कुल उत्पादन", ar: "إجمالي إنتاج البلد" },
          { en: "Interest rate", ur: "سود کی شرح", hi: "ब्याज दर", ar: "سعر الفائدة" },
          { en: "Unemployment", ur: "بے روزگاری", hi: "बेरोज़गारी", ar: "البطالة" },
        ],
        correctIndex: 1,
        explanation: { en: "GDP = Gross Domestic Product = country's total production.", ur: "GDP = Gross Domestic Product = ملک کی کل پیداوار۔", hi: "GDP = Gross Domestic Product = देश की कुल उत्पादन।", ar: "GDP = الناتج المحلي الإجمالي = إجمالي إنتاج البلد." },
      },
      {
        type: "MCQ",
        prompt: { en: "How long to wait before news trading?", ur: "نیوز ٹریڈنگ سے پہلے کتنی دیر انتظار کریں؟", hi: "News ट्रेडिंग से पहले कितनी देर इंतज़ार करें?", ar: "كم ننتظر قبل تداول الأخبار؟" },
        options: [
          { en: "5 minutes", ur: "5 منٹ", hi: "5 मिनट", ar: "5 دقائق" },
          { en: "15 min before and 30 min after", ur: "15 منٹ پہلے اور 30 منٹ بعد", hi: "15 मिनट पहले और 30 मिनट बाद", ar: "15 دقيقة قبل و 30 دقيقة بعد" },
          { en: "2 hours", ur: "2 گھنٹے", hi: "2 घंटे", ar: "ساعتان" },
          { en: "Don't wait", ur: "انتظار نہ کریں", hi: "इंतज़ार न करें", ar: "لا تنتظر" },
        ],
        correctIndex: 1,
        explanation: { en: "Don't trade 15 min before news, wait 30 min after.", ur: "نیوز سے 15 منٹ پہلے Trade نہیں، 30 منٹ بعد انتظار کریں۔", hi: "News से 15 मिनट पहले Trade नहीं, 30 मिनट बाद इंतज़ार करें।", ar: "لا تتداول 15 دقيقة قبل الأخبار، انتظر 30 دقيقة بعد." },
      },
      {
        type: "MCQ",
        prompt: { en: "What does a red colored news on Forex Factory mean?", ur: "Forex Factory پر لال رنگ کی خبر کیا ہوتی ہے؟", hi: "Forex Factory पर लाल रंग की ख़बर क्या होती है?", ar: "ماذا تعني الأخبار الحمراء على Forex Factory؟" },
        options: [
          { en: "Low importance", ur: "کم اہم", hi: "कम अहम", ar: "أهمية منخفضة" },
          { en: "High Impact News", ur: "High Impact News", hi: "High Impact News", ar: "أخبار عالية التأثير" },
          { en: "Fake news", ur: "جھوٹی خبر", hi: "झूठी ख़बर", ar: "أخبار كاذبة" },
          { en: "Close news", ur: "بند کی خبر", hi: "बंद की ख़बर", ar: "أخبار الإغلاق" },
        ],
        correctIndex: 1,
        explanation: { en: "Red color = High Impact News (CPI, Interest Rate, FOMC).", ur: "لال رنگ = High Impact News (CPI, Interest Rate, FOMC)۔", hi: "लाल रंग = High Impact News (CPI, Interest Rate, FOMC)।", ar: "اللون الأحمر = أخبار عالية التأثير (CPI, Interest Rate, FOMC)." },
      },
    ],
  },

  // ===== LESSON 22: Fundamental Analysis 2 - Interest Rate, CPI =====
  {
    id: "eurusd-22",
    order: 10,
    title: {
      en: "Fundamental Analysis 2: Interest Rate & CPI",
      ur: "Fundamental Analysis 2: Interest Rate, CPI",
      hi: "फंडामेंटल एनालिसिस 2: ब्याज दर और CPI",
      ar: "التحليل الأساسي 2: سعر الفائدة و CPI",
    },
    summary: {
      en: "The two forces that truly decide a currency's price — Interest Rate and CPI.",
      ur: "وہ 2 چیزیں جو کرنسی کی قیمت کا اصل فیصلہ کرتی ہیں — Interest Rate اور CPI۔",
      hi: "वे 2 चीज़ें जो मुद्रा की कीमत का असली फ़ैसला करती हैं — Interest Rate और CPI।",
      ar: "القوتان اللتان تقرران حقيقة سعر العملة — سعر الفائدة و CPI.",
    },
    content: {
      en: `## Fundamental Analysis 2: Interest Rate & CPI

These 2 things truly decide a currency's price.

### 1. Interest Rate
This is the biggest weapon. The Central Bank decides it.
**Rule:** Interest Rate rises = currency stronger.
Why? People will bring money to that country to earn more interest.

**Example:** If the Fed raises rates and the ECB does not, then USD > EUR = EUR/USD goes down.

### 2. CPI = Consumer Price Index = Inflation
This tells us how much inflation there is.
**Rule:** High CPI = Central Bank will raise rates = currency stronger.
Low CPI = rates won't rise = currency weaker.

### Fundamental + Technical = Complete Trader
First read the news to know the direction. Then use Technical to find Entry.

### Example — EUR/USD
ECB said "we will raise rates".
At the same time, on the chart price was at the 61.8% Fib Support.
**Signal:** Buy. Both Fundamental and Technical were saying Buy.`,
      ur: `## Fundamental Analysis 2: Interest Rate, CPI

یہ 2 چیزیں کرنسی کی قیمت کا اصل فیصلہ کرتی ہیں۔

### 1. Interest Rate = سود کی شرح
یہ سب سے بڑا ہتھیار ہے۔ Central Bank فیصلہ کرتی ہے۔
**رول:** Interest Rate بڑھے = کرنسی مضبوط۔
کیوں؟ لوگ زیادہ سود کمانے اس ملک میں پیسہ لائیں گے۔

**مثال:** اگر Fed Rate بڑھائے اور ECB نہ بڑھائے تو USD > EUR = EUR/USD نیچے جائے گا۔

### 2. CPI = Consumer Price Index = مہنگائی
یہ بتاتا ہے مہنگائی کتنی ہے۔
**رول:** CPI زیادہ = Central Bank Rate بڑھائے گی = کرنسی مضبوط۔
CPI کم = Rate نہیں بڑھے گا = کرنسی کمزور۔

### Fundamental + Technical = مکمل ٹریڈر
پہلے News دیکھیں کہ سمت کیا ہے۔ پھر Technical سے Entry ڈھونڈیں۔

### مثال: EUR/USD
ECB نے کہا "ہم Rate بڑھائیں گے"۔
اسی وقت چارٹ پر قیمت 61.8% Fib Support پر تھی۔
**سگنل:** Buy۔ Fund اور Tech دونوں Buy کہہ رہے تھے۔`,
      hi: `## फंडामेंटल एनालिसिस 2: ब्याज दर और CPI

ये 2 चीज़ें मुद्रा की कीमत का असली फ़ैसला करती हैं।

### 1. Interest Rate = ब्याज दर
यह सबसे बड़ा हथियार है। Central Bank फ़ैसला करती है।
**नियम:** Interest Rate बढ़े = मुद्रा मज़बूत।
क्यों? लोग ज़्यादा ब्याज कमाने उस देश में पैसा लाएँगे।

**उदाहरण:** अगर Fed Rate बढ़ाए और ECB न बढ़ाए, तो USD > EUR = EUR/USD नीचे जाएगा।

### 2. CPI = Consumer Price Index = महँगाई
यह बताता है महँगाई कितनी है।
**नियम:** CPI ज़्यादा = Central Bank Rate बढ़ाएगी = मुद्रा मज़बूत।
CPI कम = Rate नहीं बढ़ेगा = मुद्रा कमज़ोर।

### Fundamental + Technical = पूर्ण ट्रेडर
पहले News देखें कि दिशा क्या है। फिर Technical से Entry ढूँढें।

### उदाहरण: EUR/USD
ECB ने कहा "हम Rate बढ़ाएँगे"।
उसी समय चार्ट पर कीमत 61.8% Fib Support पर थी।
**सिग्नल:** Buy। Fund और Tech दोनों Buy कह रहे थे।`,
      ar: `## التحليل الأساسي 2: سعر الفائدة و CPI

هاتان القوتان تقرران حقيقة سعر العملة.

### 1. سعر الفائدة
هذا أكبر سلاح. البنك المركزي يقرره.
**القاعدة:** ارتفاع سعر الفائدة = عملة أقوى.
لماذا؟ سيجلب الناس أموالهم إلى ذلك البلد لكسب فائدة أكبر.

**مثال:** إذا رفع الاحتياطي الفيدرالي الأسعار ولم يرفعها البنك المركزي الأوروبي، فإن USD > EUR = EUR/USD يهبط.

### 2. CPI = مؤشر أسعار المستهلك = التضخم
يخبرنا بكمية التضخم.
**القاعدة:** CPI مرتفع = البنك المركزي سيرفع الأسعار = عملة أقوى.
CPI منخفض = لن تُرفع الأسعار = عملة أضعف.

### الأساسي + الفني = متداول كامل
اقرأ الأخبار أولاً لمعرفة الاتجاه. ثم استخدم الفني لإيجاد الدخول.

### مثال: EUR/USD
قال البنك المركزي الأوروبي "سنرفع الأسعار".
في نفس الوقت، على الرسم كان السعر عند دعم فيبوناتشي 61.8%.
**الإشارة:** شراء. الأساسي والفني كلاهما يقول شراء.`,
    },
    durationMin: 7,
    isFree: true,
    questions: [
      {
        type: "MCQ",
        prompt: { en: "What is the effect on currency when Interest Rate rises?", ur: "Interest Rate بڑھنے سے کرنسی پر کیا اثر؟", hi: "Interest Rate बढ़ने से मुद्रा पर क्या असर?", ar: "ما تأثير ارتفاع سعر الفائدة على العملة؟" },
        options: [
          { en: "Becomes weaker", ur: "کمزور ہوتی ہے", hi: "कमज़ोर होती है", ar: "تضعف" },
          { en: "Becomes stronger", ur: "مضبوط ہوتی ہے", hi: "मज़बूत होती है", ar: "تقوى" },
          { en: "No effect", ur: "کوئی اثر نہیں", hi: "कोई असर नहीं", ar: "بلا تأثير" },
          { en: "Closes", ur: "بند ہو جاتی ہے", hi: "बंद हो जाती है", ar: "تغلق" },
        ],
        correctIndex: 1,
        explanation: { en: "Interest Rate rises = currency stronger (more money flows in).", ur: "Interest Rate بڑھے = کرنسی مضبوط (زیادہ پیسہ آتا ہے)۔", hi: "Interest Rate बढ़े = मुद्रा मज़बूत (ज़्यादा पैसा आता है)।", ar: "ارتفاع سعر الفائدة = عملة أقوى (تدفق أموال أكثر)." },
      },
      {
        type: "MCQ",
        prompt: { en: "What does CPI measure?", ur: "CPI کیا ماپتا ہے؟", hi: "CPI क्या नापता है?", ar: "ماذا يقيس CPI؟" },
        options: [
          { en: "Jobs", ur: "نوکریاں", hi: "नौकरियाँ", ar: "الوظائف" },
          { en: "Inflation", ur: "مہنگائی", hi: "महँगाई", ar: "التضخم" },
          { en: "GDP", ur: "GDP", hi: "GDP", ar: "GDP" },
          { en: "Interest", ur: "سود", hi: "ब्याज", ar: "الفائدة" },
        ],
        correctIndex: 1,
        explanation: { en: "CPI = Consumer Price Index = measures inflation.", ur: "CPI = Consumer Price Index = مہنگائی ماپتا ہے۔", hi: "CPI = Consumer Price Index = महँगाई नापता है।", ar: "CPI = مؤشر أسعار المستهلك = يقيس التضخم." },
      },
      {
        type: "MCQ",
        prompt: { en: "If CPI is high, what will the Central Bank do?", ur: "CPI زیادہ آئے تو Central Bank کیا کرے گی؟", hi: "CPI ज़्यादा आए तो Central Bank क्या करेगा?", ar: "إذا كان CPI مرتفعاً، ماذا سيفعل البنك المركزي؟" },
        options: [
          { en: "Lower rate", ur: "Rate کم کرے گی", hi: "Rate कम करेगा", ar: "يخفض السعر" },
          { en: "Raise rate", ur: "Rate بڑھائے گی", hi: "Rate बढ़ाएगा", ar: "يرفع السعر" },
          { en: "Do nothing", ur: "کچھ نہیں کرے گی", hi: "कुछ नहीं करेगा", ar: "لا يفعل شيئاً" },
          { en: "Close market", ur: "مارکیٹ بند کر دے گی", hi: "बाज़ार बंद कर देगा", ar: "يغلق السوق" },
        ],
        correctIndex: 1,
        explanation: { en: "High CPI = inflation = Central Bank will raise rate.", ur: "CPI زیادہ = مہنگائی = Central Bank Rate بڑھائے گی۔", hi: "CPI ज़्यादा = महँगाई = Central Bank Rate बढ़ाएगा।", ar: "CPI مرتفع = تضخم = البنك المركزي سيرفع السعر." },
      },
      {
        type: "MCQ",
        prompt: { en: "If Fed raises rate but ECB doesn't, then EUR/USD?", ur: "Fed Rate بڑھے اور ECB نہ بڑھے تو EUR/USD؟", hi: "Fed Rate बढ़े और ECB न बढ़ाए तो EUR/USD?", ar: "إذا رفع الفيدرالي الأسعار ولم يرفعها ECB فـ EUR/USD؟" },
        options: [
          { en: "Will go up", ur: "اوپر جائے گا", hi: "ऊपर जाएगा", ar: "سيصعد" },
          { en: "Will go down", ur: "نیچے جائے گا", hi: "नीचे जाएगा", ar: "سيهبط" },
          { en: "Will stay same", ur: "ایک جیسا رہے گا", hi: "एक जैसा रहेगा", ar: "سيبقى كما هو" },
          { en: "Unknown", ur: "پتا نہیں", hi: "पता नहीं", ar: "غير معروف" },
        ],
        correctIndex: 1,
        explanation: { en: "Fed raises rate, ECB doesn't = USD > EUR = EUR/USD down.", ur: "Fed Rate بڑھے، ECB نہ بڑھائے = USD > EUR = EUR/USD نیچے۔", hi: "Fed Rate बढ़े, ECB न बढ़ाए = USD > EUR = EUR/USD नीचे।", ar: "الفيدرالي يرفع والـ ECB لا = USD > EUR = EUR/USD هبوط." },
      },
      {
        type: "MCQ",
        prompt: { en: "How do you become a complete trader?", ur: "مکمل ٹریڈر کیسے بنتے ہیں؟", hi: "पूर्ण ट्रेडर कैसे बनते हैं?", ar: "كيف تصبح متداولاً كاملاً؟" },
        options: [
          { en: "Only Technical", ur: "صرف Technical", hi: "सिर्फ़ Technical", ar: "فقط الفني" },
          { en: "Only Fundamental", ur: "صرف Fundamental", hi: "सिर्फ़ Fundamental", ar: "فقط الأساسي" },
          { en: "Both Fundamental + Technical", ur: "Fundamental + Technical دونوں", hi: "Fundamental + Technical दोनों", ar: "الأساسي + الفني معاً" },
          { en: "By guess", ur: "اندازے سے", hi: "अंदाज़े से", ar: "بالتخمين" },
        ],
        correctIndex: 2,
        explanation: { en: "Complete trader uses both Fundamental (direction) + Technical (entry).", ur: "مکمل ٹریڈر = Fundamental (سمت) + Technical (Entry) دونوں استعمال کرتا ہے۔", hi: "पूर्ण ट्रेडर = Fundamental (दिशा) + Technical (Entry) दोनों इस्तेमाल करता है।", ar: "المتداول الكامل يستخدم الأساسي (الاتجاه) + الفني (الدخول) معاً." },
      },
    ],
  },
]

export async function seedIntermediateLessons(db: PrismaClient) {
  // Get the Intermediate category
  const intermediate = await db.category.findUnique({ where: { slug: "intermediate" } })
  if (!intermediate) throw new Error("Intermediate category not found — run main seed first")

  // Delete old intermediate lessons + their quizzes/questions
  const oldLessons = await db.lesson.findMany({ where: { categoryId: intermediate.id }, select: { id: true } })
  if (oldLessons.length > 0) {
    await db.lesson.deleteMany({ where: { id: { in: oldLessons.map((l) => l.id) } } })
  }

  let lessonCount = 0
  let quizCount = 0

  for (const ls of LESSONS) {
    const lesson = await db.lesson.create({
      data: {
        id: ls.id,
        categoryId: intermediate.id,
        order: ls.order,
        titleEn: ls.title.en, titleUr: ls.title.ur, titleHi: ls.title.hi, titleAr: ls.title.ar,
        summaryEn: ls.summary.en, summaryUr: ls.summary.ur, summaryHi: ls.summary.hi, summaryAr: ls.summary.ar,
        contentEn: ls.content.en, contentUr: ls.content.ur, contentHi: ls.content.hi, contentAr: ls.content.ar,
        imageUrl: `/lessons/lesson-${ls.order + 12}.png`,
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
