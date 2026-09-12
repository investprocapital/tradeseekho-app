import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/models.dart';
import '../services/api_client.dart';
import '../services/cache_service.dart';

/// App state with Riverpod. Reads cache first (instant), then refreshes from API.

final localeProvider = StateProvider<String>((ref) => 'en'); // en | ur | hi | ar

class LessonsState {
  final List<Category> categories;
  final List<Lesson> lessons;
  final bool loading;
  final String? error;
  const LessonsState({
    this.categories = const [],
    this.lessons = const [],
    this.loading = false,
    this.error,
  });
  LessonsState copyWith({
    List<Category>? categories,
    List<Lesson>? lessons,
    bool? loading,
    String? error,
  }) =>
      LessonsState(
        categories: categories ?? this.categories,
        lessons: lessons ?? this.lessons,
        loading: loading ?? this.loading,
        error: error,
      );
}

class LessonsNotifier extends StateNotifier<LessonsState> {
  final String _category;
  LessonsNotifier(this._category) : super(const LessonsState()) {
    _load();
  }

  Future<void> _load() async {
    // 1) render cache instantly
    final cached = CacheService.readLessons(_category);
    if (cached != null) {
      state = LessonsState(categories: cached.categories, lessons: cached.lessons);
    }
    // 2) refresh from API
    state = state.copyWith(loading: true);
    try {
      final bundle = await ApiClient.fetchLessons(category: _category);
      CacheService.cacheLessons(_category, bundle.categories, bundle.lessons);
      state = LessonsState(categories: bundle.categories, lessons: bundle.lessons);
    } catch (e) {
      // network error, cleartext blocked, DNS, etc. — never crash, show graceful state
      state = state.copyWith(
        loading: false,
        error: 'Could not reach the server. Pull to retry.',
      );
    }
  }

  Future<void> refresh() => _load();
}

final lessonsProvider =
    StateNotifierProvider.family<LessonsNotifier, LessonsState, String>(
  (ref, category) => LessonsNotifier(category),
);

// Active category filter (slug or 'all')
final activeCategoryProvider = StateProvider<String>((ref) => 'all');

// Lesson detail + quiz
class LessonDetailState {
  final LessonDetail? lesson;
  final PublicQuiz? quiz;
  final bool loading;
  const LessonDetailState({this.lesson, this.quiz, this.loading = false});
}

class LessonDetailNotifier extends StateNotifier<LessonDetailState> {
  final String id;
  LessonDetailNotifier(this.id) : super(const LessonDetailState()) {
    _load();
  }
  Future<void> _load() async {
    state = const LessonDetailState(loading: true);
    try {
      final r = await ApiClient.fetchLesson(id);
      CacheService.cacheLesson(r.lesson, r.quiz);
      state = LessonDetailState(lesson: r.lesson, quiz: r.quiz, loading: false);
    } catch (_) {
      state = const LessonDetailState(loading: false);
    }
  }
}

final lessonDetailProvider =
    StateNotifierProvider.family<LessonDetailNotifier, LessonDetailState, String>(
  (ref, id) => LessonDetailNotifier(id),
);

// Certificates
final certificatesProvider = FutureProvider<List<Certificate>>((ref) async {
  try {
    return ApiClient.fetchCertificates();
  } catch (_) {
    return <Certificate>[];
  }
});
