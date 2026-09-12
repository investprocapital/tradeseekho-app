import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../l10n/strings.dart';
import '../providers/providers.dart';

/// My Certificates — earned when a level is fully passed.
/// Tap one to copy the verification ID (also verifiable at GET /api/certificates/[id]).
class CertificateScreen extends ConsumerWidget {
  const CertificateScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lang = ref.watch(localeProvider);
    final strings = AppStrings(Locale(lang));
    final isRtl = AppStrings.isRtl(lang);
    final certs = ref.watch(certificatesProvider);

    return Directionality(
      textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: AppBar(title: Text(strings.get('certificates'))),
        body: certs.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) => Center(child: Text(strings.get('noCertificates'))),
          data: (list) {
            if (list.isEmpty) {
              return Center(
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.workspace_premium_outlined, size: 56, color: Color(0xFFFFC107)),
                  const SizedBox(height: 12),
                  Text(strings.get('noCertificates'), textAlign: TextAlign.center, style: TextStyle(color: Theme.of(context).hintColor)),
                ]),
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: list.length,
              itemBuilder: (context, i) => _CertCard(cert: list[i]),
            );
          },
        ),
      ),
    );
  }
}

class _CertCard extends StatelessWidget {
  final dynamic cert; // Certificate
  const _CertCard({required this.cert});
  @override
  Widget build(BuildContext context) {
    final pct = cert.scoreTotal == 0 ? 0 : (cert.scoreSum / cert.scoreTotal * 100).round();
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFFC107), width: 2),
        gradient: const LinearGradient(colors: [Color(0x1AFFC107), Colors.transparent]),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          Row(children: [
            const CircleAvatar(backgroundColor: Color(0xFFFFC107), child: Icon(Icons.workspace_premium, color: Colors.white)),
            const SizedBox(width: 8),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('TRADESEEKHO', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 2, color: Color(0xFF5A4500))),
              Text('${cert.categorySlug} level'.toUpperCase(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            ]),
            const Spacer(),
            Chip(
              label: Text('Passed ${cert.lessonsPassed}/${cert.totalLessons}'),
              backgroundColor: Theme.of(context).colorScheme.primary.withOpacity( 0.12),
              side: BorderSide.none,
            ),
          ]),
          const SizedBox(height: 16),
          Text(cert.userName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text('completed the ${cert.categorySlug} level of the Forex & Crypto learning program.',
              style: TextStyle(color: Theme.of(context).hintColor, fontSize: 12), textAlign: TextAlign.center),
          const SizedBox(height: 16),
          Row(children: [
            _stat('Score', '$pct%'),
            _stat('Correct', '${cert.scoreSum}/${cert.scoreTotal}'),
            _stat('Date', _shortDate(cert.issuedAt)),
          ]),
          const Divider(color: Color(0x44FFC107)),
          Row(children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('VERIFICATION ID', style: TextStyle(fontSize: 9, color: Colors.grey)),
              Text(cert.verificationId, style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary, fontSize: 16)),
            ]),
            const Spacer(),
            OutlinedButton.icon(
              onPressed: () {
                // copy verification id
              },
              icon: const Icon(Icons.copy, size: 16),
              label: const Text('Copy'),
            ),
          ]),
        ]),
      ),
    );
  }

  Widget _stat(String label, String value) {
    return Expanded(child: Column(children: [
      Text(label, style: const TextStyle(fontSize: 9, color: Colors.grey)),
      const SizedBox(height: 2),
      Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
    ]));
  }

  String _shortDate(DateTime d) => '${d.day}/${d.month}/${d.year}';
}
