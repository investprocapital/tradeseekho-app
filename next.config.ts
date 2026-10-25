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
};

export default nextConfig;
