"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

/**
 * Splash / Loading screen — shown on app load (and after login while data
 * hydrates). Displays the TradeSeekho PK brand image (boy + T logo + tagline).
 *
 * Responsive across mobile / tablet / PC:
 *   - Mobile (portrait): image fills width, height auto, centered.
 *   - Tablet (portrait/landscape): image scales up, max 80vh height.
 *   - PC (landscape): image constrained to max 600px width, centered.
 *
 * The image (splash-loading.jpg) is a full promotional graphic with the T
 * logo, "TradeSeekho PK" text, "Learn. Trade. Grow." tagline, and a boy
 * illustration — so we render it as a single responsive image instead of
 * compositing separate elements.
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
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{ backgroundColor: "#050D17" }}
        >
          {/* Responsive brand image — scales to fit all screen sizes.
              - Mobile:  w-full max-w-[420px], height auto
              - Tablet:  sm:max-w-[520px]
              - PC:      md:max-w-[600px], max-h-[85vh] (won't overflow vertically)
              The image has a portrait aspect (~9:16) so on mobile it fills nicely;
              on PC it's centered + capped so it doesn't get too tall. */}
          <motion.img
            src="/splash-loading.jpg"
            alt="TradeSeekho PK — Learn. Trade. Grow."
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="h-auto w-full max-w-[420px] object-contain sm:max-w-[520px] md:max-w-[600px] md:max-h-[85vh]"
            draggable={false}
          />

          {/* Loading spinner — bottom center */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="absolute bottom-6 flex flex-col items-center gap-2"
          >
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#00D09C]/30 border-t-[#00D09C]" />
            <p className="text-[10px] font-medium tracking-[0.2em] text-white/40">LOADING...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
