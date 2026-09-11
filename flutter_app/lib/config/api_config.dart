/// API + app configuration for TradeSeekho Flutter client.
/// In production, point [baseUrl] at your Vercel-deployed Next.js API.

class ApiConfig {
  /// Local dev (Next.js API on port 3000). For release, set this to your Vercel URL
  /// (e.g. https://tradeseekho.com) — ideally injected via --dart-define.
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000', // 10.0.2.2 = host loopback from Android emulator
  );

  static const String appName = 'TradeSeekho';
  static const Duration httpTimeout = Duration(seconds: 15);

  // AdMob — replace with your real unit IDs before release.
  static const String bannerAdUnitId = String.fromEnvironment(
    'BANNER_AD_UNIT_ID',
    defaultValue: 'ca-app-pub-3940256099942544/6300978111', // Google's test banner
  );
  static const String interstitialAdUnitId = String.fromEnvironment(
    'INTERSTITIAL_AD_UNIT_ID',
    defaultValue: 'ca-app-pub-3940256099942544/1033173712', // Google's test interstitial
  );
}
