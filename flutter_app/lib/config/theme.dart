import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// TradeSeekho dark theme with green (#00C853) + gold (#FFC107) accents,
/// matching the Next.js web design.
ThemeData buildTradeSeekhoTheme(Brightness brightness) {
  final isDark = brightness == Brightness.dark;
  const brand = Color(0xFF00C853);
  const brandDark = Color(0xFF1ED86A);
  const gold = Color(0xFFFFC107);
  final bg = isDark ? const Color(0xFF0B1410) : const Color(0xFFFFFFFF);
  final card = isDark ? const Color(0xFF121D16) : const Color(0xFFFFFFFF);
  final fg = isDark ? const Color(0xFFEAF3EC) : const Color(0xFF15241C);
  final muted = isDark ? const Color(0xFF16241B) : const Color(0xFFF3F6F3);
  final mutedFg = isDark ? const Color(0xFF9FB3A6) : const Color(0xFF5C6B62);
  final border = isDark ? const Color(0xFF1F3027) : const Color(0xFFE6ECE7);

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    scaffoldBackgroundColor: bg,
    colorScheme: ColorScheme(
      brightness: brightness,
      primary: isDark ? brandDark : brand,
      onPrimary: isDark ? const Color(0xFF04130B) : Colors.white,
      secondary: gold,
      onSecondary: const Color(0xFF1A1400),
      surface: card,
      onSurface: fg,
      error: const Color(0xFFE53935),
      onError: Colors.white,
    ),
    cardColor: card,
    dividerColor: border,
    textTheme: ThemeData(brightness: brightness).textTheme.apply(
          bodyColor: fg,
          displayColor: fg,
          fontFamily: 'Poppins',
        ),
    appBarTheme: AppBarTheme(
      backgroundColor: isDark ? const Color(0xFF0F1812) : Colors.white,
      foregroundColor: fg,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: fg,
        fontWeight: FontWeight.w800,
        fontSize: 18,
        fontFamily: 'Poppins',
      ),
    ),
    cardTheme: CardTheme(
      color: card,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: border, width: 1),
      ),
      margin: EdgeInsets.zero,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: isDark ? brandDark : brand,
        foregroundColor: isDark ? const Color(0xFF04130B) : Colors.white,
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: isDark ? brandDark : brand,
        side: BorderSide(color: isDark ? brandDark : brand),
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    ),
    progressIndicatorTheme: ProgressIndicatorThemeData(
      color: isDark ? brandDark : brand,
      linearTrackColor: muted,
    ),
  );
}

final themeProvider = StateProvider<Brightness>((ref) => Brightness.dark);
