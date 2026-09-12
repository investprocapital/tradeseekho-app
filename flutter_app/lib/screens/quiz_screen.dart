import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../l10n/strings.dart';
import '../models/models.dart';
import '../providers/providers.dart';
import '../services/ad_service.dart';
import '../services/api_client.dart';
import 'certificate_screen.dart';
import 'lesson_detail_screen.dart';

/// Level 4 — Quiz. 5 MCQ/TF → submit → instant per-question feedback.
/// Pass ≥ passMark unlocks the next lesson. AdMob interstitial fires when the
/// server says so (every 2 completed lessons). Certificate banner on level completion.
class QuizScreen extends ConsumerStatefulWidget {
  final String lessonId;
  const QuizScreen({super.key, required this.lessonId});

  @override
  ConsumerState<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends ConsumerState<QuizScreen> {
  final _answers = <String, int>{};
  QuizSubmitResult? _result;
  bool _submitting = false;

  @override
  Widget build(BuildContext context) {
    final lang = ref.watch(localeProvider);
    final strings = AppStrings(Locale(lang));
    final isRtl = AppStrings.isRtl(lang);
    final state = ref.watch(lessonDetailProvider(widget.lessonId));
    final quiz = state.quiz;

    return Directionality(
      textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: AppBar(title: const Text('Quiz')),
        body: quiz == null
            ? const Center(child: CircularProgressIndicator())
            : _result == null
                ? _buildQuestions(quiz, lang, strings)
                : _buildResults(quiz, lang, strings, state),
        bottomNavigationBar: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: _result == null
                ? FilledButton(
                    onPressed: _submitting || _answers.length < quiz!.questions.length
                        ? null
                        : _submit,
                    child: _submitting
                        ? const SizedBox(height: 22, width: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : Text(strings.get('submit')),
                  )
                : Row(children: [
                    Expanded(
                      child: OutlinedButton(onPressed: _reset, child: Text(strings.get('retry'))),
                    ),
                    const SizedBox(width: 8),
                    if (_result!.passed && _result!.nextLessonId != null)
                      Expanded(
                        child: FilledButton(
                          onPressed: () {
                            Navigator.pushReplacement(context, MaterialPageRoute(
                              builder: (_) => LessonDetailScreen(lessonId: _result!.nextLessonId!),
                            ));
                          },
                          child: Text(strings.get('nextLesson')),
                        ),
                      )
                    else
                      Expanded(
                        child: FilledButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Close'),
                        ),
                      ),
                  ]),
          ),
        ),
      ),
    );
  }

  Widget _buildQuestions(PublicQuiz quiz, String lang, AppStrings strings) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: quiz.questions.length,
      itemBuilder: (context, i) {
        final q = quiz.questions[i];
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                CircleAvatar(
                  radius: 12,
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  child: Text('${i + 1}', style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 8),
                Expanded(child: Text(q.prompt.pick(lang), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15))),
              ]),
              const SizedBox(height: 10),
              ...q.options.asMap().entries.map((e) {
                final oi = e.key;
                final opt = e.value;
                final selected = _answers[q.id] == oi;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: InkWell(
                    onTap: () => setState(() => _answers[q.id] = oi),
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: selected ? Theme.of(context).colorScheme.primary : Theme.of(context).dividerColor,
                        ),
                        color: selected ? Theme.of(context).colorScheme.primary.withOpacity( 0.08) : null,
                      ),
                      child: Row(children: [
                        Container(width: 20, height: 20, alignment: Alignment.center,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: selected ? Theme.of(context).colorScheme.primary : Theme.of(context).hintColor,
                              width: 2,
                            ),
                            color: selected ? Theme.of(context).colorScheme.primary : Colors.transparent,
                          ),
                          child: Text(String.fromCharCode(65 + oi),
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: selected ? Colors.white : Theme.of(context).hintColor)),
                        ),
                        const SizedBox(width: 8),
                        Expanded(child: Text(opt.pick(lang), style: const TextStyle(fontSize: 14))),
                      ]),
                    ),
                  ),
                );
              }),
            ]),
          ),
        );
      },
    );
  }

  Widget _buildResults(PublicQuiz quiz, String lang, AppStrings strings, state) {
    final r = _result!;
    final pct = (r.score / r.total * 100).round();
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Score banner
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: r.passed ? Theme.of(context).colorScheme.primary.withOpacity( 0.12) : const Color(0x1AFFC107),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(children: [
            CircleAvatar(
              radius: 28,
              backgroundColor: r.passed ? Theme.of(context).colorScheme.primary : const Color(0xFFFFC107),
              child: Text('$pct%', style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.white)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(r.passed ? '🎉 ${strings.get('passed')}' : strings.get('failed', vars: {'need': '${r.passMark}'}),
                    style: TextStyle(fontWeight: FontWeight.w800, color: r.passed ? Theme.of(context).colorScheme.primary : const Color(0xFFFFC107))),
                Text('Score: ${r.score} / ${r.total}', style: TextStyle(color: Theme.of(context).hintColor, fontSize: 13)),
              ]),
            ),
          ]),
        ),
        // Certificate banner
        if (r.certificateId != null) ...[
          const SizedBox(height: 12),
          InkWell(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CertificateScreen())),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFFC107), width: 2),
                color: const Color(0x1AFFC107),
              ),
              child: Row(children: [
                const CircleAvatar(backgroundColor: Color(0xFFFFC107), child: Icon(Icons.workspace_premium, color: Colors.white)),
                const SizedBox(width: 8),
                Expanded(child: Text('🏆 Certificate earned!\nYou completed the ${r.certificateSlug} level.', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13))),
                const Icon(Icons.chevron_right),
              ]),
            ),
          ),
        ],
        const SizedBox(height: 16),
        Text('Review answers', style: TextStyle(color: Theme.of(context).hintColor, fontWeight: FontWeight.bold, fontSize: 12)),
        const SizedBox(height: 8),
        ...quiz.questions.asMap().entries.map((e) {
          final i = e.key;
          final q = e.value;
          final correct = r.correctFlags[i];
          final correctIdx = r.correctIndices[i];
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Icon(correct ? Icons.check_circle : Icons.cancel, color: correct ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.error, size: 18),
                  const SizedBox(width: 6),
                  Expanded(child: Text(q.prompt.pick(lang), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14))),
                ]),
                const SizedBox(height: 8),
                Text('Correct: ${String.fromCharCode(65 + correctIdx)}. ${q.options[correctIdx].pick(lang)}',
                    style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.bold, fontSize: 13)),
                if (r.explanations[i].pick(lang).isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: Theme.of(context).dividerColor.withOpacity( 0.3), borderRadius: BorderRadius.circular(8)),
                    child: Text(r.explanations[i].pick(lang), style: TextStyle(fontSize: 13, color: Theme.of(context).hintColor)),
                  ),
                ],
              ]),
            ),
          );
        }),
      ],
    );
  }

  Future<void> _submit() async {
    final state = ref.read(lessonDetailProvider(widget.lessonId));
    final quiz = state.quiz!;
    setState(() => _submitting = true);
    try {
      final answers = quiz.questions.map((q) => _answers[q.id]!).toList();
      final r = await ApiClient.submitQuiz(widget.lessonId, answers);
      setState(() {
        _result = r;
        _submitting = false;
      });
      // AdMob interstitial cadence (decided server-side: every 2 completed lessons)
      ref.read(AdService.provider).maybeShowInterstitial(r.showInterstitial);
      // refresh lesson detail so the unlock reflects
      ref.refresh(lessonDetailProvider(widget.lessonId));
      ref.refresh(lessonsProvider('all'));
    } catch (_) {
      setState(() => _submitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Submission failed. Try again.')));
      }
    }
  }

  void _reset() => setState(() {
        _answers.clear();
        _result = null;
      });
}
