// Data models mirroring the Next.js API DTOs (see src/lib/types.ts).

class LocalizedText {
  final String en, ur, hi, ar;
  const LocalizedText({required this.en, this.ur = '', this.hi = '', this.ar = ''});
  factory LocalizedText.fromJson(Map<String, dynamic> j) => LocalizedText(
        en: j['en'] ?? '',
        ur: j['ur'] ?? '',
        hi: j['hi'] ?? '',
        ar: j['ar'] ?? '',
      );
  String pick(String lang) {
    switch (lang) {
      case 'ur':
        return ur.isNotEmpty ? ur : en;
      case 'hi':
        return hi.isNotEmpty ? hi : en;
      case 'ar':
        return ar.isNotEmpty ? ar : en;
      default:
        return en;
    }
  }
}

class Category {
  final String id;
  final String slug;
  final LocalizedText name;
  final LocalizedText description;
  final String? icon;
  final String? color;
  final int order;
  const Category({
    required this.id,
    required this.slug,
    required this.name,
    required this.description,
    this.icon,
    this.color,
    this.order = 0,
  });
  factory Category.fromJson(Map<String, dynamic> j) => Category(
        id: j['id'],
        slug: j['slug'],
        name: LocalizedText.fromJson(j['name']),
        description: LocalizedText.fromJson(j['description']),
        icon: j['icon'],
        color: j['color'],
        order: j['order'] ?? 0,
      );
}

class Lesson {
  final String id;
  final String categoryId;
  final String categorySlug;
  final String? categoryColor;
  final String? categoryIcon;
  final LocalizedText title;
  final LocalizedText summary;
  final String? imageUrl;
  final int durationMin;
  final int order;
  final int orderInCategory;
  final bool isPublished;
  final bool hasQuiz;
  final bool passed;
  final bool completed;
  final bool bookmarked;
  const Lesson({
    required this.id,
    required this.categoryId,
    required this.categorySlug,
    this.categoryColor,
    this.categoryIcon,
    required this.title,
    required this.summary,
    this.imageUrl,
    this.durationMin = 5,
    this.order = 0,
    this.orderInCategory = 1,
    this.isPublished = true,
    this.hasQuiz = true,
    this.passed = false,
    this.completed = false,
    this.bookmarked = false,
  });
  factory Lesson.fromJson(Map<String, dynamic> j) => Lesson(
        id: j['id'],
        categoryId: j['categoryId'],
        categorySlug: j['categorySlug'],
        categoryColor: j['categoryColor'],
        categoryIcon: j['categoryIcon'],
        title: LocalizedText.fromJson(j['title']),
        summary: LocalizedText.fromJson(j['summary']),
        imageUrl: j['imageUrl'],
        durationMin: j['durationMin'] ?? 5,
        order: j['order'] ?? 0,
        orderInCategory: j['orderInCategory'] ?? 1,
        isPublished: j['isPublished'] ?? true,
        hasQuiz: j['hasQuiz'] ?? true,
        passed: j['passed'] ?? false,
        completed: j['completed'] ?? false,
        bookmarked: j['bookmarked'] ?? false,
      );
}

class LessonDetail {
  final String id;
  final LocalizedText title;
  final LocalizedText summary;
  final LocalizedText content;
  final String? imageUrl;
  final int orderInCategory;
  final int totalInCategory;
  final bool locked;
  final String? nextLessonId;
  final bool bookmarked;
  final bool passed;
  final Category? category;
  const LessonDetail({
    required this.id,
    required this.title,
    required this.summary,
    required this.content,
    this.imageUrl,
    this.orderInCategory = 1,
    this.totalInCategory = 1,
    this.locked = false,
    this.nextLessonId,
    this.bookmarked = false,
    this.passed = false,
    this.category,
  });
  factory LessonDetail.fromJson(Map<String, dynamic> j) => LessonDetail(
        id: j['id'],
        title: LocalizedText.fromJson(j['title']),
        summary: LocalizedText.fromJson(j['summary']),
        content: LocalizedText.fromJson(j['content']),
        imageUrl: j['imageUrl'],
        orderInCategory: j['orderInCategory'] ?? 1,
        totalInCategory: j['totalInCategory'] ?? 1,
        locked: j['locked'] ?? false,
        nextLessonId: j['nextLessonId'],
        bookmarked: j['bookmarked'] ?? false,
        passed: j['passed'] ?? false,
        category: j['category'] != null ? Category.fromJson(j['category']) : null,
      );
}

