"use client"

// ============================================================
// components/ads/VideoAdPlayer.tsx
// Full-screen video ad with local storage + Cloudinary fallback
// Handles skip logic, click tracking, rewards
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, X, Volume2, VolumeX } from "lucide-react"
import type { VideoAd } from "@/lib/ads-config"
//import {
//  trackAdStarted,
//  trackAdCompleted,
//  trackAdClicked,
//} from "@/lib/ad-tracker"
// NEW
import { trackAdStarted, trackAdCompleted, trackAdClicked } from "@/lib/ad-tracker-db"
interface VideoAdPlayerProps {
  ad: VideoAd
  onComplete: (watchedFull: boolean) => void
}

type AdState = "loading" | "playing" | "paused" | "ended" | "error"

export function VideoAdPlayer({ ad, onComplete }: VideoAdPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [adState, setAdState] = useState<AdState>("loading")
  const [timeLeft, setTimeLeft] = useState(ad.durationSeconds)
  const [skipCountdown, setSkipCountdown] = useState(ad.skipAfterSeconds)
  const [canSkip, setCanSkip] = useState(ad.skipAfterSeconds === 0)
  const [muted, setMuted] = useState(false)
  const [showClickPrompt, setShowClickPrompt] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)
  const trackedRef = useRef(false)
  const completedRef = useRef(false)

  // Track ad started once
  useEffect(() => {
    if (!trackedRef.current) {
      trackedRef.current = true
      trackAdStarted(ad.id, ad.advertiserName, "reward_modal")
    }
  }, [ad.id, ad.advertiserName])

  // Try local video first, fall back to Cloudinary
  const getVideoSrc = useCallback((): string => {
    if (usingFallback && ad.cloudinaryVideoUrl) {
      return ad.cloudinaryVideoUrl
    }
    return ad.localVideoPath
  }, [usingFallback, ad.localVideoPath, ad.cloudinaryVideoUrl])

  const handleVideoError = useCallback(() => {
    if (!usingFallback && ad.cloudinaryVideoUrl) {
      console.log(`[AdPlayer] Local video failed, switching to Cloudinary: ${ad.cloudinaryVideoUrl}`)
      setUsingFallback(true)
    } else {
      console.error("[AdPlayer] Both local and Cloudinary sources failed")
      setAdState("error")
    }
  }, [usingFallback, ad.cloudinaryVideoUrl])

  // Auto-play when src changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.src = getVideoSrc()
    video
      .play()
      .then(() => setAdState("playing"))
      .catch(handleVideoError)
  }, [usingFallback, getVideoSrc, handleVideoError])

  // Timer tick
  useEffect(() => {
    if (adState !== "playing") return

    const interval = setInterval(() => {
      const video = videoRef.current
      if (!video) return

      const remaining = Math.max(
        0,
        ad.durationSeconds - Math.floor(video.currentTime)
      )
      setTimeLeft(remaining)

      if (ad.skipAfterSeconds > 0) {
        const skipRemaining = Math.max(
          0,
          ad.skipAfterSeconds - Math.floor(video.currentTime)
        )
        setSkipCountdown(skipRemaining)
        if (skipRemaining === 0) setCanSkip(true)
      }

      // Update progress bar
      if (progressRef.current && video.duration) {
        const pct = (video.currentTime / video.duration) * 100
        progressRef.current.style.width = `${pct}%`
      }
    }, 250)

    return () => clearInterval(interval)
  }, [adState, ad.durationSeconds, ad.skipAfterSeconds])

  const handleVideoEnded = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setAdState("ended")
    trackAdCompleted(ad.id, ad.advertiserName, true, true)
    setTimeout(() => onComplete(true), 800)
  }, [ad.id, ad.advertiserName, onComplete])

  const handleSkip = useCallback(() => {
    if (!canSkip || completedRef.current) return
    completedRef.current = true
    videoRef.current?.pause()
    trackAdCompleted(ad.id, ad.advertiserName, false, false)
    onComplete(false)
  }, [canSkip, ad.id, ad.advertiserName, onComplete])

  const handleAdClick = useCallback(() => {
    trackAdClicked(ad.id, ad.advertiserName)
    window.open(ad.clickUrl, "_blank", "noopener,noreferrer")
    setShowClickPrompt(false)
  }, [ad.id, ad.advertiserName, ad.clickUrl])

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
    }
  }

  if (adState === "error") {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
        <div className="text-white text-center p-8 max-w-sm">
          <div className="text-4xl mb-4">📵</div>
          <p className="text-lg font-semibold mb-2">Ad unavailable</p>
          <p className="text-white/60 text-sm mb-6">
            We couldn't load this ad. You can still continue playing.
          </p>
          <button
            onClick={() => onComplete(false)}
            className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-full transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col select-none">
      {/* ── Top bar ────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center gap-2">
          <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded">
            AD
          </span>
          <span className="text-white/80 text-sm font-medium">
            {ad.advertiserName}
          </span>
          {ad.packageTier === "premium" && (
            <span className="text-yellow-400/80 text-xs">★ Premium</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          <span className="text-white/70 text-sm tabular-nums">{timeLeft}s</span>
        </div>
      </div>

      {/* ── Video ──────────────────────────────────────── */}
      <div
        className="flex-1 relative flex items-center justify-center cursor-pointer"
        onClick={() => setShowClickPrompt(true)}
      >
        <video
          ref={videoRef}
          className="max-w-full max-h-full w-full object-contain"
          playsInline
          onEnded={handleVideoEnded}
          onError={handleVideoError}
          onCanPlay={() => {
            if (adState === "loading") {
              videoRef.current?.play().then(() => setAdState("playing"))
            }
          }}
        />

        {/* Loading spinner */}
        {adState === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Completion overlay */}
        <AnimatePresence>
          {adState === "ended" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="text-center"
              >
                <div className="text-6xl mb-3">🎉</div>
                <p className="text-white text-xl font-bold">Reward Earned!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click-to-visit overlay */}
        <AnimatePresence>
          {showClickPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 flex items-center justify-center p-6"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowClickPrompt(false)
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl"
              >
                {ad.advertiserLogo && (
                  <img
                    src={ad.advertiserLogo}
                    alt={ad.advertiserName}
                    className="h-12 object-contain mx-auto mb-3"
                  />
                )}
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  Visit {ad.advertiserName}?
                </h3>
                <p className="text-gray-500 text-sm mb-5">
                  Opens in your browser
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClickPrompt(false)}
                    className="flex-1 border-2 border-gray-200 text-gray-600 rounded-2xl py-3 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdClick}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl py-3 font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    {ad.callToAction}
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Progress bar ───────────────────────────────── */}
      <div className="h-1 bg-white/20">
        <div
          ref={progressRef}
          className="h-full bg-yellow-400 transition-none"
          style={{ width: "0%" }}
        />
      </div>

      {/* ── Bottom bar ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/80 to-transparent">
        <button
          onClick={() => setShowClickPrompt(true)}
          className="text-white/60 text-xs hover:text-white/80 transition-colors flex items-center gap-1"
        >
          Tap to learn more <ExternalLink className="h-3 w-3" />
        </button>

        {canSkip ? (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleSkip}
            className="bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors font-medium"
          >
            Skip Ad <X className="h-4 w-4" />
          </motion.button>
        ) : (
          <div className="bg-white/10 text-white/50 text-sm px-5 py-2.5 rounded-full">
            Skip in {skipCountdown}s
          </div>
        )}
      </div>
    </div>
  )
}
