"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

/**
 * Splash / Loading screen — shown on app load (and after login while data
 * hydrates). Displays the TradeSeekho PK brand image (boy + T logo + tagline).
 *
 * FULL-SCREEN RESPONSIVE (no black gap on any device):
 *   - Container: fixed inset-0, 100dvh height, margin:0, padding:0, overflow:hidden
 *   - Image: width 100%, height 100dvh, object-fit: cover, object-position: center
 *   - The image fills the ENTIRE viewport edge-to-edge — no black bars on
 *     mobile, tablet, or desktop.
 *   - Loading spinner + "LOADING..." text overlay on top (bottom center).
 *
 * The image (splash-loading.jpg) is a full promotional graphic with the T
 * logo, "TradeSeekho PK" text, "Learn. Trade. Grow." tagline, and a boy
 * illustration.
 */
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
          className="fixed inset-0 z-[200] overflow-hidden"
          style={{
            margin: 0,
            padding: 0,
            height: "100dvh",
            width: "100%",
            backgroundColor: "#050D17",
          }}
        >
          {/* Full-bleed brand image — covers entire viewport, no black gap.
              object-fit: cover fills the screen; object-position: center keeps
              the important content (logo, boy) centered on all aspect ratios. */}
          <motion.img
            src="/splash-loading.jpg"
            alt="TradeSeekho PK — Learn. Trade. Grow."
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{
              width: "100%",
              height: "100dvh",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
            draggable={false}
          />

          {/* Loading spinner — bottom center, overlay on top of image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#00D09C]/30 border-t-[#00D09C]" />
            <p className="text-[10px] font-medium tracking-[0.2em] text-white/70 drop-shadow">LOADING...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
