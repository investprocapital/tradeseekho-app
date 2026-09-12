import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../l10n/strings.dart';
import '../models/models.dart';
import '../providers/providers.dart';
import 'lesson_detail_screen.dart';

/// Level 2 — Lessons list for a chosen level (category).
/// Lessons lock until the previous lesson's quiz is passed (3/5).
class LessonsListScreen extends ConsumerWidget {
  final Category category;
  const LessonsListScreen({super.key, required this.category});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lang = ref.watch(localeProvider);
    final strings = AppStrings(Locale(lang));
    final isRtl = AppStrings.isRtl(lang);
    final bundle = ref.watch(lessonsProvider('all'));
    final lessons = bundle.lessons.where((l) => l.categoryId == category.id).toList()
      ..sort((a, b) => a.orderInCategory.compareTo(b.orderInCategory));

    return Directionality(
      textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: AppBar(title: Text(category.name.pick(lang))),
        body: RefreshIndicator(
          onRefresh: () => ref.read(lessonsProvider('all').notifier).refresh(),
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: lessons.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, i) {
              final l = lessons[i];
              // Lock rule: locked if a previous sibling in this level is NOT passed
              final locked = i > 0 && !lessons[i - 1].passed;
              return _LessonListCard(
                lesson: l,
                lang: lang,
                strings: strings,
                locked: locked,
                onTap: () {
                  if (locked) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(strings.get('locked'))));
                    return;
                  }
                  Navigator.push(context, MaterialPageRoute(builder: (_) => LessonDetailScreen(lessonId: l.id)));
                },
              );
            },
          ),
        ),
      ),
    );
  }
}

class _LessonListCard extends StatelessWidget {
  final Lesson lesson;
  final String lang;
  final AppStrings strings;
  final bool locked;
  final VoidCallback onTap;
  const _LessonListCard({required this.lesson, required this.lang, required this.strings, required this.locked, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Opacity(
          opacity: locked ? 0.6 : 1,
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(
                width: 44, height: 44,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: (lesson.categoryColor != null
                          ? Color(int.parse('FF${lesson.categoryColor!.replaceFirst('#', '')}', radix: 16))
                          : Theme.of(context).colorScheme.primary)
                      .withOpacity( 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text('${lesson.orderInCategory}',
                    style: TextStyle(fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.primary, fontSize: 16)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(strings.get('lessonNofM', vars: {'n': '${lesson.orderInCategory}', 'm': '…'}),
                      style: TextStyle(fontSize: 11, color: Theme.of(context).hintColor, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 2),
                  Text(lesson.title.pick(lang), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                  const SizedBox(height: 4),
                  Row(children: [
                    Icon(Icons.access_time, size: 13, color: Theme.of(context).hintColor),
                    const SizedBox(width: 4),
                    Text(strings.get('minRead', vars: {'n': '${lesson.durationMin}'}),
                        style: TextStyle(fontSize: 12, color: Theme.of(context).hintColor)),
                    const Spacer(),
                    if (lesson.passed) Icon(Icons.check_circle, color: Theme.of(context).colorScheme.primary, size: 18)
                    else if (locked) const Icon(Icons.lock_outline, size: 18)
                  ]),
                ]),
              ),
            ]),
          ),
        ),
      ),
    );
  }
}
