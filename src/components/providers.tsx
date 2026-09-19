"use client"

import { ThemeProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"
import { useEffect, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useStore } from "@/lib/store"
import { Splash } from "@/components/tradeseekho/splash"

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
  const [showSplash, setShowSplash] = useState(true)

  // Rehydrate the persisted store AFTER mount.
  useEffect(() => {
    const result = useStore.persist.rehydrate() as unknown as Promise<void> | void
    const markHydrated = () => useStore.setState({ hasHydrated: true })
    if (result && typeof (result as Promise<void>).then === "function") {
      ;(result as Promise<void>).then(markHydrated, markHydrated)
    } else {
      markHydrated()
    }
  }, [])

  // Hide splash after 2.5s (enough time for app to load)
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <SessionProvider>
        <QueryClientProvider client={qc}>
          <LangDirSync />
          {showSplash && <Splash onDone={() => setShowSplash(false)} />}
          {children}
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
