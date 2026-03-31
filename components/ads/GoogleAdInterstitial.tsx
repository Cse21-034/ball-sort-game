"use client"

/**
 * GoogleAdInterstitial.tsx
 * Full-screen interstitial showing either:
 * 1. Video ad (if available from VideoAdPlayer)
 * 2. Google Display Ad (300x250 fallback)
 * 
 * Auto-dismisses after 5 seconds with countdown + skip button
 */

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { VideoAdPlayer } from "@/components/ads/VideoAdPlayer"
import type { VideoAd } from "@/lib/ads-config"

interface GoogleAdInterstitialProps {
  isOpen: boolean
  onComplete: () => void
  ad?: VideoAd | null
  levelId?: number
}

type AdState = "video" | "display" | "closed"

export function GoogleAdInterstitial({
  isOpen,
  onComplete,
  ad,
  levelId = 0,
}: GoogleAdInterstitialProps) {
  const [adState, setAdState] = useState<AdState>("video")
  const [timeLeft, setTimeLeft] = useState(5)
  const [canSkip, setCanSkip] = useState(false)
  const adRef = useRef<HTMLDivElement>(null)

  // Determine which ad to show
  const showVideo = ad !== null && ad !== undefined

  useEffect(() => {
    if (!isOpen) {
      setAdState("closed")
      return
    }

    // If no video ad, show display ad
    if (!showVideo) {
      setAdState("display")
    } else {
      setAdState("video")
    }
  }, [isOpen, showVideo])

  // Timer for auto-dismiss and skip button
  useEffect(() => {
    if (adState === "closed" || !isOpen) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1
        if (newTime <= 0) {
          handleComplete()
          return 0
        }
        if (newTime === 0) setCanSkip(true)
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [adState, isOpen])

  const handleComplete = () => {
    setAdState("closed")
    // Small delay before closing for smooth animation
    setTimeout(() => {
      onComplete()
      setTimeLeft(5)
      setCanSkip(false)
    }, 300)
  }

  const handleVideoComplete = (watchedFull: boolean) => {
    if (watchedFull) {
      handleComplete()
    } else {
      // User skipped — still show display ad briefly
      if (!showVideo) {
        handleComplete()
      }
    }
  }

  if (adState === "closed") return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
        >
          {/* Close button (shows after time limit) */}
          <AnimatePresence>
            {canSkip && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleComplete}
                className="absolute top-4 right-4 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                title="Close ad"
              >
                <X className="h-6 w-6" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Countdown timer */}
          <AnimatePresence>
            {!canSkip && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 right-4 flex items-center gap-2 text-white bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium"
              >
                Skip in {timeLeft}s
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Ad */}
          {adState === "video" && showVideo && ad && (
            <VideoAdPlayer
              ad={ad}
              onComplete={handleVideoComplete}
            />
          )}

          {/* Display Ad (Google AdSense) */}
          {adState === "display" && process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
            <div
              ref={adRef}
              className="flex items-center justify-center"
            >
              <div className="bg-white rounded-lg p-4">
                <ins
                  className="adsbygoogle"
                  style={{
                    display: "inline-block",
                    width: "300px",
                    height: "250px",
                  }}
                  data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
                  data-ad-slot={
                    process.env.NEXT_PUBLIC_ADSENSE_SLOT_INTERSTITIAL ||
                    "0000000000"
                  }
                  data-ad-format="auto"
                />
              </div>
            </div>
          )}

          {/* Fallback - just show dismissible screen */}
          {adState === "display" && !process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
            <div className="text-center text-white">
              <div className="text-6xl mb-4">📺</div>
              <p className="text-xl mb-8">Advertisement</p>
              <button
                onClick={handleComplete}
                className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-full transition-colors"
              >
                {canSkip ? "Skip" : `Close in ${timeLeft}s`}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
