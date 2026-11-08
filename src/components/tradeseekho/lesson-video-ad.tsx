"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Megaphone, PlayCircle, Volume2, VolumeX, ExternalLink } from "lucide-react"

/**
 * LessonVideoAd — AdMob-style video interstitial shown at the START of each
 * lesson (Lessons 1–43) for users whose per-user Ads flag is ON.
 *
 * Behaviour mirrors a real AdMob rewarded/interstitial video ad:
 *  - Autoplays the TradeSeekho promo video with sound.
 *  - A 5-second countdown runs in the corner (real AdMob enforces a minimum
 *    watch time before the skip control appears).
 *  - After the countdown, a "Skip Ad" button is revealed.
 *  - On web we simulate the AdMob unit with /tradeseekho-ad.mp4 (the same
 *    creative bundled for the Flutter APK). On native (APK/iOS) the Flutter
 *    side swaps this for the real Google Mobile Ads SDK interstitial.
 *
 * Pro users never see this — `adsEffective` is forced false server-side when
 * proStatus === "active", so this component is never mounted for them.
 */
export function LessonVideoAd({
  lessonTitle,
  onSkip,
}: {
  lessonTitle: string
  onSkip: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [countdown, setCountdown] = useState(5)
  const [muted, setMuted] = useState(false)
  const [videoOk, setVideoOk] = useState(true)
  // Skip control unlocks once the 5-second countdown completes (AdMob-style).
  const canSkip = countdown <= 0

  // 5-second countdown → drives the "Skip in Ns" → "Skip Ad" transition.
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Autoplay attempt (muted-first to satisfy browser policies, then unmute).
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    const p = v.play()
    if (p && typeof p.then === "function") {
      p.then(() => {
        // Muted autoplay succeeded — try to unmute for the full ad experience.
        v.muted = false
        setMuted(false)
        v.play().catch(() => {
          // Unmute blocked — keep muted, user can toggle.
          v.muted = true
          setMuted(true)
        })
      }).catch(() => {
        // Autoplay blocked entirely — keep muted so the user can tap play.
        v.muted = true
        setMuted(true)
      })
    }
  }, [])

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col bg-black"
    >
      {/* Top bar: Ad badge (left) + countdown/skip (right) */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-3">
        <span className="rounded bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/80">
          Ad · AdMob Video
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white active:scale-90"
            aria-label={muted ? "Unmute ad" : "Mute ad"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          {canSkip ? (
            <Button
              size="sm"
              className="gap-1.5 bg-white font-bold text-black hover:bg-white/90"
              onClick={onSkip}
            >
              Skip Ad →
            </Button>
          ) : (
            <span className="rounded bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white/90">
              Skip in {countdown}s
            </span>
          )}
        </div>
      </div>

      {/* Video creative (web simulation of the AdMob interstitial unit) */}
      {videoOk ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src="/tradeseekho-ad.mp4"
          poster="/ad-shot-1.png"
          playsInline
          autoPlay
          controls={false}
          onError={() => setVideoOk(false)}
          onClick={toggleMute}
        />
      ) : (
        // Fallback static branded ad if the video asset fails to load.
        <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#0A1929] via-[#102a43] to-[#0A1929] p-6 text-center">
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gold/20">
            <Megaphone className="h-10 w-10 text-gold" />
          </span>
          <div>
            <p className="text-xl font-extrabold text-white">TradeSeekho PK Pro</p>
            <p className="mt-1 text-sm text-white/60">Unlock all lessons · Ad-free learning</p>
          </div>
          <PlayCircle className="h-10 w-10 text-white/40" />
        </div>
      )}

      {/* Bottom CTA bar — mimics AdMob's "Visit" end-card */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-3 border-t border-white/10 bg-black/80 p-3 backdrop-blur">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-white">
            📈 Up next: {lessonTitle}
          </p>
          <p className="text-[10px] text-white/50">Your lesson starts after this ad</p>
        </div>
        <a
          href="https://tradeseekho.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-[11px] font-bold text-black"
        >
          Visit <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </motion.div>
  )
}

/** Wrapper that mounts/unmounts the video ad with AnimatePresence. */
export function LessonVideoAdOverlay({
  show,
  lessonTitle,
  onSkip,
}: {
  show: boolean
  lessonTitle: string
  onSkip: () => void
}) {
  return (
    <AnimatePresence>
      {show && <LessonVideoAd lessonTitle={lessonTitle} onSkip={onSkip} />}
    </AnimatePresence>
  )
}
