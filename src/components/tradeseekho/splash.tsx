"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

export function Splash({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 400)
    }, 2500)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{ backgroundColor: "#0A1929" }}
        >
          {/* Top section: Logo + Brand name + Tagline */}
          <div className="flex flex-col items-center pt-[12vh]">
            <motion.img
              src="/tradeseekho-logo.png"
              alt="TradeSeekho PK"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-20 w-20 sm:h-24 sm:w-24"
              draggable={false}
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-3 text-lg font-extrabold tracking-tight text-white"
            >
              TradeSeekho <span className="text-[#00D09C]">PK</span>
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-1 text-[10px] font-medium tracking-[0.2em] text-white/30"
            >
              LEARN • TRADE • GROW
            </motion.p>
          </div>

          {/* Bottom section: Boy illustration (cross-legged, laptop, floating chart) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="flex flex-1 items-end justify-center"
          >
            <img
              src="/splash-boy.png"
              alt="Trader"
              className="h-[45vh] w-auto max-w-[90vw] object-contain"
              draggable={false}
            />
          </motion.div>

          {/* Loading spinner — bottom center */}
          <div className="absolute bottom-6 flex flex-col items-center gap-2">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#00D09C]/30 border-t-[#00D09C]" />
            <p className="text-[10px] font-medium tracking-[0.2em] text-white/30">LOADING...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
