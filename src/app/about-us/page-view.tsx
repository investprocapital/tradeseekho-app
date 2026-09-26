"use client"

import { Shield, Mail, Info, ArrowLeft } from "lucide-react"
import Link from "next/link"

const ICONS: Record<string, any> = {
  "about-us": Info,
  "privacy-policy": Shield,
  "contact-us": Mail,
}

export function PageView({ title, content, slug }: { title: string; content: string; slug: string }) {
  const Icon = ICONS[slug] || Info
  const paragraphs = content.split("\n").filter((p) => p.trim())

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Icon className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-extrabold text-foreground">{title}</h1>
        </div>

        <div className="prose prose-sm max-w-none">
          {paragraphs.map((p, i) => (
            <p key={i} className="mb-4 text-[15px] leading-7 text-foreground/80 whitespace-pre-wrap">
              {p}
            </p>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-border pt-6 text-center">
          <div className="mb-2 flex items-center justify-center gap-4 text-xs">
            <Link href="/about-us" className="font-bold text-brand hover:underline">About Us</Link>
            <span className="text-muted-foreground">|</span>
            <Link href="/privacy-policy" className="font-bold text-brand hover:underline">Privacy Policy</Link>
            <span className="text-muted-foreground">|</span>
            <Link href="/contact-us" className="font-bold text-brand hover:underline">Contact Us</Link>
          </div>
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} TradeSeekho PK · Made in Pakistan · Serving Worldwide
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Email: <a href="mailto:tradeseekhopk@gmail.com" className="text-brand hover:underline">tradeseekhopk@gmail.com</a>
          </p>
        </div>
      </main>
    </div>
  )
}
