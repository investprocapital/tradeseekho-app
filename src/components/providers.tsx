"use client"

import { ThemeProvider } from "next-themes"
import { useEffect, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useStore } from "@/lib/store"

function LangDirSync() {
  const lang = useStore((s) => s.lang)
  useEffect(() => {
    const dir = lang === "ur" || lang === "ar" ? "rtl" : "ltr"
    document.documentElement.setAttribute("dir", dir)
    document.documentElement.setAttribute("lang", lang)
  }, [lang])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  )
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <QueryClientProvider client={qc}>
        <LangDirSync />
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  )
}
