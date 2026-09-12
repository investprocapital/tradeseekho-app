import 'package:flutter/material.dart';
import 'dart:ui' show PlatformDispatcher;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'config/theme.dart';
import 'l10n/strings.dart';
import 'providers/providers.dart';
import 'services/ad_service.dart';
import 'services/cache_service.dart';
import 'screens/home_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Offline cache (Hive) — instant load + <1s render goal.
  await CacheService.init();
  // AdMob — wrapped defensively so a missing APPLICATION_ID or no Play Services
  // never prevents the app from opening. Ads simply won't serve if this fails.
  try {
    await AdService().init();
  } catch (e) {
    // ignore: avoid_print
    print('AdMob init skipped: $e');
  }
  // Catch unhandled async errors so they never crash the app to a black screen.
  FlutterError.onError = (details) {
    FlutterError.presentError(details);
  };
  PlatformDispatcher.instance.onError = (error, stack) {
    // ignore: avoid_print
    print('Unhandled: $error');
    return true; // swallow — app keeps running
  };
  runApp(const ProviderScope(child: TradeSeekhoApp()));
}

class TradeSeekhoApp extends ConsumerWidget {
  const TradeSeekhoApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lang = ref.watch(localeProvider);
    final brightness = ref.watch(themeProvider);
    final isRtl = AppStrings.isRtl(lang);
    return MaterialApp(
      title: 'TradeSeekho',
      debugShowCheckedModeBanner: false,
      theme: buildTradeSeekhoTheme(brightness),
      locale: Locale(lang),
      supportedLocales: const [Locale('en'), Locale('ur'), Locale('hi'), Locale('ar')],
      builder: (context, child) => Directionality(
        textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
        child: child!,
      ),
      home: const HomeScreen(),
    );
  }
}
