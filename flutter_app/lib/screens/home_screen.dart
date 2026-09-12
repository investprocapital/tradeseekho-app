import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../l10n/strings.dart';
import '../models/models.dart';
import '../providers/providers.dart';
import 'lessons_list_screen.dart';
import 'certificate_screen.dart';

/// Level 1 — Home: brand, language toggle, 3 category (level) cards, progress.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lang = ref.watch(localeProvider);
    final strings = AppStrings(Locale(lang));
    final isRtl = AppStrings.isRtl(lang);
    final bundle = ref.watch(lessonsProvider('all'));

    return Directionality(
      textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        appBar: AppBar(
          title: Row(children: [
            Container(
              width: 32, height: 32,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text('₸', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.white)),
            ),
            const SizedBox(width: 8),
            Text('Trade',
                style: TextStyle(
                    fontWeight: FontWeight.w800,
                    color: Theme.of(context).textTheme.bodyLarge!.color)),
            Text('Seekho',
                style: TextStyle(
                    fontWeight: FontWeight.w800,
                    color: Theme.of(context).colorScheme.primary)),
          ]),
          actions: [
            PopupMenuButton<String>(
              onSelected: (v) => ref.read(localeProvider.notifier).state = v,
              itemBuilder: (_) => const [
                PopupMenuItem(value: 'en', child: Text('English')),
                PopupMenuItem(value: 'ur', child: Text('اردو')),
                PopupMenuItem(value: 'hi', child: Text('हिन्दी')),
                PopupMenuItem(value: 'ar', child: Text('العربية')),
              ],
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Center(child: Text(lang.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.bold))),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.workspace_premium_outlined, color: Color(0xFFFFC107)),
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CertificateScreen())),
            ),
          ],
        ),
        body: RefreshIndicator(
          onRefresh: () => ref.read(lessonsProvider('all').notifier).refresh(),
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _Hero(context: context, strings: strings),
              const SizedBox(height: 20),
              Text(strings.get('levels'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
              const SizedBox(height: 12),
              ...bundle.categories.map((c) => _CategoryCard(
                    category: c,
                    count: bundle.lessons.where((l) => l.categoryId == c.id).length,
                    onTap: () => Navigator.push(context, MaterialPageRoute(
                      builder: (_) => LessonsListScreen(category: c),
                    )),
                  )),
              const SizedBox(height: 24),
              _ProgressStrip(lessons: bundle.lessons),
            ],
          ),
        ),
      ),
    );
  }
}

class _Hero extends StatelessWidget {
  final BuildContext context;
  final AppStrings strings;
  const _Hero({required this.context, required this.strings});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(colors: [Color(0x1A00C853), Color(0x14FFC107)]),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(strings.get('tagline'),
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)),
        const SizedBox(height: 12),
        Wrap(spacing: 8, children: [
          _chip('1.8k+ learners'),
          _chip('4 languages'),
          _chip('4.9 ★'),
        ]),
      ]),
    );
  }

  Widget _chip(String label) => Chip(
        label: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
        backgroundColor: Theme.of(context).colorScheme.primary.withOpacity( 0.12),
        side: BorderSide.none,
      );
}

class _CategoryCard extends StatelessWidget {
  final Category category;
  final int count;
  final VoidCallback onTap;
  const _CategoryCard({required this.category, required this.count, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(children: [
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(color: _color(), borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.trending_up, color: Colors.white),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(category.name.en, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                Text(category.description.en, maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(color: Theme.of(context).hintColor, fontSize: 13)),
              ]),
            ),
            Text('$count', style: TextStyle(fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.primary, fontSize: 18)),
          ]),
        ),
      ),
    );
  }

  Color _color() {
    final hex = category.color?.replaceFirst('#', '');
    if (hex == null) return const Color(0xFF00C853);
    return Color(int.parse('FF$hex', radix: 16));
  }
}

class _ProgressStrip extends StatelessWidget {
  final List<Lesson> lessons;
  const _ProgressStrip({required this.lessons});
  @override
  Widget build(BuildContext context) {
    final passed = lessons.where((l) => l.passed).length;
    final pct = lessons.isEmpty ? 0.0 : passed / lessons.length;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Your progress', style: TextStyle(fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(value: pct, minHeight: 8),
          ),
          const SizedBox(height: 8),
          Text('$passed / ${lessons.length} lessons passed',
              style: TextStyle(color: Theme.of(context).hintColor, fontSize: 12)),
        ]),
      ),
    );
  }
}
