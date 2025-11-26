"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Coins, Lightbulb, Undo2, Loader2, X, Gift } from "lucide-react"
import { adManager, type AdReward } from "@/lib/ad-manager"

interface AdRewardModalProps {
  isOpen: boolean
  onClose: () => void
  onReward: (reward: AdReward) => void
}

export function AdRewardModal({ isOpen, onClose, onReward }: AdRewardModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedReward, setSelectedReward] = useState<"coins" | "hint" | "undo" | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [showingAd, setShowingAd] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const remaining = adManager.getCooldownRemaining()
      setCooldown(remaining)

      if (remaining > 0) {
        const interval = setInterval(() => {
          const r = adManager.getCooldownRemaining()
          setCooldown(r)
          if (r <= 0) clearInterval(interval)
        }, 1000)
        return () => clearInterval(interval)
      }
    }
  }, [isOpen])

  const handleWatchAd = async (type: "coins" | "hint" | "undo") => {
    if (!adManager.isReady()) return

    setSelectedReward(type)
    setLoading(true)
    setShowingAd(true)

    const reward = await adManager.showRewardedAd(type)

    setShowingAd(false)
    setLoading(false)

    if (reward) {
      onReward(reward)
      onClose()
    }
  }

  const rewards = [
    {
      type: "coins" as const,
      icon: Coins,
      label: "+25 Coins",
      description: "Free coins to spend",
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/20",
    },
    {
      type: "hint" as const,
      icon: Lightbulb,
      label: "+1 Hint",
      description: "Get a helpful hint",
      color: "text-accent",
      bgColor: "bg-accent/20",
    },
    {
      type: "undo" as const,
      icon: Undo2,
      label: "+3 Undos",
      description: "Undo your moves",
      color: "text-primary",
      bgColor: "bg-primary/20",
    },
  ]

  return (
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {showingAd ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
                <p className="text-lg font-semibold">Watching Ad...</p>
                <p className="text-sm text-muted-foreground mt-2">Please wait while the ad plays</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Gift className="h-6 w-6 text-accent" />
                    <h2 className="text-xl font-bold">Free Rewards</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {cooldown > 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-2">Next ad available in</p>
                    <p className="text-3xl font-bold text-primary">{cooldown}s</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Watch a short ad to get free rewards!
                    </p>
                    {rewards.map((reward) => (
                      <Button
                        key={reward.type}
                        variant="outline"
                        className="w-full h-auto py-4 justify-start gap-4 border-border bg-transparent"
                        onClick={() => handleWatchAd(reward.type)}
                        disabled={loading}
                      >
                        <div className={`p-3 rounded-xl ${reward.bgColor}`}>
                          <reward.icon className={`h-6 w-6 ${reward.color}`} />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-semibold">{reward.label}</p>
                          <p className="text-xs text-muted-foreground">{reward.description}</p>
                        </div>
                        <Play className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
