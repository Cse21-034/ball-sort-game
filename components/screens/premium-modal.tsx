"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Crown, Zap, Undo2, Lightbulb, Sparkles, Heart } from "lucide-react"
import { useState } from "react"
import { PayPalPaymentModal } from "@/components/ads/PayPalPaymentModal"

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
  onPurchase: () => Promise<void>
  isPremium: boolean
}

export function PremiumModal({ isOpen, onClose, onPurchase, isPremium }: PremiumModalProps) {
  const [showPayment, setShowPayment] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="bg-card border border-accent/50 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Crown icon */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mb-6"
          >
            <Crown className="h-12 w-12 text-accent" />
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-2">Go Premium</h2>
          <p className="text-muted-foreground text-center text-sm mb-8">
            Remove ads forever and unlock exclusive features
          </p>

          {/* Benefits list */}
          <div className="space-y-3 mb-8">
            {[
              { icon: Zap, text: "Remove all ads forever" },
              { icon: Lightbulb, text: "Unlimited hints" },
              { icon: Undo2, text: "Unlimited undos" },
              { icon: Sparkles, text: "Exclusive gold tube skin" },
              { icon: Heart, text: "Support the developer ❤️" },
            ].map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <Icon className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm text-foreground">{benefit.text}</span>
                </motion.div>
              )
            })}
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/20 border border-destructive rounded-xl p-3 mb-4"
            >
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}

          {/* Price and CTA buttons */}
          <div className="space-y-3">
            {isPremium ? (
              <div className="bg-accent/20 border border-accent rounded-2xl p-4 text-center">
                <p className="text-lg font-semibold text-accent">✓ Premium Active</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold text-foreground">$2.99</p>
                  <p className="text-sm text-muted-foreground">One-time purchase</p>
                </div>

                <Button
                  onClick={() => setShowPayment(true)}
                  className="w-full py-4 font-semibold bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl"
                >
                  Get Premium
                </Button>

                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full py-4 text-foreground hover:bg-secondary/50 rounded-2xl"
                >
                  Maybe Later
                </Button>
              </>
            )}
          </div>

          {/* Footer text */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            {isPremium
              ? "Thanks for supporting the game!"
              : "💳 PayPal, Visa, Mastercard • Secure payment"}
          </p>
        </motion.div>
      </div>

      {/* PayPal Payment Modal */}
      <PayPalPaymentModal
        isOpen={showPayment}
        onClose={() => {
          setShowPayment(false)
          setError(null)
        }}
        onSuccess={async () => {
          try {
            await onPurchase()
            onClose()
            setError(null)
          } catch (err) {
            const error = err as Error
            setError(error.message || "Failed to activate premium")
            setShowPayment(false)
          }
        }}
        onError={(errorMsg) => {
          setError(errorMsg)
        }}
      />
    </>
  )
}
