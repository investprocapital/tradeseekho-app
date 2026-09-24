import type { Metadata, Viewport } from "next";
import { Poppins, Noto_Nastaliq_Urdu, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const notoNastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-noto-nastaliq",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tradeseekho.com"),
  title: {
    default: "TradeSeekho PK - Learn Trading",
    template: "%s · TradeSeekho PK",
  },
  manifest: "/manifest.json",
  description:
    "TradeSeekho PK is a free Forex & Crypto learning platform. Structured lessons, instant quizzes, and real trading skills — in Urdu, English, Hindi and Arabic. Beginner to advanced.",
  keywords: [
    "Forex", "Forex trading", "Crypto", "Cryptocurrency", "Learn Forex Urdu",
    "Forex Pakistan", "Forex India", "Forex Arabic", "Babypips alternative",
    "Trading course", "Pips", "Candlestick", "Risk management",
  ],
  authors: [{ name: "TradeSeekho PK" }],
  creator: "TradeSeekho PK",
  icons: {
    icon: "/tradeseekho-logo.png",
    apple: "/tradeseekho-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["ur_PK", "hi_IN", "ar_AR"],
    title: "TradeSeekho PK — Learn Forex & Crypto",
    description: "Structured Forex & Crypto lessons with quizzes. Urdu, English, Hindi & Arabic.",
    siteName: "TradeSeekho PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "TradeSeekho PK — Learn Forex & Crypto",
    description: "Structured Forex & Crypto lessons with quizzes. Urdu, English, Hindi & Arabic.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1931" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${notoNastaliq.variable} ${notoNaskhArabic.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
