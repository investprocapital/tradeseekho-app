import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    // Allow next/image to load from Vercel Blob CDN + data URLs (base64 fallback)
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "vercel-storage.com" },
    ],
    // Allow base64 data URLs (used when Vercel Blob is not configured)
    dangerouslyAllowSVG: true,
  },
  // ─── Cache static assets to reduce Vercel bandwidth ───
  // Lesson images (43 × ~8KB = 468KB) + other static files get 1-year cache.
  // Without this, browsers re-fetch them on every page load = bandwidth waste.
  async headers() {
    return [
      {
        source: "/lessons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/banners/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/tradeseekho-logo.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/tradeseekho-ad.mp4",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
