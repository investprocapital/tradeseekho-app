import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/models.dart';

/// Thin typed client for the TradeSeekho Next.js API.
/// All calls are relative to [ApiConfig.baseUrl]. In production, point it at your
/// Vercel deployment; the Flutter app NEVER touches the database directly.
class ApiClient {
  static Future<Map<String, dynamic>> _get(String path) async {
    final res = await http
        .get(Uri.parse('${ApiConfig.baseUrl}$path'))
        .timeout(ApiConfig.httpTimeout);
    if (res.statusCode != 200) throw ApiException(res.statusCode, res.body);
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> _post(String path, Map<String, dynamic> body) async {
    final res = await http
        .post(Uri.parse('${ApiConfig.baseUrl}$path'),
            headers: const {'Content-Type': 'application/json'},
            body: jsonEncode(body))
        .timeout(ApiConfig.httpTimeout);
    if (res.statusCode != 200) throw ApiException(res.statusCode, res.body);
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  static Future<void> _delete(String path) async {
    final res = await http
        .delete(Uri.parse('${ApiConfig.baseUrl}$path'))
        .timeout(ApiConfig.httpTimeout);
    if (res.statusCode != 200) throw ApiException(res.statusCode, res.body);
  }

  // --- Lessons ---
  static Future<({List<Category> categories, List<Lesson> lessons})> fetchLessons(
      {String category = 'all'}) async {
    final j = await _get('/api/lessons?category=$category');
    return (
      categories: (j['categories'] as List).map((c) => Category.fromJson(c)).toList(),
      lessons: (j['lessons'] as List).map((l) => Lesson.fromJson(l)).toList(),
    );
  }

  static Future<({LessonDetail lesson, PublicQuiz? quiz})> fetchLesson(String id) async {
    final j = await _get('/api/lessons/$id');
    final quiz = j['quiz'] != null ? PublicQuiz.fromJson(j['quiz']) : null;
    return (lesson: LessonDetail.fromJson(j['lesson']), quiz: quiz);
  }

  // --- Quiz ---
  static Future<QuizSubmitResult> submitQuiz(String lessonId, List<int> answers) async {
    final j = await _post('/api/quiz/submit', {'lessonId': lessonId, 'answers': answers});
    return QuizSubmitResult.fromJson(j);
  }

  // --- Bookmarks ---
  static Future<List<Lesson>> fetchBookmarks() async {
    final j = await _get('/api/bookmarks');
    return (j['bookmarks'] as List).map((l) => Lesson.fromJson(l)).toList();
  }

  static Future<void> addBookmark(String lessonId) =>
      _post('/api/bookmarks', {'lessonId': lessonId});

  static Future<void> removeBookmark(String lessonId) =>
      _delete('/api/bookmarks?lessonId=$lessonId');

  // --- Certificates ---
  static Future<List<Certificate>> fetchCertificates() async {
    final j = await _get('/api/certificates');
    return (j['certificates'] as List).map((c) => Certificate.fromJson(c)).toList();
  }
}

class ApiException implements Exception {
  final int statusCode;
  final String body;
  const ApiException(this.statusCode, this.body);
  @override
  String toString() => 'ApiException($statusCode)';
}
