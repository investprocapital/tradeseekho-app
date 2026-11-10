# TradeSeekho PK — Play Store AAB Setup (TWA / Bubblewrap)

This folder contains the configuration for building the Play Store AAB file
using **Bubblewrap** (Google's official TWA wrapper). A TWA (Trusted Web
Activity) wraps the web app (`https://tradeseekhopk.vercel.app` or later
`https://tradeseekhopk.com`) into a native Android app — no WebView chrome,
full-screen, installable from Play Store.

## Package Name (FINAL — never changes)
```
com.tradeseekhopk.app
```

## Prerequisites
1. **Node.js 18+** + **JDK 17** + **Android SDK** (Build Tools 34+)
2. Install Bubblewrap CLI:
   ```bash
   npm install -g @bubblewrap/cli
   ```

## Step 1: Initialize the TWA project (run ONCE)
When ready to build the AAB (after domain is live), run:

```bash
cd twa
bubblewrap init --manifest=https://tradeseekhopk.vercel.app/manifest.json
```

Bubblewrap will prompt for:
- **Application name**: `TradeSeekho PK`
- **Short name**: `TradeSeekho`
- **Package ID**: `com.tradeseekhopk.app` ← MUST match exactly
- **Start URL**: `/` (root)
- **Theme color**: `#0A1931` (dark navy)
- **Background color**: `#0A1931`
- **Icon**: `./icon-512.png` (512×512, already in public/)
- **Maskable icon**: `./icon-512.png`
- **Splash screen**: `./icon-512.png`
- **Navigation fallback**: `customtabs`
- **Signing key**: generate new (keep keystore safe!)

## Step 2: Build the AAB
```bash
cd twa
bubblewrap build
```
Output: `app-release-bundle.aab` → upload to Play Console.

## Step 3: Domain Verification (Digital Asset Links)
After the domain is live (`tradeseekhopk.com`), host the assetlinks.json at:
```
https://tradeseekhopk.com/.well-known/assetlinks.json
```

Bubblewrap generates this file automatically. The content is also in
`twa/assetlinks.json` in this folder (placeholder — replace `PACKAGE` and
`SHA256` after first build).

## App Mode Integration
The app uses `getAppUrl()` from `src/lib/app-settings.ts` (DB-controlled).
When you switch App Mode from "Vercel" → "Custom Domain" in Admin Panel:
1. All share links / legal pages update to `tradeseekhopk.com`
2. The TWA should be rebuilt with the new domain (Bubblewrap `update` command)
3. Re-upload AAB to Play Console

## Play Store Listing Assets
All assets are in `/public/` and `/twa/assets/`:
- App Icon 512×512: `public/icon-512.png`
- Feature Graphic 1024×500: `twa/assets/feature-graphic.png`
- Phone Screenshots: `twa/assets/screenshots/`
- App name: `TradeSeekho PK`
- Short description: see `twa/listing.txt`
- Full description: see `twa/listing.txt`

## Versioning
- `flutter_app/pubspec.yaml` → `version: 1.0.0+1`
- `twa/twa-manifest.json` → `versionName: "1.0.0"` (after init)
- Increment versionCode for each Play Store upload.
