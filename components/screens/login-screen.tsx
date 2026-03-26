"use client"

// ============================================================
// components/screens/login-screen.tsx
// Shown on first launch or when not authenticated
// ============================================================

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth/AuthContext"
import { Loader2 } from "lucide-react"

export function LoginScreen() {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Animated background balls */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-15"
            style={{
              width: Math.random() * 60 + 20,
              height: Math.random() * 60 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: [
                "#e94560","#4361ee","#2ec4b6",
                "#ffc947","#9b5de5","#ff6b35",
              ][Math.floor(Math.random() * 6)],
            }}
            animate={{ y: [0, -25, 0], scale: [1, 1.1, 1] }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="text-center mb-12 relative z-10"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          {["#e94560", "#4361ee", "#2ec4b6", "#ffc947"].map((color, i) => (
            <motion.div
              key={i}
              className="w-10 h-10 rounded-full shadow-lg"
              style={{ backgroundColor: color }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <h1 className="text-5xl font-bold text-foreground mb-2">Ball Sort</h1>
        <p className="text-muted-foreground">Puzzle Game</p>
      </motion.div>

      {/* Login card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl relative z-10"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Welcome!</h2>
        <p className="text-muted-foreground text-center text-sm mb-8">
          Sign in to save your progress across all your devices. Your coins,
          levels, and scores are always safe.
        </p>

        {/* Google sign-in button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-2xl border border-gray-200 shadow-sm transition-all active:scale-95 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          ) : (
            <GoogleIcon />
          )}
          <span>{loading ? "Signing in…" : "Continue with Google"}</span>
        </button>

        <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
          By signing in you agree to our terms. We only use your Google account
          to save your game progress — we never post on your behalf.
        </p>
      </motion.div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
