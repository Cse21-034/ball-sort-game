"use client"

// ============================================================
// components/ads/AdRewardModal.tsx  (replaces ad-reward-modal.tsx)
// Updated modal that shows real advertiser videos
// ============================================================

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Coins, Lightbulb, Undo2, X, Gift, Play, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VideoAdPlayer } from "./VideoAdPlayer"
import { AffiliateLinksPanel } from "./AffiliateLinksPanel"
import {
  getRandomAd,
  getActiveAffiliateLinks,
  hasAnyActiveAds,
  type VideoAd,
} from "@/lib/ads-config"

export interface AdReward {
  type: "coins" | "hint" | "undo"
  amount: number
}

interface AdRewardModalProps {
  isOpen: boolean
  onClose: () => void
  onReward: (reward: AdReward) => void
}

type ModalState = "selection" | "playing_ad" | "no_ads" | "cooldown"

const REWARD_OPTIONS = [
  {
    type: "coins" as const,
    icon: Coins,
    label: "+25 Coins",
    description: "Watch a short video",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/20",
    amount: 25,
  },
  {
    type: "hint" as const,
    icon: Lightbulb,
    label: "+1 Hint",
    description: "Watch a short video",
    color: "text-accent",
    bgColor: "bg-accent/20",
    amount: 1,
  },
  {
    type: "undo" as const,
    icon: Undo2,
    label: "+3 Undos",
    description: "Watch a short video",
    color: "text-primary",
    bgColor: "bg-primary/20",
    amount: 3,
  },
]

// Cooldown between ads: 30 seconds
const AD_COOLDOWN_MS = 30_000
let lastAdTimestamp = 0

export function AdRewardModal({
  isOpen,
  onClose,
  onReward,
}: AdRewardModalProps) {
  const [modalState, setModalState] = useState<ModalState>("selection")
  const [currentAd, setCurrentAd] = useState<VideoAd | null>(null)
  const [selectedRewardType, setSelectedRewardType] = useState<
    "coins" | "hint" | "undo"
  >("coins")
  const [cooldownLeft, setCooldownLeft] = useState(0)
  const [showAffiliates, setShowAffiliates] = useState(false)
  const hasAds = hasAnyActiveAds()
  const hasAffiliates = getActiveAffiliateLinks().length > 0

  // Check cooldown on open
  useEffect(() => {
    if (!isOpen) return
    const elapsed = Date.now() - lastAdTimestamp
    if (lastAdTimestamp > 0 && elapsed < AD_COOLDOWN_MS) {
      setCooldownLeft(Math.ceil((AD_COOLDOWN_MS - elapsed) / 1000))
      setModalState("cooldown")
    } else {
      setModalState("selection")
    }
  }, [isOpen])

  // Cooldown countdown
  useEffect(() => {
    if (modalState !== "cooldown") return
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastAdTimestamp
      const remaining = Math.ceil((AD_COOLDOWN_MS - elapsed) / 1000)
      if (remaining <= 0) {
        setCooldownLeft(0)
        setModalState("selection")
        clearInterval(interval)
      } else {
        setCooldownLeft(remaining)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [modalState])

  const handleWatchAd = (type: "coins" | "hint" | "undo") => {
    const ad = getRandomAd("reward_modal")
    if (!ad) {
      setModalState("no_ads")
      return
    }
    setSelectedRewardType(type)
    setCurrentAd(ad)
    setModalState("playing_ad")
    lastAdTimestamp = Date.now()
  }

  const handleAdComplete = (watchedFull: boolean) => {
    setCurrentAd(null)
    setModalState("selection")

    if (watchedFull) {
      const option = REWARD_OPTIONS.find((r) => r.type === selectedRewardType)!
      onReward({ type: selectedRewardType, amount: option.amount })
    }
    onClose()
  }

  const handleAffiliateReward = (type: string, amount: number) => {
    onReward({ type: type as "coins" | "hint" | "undo", amount })
  }

  // Show video player fullscreen (outside modal)
  if (modalState === "playing_ad" && currentAd) {
    return <VideoAdPlayer ad={currentAd} onComplete={handleAdComplete} />
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-card rounded-3xl p-6 max-w-sm w-full border border-border shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Gift className="h-6 w-6 text-accent" />
                  <h2 className="text-xl font-bold">Free Rewards</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Cooldown state */}
              {modalState === "cooldown" && (
                <div className="text-center py-6">
                  <div className="text-5xl mb-3">⏳</div>
                  <p className="text-muted-foreground mb-1">
                    Next ad available in
                  </p>
                  <p className="text-4xl font-bold text-primary tabular-nums">
                    {cooldownLeft}s
                  </p>
                </div>
              )}

              {/* No ads state */}
              {modalState === "no_ads" && (
                <div className="text-center py-6">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="font-semibold mb-1">No ads right now</p>
                  <p className="text-sm text-muted-foreground">
                    Check back later or browse our deals below!
                  </p>
                </div>
              )}

              {/* Selection state */}
              {modalState === "selection" && (
                <div className="space-y-3">
                  {hasAds ? (
                    <>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Watch a short video ad to earn free rewards!
                      </p>
                      {REWARD_OPTIONS.map((reward) => (
                        <motion.button
                          key={reward.type}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleWatchAd(reward.type)}
                          className="w-full flex items-center gap-4 border border-border bg-transparent hover:bg-secondary/50 rounded-2xl p-4 transition-colors"
                        >
                          <div
                            className={`p-3 rounded-xl flex-shrink-0 ${reward.bgColor}`}
                          >
                            <reward.icon
                              className={`h-6 w-6 ${reward.color}`}
                            />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-semibold">{reward.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {reward.description}
                            </p>
                          </div>
                          <Play className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </motion.button>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-4xl mb-3">🎬</div>
                      <p className="text-muted-foreground text-sm">
                        No video ads available at the moment.
                      </p>
                    </div>
                  )}

                  {/* Affiliate links button */}
                  {hasAffiliates && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAffiliates(true)}
                      className="w-full flex items-center gap-4 border border-accent/30 bg-accent/10 hover:bg-accent/15 rounded-2xl p-4 transition-colors mt-2"
                    >
                      <div className="p-3 rounded-xl bg-accent/20 flex-shrink-0">
                        <Tag className="h-6 w-6 text-accent" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold">Browse Deals & Offers</p>
                        <p className="text-xs text-muted-foreground">
                          Exclusive discounts from our partners
                        </p>
                      </div>
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Affiliate links panel */}
      <AffiliateLinksPanel
        isOpen={showAffiliates}
        onClose={() => setShowAffiliates(false)}
        onReward={handleAffiliateReward}
      />
    </>
  )
}
