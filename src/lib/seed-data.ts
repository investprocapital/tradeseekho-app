/* TradeSeekho seed script — run with: bun run prisma/seed.ts */




export async function seedTradeSeekho(db: import("@prisma/client").PrismaClient): Promise<{ categories: number; lessons: number; quizzes: number }> {
  console.log('🌱 Seeding TradeSeekho...')

  // ---------- Categories ----------
  const [beginner, intermediate, advanced] = await Promise.all([
    db.category.upsert({
      where: { slug: 'beginner' },
      update: {},
      create: {
        slug: 'beginner',
        nameEn: 'Beginner', nameUr: 'ابتدائی', nameHi: 'शुरुआती', nameAr: 'مبتدئ',
        descriptionEn: 'Start here. Learn the foundations of Forex & Crypto markets.',
        descriptionUr: 'یہاں سے شروع کریں۔ فاریکس اور کرپٹو مارکیٹس کی بنیادیں سیکھیں۔',
        descriptionHi: 'यहाँ से शुरू करें। फॉरेक्स और क्रिप्टो बाज़ार की नींव सीखें।',
        descriptionAr: 'ابدأ من هنا. تعلم أسواق الفوركس والعملات الرقمية.',
        icon: 'Sprout', color: '#00C853', order: 1,
      },
    }),
    db.category.upsert({
      where: { slug: 'intermediate' },
      update: {},
      create: {
        slug: 'intermediate',
        nameEn: 'Intermediate', nameUr: 'درمیانی', nameHi: 'मध्यवर्ती', nameAr: 'متوسط',
        descriptionEn: 'Charts, patterns and price action to read the market.',
        descriptionUr: 'مارکیٹ پڑھنے کے لیے چارٹس، پیٹرن اور پرائس ایکشن۔',
        descriptionHi: 'बाज़ार पढ़ने के लिए चार्ट, पैटर्न और प्राइस एक्शन।',
        descriptionAr: 'الرسوم البيانية والأنماط وحركة السعر لقراءة السوق.',
        icon: 'LineChart', color: '#FFC107', order: 2,
      },
    }),
    db.category.upsert({
      where: { slug: 'advanced' },
      update: {},
      create: {
        slug: 'advanced',
        nameEn: 'Advanced', nameUr: 'ایڈوانس', nameHi: 'उन्नत', nameAr: 'متقدم',
        descriptionEn: 'Risk, psychology and strategy for consistent trading.',
        descriptionUr: 'مسلسل ٹریڈنگ کے لیے رسک، نفسیات اور حکمت عملی۔',
        descriptionHi: 'निरंतर ट्रेडिंग के लिए जोखिम, मनोविज्ञान और रणनीति।',
        descriptionAr: 'المخاطر وعلم النفس والاستراتيجية للتداول المستمر.',
        icon: 'Trophy', color: '#00BFA5', order: 3,
      },
    }),
  ])

  // ---------- Helper to build a lesson + quiz ----------
  type Q = {
    type: 'MCQ' | 'TF'
    p: [string, string, string, string]
    opts: [string, string, string?, string?][] // per-language options (4 langs)
    correct: number
    expl?: [string, string, string, string]
  }

  async function buildLesson(opts: {
    category: typeof beginner
    order: number
    title: [string, string, string, string]
    summary: [string, string, string, string]
    content: [string, string, string, string]
    imageUrl?: string
    questions: Q[]
  }) {
    const lesson = await db.lesson.upsert({
      where: { id: `${opts.category.slug}-${opts.order}` },
      update: {},
      create: {
        id: `${opts.category.slug}-${opts.order}`,
        categoryId: opts.category.id,
        order: opts.order,
        titleEn: opts.title[0], titleUr: opts.title[1], titleHi: opts.title[2], titleAr: opts.title[3],
        summaryEn: opts.summary[0], summaryUr: opts.summary[1], summaryHi: opts.summary[2], summaryAr: opts.summary[3],
        contentEn: opts.content[0], contentUr: opts.content[1], contentHi: opts.content[2], contentAr: opts.content[3],
        imageUrl: opts.imageUrl ?? null,
        durationMin: 6, isPublished: true, isFree: true,
      },
    })

    if (await db.quiz.count({ where: { lessonId: lesson.id } })) {
      await db.quiz.delete({ where: { lessonId: lesson.id } })
    }
    const quiz = await db.quiz.create({
      data: { lessonId: lesson.id, passMark: 3 },
    })

    for (const q of opts.questions) {
      await db.question.create({
        data: {
          quizId: quiz.id,
          type: q.type,
          promptEn: q.p[0], promptUr: q.p[1], promptHi: q.p[2], promptAr: q.p[3],
          option1En: q.opts[0][0], option1Ur: q.opts[0][1], option1Hi: q.opts[0][2], option1Ar: q.opts[0][3],
          option2En: q.opts[1][0], option2Ur: q.opts[1][1], option2Hi: q.opts[1][2], option2Ar: q.opts[1][3],
          option3En: q.opts[2]?.[0] ?? null, option3Ur: q.opts[2]?.[1] ?? null, option3Hi: q.opts[2]?.[2] ?? null, option3Ar: q.opts[2]?.[3] ?? null,
          option4En: q.opts[3]?.[0] ?? null, option4Ur: q.opts[3]?.[1] ?? null, option4Hi: q.opts[3]?.[2] ?? null, option4Ar: q.opts[3]?.[3] ?? null,
          correctIndex: q.correct,
          explanationEn: q.expl?.[0] ?? null, explanationUr: q.expl?.[1] ?? null, explanationHi: q.expl?.[2] ?? null, explanationAr: q.expl?.[3] ?? null,
        },
      })
    }
    return lesson
  }

  // ---------- Lesson 1: What is Forex Trading? ----------
  await buildLesson({
    category: beginner, order: 1,
    title: ['What is Forex Trading?', 'فاریکس ٹریڈنگ کیا ہے؟', 'फॉरेक्स ट्रेडिंग क्या है?', 'ما هو تداول الفوركس؟'],
    summary: [
      'Understand the world\'s largest financial market and how currencies are exchanged.',
      'دنیا کے سب سے بڑے مالیاتی مارکیٹ کو سمجھیں اور کرنسیاں کیسے بدلی جاتی ہیں۔',
      'दुनिया के सबसे बड़े वित्तीय बाज़ार को समझें और मुद्राओं का आदान-प्रदान कैसे होता है।',
      'افهم أكبر سوق مالي في العالم وكيف يتم تبادل العملات.',
    ],
    content: [
      `## What is Forex?

**Forex** (Foreign Exchange) is the global market where currencies are traded against each other. It is the world's largest financial market, with over **$7 trillion** traded every single day.

### Why does it exist?
Companies, banks, governments and travellers need to exchange one currency for another. If a Pakistani importer buys goods from the USA, they must pay in US Dollars — so they exchange PKR for USD.

### Key takeaways
- Forex has **no central location** — it runs 24 hours a day, 5 days a week.
- Currencies trade in **pairs** (e.g. EUR/USD).
- Prices move because of **supply and demand**, news, and interest rates.

> Forex is exciting, but treat it like a business — not a casino.`,
      `## فاریکس کیا ہے؟

**فاریکس** (Foreign Exchange) عالمی مارکیٹ ہے جہاں کرنسیوں کا لین دین ہوتا ہے۔ یہ دنیا کا سب سے بڑا مالیاتی مارکیٹ ہے جہاں روزانہ **7 ٹریلین ڈالر** سے زائد کا کاروبار ہوتا ہے۔

### یہ کیوں موجود ہے؟
کمپنیوں، بینکوں، حکومتوں اور مسافروں کو ایک کرنسی کو دوسری میں بدلنے کی ضرورت ہوتی ہے۔ اگر ایک پاکستانی درآمد کنندہ امریکہ سے سامان خریدتا ہے تو اسے ڈالر میں ادائیگی کرنی ہوتی ہے۔

### اہم نکات
- فاریکس کا **کوئی مرکزی مقام نہیں** — یہ 24 گھنٹے، ہفتے میں 5 دن چلتا ہے۔
- کرنسیاں **جوڑوں** میں ٹریڈ ہوتی ہیں (جیسے EUR/USD)۔
- قیمت **ڈیمانڈ اور سپلائی**، خبروں اور شرح سود کی وجہ سے بدلتی ہے۔

> فاریکس دلچسپ ہے، مگر اسے کاروبار سمجھیں — جوئے کی طرح نہیں۔`,
      `## फॉरेक्स क्या है?

**फॉरेक्स** (विदेशी विनिमय) वैश्विक बाज़ार है जहाँ मुद्राओं का आपस में लेन-देन होता है। यह दुनिया का सबसे बड़ा वित्तीय बाज़ार है जहाँ हर दिन **7 ट्रिलियन डॉलर** से अधिक का कारोबार होता है।

### यह क्यों मौजूद है?
कंपनियों, बैंकों, सरकारों और यात्रियों को एक मुद्रा को दूसरी में बदलने की ज़रूरत होती है।

### मुख्य बिंदु
- फॉरेक्स का **कोई केंद्र नहीं** — यह 24 घंटे चलता है।
- मुद्राएँ **जोड़ियों** में ट्रेड होती हैं (जैसे EUR/USD)।
- कीमत **माँग-आपूर्ति**, समाचार और ब्याज दर से बदलती है।

> फॉरेक्स रोमांचक है, पर इसे व्यवसाय समझें — जुए की तरह नहीं।`,
      `## ما هو الفوركس؟

**الفوركس** (سوق الصرف الأجنبي) هو السوق العالمي where يتم تداول العملات. إنه أكبر سوق مالي في العالم بأكثر من **7 تريليون دولار** يومياً.

### لماذا يوجد؟
الشركات والبنوك والحكومات والمسافرون يحتاجون لتبديل عملة بأخرى.

### النقاط الرئيسية
- ليس للفوركس **مركز واحد** — يعمل 24 ساعة.
- العملات تتداول في **أزواج** (مثل EUR/USD).
- الأسعار تتحرك بسبب **العرض والطلب** والأخبار.

> الفوركس مثير، لكن عامله كعمل تجاري — لا كقمار.`,
    ],
    questions: [
      {
        type: 'MCQ',
        p: ['What does "Forex" stand for?', 'فاریکس کس کا مخفف ہے؟', '"फॉरेक्स" किसका संक्षेप है?', 'مختصر كلمة "الفوركس"؟'],
        opts: [
          ['Foreign Exchange', 'فارن ایکسچینج', 'विदेशी विनिमय', 'صرف أجنبي'],
          ['Foreign Export', 'فارن ایکسپورٹ', 'विदेशी निर्यात', 'تصدير أجنبي'],
          ['Formal Export Rules', 'فارمل ایکسپورٹ رولز', 'औपचारिक निर्यात नियम', 'قواعد تصدير رسمية'],
          ['Forward Exchange Rate', 'فارورڈ ایکسچینج ریٹ', 'अग्रेषित विनिमय दर', 'سعر صرف آجل'],
        ],
        correct: 0,
        expl: ['Forex = Foreign Exchange, the market for trading currencies.', 'فاریکس یعنی فارن ایکسچینج، کرنسیوں کی ٹریڈنگ کا مارکیٹ۔', 'फॉरेक्स = विदेशी विनिमय, मुद्रा ट्रेडिंग का बाज़ार।', 'الفوركس = الصرف الأجنبي، سوق تداول العملات.'],
      },
      {
        type: 'MCQ',
        p: ['Roughly how much is traded in Forex every day?', 'فاریکس میں روزانہ تقریباً کتنا کاروبار ہوتا ہے؟', 'फॉरेक्स में रोज़ कितना कारोबार होता है?', 'كم يُتداول في الفوركس يومياً تقريباً؟'],
        opts: [
          ['$7 million', '7 ملین ڈالر', '7 मिलियन डॉलर', '7 مليون دولار'],
          ['$7 billion', '7 ارب ڈالر', '7 अरब डॉलर', '7 مليار دولار'],
          ['$7 trillion', '7 ٹریلین ڈالر', '7 ट्रिलियन डॉलर', '7 تريليون دولار'],
          ['$7 trillion occasionally', 'کتنے ہی بار', 'कभी-कभी', 'أحياناً'],
        ],
        correct: 2,
        expl: ['Over $7 trillion is traded every day in the Forex market.', 'فاریکس مارکیٹ میں روزانہ 7 ٹریلین ڈالر سے زائد کا کاروبار ہوتا ہے۔', 'फॉरेक्स में हर दिन 7 ट्रिलियन डॉलर से अधिक का कारोबार होता है।', 'أكثر من 7 تريليون دولار يومياً.'],
      },
      {
        type: 'TF',
        p: ['Forex has a single central exchange building.', 'فاریکس کا کوئی واحد مرکزی عمارت ہے۔', 'फॉरेक्स की एक केंद्रीय इमारत है।', 'للفوركس مبنى مركزي واحد.'],
        opts: [
          ['True', 'سچ', 'सच', 'صحيح'],
          ['False', 'جھوٹ', 'झूठ', 'خطأ'],
        ],
        correct: 1,
        expl: ['Forex is decentralized — it runs 24/5 across the world.', 'فاریکس غیر مرکزی ہے — یہ دنیا بھر میں 24/5 چلتا ہے۔', 'फॉरेक्स विकेंद्रीकृत है — यह 24/5 चलता है।', 'الفوركس لا مركزي — يعمل 24/5.'],
      },
      {
        type: 'MCQ',
        p: ['When does the Forex market operate?', 'فاریکس مارکیٹ کب چلتی ہے؟', 'फॉरेक्स बाज़ार कब चलता है?', 'متى يعمل سوق الفوركس؟'],
        opts: [
          ['Only on weekends', 'صرف ہفتے کے آخری دنوں میں', 'सिर्फ सप्ताहांत में', 'عطل نهاية الأسبوع فقط'],
          ['24 hours a day, 5 days a week', '24 گھنٹے، ہفتے میں 5 دن', '24 घंटे, हफ्ते में 5 दिन', '24 ساعة، 5 أيام أسبوعياً'],
          ['9am to 5pm only', 'صبح 9 سے شام 5 تک', 'सुबह 9 से शाम 5', '9ص حتى 5م فقط'],
          ['Never', 'کبھی نہیں', 'कभी नहीं', 'أبداً'],
        ],
        correct: 1,
      },
      {
        type: 'MCQ',
        p: ['Which factor mainly moves currency prices?', 'کرنسی کی قیمت کس چیز سے بنیادی طور پر بدلتی ہے؟', 'मुद्रा की कीमत किससे मुख्य रूप से बदलती है?', 'ما يحرك أسعار العملات أساساً؟'],
        opts: [
          ['Lucky numbers', 'خوش قسمتی کے نمبر', 'भाग्यशाली नंबर', 'أرقام الحظ'],
          ['Supply and demand', 'ڈیمانڈ اور سپلائی', 'माँग और आपूर्ति', 'العرض والطلب'],
          ['The weather', 'موسم', 'मौसम', 'الطقس'],
          ['Random only', 'صرف اتفاق', 'सिर्फ अनियमित', 'عشوائي فقط'],
        ],
        correct: 1,
        expl: ['Currency prices move mainly due to supply and demand, news and interest rates.', 'کرنسی کی قیمت بنیادی طور پر ڈیمانڈ، سپلائی، خبروں اور شرح سود سے بدلتی ہے۔', 'मुद्रा की कीमत मुख्य रूप से माँग-आपूर्ति, समाचार और ब्याज दर से बदलती है।', 'تتحرك الأسعار بسبب العرض والطلب والأخبار وفوائد.'],
      },
    ],
  })

  // ---------- Lesson 2: Currency Pairs ----------
  await buildLesson({
    category: beginner, order: 2,
    title: ['Understanding Currency Pairs', 'کرنسی جوڑوں کو سمجھنا', 'मुद्रा जोड़ियों को समझना', 'فهم أزواج العملات'],
    summary: [
      'Learn how base and quote currencies work and how to read a pair like EUR/USD.',
      'بیس اور کوٹ کرنسی کیسے کام کرتی ہے اور EUR/USD جیسا جوڑ کیسے پڑھیں۔',
      'बेस और कोट मुद्रा कैसे काम करती है और EUR/USD जैसा जोड़ा कैसे पढ़ें।',
      'كيف تعمل العملة الأساسية والعملة المقتبسة وكيف تقرأ زوجاً مثل EUR/USD.',
    ],
    content: [
      `## Currency Pairs

In Forex you always trade **two currencies together** — a **pair**. Example: **EUR/USD**.

- **Base currency** (first) = the Euro
- **Quote currency** (second) = the US Dollar

The price tells you **how many quote units you need to buy one base unit**.
If EUR/USD = 1.10, then **1 Euro = 1.10 US Dollars**.

### Reading the pair
- If you think the Euro will get **stronger**, you **buy** EUR/USD.
- If you think the Euro will get **weaker**, you **sell** EUR/USD.

### Major pairs
EUR/USD, GBP/USD, USD/JPY, USD/CHF — these have the highest volume and the tightest spreads.`,
      `## کرنسی جوڑے

فاریکس میں آپ ہمیشہ **دو کرنسیاں ایک ساتھ** ٹریڈ کرتے ہیں — ایک **جوڑا**۔ مثال: **EUR/USD**۔

- **بیس کرنسی** (پہلی) = یورو
- **کوٹ کرنسی** (دوسری) = امریکی ڈالر

قیمت بتاتی ہے کہ **ایک بیس یونٹ خریدنے کے لیے کتنے کوٹ یونٹ چاہیے**۔
اگر EUR/USD = 1.10 ہے تو **1 یورو = 1.10 ڈالر**۔

### جوڑے کو پڑھنا
- اگر آپ سمجھتے ہیں یورو **مضبوط** ہوگا، تو EUR/USD **خریدیں**۔
- اگر آپ سمجھتے ہیں یورو **کمزور** ہوگا، تو EUR/USD **بیچیں**۔

### بڑے جوڑے
EUR/USD, GBP/USD, USD/JPY, USD/CHF — ان میں سب سے زیادہ حجم اور کم سے کم سپریڈ ہوتا ہے۔`,
      `## मुद्रा जोड़े

फॉरेक्स में आप हमेशा **दो मुद्राएँ एक साथ** ट्रेड करते हैं — एक **जोड़ा**। उदाहरण: **EUR/USD**।

- **बेस मुद्रा** (पहली) = यूरो
- **कोट मुद्रा** (दूसरी) = अमेरिकी डॉलर

कीमत बताती है कि **एक बेस यूनिट खरीदने के लिए कितने कोट यूनिट चाहिए**।
यदि EUR/USD = 1.10, तो **1 यूरो = 1.10 डॉलर**।

### जोड़ा पढ़ना
- यूरो **मज़बूत** होगा तो EUR/USD **खरीदें**।
- यूरो **कमज़ोर** होगा तो EUR/USD **बेचें**।

### प्रमुख जोड़े
EUR/USD, GBP/USD, USD/JPY, USD/CHF — इनमें सबसे अधिक आयतन होता है।`,
      `## أزواج العملات

في الفوركس تتداول دائماً **عملتين معاً** — **زوج**. مثال: **EUR/USD**.

- **العملة الأساسية** (الأولى) = اليورو
- **العملة المقتبسة** (الثانية) = الدولار

السعر يخبرك **كم وحدة مقتبسة ت-needed لشراء وحدة أساسية واحدة**.
إذا EUR/USD = 1.10, فـ **1 يورو = 1.10 دولار**.

### قراءة الزوج
- إذا توقعت تقوى اليورو فـ **اشترِ** EUR/USD.
- إذا توقعت ضعفه فـ **بِع** EUR/USD.

### الأزواج الرئيسية
EUR/USD, GBP/USD, USD/JPY, USD/CHF — أكبر حجماً وأقل فروقاً.`,
    ],
    questions: [
      {
        type: 'MCQ',
        p: ['In EUR/USD, which is the base currency?', 'EUR/USD میں بیس کرنسی کون سی ہے؟', 'EUR/USD में बेस मुद्रा कौन सी है?', 'في EUR/USD ما العملة الأساسية؟'],
        opts: [
          ['USD', 'USD', 'USD', 'USD'],
          ['EUR', 'EUR', 'EUR', 'EUR'],
          ['Both', 'دونوں', 'दोनों', 'كلاهما'],
          ['Neither', 'کوئی نہیں', 'कोई नहीं', 'لا أحد'],
        ],
        correct: 1,
        expl: ['The first currency in a pair is always the base currency.', 'جوڑے میں پہلی کرنسی ہمیشہ بیس کرنسی ہوتی ہے۔', 'जोड़े में पहली मुद्रा हमेशा बेस मुद्रा होती है।', 'العملة الأولى دائماً هي الأساسية.'],
      },
      {
        type: 'MCQ',
        p: ['If EUR/USD = 1.10, what does it mean?', 'اگر EUR/USD = 1.10 ہے تو اس کا کیا مطلب ہے؟', 'यदि EUR/USD = 1.10 तो इसका क्या मतलब है?', 'إذا EUR/USD = 1.10 ماذا يعني؟'],
        opts: [
          ['1 EUR costs 1.10 USD', '1 یورو 1.10 ڈالر کا', '1 यूरो = 1.10 डॉलर', '1 يورو = 1.10 دولار'],
          ['1 USD costs 1.10 EUR', '1 ڈالر 1.10 یورو', '1 डॉलर = 1.10 यूरो', '1 دولار = 1.10 يورو'],
          ['They are equal', 'برابر', 'बराबर', 'متساويان'],
          ['No relation', 'کوئی تعلق نہیں', 'कोई संबंध नहीं', 'لا علاقة'],
        ],
        correct: 0,
      },
      {
        type: 'MCQ',
        p: ['If you expect the base to strengthen, you should...', 'اگر آپ کو بیس مضبوط ہونے کی امید ہو تو...', 'यदि आपको बेस मज़बूत होने की उम्मीद हो तो...', 'إذا توقعت تقوى العملة الأساسية فـ...'],
        opts: [
          ['Buy the pair', 'جوڑا خریدیں', 'जोड़ा खरीदें', 'اشترِ الزوج'],
          ['Sell the pair', 'جوڑا بیچیں', 'जोड़ा बेचें', 'بِع الزوج'],
          ['Do nothing', 'کچھ نہ کریں', 'कुछ न करें', 'لا تفعل شيئاً'],
          ['Switch broker', 'بروکر بدلیں', 'ब्रोकर बदलें', 'بدّل الوسيط'],
        ],
        correct: 0,
        expl: ['Buying the pair means buying the base and selling the quote — you profit if base strengthens.', 'جوڑا خریدنے کا مطلب بیس خریدنا اور کوٹ بیچنا — بیس مضبوط ہو تو منافع۔', 'जोड़ा खरीदने का मतलब बेस खरीदना — बेस मज़बूत हो तो लाभ।', 'شراء الزوج = شراء الأساسية — تقوى الأساسية يعني ربح.'],
      },
      {
        type: 'TF',
        p: ['Major pairs have the lowest spreads.', 'بڑے جوڑوں میں سب سے کم سپریڈ ہوتا ہے۔', 'प्रमुख जोड़ों में सबसे कम स्प्रेड होता है।', 'الأزواج الرئيسية أقل فروقاً.'],
        opts: [
          ['True', 'سچ', 'सच', 'صحيح'],
          ['False', 'جھوٹ', 'झूठ', 'خطأ'],
        ],
        correct: 0,
        expl: ['Majors have the highest volume, so spreads are tightest.', 'بڑے جوڑوں میں حجم زیادہ ہوتا ہے اس لیے سپریڈ کم ہوتا ہے۔', 'प्रमुख जोड़ों में आयतन अधिक होता है इसलिए स्प्रेड कम होता है।', 'للرئيسية حجم أكبر فالفروق أقل.'],
      },
      {
        type: 'MCQ',
        p: ['Which is a major pair?', 'کون سا بڑا جوڑا ہے؟', 'कौन सा प्रमुख जोड़ा है?', 'أيها زوج رئيسي؟'],
        opts: [
          ['EUR/USD', 'EUR/USD', 'EUR/USD', 'EUR/USD'],
          ['PKR/JPY', 'PKR/JPY', 'PKR/JPY', 'PKR/JPY'],
          ['Gold/Oil', 'گولڈ/آئل', 'सोना/तेल', 'ذهب/نفط'],
          ['Stocks/Bonds', 'اسٹاکس/بانڈز', 'स्टॉक/बॉन्ड', 'أسهم/سندات'],
        ],
        correct: 0,
      },
    ],
  })

  // ---------- Lesson 3: Pips & Lot Size ----------
  await buildLesson({
    category: beginner, order: 3,
    title: ['What is a Pip & Lot Size?', 'پپ اور لاٹ سائز کیا ہے؟', 'पिप और लॉट साइज़ क्या है?', 'ما هو البيب وحجم اللوت؟'],
    summary: [
      'The smallest price move and the standard trade sizes every trader must know.',
      'سب سے چھوٹی قیمت کا تبدیلی اور وہ معیاری ٹریڈ سائز جو ہر ٹریڈر کو جاننا چاہیے۔',
      'सबसे छोटी कीमत का बदलाव और वे मानक ट्रेड साइज़ जो हर ट्रेडर को पता होने चाहिए।',
      'أصغر حركة سعر والأحجام القياسية للتداول التي يجب أن يعرفها كل متداول.',
    ],
    content: [
      `## Pips & Lots

### Pip
A **pip** ("point in percentage") is the smallest standard price move for most pairs.
For EUR/USD, a pip = **0.0001**. If EUR/USD moves from 1.1000 to 1.1005, that is a **5-pip** move.

### Lot size
A lot is the size of your trade:
| Lot | Units |
|-----|-------|
| Standard lot | 100,000 |
| Mini lot | 10,000 |
| Micro lot | 1,000 |

### Why it matters
A 5-pip move on a **standard lot** is worth about **$50**. The same move on a **micro lot** is only **$0.50**. So your **lot size controls your risk**.

> Beginners should start with micro lots while learning.`,
      `## پپ اور لاٹس

### پپ
ایک **پپ** سب سے چھوٹی معیاری قیمت کا تبدیلی ہے۔
EUR/USD کے لیے ایک پپ = **0.0001**۔ اگر EUR/USD 1.1000 سے 1.1005 ہو تو یہ **5 پپ** کا تبدیلی ہے۔

### لاٹ سائز
لاٹ آپ کی ٹریڈ کا سائز ہے:
| لاٹ | یونٹس |
|-----|-------|
| معیاری لاٹ | 100,000 |
| منی لاٹ | 10,000 |
| مائیکرو لاٹ | 1,000 |

### اہمیت
معیاری لاٹ پر 5 پپ کا تبدیلی تقریباً **$50** کا ہوتا ہے۔ مائیکرو لاٹ پر وہی تبدیلی صرف **$0.50** کا ہے۔ لہذا **لاٹ سائز آپ کا رسک کنٹرول کرتا ہے**۔

> ابتدائی افراد کو سیکھتے وقت مائیکرو لاٹ سے شروع کرنا چاہیے۔`,
      `## पिप और लॉट

### पिप
एक **पिप** सबसे छोटा मानक कीमत बदलाव है।
EUR/USD के लिए एक पिप = **0.0001**। 1.1000 से 1.1005 = **5 पिप** का बदलाव।

### लॉट साइज़
| लॉट | यूनिट |
|-----|-------|
| स्टैंडर्ड लॉट | 100,000 |
| मिनी लॉट | 10,000 |
| माइक्रो लॉट | 1,000 |

### महत्व
स्टैंडर्ड लॉट पर 5 पिप ≈ **$50**। माइक्रो लॉट पर वही = **$0.50**। इसलिए **लॉट साइज़ आपका जोखिम तय करता है**।

> नौसिखिए माइक्रो लॉट से शुरू करें।`,
      `## البيب واللوت

### البيب
الـ **بيب** أصغر حركة سعر قياسية. لـ EUR/USD بيب = **0.0001**. من 1.1000 إلى 1.1005 = **5 بيب**.

### حجم اللوت
| اللوت | الوحدات |
|-----|-------|
| قياسي | 100,000 |
| ميني | 10,000 |
| مايكرو | 1,000 |

### الأهمية
5 بيب على لوت قياسي ≈ **$50**. على مايكرو = **$0.50**. **حجم اللوت يتحكم في مخاطرك**.

> المبتدئون يبدأون بالمايكرو.`,
    ],
    questions: [
      {
        type: 'MCQ',
        p: ['A pip for EUR/USD is usually...', 'EUR/USD کے لیے پپ عام طور پر...', 'EUR/USD के लिए पिप आमतौर पर...', 'بيب EUR/USD عادة...'],
        opts: [
          ['0.0001', '0.0001', '0.0001', '0.0001'],
          ['0.01', '0.01', '0.01', '0.01'],
          ['1.0', '1.0', '1.0', '1.0'],
          ['0.1', '0.1', '0.1', '0.1'],
        ],
        correct: 0,
      },
      {
        type: 'MCQ',
        p: ['A standard lot equals how many units?', 'معیاری لاٹ کتنے یونٹس کے برابر ہے؟', 'स्टैंडर्ड लॉट कितने यूनिट के बराबर है?', 'اللوت القياسي كم وحدة؟'],
        opts: [
          ['1,000', '1,000', '1,000', '1,000'],
          ['10,000', '10,000', '10,000', '10,000'],
          ['100,000', '100,000', '100,000', '100,000'],
          ['1,000,000', '1,000,000', '1,000,000', '1,000,000'],
        ],
        correct: 2,
      },
      {
        type: 'TF',
        p: ['A micro lot is 10,000 units.', 'مائیکرو لاٹ 10,000 یونٹس ہوتا ہے۔', 'माइक्रो लॉट 10,000 यूनिट होता है।', 'اللوت المايكرو 10,000 وحدة.'],
        opts: [
          ['True', 'سچ', 'सच', 'صحيح'],
          ['False', 'جھوٹ', 'झूठ', 'خطأ'],
        ],
        correct: 1,
        expl: ['A micro lot is 1,000 units; 10,000 is a mini lot.', 'مائیکرو لاٹ 1,000 یونٹس ہوتا ہے؛ 10,000 منی لاٹ ہے۔', 'माइक्रो लॉट 1,000 यूनिट; 10,000 मिनी लॉट है।', 'المايكرو 1,000; 10,000 ميني.'],
      },
      {
        type: 'MCQ',
        p: ['5 pips on a standard lot ≈ ?', 'معیاری لاٹ پر 5 پپ تقریباً ؟', 'स्टैंडर्ड लॉट पर 5 पिप ≈ ?', '5 بيب على لوت قياسي ≈ ؟'],
        opts: [
          ['$5', '$5', '$5', '$5'],
          ['$50', '$50', '$50', '$50'],
          ['$500', '$500', '$500', '$500'],
          ['$0.50', '$0.50', '$0.50', '$0.50'],
        ],
        correct: 1,
      },
      {
        type: 'MCQ',
        p: ['What should beginners trade?', 'ابتدائی افراد کو کیا ٹریڈ کرنا چاہیے؟', 'नौसिखिए क्या ट्रेड करें?', 'ماذا يتداول المبتدئون؟'],
        opts: [
          ['Standard lots', 'معیاری لاٹس', 'स्टैंडर्ड लॉट', 'لوت قياسي'],
          ['Micro lots', 'مائیکرو لاٹس', 'माइक्रो लॉट', 'لوت مايكرو'],
          ['Maximum leverage', 'زیادہ سے زیادہ لیورج', 'अधिकतम लीवरेज', 'أقصى رافعة'],
          ['No lots', 'کوئی لاٹ نہیں', 'कोई लॉट नहीं', 'لا لوت'],
        ],
        correct: 1,
        expl: ['Micro lots keep risk small while learning.', 'مائیکرو لاٹ سیکھتے وقت رسک کم رکھتا ہے۔', 'माइक्रो लॉट सीखते समय जोखिम कम रखता है।', 'المايكرو يقلل المخاطرة أثناء التعلم.'],
      },
    ],
  })

  // ---------- Lesson 4: Support & Resistance ----------
  await buildLesson({
    category: intermediate, order: 1,
    title: ['Support & Resistance Basics', 'سپورٹ اور رسسٹنس کی بنیادیں', 'सपोर्ट और रेज़िस्टेंस की नींव', 'أساسيات الدعم والمقاومة'],
    summary: [
      'The two most important price zones where markets tend to turn.',
      'وہ دو اہم قیمت زون جہاں مارکیٹ عموماً بدلتی ہے۔',
      'वे दो महत्वपूर्ण मूल्य क्षेत्र जहाँ बाज़ाल अक्सर मुड़ता है।',
      'أهم منطقتي سعر حيث يميل السوق للانعطاف.',
    ],
    content: [
      `## Support & Resistance

### Support
A **support** level is a price zone where **buying pressure** tends to stop prices from falling further. Think of it as a "floor".

### Resistance
A **resistance** level is a zone where **selling pressure** tends to cap further rises. Think of it as a "ceiling".

### How traders use them
- **Buy near support** (expect a bounce up).
- **Sell near resistance** (expect a rejection down).

### Role reversal
When a resistance level is **broken**, it often becomes the new **support**, and vice-versa. This is called **role reversal**.

> The more times a level is tested, the stronger it is considered.`,
      `## سپورٹ اور رسسٹنس

### سپورٹ
**سپورٹ** لیول وہ قیمت زون ہے جہاں **خريدار کا دباؤ** قیمت کو مزید گرنے سے روکتا ہے۔ اسے "فرش" سمجھیں۔

### رسسٹنس
**رسسٹنس** لیول وہ زون ہے جہاں **بیچنے کا دباؤ** قیمت کو مزید بڑھنے سے روکتا ہے۔ اسے "چھت" سمجھیں۔

### ٹریڈر کیسے استعمال کرتے ہیں
- **سپورٹ کے قریب خریدیں** (اوپر اچھالنے کی امید)۔
- **رسسٹنس کے قریب بیچیں** (نیچے جانے کی امید)۔

### کردار بدلنا
جب رسسٹنس لیول **ٹوٹ جاتا** ہے تو اکثر وہ نئی **سپورٹ** بن جاتی ہے، اور اس کے برعکس بھی۔ اسے **کردار بدلنا** کہتے ہیں۔

> جتنی بار لیول ٹیسٹ ہو، اتنا ہی مضبوط سمجھا جاتا ہے۔`,
      `## सपोर्ट और रेज़िस्टेंस

### सपोर्ट
**सपोर्ट** स्तर वह मूल्य क्षेत्र है जहाँ **खरीदारी दबाव** कीमत को गिरने से रोकता है। इसे "फर्श" समझें।

### रेज़िस्टेंस
**रेज़िस्टेंस** वह क्षेत्र है जहाँ **बिक्री दबाव** कीमत को बढ़ने से रोकता है। इसे "छत" समझें।

### उपयोग
- **सपोर्ट के पास खरीदें** (बाउंस की उम्मीद)।
- **रेज़िस्टेंस के पास बेचें** (अस्वीकृति की उम्मीद)।

### भूमिका परिवर्तन
टूटी हुई रेज़िस्टेंस अक्सर नया **सपोर्ट** बन जाती है। इसे **भूमिका परिवर्तन** कहते हैं।

> जितनी बार स्तर टेस्ट हो, उतना मज़बूत।`,
      `## الدعم والمقاومة

### الدعم
**الدعم** مستوى حيث **ضغط الشراء** يوقف هبوط السعر. اعتبره "أرضية".

### المقاومة
**المقاومة** منطقة حيث **ضغط البيع** يوقف صعود السعر. اعتبرها "سقفاً".

### الاستخدام
- **اشترِ قرب الدعم** (ارتداد متوقع).
- **بِع قرب المقاومة** (رفض متوقع).

### تبادل الأدوار
المقاومة المكسورة تصبح دعماً جديداً والعكس.

> كلما اختُبر المستوى أكثر، صار أقوى.`,
    ],
    questions: [
      {
        type: 'MCQ',
        p: ['Support acts like a...', 'سپورٹ کس طرح کام کرتا ہے؟', 'सपोर्ट किस तरह काम करता ہै?', 'الدعم يعمل مثل...'],
        opts: [
          ['Ceiling', 'چھت', 'छत', 'سقف'],
          ['Floor', 'فرش', 'फर्श', 'أرضية'],
          ['Wall', 'دیوار', 'दीवार', 'جدار'],
          ['Door', 'دروازہ', 'दरवाज़ा', 'باب'],
        ],
        correct: 1,
      },
      {
        type: 'MCQ',
        p: ['Traders usually buy near...', 'ٹریڈرز عموماً کہاں خریدتے ہیں؟', 'ट्रेडर आमतौर पर कहाँ खरीदते हैं?', 'المتداولون يشترون عادة قرب...'],
        opts: [
          ['Resistance', 'رسسٹنس', 'रेज़िस्टेंस', 'المقاومة'],
          ['Support', 'سپورٹ', 'सपोर्ट', 'الدعم'],
          ['Random price', 'بے ترتیب قیمت', 'अनियमित कीमत', 'سعر عشوائي'],
          ['Weekend', 'ہفتہ کے آخری دن', 'सप्ताहांत', 'العطلة'],
        ],
        correct: 1,
      },
      {
        type: 'TF',
        p: ['A broken resistance can become support.', 'ٹوٹی رسسٹنس سپورٹ بن سکتی ہے۔', 'टूटी रेज़िस्टेंस सपोर्ट बन सकती है।', 'المقاومة المكسورة قد تصبح دعماً.'],
        opts: [
          ['True', 'سچ', 'सच', 'صحيح'],
          ['False', 'جھوٹ', 'झूठ', 'خطأ'],
        ],
        correct: 0,
      },
      {
        type: 'MCQ',
        p: ['A level tested many times is...', 'جس لیول کو کئی بار ٹیسٹ کیا جائے وہ...', 'जिस स्तर को कई बार टेस्ट किया जाए वह...', 'المستوى المختبر مرات كثيرة...'],
        opts: [
          ['Weaker', 'کمزور', 'कमज़ोर', 'أضعف'],
          ['Stronger', 'مضبوط', 'मज़बूत', 'أقوى'],
          ['Useless', 'بے کار', 'बेकार', 'عديم الفائدة'],
          ['Random', 'بے ترتیب', 'अनियमित', 'عشوائي'],
        ],
        correct: 1,
      },
      {
        type: 'MCQ',
        p: ['Resistance acts like a...', 'رسسٹنس کس طرح ہے؟', 'रेज़िस्टेंस कैसे है?', 'المقاومة مثل...'],
        opts: [
          ['Floor', 'فرش', 'फर्श', 'أرضية'],
          ['Ceiling', 'چھت', 'छत', 'سقف'],
          ['Window', 'کھڑکی', 'खिड़की', 'نافذة'],
          ['Stair', 'سیڑھی', 'सीढ़ी', 'درج'],
        ],
        correct: 1,
      },
    ],
  })

  // ---------- Lesson 5: Candlestick Patterns ----------
  await buildLesson({
    category: intermediate, order: 2,
    title: ['Candlestick Patterns 101', 'کینڈل اسٹک پیٹرن 101', 'कैंडलस्टिक पैटर्न 101', 'أنماط الشموع اليابانية 101'],
    summary: [
      'Read the story of price using the most common Japanese candlestick shapes.',
      'جاپانی کینڈل اسٹک شکلوں سے قیمت کی کہانی پڑھیں۔',
      'जापानी कैंडलस्टिक आकृतियों से कीमत की कहानी पढ़ें।',
      'اقرأ قصة السعر باستخدام أشكال الشموع اليابانية الشائعة.',
    ],
    content: [
      `## Candlestick Patterns

Each **candlestick** shows four prices for a time period: **Open, High, Low, Close**.

### Bullish vs Bearish
- **Bullish (green)**: close higher than open — buyers won.
- **Bearish (red)**: close lower than open — sellers won.

### Key patterns
1. **Doji** — open ≈ close. Signals indecision.
2. **Hammer** — small body, long lower wick. Bullish reversal at support.
3. **Shooting Star** — small body, long upper wick. Bearish reversal at resistance.
4. **Bullish Engulfing** — a big green candle swallows the previous red candle.

> Never trade a pattern alone — confirm with the trend and the level.`,
      `## کینڈل اسٹک پیٹرن

ہر **کینڈل اسٹک** کسی وقت کی چار قیمت دکھاتا ہے: **اوپن، ہائی، لو، کلوز**۔

### بلش اور بیئرش
- **بلش (سبز)**: کلوز اوپن سے اوپر — خریدار جیت گیا۔
- **بیئرش (سرخ)**: کلوز اوپن سے نیچے — بیچنے والا جیت گیا۔

### اہم پیٹرن
1. **دوجی** — اوپن ≈ کلوز۔ ابہام کا اشارہ۔
2. **ہیمر** — چھوٹا باڈی، لمبا نیچے والا وِک۔ سپورٹ پر بلش ریورسل۔
3. **شوٹنگ اسٹار** — چھوٹا باڈی، لمبا اوپر والا وِک۔ رسسٹنس پر بیئرش ریورسل۔
4. **بلش انگلفنگ** — بڑی سبز کینڈل پچھلی سرخ کو نگل لیتی ہے۔

> کسی پیٹرن کو اکیلا نہ ٹریڈ کریں — ٹرینڈ اور لیول سے تصدیق کریں۔`,
      `## कैंडलस्टिक पैटर्न

हर **कैंडल** चार कीमतें दिखाता है: **ओपन, हाई, लो, क्लोज़**।

### बुलिश बनाम बेयरिश
- **बुलिश (हरा)**: क्लोज़ ओपन से ऊपर।
- **बेयरिश (लाल)**: क्लोज़ ओपन से नीचे।

### मुख्य पैटर्न
1. **दोजी** — ओपन ≈ क्लोज़। अनिर्णय।
2. **हैमर** — छोटा बॉडी, लंबा निचला विक। सपोर्ट पर बुलिश रिवर्सल।
3. **शूटिंग स्टार** — रेज़िस्टेंस पर बेयरिश।
4. **बुलिश एंगल्फिंग** — बड़ी हरी पिछली लाल को निगल ले।

> पैटर्न को अकेला न ट्रेड करें — ट्रेंड और स्तर से पुष्टि करें।`,
      `## أنماط الشموع

كل **شمعة** تظهر أربع أسعار: **افتتاح، أعلى، أدنى، إغلاق**.

### صاعدة مقابل هابطة
- **صاعدة (خضراء)**: الإغلاق فوق الافتتاح.
- **هابطة (حمراء)**: الإغلاق تحت الافتتاح.

### أنماط رئيسية
1. **دوجي** — افتتاح ≈ إغلاق. تردد.
2. **المطرقة** — عند الدعم، انعكاس صاعد.
3. **النجمة الهابطة** — عند المقاومة، انعكاس هابط.
4. **الابتلاع الصاعد** — شمعة خضراء كبيرة تبتلع الحمراء.

> لا تتداول النمط وحده — أكده بالاتجاه والمستوى.`,
    ],
    questions: [
      {
        type: 'MCQ',
        p: ['A bullish candle usually is...', 'بلش کینڈل عام طور پر...', 'बुलिश कैंडल आमतौर पर...', 'الشمعة الصاعدة عادة...'],
        opts: [
          ['Red', 'سرخ', 'लाल', 'حمراء'],
          ['Green', 'سبز', 'हरा', 'خضراء'],
          ['White only', 'صرف سفید', 'सिर्फ सफ़ेद', 'بيضاء فقط'],
          ['Black only', 'صرف کالا', 'सिर्फ काला', 'سوداء فقط'],
        ],
        correct: 1,
      },
      {
        type: 'MCQ',
        p: ['A Doji signals...', 'دوجی کیا ظاہر کرتا ہے؟', 'दोजी क्या दर्शाता है?', 'الدوجي يدل على...'],
        opts: [
          ['Strong trend', 'مضبوط ٹرینڈ', 'मज़बूत ट्रेंड', 'اتجاه قوي'],
          ['Indecision', 'ابہام', 'अनिर्णय', 'تردد'],
          ['Guaranteed profit', 'یقینی منافع', 'गारंटीदार मुनाफ़ा', 'ربح مضمونة'],
          ['Market closed', 'مارکیٹ بند', 'बाज़ार बंद', 'السوق مغلق'],
        ],
        correct: 1,
      },
      {
        type: 'TF',
        p: ['A Hammer is a bearish reversal pattern.', 'ہیمر بیئرش ریورسل پیٹرن ہے۔', 'हैमर बेयरिश रिवर्सल पैटर्न है।', 'المطرقة نمط هابط.'],
        opts: [
          ['True', 'سچ', 'सच', 'صحيح'],
          ['False', 'جھوٹ', 'झूठ', 'خطأ'],
        ],
        correct: 1,
        expl: ['A Hammer is a bullish reversal pattern, found at support.', 'ہیمر بلش ریورسل پیٹرن ہے، سپورٹ پر ملتا ہے۔', 'हैमर बुलिश रिवर्सल पैटर्न है।', 'المطرقة صاعدة، عند الدعم.'],
      },
      {
        type: 'MCQ',
        p: ['A Shooting Star appears at...', 'شوٹنگ اسٹار کہاں نظر آتا ہے؟', 'शूटिंग स्टार कहाँ दिखता है?', 'النجمة الهابطة تظهر عند...'],
        opts: [
          ['Support', 'سپورٹ', 'सपोर्ट', 'الدعم'],
          ['Resistance', 'رسسٹنس', 'रेज़िस्टेंस', 'المقاومة'],
          ['Anywhere random', 'کہیں بھی', 'कहीं भी', 'أي مكان'],
          ['Holidays', 'چھٹیوں میں', 'छुट्टियों में', 'العطل'],
        ],
        correct: 1,
      },
      {
        type: 'MCQ',
        p: ['Bullish Engulfing means...', 'بلش انگلفنگ کا مطلب...', 'बुलिश एंगल्फिंग का मतलब...', 'الابتلاع الصاعد يعني...'],
        opts: [
          ['Big green swallows red', 'بڑی سبز سرخ کو نگل لیتی ہے', 'बड़ी हरी लाल को निगल ले', 'خضراء تبتلع حمراء'],
          ['Market closed', 'مارکیٹ بند', 'बाज़ार बंद', 'السوق مغلق'],
          ['Price frozen', 'قیمت جم گئی', 'कीमत जम गई', 'السعر جامد'],
          ['No candles', 'کوئی کینڈل نہیں', 'कोई कैंडल नहीं', 'لا شموع'],
        ],
        correct: 0,
      },
    ],
  })

  // ---------- Lesson 6: Risk Management ----------
  await buildLesson({
    category: advanced, order: 1,
    title: ['Risk Management & Position Sizing', 'رسک مینجمنٹ اور پوزیشن سائزنگ', 'जोखिम प्रबंधन और पोज़ीशन साइज़िंग', 'إدارة المخاطر وتحديد حجم المركز'],
    summary: [
      'The single skill that separates survivors from blowups.',
      'وہ واحد مہارت جو بچنے والوں کو تباہی سے الگ کرتی ہے۔',
      'वह एकमात्र कौशल जो बचने वालों को तबाह होने से अलग करता है।',
      'المهارة الوحيدة التي تفصل الناجين عن الانفجارات.',
    ],
    content: [
      `## Risk Management

The market is unpredictable. **Risk management** is what keeps you in the game.

### The 1% rule
Never risk more than **1% of your account** on a single trade. With a $1,000 account, your maximum loss per trade should be **$10**.

### Risk : Reward
Aim for at least **1:2**. If you risk $10, your target profit should be $20. With this ratio you can be wrong more than half the time and still be profitable.

### Position sizing formula
\`Risk Amount / Stop Distance = Position Size\`
If you risk $10 and your stop is 20 pips away, and 1 pip on a micro lot ≈ $0.10:
\`$10 / (20 × $0.10) = 5 micro lots\`

### Golden rules
1. Always use a **stop loss**.
2. Never average down on a losing trade.
3. Size positions — don't guess.

> "Amateurs think about how much they can win. Professionals think about how much they can lose."`,
      `## رسک مینجمنٹ

مارکیٹ غیر متوقع ہے۔ **رسک مینجمنٹ** آپ کو کھیل میں رکھتی ہے۔

### 1% اصول
ایک ٹریڈ میں اپنے اکاؤنٹ کے **1%** سے زیادہ رسک نہ کریں۔ $1,000 کے اکاؤنٹ پر ہر ٹریڈ کا زیادہ سے زیادہ نقصان **$10** ہونا چاہیے۔

### رسک : انعام
کم از کم **1:2** کا ہدف رکھیں۔ اگر آپ $10 رسک کرتے ہیں تو منافع کا ہدف $20 ہو۔ اس نسبت سے آپ آدھی بار غلط ہو کر بھی منافع میں رہ سکتے ہیں۔

### پوزیشن سائزنگ فارمولا
\`رسک کی رقم / اسٹاپ کا فاصلہ = پوزیشن سائز\`

### سنہری اصول
1. ہمیشہ **اسٹاپ لاس** استعمال کریں۔
2. نقصان میں اوسط نہ لیں۔
3. پوزیشن سائز کریں — اندازہ نہ لگائیں۔

> "شوقین جیتنے کے بارے میں سوچتے ہیں۔ پیشہ ور کھونے کے بارے میں سوچتے ہیں۔"`,
      `## जोखिम प्रबंधन

बाज़ार अप्रत्याशित है। **जोखिम प्रबंधन** ही आपको खेल में बनाए रखता है।

### 1% नियम
एक ट्रेड में अपने खाते के **1%** से अधिक जोखिम न लें। $1,000 के खाते पर अधिकतम हानि **$10** होनी चाहिए।

### जोखिम : लाभ
कम से कम **1:2** का लक्ष्य रखें। $10 जोखिम पर $20 लाभ का लक्ष्य। इस अनुपात से आप आधी बार गलत होकर भी लाभ में रह सकते हैं।

### स्वर्ण नियम
1. हमेशा **स्टॉप लॉस** इस्तेमाल करें।
2. हानि में औसत न बढ़ाएँ।
3. पोज़िशन साइज़ करें — अनुमान न लगाएँ।

> "शौकिया जीतने के बारे में सोचते हैं। पेशेवर हारने के बारे में।"`,
      `## إدارة المخاطر

السوق لا يمكن التنبؤ به. **إدارة المخاطر** تبقيك في اللعبة.

### قاعدة الـ1%
لا تخاطر بأكثر من **1% من حسابك** في صفقة واحدة. حساب $1,000 → خسارة قصوى $10.

### المخاطرة : العائد
استهدف **1:2** على الأقل. خاطرة $10 → هدف $20. بهذه النسبة تخطئ أكثر من نصف المرة وتبقى رابحاً.

### القواعد الذهبية
1. استخدم **وقف الخسارة** دائماً.
2. لا تضيف على الصفقة الخاسرة.
3. حدد الحجم — لا تخمن.

> "الهواة يفكرون فيما قد يكسبونه. المحترفون يفكرون فيما قد يخسرونه."`,
    ],
    questions: [
      {
        type: 'MCQ',
        p: ['The 1% rule says risk at most...', '1% اصول کے مطابق زیادہ سے زیادہ رسک...', '1% नियम के अनुसार अधिकतम जोखिम...', 'قاعدة 1% تقول خاطر بأقصى...'],
        opts: [
          ['1% of account', 'اکاؤنٹ کا 1%', 'खाते का 1%', '1% من الحساب'],
          ['10% of account', 'اکاؤنٹ کا 10%', 'खाते का 10%', '10% من الحساب'],
          ['50% of account', 'اکاؤنٹ کا 50%', 'खाते का 50%', '50% من الحساب'],
          ['100% of account', 'پورا اکاؤنٹ', 'पूरा खाता', '100% من الحساب'],
        ],
        correct: 0,
      },
      {
        type: 'MCQ',
        p: ['Minimum recommended risk:reward is...', 'کم از کم مطلوبہ رسک:انعام...', 'न्यूनतम अनुशंसित जोखिम:लाभ...', 'أدنى مخاطرة:عائد موصى به...'],
        opts: [
          ['1:1', '1:1', '1:1', '1:1'],
          ['1:2', '1:2', '1:2', '1:2'],
          ['2:1', '2:1', '2:1', '2:1'],
          ['5:1', '5:1', '5:1', '5:1'],
        ],
        correct: 1,
      },
      {
        type: 'TF',
        p: ['You should always use a stop loss.', 'آپ کو ہمیشہ اسٹاپ لاس استعمال کرنا چاہیے۔', 'आपको हमेशा स्टॉप लॉस इस्तेमाल करना चाहिए।', 'يجب دائماً استخدام وقف الخسارة.'],
        opts: [
          ['True', 'سچ', 'सच', 'صحيح'],
          ['False', 'جھوٹ', 'झूठ', 'خطأ'],
        ],
        correct: 0,
      },
      {
        type: 'MCQ',
        p: ['On a losing trade you should...', 'نقصان والی ٹریڈ پر آپ کو...', 'हानि वाली ट्रेड पर आपको...', 'على صفقة خاسرة يجب...'],
        opts: [
          ['Add more size', 'زیادہ سائز شامل کریں', 'और अधिक साइज़ जोड़ें', 'أضف حجماً أكبر'],
          ['Hold and hope', 'پکڑے رہیں', 'पकड़े रहें', 'تمسك وتمنّ'],
          ['Follow your plan / cut it', 'اپنی پلان پر عمل کریں', 'अपनी योजना पर अमल करें', 'اتبع خطتك'],
          ['Delete the app', 'ایپ حذف کریں', 'ऐप मिटाएँ', 'احذف التطبيق'],
        ],
        correct: 2,
      },
      {
        type: 'MCQ',
        p: ['Professionals think mostly about...', 'پیشہ ور زیادہ تر کس بارے میں سوچتے ہیں؟', 'पेशेवर ज़्यादातर किस बारे में सोचते हैं?', 'المحترفون يفكرون غالباً في...'],
        opts: [
          ['How much to win', 'کتنا جیتنا ہے', 'कितना जीतना है', 'كم سيكسبون'],
          ['How much to lose', 'کتنا کھونا ہے', 'कितना हारना है', 'كم سيخسرون'],
          ['Lunch', 'دوپہر کا کھانا', 'दोपहर का खाना', 'الغداء'],
          ['Followers', 'فالوورز', 'फ़ॉलोअर्स', 'المتابعون'],
        ],
        correct: 1,
        expl: ['Pros focus on protecting capital — controlling losses.', 'پیشہ ور سرمائے کو بچانے پر توجہ دیتے ہیں۔', 'पेशेवर पूंजी बचाने पर केंद्रित।', 'المحترفون يركزون على حماية رأس المال.'],
      },
    ],
  })

  // ---------- Config singletons ----------
  await db.adSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton', bannerEnabled: true, interstitialEnabled: true },
  })
  const lessonCount = await db.lesson.count()
  const quizCount = await db.quiz.count()
  await db.appStats.upsert({
    where: { id: 'singleton' },
    update: { totalLessons: lessonCount, totalQuizzes: quizCount, totalDownloads: 1820, activeUsers: 640 },
    create: { id: 'singleton', totalLessons: lessonCount, totalQuizzes: quizCount, totalDownloads: 1820, activeUsers: 640 },
  })

  // ---------- Local learner (anonymous) ----------
  await db.user.upsert({
    where: { id: 'local-learner' },
    update: {},
    create: { id: 'local-learner', role: 'student' },
  })

  // ---------- Replace generic lessons with EUR/USD Beginner (12) + Intermediate (10) + Advanced (16) ----------
  // The base seed above creates 6 generic lessons. Now we replace the Beginner,
  // Intermediate, and Advanced categories with the full EUR/USD curriculum (38 lessons total).
  const { seedEurUsdLessons } = await import("./seed-eurusd")
  const { seedIntermediateLessons } = await import("./seed-intermediate")
  const { seedAdvancedLessons } = await import("./seed-advanced")
  const eur = await seedEurUsdLessons(db)
  const inter = await seedIntermediateLessons(db)
  const adv = await seedAdvancedLessons(db)

  const finalLessons = await db.lesson.count()
  const finalQuizzes = await db.quiz.count()
  await db.appStats.upsert({
    where: { id: 'singleton' },
    update: { totalLessons: finalLessons, totalQuizzes: finalQuizzes },
    create: { id: 'singleton', totalLessons: finalLessons, totalQuizzes: finalQuizzes },
  })

  console.log('✅ Seed complete.')
  console.log(`   Categories: 3 | Lessons: ${finalLessons} | Quizzes: ${finalQuizzes}`)
  console.log(`   EUR/USD Beginner: ${eur.lessons} lessons + ${eur.questions} questions`)
  console.log(`   EUR/USD Intermediate: ${inter.lessons} lessons + ${inter.questions} questions`)
  console.log(`   EUR/USD Advanced: ${adv.lessons} lessons + ${adv.questions} questions`)

  return { categories: 3, lessons: finalLessons, quizzes: finalQuizzes }
}
