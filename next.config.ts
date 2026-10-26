import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    // Disable Next.js image optimization — saves Vercel bandwidth (no origin
    // processing for images). Images are served as-is from static/public folder
    // or Vercel Blob CDN. We use <img> tags with loading="lazy" instead.
    unoptimized: true,
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
