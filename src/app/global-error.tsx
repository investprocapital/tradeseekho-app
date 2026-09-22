"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("GlobalError caught:", error)
  }, [error])

  return (
    <html>
      <body style={{ padding: "20px", fontFamily: "monospace", fontSize: "14px" }}>
        <h2 style={{ color: "red" }}>Application Error</h2>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {error?.message || "Unknown error"}
          {"\n\n"}
          {error?.stack || "No stack trace"}
          {"\n\n"}
          {error?.digest ? `Digest: ${error.digest}` : ""}
        </pre>
        <button
          onClick={() => reset()}
          style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