class PublicQuestion {
  final String id;
  final String type; // MCQ | TF
  final LocalizedText prompt;
  final List<LocalizedText> options;
  const PublicQuestion({
    required this.id,
    required this.type,
    required this.prompt,
    required this.options,
  });
  factory PublicQuestion.fromJson(Map<String, dynamic> j) => PublicQuestion(
        id: j['id'],
        type: j['type'],
        prompt: LocalizedText.fromJson(j['prompt']),
        options: (j['options'] as List).map((o) => LocalizedText.fromJson(o)).toList(),
      );
}

class PublicQuiz {
  final String id;
  final String lessonId;
  final int passMark;
  final List<PublicQuestion> questions;
  const PublicQuiz({
    required this.id,
    required this.lessonId,
    required this.passMark,
    required this.questions,
  });
  factory PublicQuiz.fromJson(Map<String, dynamic> j) => PublicQuiz(
        id: j['id'],
        lessonId: j['lessonId'],
        passMark: j['passMark'] ?? 3,
        questions: (j['questions'] as List).map((q) => PublicQuestion.fromJson(q)).toList(),
      );
}

class QuizSubmitResult {
  final String lessonId;
  final int score;
  final int total;
  final int passMark;
  final bool passed;
  final List<bool> correctFlags;
  final List<int> correctIndices;
  final List<LocalizedText> explanations;
  final String? nextLessonId;
  final bool unlockedNext;
  final bool showInterstitial;
  final String? certificateId;
  final String? certificateSlug;
  const QuizSubmitResult({
    required this.lessonId,
    required this.score,
    required this.total,
    required this.passMark,
    required this.passed,
    required this.correctFlags,
    required this.correctIndices,
    required this.explanations,
    this.nextLessonId,
    this.unlockedNext = false,
    this.showInterstitial = false,
    this.certificateId,
    this.certificateSlug,
  });
  factory QuizSubmitResult.fromJson(Map<String, dynamic> j) => QuizSubmitResult(
        lessonId: j['lessonId'],
        score: j['score'],
        total: j['total'],
        passMark: j['passMark'] ?? 3,
        passed: j['passed'] ?? false,
        correctFlags: List<bool>.from(j['correctFlags']),
        correctIndices: List<int>.from(j['correctIndices']),
        explanations: (j['explanations'] as List).map((e) => LocalizedText.fromJson(e)).toList(),
        nextLessonId: j['nextLessonId'],
        unlockedNext: j['unlockedNext'] ?? false,
        showInterstitial: j['showInterstitial'] ?? false,
        certificateId: j['certificateId'],
        certificateSlug: j['certificateSlug'],
      );
}

class Certificate {
  final String id;
  final String categorySlug;
  final String userName;
  final int lessonsPassed;
  final int totalLessons;
  final int scoreSum;
  final int scoreTotal;
  final String verificationId;
  final DateTime issuedAt;
  const Certificate({
    required this.id,
    required this.categorySlug,
    required this.userName,
    required this.lessonsPassed,
    required this.totalLessons,
    required this.scoreSum,
    required this.scoreTotal,
    required this.verificationId,
    required this.issuedAt,
  });
  factory Certificate.fromJson(Map<String, dynamic> j) => Certificate(
        id: j['id'],
        categorySlug: j['categorySlug'],
        userName: j['userName'],
        lessonsPassed: j['lessonsPassed'],
        totalLessons: j['totalLessons'],
        scoreSum: j['scoreSum'],
        scoreTotal: j['scoreTotal'],
        verificationId: j['verificationId'],
        issuedAt: DateTime.parse(j['issuedAt']),
      );
}
