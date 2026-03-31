"use client"

// ============================================================
// components/screens/save-progress-modal.tsx
// Shown as overlay when guest tries to progress past level 3
// ============================================================

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth/AuthContext"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight, Lock } from "lucide-react"

interface SaveProgressModalProps {
  isOpen: boolean
  onClose: () => void
  onSignInComplete: () => void
}

export function SaveProgressModal({
  isOpen,
  onClose,
  onSignInComplete,
}: SaveProgressModalProps) {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      setTimeout(() => onSignInComplete(), 500)
    } catch {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl"
      >
        {/* Lock icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-accent/20 border border-accent/40 rounded-full p-4">
            <Lock className="h-8 w-8 text-accent" />
          </div>
        </div>

        {/* Title and description */}
        <h2 className="text-2xl font-bold text-center mb-2">Save Your Progress</h2>
        <p className="text-muted-foreground text-center text-sm mb-8">
          You've completed the free levels! Sign in to unlock 500+ more challenging levels
          and save your progress.
        </p>

        {/* Benefits list */}
        <div className="bg-secondary/30 rounded-2xl p-4 mb-8 space-y-3">
          {[
            "✓ Save progress on all devices",
            "✓ Unlock 500+ levels",
            "✓ Compete on leaderboards",
            "✓ Earn coins and rewards",
          ].map((benefit, i) => (
            <p key={i} className="text-sm text-foreground flex items-center gap-2">
              {benefit}
            </p>
          ))}
        </div>

        {/* Google sign-in button */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-4 mb-3 font-semibold bg-white text-gray-800 hover:bg-gray-100 rounded-2xl flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <GoogleIcon />
              Sign in with Google
            </>
          )}
        </Button>

        {/* Maybe Later button */}
        <Button
          onClick={onClose}
          disabled={loading}
          variant="ghost"
          className="w-full py-4 text-foreground hover:bg-secondary/50 rounded-2xl"
        >
          Maybe Later
        </Button>

        {/* Footer text */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Free account • No credit card required
        </p>
      </motion.div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
