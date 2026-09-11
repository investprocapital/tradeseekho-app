import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../l10n/strings.dart';
import '../models/models.dart';
import '../providers/providers.dart';
import '../services/api_client.dart';
import '../services/cache_service.dart';
import 'quiz_screen.dart';

/// Level 3 — Lesson detail. Read-only content (non-selectable), progress bar,
/// bookmark toggle, and a "Take Quiz" CTA that opens Level 4.
class LessonDetailScreen extends ConsumerWidget {
  final String lessonId;
  const LessonDetailScreen({super.key, required this.lessonId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lang = ref.watch(localeProvider);
    final strings = AppStrings(Locale(lang));
    final isRtl = AppStrings.isRtl(lang);
    final state = ref.watch(lessonDetailProvider(lessonId));
    final lesson = state.lesson;

    return Directionality(
      textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: AppBar(
          title: lesson == null ? const Text('') : Text(lesson.title.pick(lang), maxLines: 1, overflow: TextOverflow.ellipsis),
          actions: [
            if (lesson != null)
              IconButton(
                icon: Icon(lesson.bookmarked ? Icons.bookmark : Icons.bookmark_outline),
                onPressed: () async {
                  if (lesson.bookmarked) {
                    await ApiClient.removeBookmark(lesson.id);
                  } else {
                    await ApiClient.addBookmark(lesson.id);
                  }
                  ref.refresh(lessonDetailProvider(lessonId));
                },
              ),
          ],
        ),
        body: state.loading || lesson == null
            ? const Center(child: CircularProgressIndicator())
            : Column(children: [
                // Progress bar "Lesson N of M"
                LinearProgressIndicator(
                  value: lesson.totalInCategory == 0 ? 0 : lesson.orderInCategory / lesson.totalInCategory,
                  minHeight: 4,
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                  child: Align(
                    alignment: isRtl ? Alignment.centerRight : Alignment.centerLeft,
                    child: Text(
                      strings.get('lessonNofM', vars: {'n': '${lesson.orderInCategory}', 'm': '${lesson.totalInCategory}'}),
                      style: TextStyle(fontSize: 12, color: Theme.of(context).hintColor, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                Expanded(
                  child: SelectionContainer.disabled(
                    // Read-only, non-selectable content (security requirement)
                    child: ListView(
                      padding: const EdgeInsets.all(16),
                      children: _buildMarkdown(lesson.content.pick(lang), context),
                    ),
                  ),
                ),
                if (lesson.locked)
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(strings.get('locked'),
                        style: TextStyle(color: Theme.of(context).hintColor, fontSize: 13),
                        textAlign: TextAlign.center),
                  )
                else
                  SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: FilledButton.icon(
                        onPressed: state.quiz == null
                            ? null
                            : () => Navigator.push(context, MaterialPageRoute(
                                  builder: (_) => QuizScreen(lessonId: lesson.id),
                                )),
                        icon: const Icon(Icons.quiz_outlined),
                        label: Text(strings.get('takeQuiz')),
                      ),
                    ),
                  ),
              ]),
      ),
    );
  }

  // Minimal markdown renderer (##, **, lists) — content is read-only above.
  static List<Widget> _buildMarkdown(String md, BuildContext context) {
    final lines = md.split('\n');
    final widgets = <Widget>[];
    for (final line in lines) {
      final t = line.trim();
      if (t.isEmpty) {
        widgets.add(const SizedBox(height: 8));
        continue;
      }
      if (t.startsWith('## ')) {
        widgets.add(Padding(
          padding: const EdgeInsets.only(top: 12, bottom: 6),
          child: Text(t.substring(3), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
        ));
      } else if (t.startsWith('### ')) {
        widgets.add(Padding(
          padding: const EdgeInsets.only(top: 10, bottom: 4),
          child: Text(t.substring(4), style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
        ));
      } else if (t.startsWith('- ') || t.startsWith('* ')) {
        widgets.add(Padding(
          padding: const EdgeInsets.only(left: 8, bottom: 4),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('• ', style: TextStyle(fontSize: 15)),
            Expanded(child: Text(t.substring(2), style: const TextStyle(fontSize: 15, height: 1.5))),
          ]),
        ));
      } else if (t.startsWith('> ')) {
        widgets.add(Container(
          margin: const EdgeInsets.only(top: 8, bottom: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.08),
            borderRadius: const BorderRadius.only(topRight: Radius.circular(8), bottomRight: Radius.circular(8)),
            border: Border(left: BorderSide(color: Theme.of(context).colorScheme.primary, width: 3)),
          ),
          child: Text(t.substring(2), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        ));
      } else {
        widgets.add(Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: Text(_stripBold(t), style: const TextStyle(fontSize: 15, height: 1.55)),
        ));
      }
    }
    return widgets;
  }

  static String _stripBold(String t) => t.replaceAll('**', '');
}
