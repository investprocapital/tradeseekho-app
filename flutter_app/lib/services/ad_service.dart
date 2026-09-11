import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../config/api_config.dart';

/// AdMob service: banner at the bottom of list screens + interstitial shown
/// after every 2 completed lessons (the cadence is decided server-side and
/// surfaced via QuizSubmitResult.showInterstitial).
class AdService {
  BannerAd? _banner;
  bool _interstitialLoading = false;
  InterstitialAd? _interstitial;

  static final provider = Provider<AdService>((ref) => AdService());

  Future<void> init() async {
    await MobileAds.instance.initialize();
  }

  // ---- Banner ----
  BannerAd? buildBannerAd(VoidCallback onLoaded) {
    _banner?.dispose();
    _banner = BannerAd(
      adUnitId: ApiConfig.bannerAdUnitId,
      size: AdSize.banner,
      request: const AdRequest(),
      listener: BannerAdListener(onAdLoaded: (_) => onLoaded()),
    )..load();
    return _banner;
  }

  Widget bannerWidget(BuildContext context) {
    final banner = buildBannerAd(() {});
    if (banner == null) return const SizedBox(height: 0);
    return SafeArea(
      child: SizedBox(height: banner.size.height.toDouble(), child: AdWidget(ad: banner)),
    );
  }

  // ---- Interstitial (after 2 lessons) ----
  void maybeShowInterstitial(bool show) {
    if (!show) return;
    if (_interstitial != null) {
      _interstitial!.fullScreenContentCallback = FullScreenContentCallback(
        onAdDismissedFullScreenContent: (ad) {
          ad.dispose();
          _interstitial = null;
        },
      );
      _interstitial!.show();
      return;
    }
    if (_interstitialLoading) return;
    _interstitialLoading = true;
    InterstitialAd.load(
      adUnitId: ApiConfig.interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialLoading = false;
          _interstitial = ad;
          ad.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (a) {
              a.dispose();
              _interstitial = null;
            },
          );
          ad.show();
        },
        onAdFailedToLoad: (err) {
          _interstitialLoading = false;
        },
      ),
    );
  }
}
