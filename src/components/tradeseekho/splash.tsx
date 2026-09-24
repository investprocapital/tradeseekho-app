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
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
          style={{ backgroundColor: "#0A1929" }}
        >
          {/* Transparent logo — centered on dark background */}
          <motion.img
            src="/tradeseekho-logo.png"
            alt="TradeSeekho"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-28 w-28 sm:h-32 sm:w-32"
            draggable={false}
          />

          {/* App name */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-4 text-lg font-extrabold tracking-tight text-white"
          >
            Trade<span className="text-[#00D09C]">Seekho</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-1 text-[10px] font-medium tracking-[0.2em] text-white/30"
          >
            LEARN • TRADE • GROW
          </motion.p>

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
