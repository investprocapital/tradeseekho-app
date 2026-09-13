"use client"

import { ThemeProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"
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

  // Rehydrate the persisted store AFTER mount. Combined with skipHydration:true
  // in the store, this guarantees the server render and the client's initial
  // render use identical defaults → no hydration mismatch. Persisted values
  // (lang, onboarding, bookmarks, adminAuthed) then apply on the next paint.
  useEffect(() => {
    const result = useStore.persist.rehydrate() as unknown as Promise<void> | void
    const markHydrated = () => useStore.setState({ hasHydrated: true })
    if (result && typeof (result as Promise<void>).then === "function") {
      ;(result as Promise<void>).then(markHydrated, markHydrated)
    } else {
      markHydrated()
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <SessionProvider>
        <QueryClientProvider client={qc}>
          <LangDirSync />
          {children}
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
