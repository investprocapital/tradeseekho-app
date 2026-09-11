import 'dart:convert';
import 'package:hive_flutter/hive_flutter.dart';
import '../models/models.dart';

/// Offline cache with Hive. Lessons + progress are cached so the app loads
/// under 1 second even on a flaky connection (per the project goal).
/// On launch: read cache → render instantly → refresh from API in background.
class CacheService {
  static const _lessonsBox = 'lessons';
  static const _progressBox = 'progress';

  static Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox(_lessonsBox);
    await Hive.openBox(_progressBox);
  }

  static Box get _lessons => Hive.box(_lessonsBox);
  static Box get _progress => Hive.box(_progressBox);

  /// Cache the lessons bundle (categories + lessons) keyed by category slug.
  static void cacheLessons(String category, List<Category> cats, List<Lesson> lessons) {
    _lessons.put(
      'bundle:$category',
      jsonEncode({
        'categories': cats.map((c) => _catJson(c)).toList(),
        'lessons': lessons.map((l) => _lessonJson(l)).toList(),
      }),
    );
  }

  static ({List<Category> categories, List<Lesson> lessons})? readLessons(String category) {
    final raw = _lessons.get('bundle:$category') as String?;
    if (raw == null) return null;
    final j = jsonDecode(raw) as Map<String, dynamic>;
    return (
      categories: (j['categories'] as List).map((c) => Category.fromJson(c)).toList(),
      lessons: (j['lessons'] as List).map((l) => Lesson.fromJson(l)).toList(),
    );
  }

  /// Cache a single lesson detail + quiz for offline reading.
  static void cacheLesson(LessonDetail lesson, PublicQuiz? quiz) {
    _lessons.put(
      'lesson:${lesson.id}',
      jsonEncode({
        'lesson': {
          'id': lesson.id,
          'title': _locJson(lesson.title),
          'summary': _locJson(lesson.summary),
          'content': _locJson(lesson.content),
          'orderInCategory': lesson.orderInCategory,
          'totalInCategory': lesson.totalInCategory,
        },
        'quiz': quiz == null ? null : _quizJson(quiz),
      }),
    );
  }

  // progress persistence
  static void setProgress(String lessonId, bool passed, int score, int total) {
    _progress.put(lessonId, jsonEncode({'passed': passed, 'score': score, 'total': total}));
  }

  static Map<String, dynamic>? getProgress(String lessonId) {
    final raw = _progress.get(lessonId) as String?;
    return raw == null ? null : jsonDecode(raw) as Map<String, dynamic>;
  }

  static Map<String, dynamic> _locJson(LocalizedText t) =>
      {'en': t.en, 'ur': t.ur, 'hi': t.hi, 'ar': t.ar};

  static Map<String, dynamic> _catJson(Category c) => {
        'id': c.id,
        'slug': c.slug,
        'name': _locJson(c.name),
        'description': _locJson(c.description),
        'icon': c.icon,
        'color': c.color,
        'order': c.order,
      };

  static Map<String, dynamic> _lessonJson(Lesson l) => {
        'id': l.id,
        'categoryId': l.categoryId,
        'categorySlug': l.categorySlug,
        'categoryColor': l.categoryColor,
        'categoryIcon': l.categoryIcon,
        'title': _locJson(l.title),
        'summary': _locJson(l.summary),
        'imageUrl': l.imageUrl,
        'durationMin': l.durationMin,
        'order': l.order,
        'orderInCategory': l.orderInCategory,
        'isPublished': l.isPublished,
        'hasQuiz': l.hasQuiz,
        'passed': l.passed,
        'completed': l.completed,
        'bookmarked': l.bookmarked,
      };

  static Map<String, dynamic> _quizJson(PublicQuiz q) => {
        'id': q.id,
        'lessonId': q.lessonId,
        'passMark': q.passMark,
        'questions': q.questions
            .map((qq) => {
                  'id': qq.id,
                  'type': qq.type,
                  'prompt': _locJson(qq.prompt),
                  'options': qq.options.map(_locJson).toList(),
                })
            .toList(),
      };
}
