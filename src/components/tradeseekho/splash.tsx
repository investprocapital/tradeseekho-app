"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

export function Splash({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 400) // wait for fade-out animation
    }, 2200)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#070F2B]"
        >
          {/* Splash image — covers most of the screen */}
          <img
            src="/splash.jpg"
            alt="TradeSeekho"
            className="h-full w-full object-cover"
            style={{ objectPosition: "center top" }}
          />

          {/* Dark gradient overlay at bottom for loader visibility */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#070F2B] to-transparent" />

          {/* Loading spinner — bottom center */}
          <div className="absolute bottom-12 flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00D09C]/30 border-t-[#00D09C]" />
            <p className="text-xs font-medium tracking-[0.2em] text-white/40">LOADING...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
