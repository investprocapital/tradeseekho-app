import 'package:flutter/material.dart';

/// i18n for the TradeSeekho Flutter client. Urdu + Arabic are RTL.
/// (Lesson + quiz CONTENT is multilingual and comes from the API.)
class AppStrings {
  final Locale locale;
  AppStrings(this.locale);

  static const _map = {
    'en': {
      'tagline': 'Learn Forex & Crypto — the smart way.',
      'levels': 'Levels',
      'lessons': 'Lessons',
      'bookmarks': 'Bookmarks',
      'certificates': 'Certificates',
      'readLesson': 'Read Lesson',
      'takeQuiz': 'Take Quiz',
      'nextLesson': 'Next Lesson',
      'retry': 'Retry Quiz',
      'submit': 'Submit',
      'passed': 'Passed! Next lesson unlocked.',
      'failed': 'Not quite. Need {need} to pass.',
      'locked': 'Locked — pass the previous quiz',
      'lessonNofM': 'Lesson {n} of {m}',
      'minRead': '{n} min read',
      'noCertificates': 'No certificates yet. Pass every lesson in a level.',
    },
    'ur': {
      'tagline': 'فاریکس اور کرپٹو سیکھیں — عقلمند طریقے سے۔',
      'levels': 'سطحیں',
      'lessons': 'اسباق',
      'bookmarks': 'بک مارکس',
      'certificates': 'سرٹیفکیٹس',
      'readLesson': 'سبق پڑھیں',
      'takeQuiz': 'کئز دیں',
      'nextLesson': 'اگلا سبق',
      'retry': 'دوبارہ دیں',
      'submit': 'جمع کریں',
      'passed': 'پاس! اگلا سبق کھل گیا۔',
      'failed': 'تھوڑا رہ گیا۔ پاس کے لیے {need} درکار۔',
      'locked': 'مقفل — پچھلا کئز پاس کریں',
      'lessonNofM': 'سبق {n} از {m}',
      'minRead': '{n} منٹ',
      'noCertificates': 'ابھی کوئی سرٹیفکیٹ نہیں۔ ایک سطح مکمل کریں۔',
    },
    'hi': {
      'tagline': 'फॉरेक्स और क्रिप्टो सीखें — समझदारी से।',
      'levels': 'स्तर',
      'lessons': 'पाठ',
      'bookmarks': 'बुकमार्क',
      'certificates': 'प्रमाणपत्र',
      'readLesson': 'पाठ पढ़ें',
      'takeQuiz': 'प्रश्नोत्तरी दें',
      'nextLesson': 'अगला पाठ',
      'retry': 'फिर से दें',
      'submit': 'जमा करें',
      'passed': 'पास! अगला पाठ खुल गया।',
      'failed': 'थोड़ा रह गया। पास के लिए {need} चाहिए।',
      'locked': 'बंद — पिछली प्रश्नोत्तरी पास करें',
      'lessonNofM': 'पाठ {n} / {m}',
      'minRead': '{n} मिनट',
      'noCertificates': 'अभी कोई प्रमाणपत्र नहीं। एक स्तर पूर्ण करें।',
    },
    'ar': {
      'tagline': 'تعلم الفوركس والعملات الرقمية — بذكاء.',
      'levels': 'المستويات',
      'lessons': 'الدروس',
      'bookmarks': 'المرجعيات',
      'certificates': 'الشهادات',
      'readLesson': 'اقرأ الدرس',
      'takeQuiz': 'أدِّ الاختبار',
      'nextLesson': 'الدرس التالي',
      'retry': 'أعد الاختبار',
      'submit': 'إرسال',
      'passed': 'نجحت! الدرس التالي مفتوح.',
      'failed': 'لم تكتمل. تحتاج {need} للنجاح.',
      'locked': 'مغلق — اجتز الاختبار السابق',
      'lessonNofM': 'الدرس {n} من {m}',
      'minRead': '{n} دقيقة',
      'noCertificates': 'لا شهادات بعد. أكمل دروس مستوى.',
    },
  };

  String get(String key, {Map<String, String>? vars}) {
    String s = _map[locale.languageCode]?[key] ?? _map['en']![key] ?? key;
    if (vars != null) {
      vars.forEach((k, v) => s = s.replaceAll('{$k}', v));
    }
    return s;
  }

  static bool isRtl(String code) => code == 'ur' || code == 'ar';
}
