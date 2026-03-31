"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Play, LogIn, Zap, Trophy, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LandingPageProps {
  onPlayFree: () => void
  onSignIn: () => void
}

export function LandingPage({ onPlayFree, onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Animated background balls */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: Math.random() * 80 + 30,
              height: Math.random() * 80 + 30,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ["#e94560", "#4361ee", "#2ec4b6", "#ffc947", "#9b5de5", "#ff6b35"][
                Math.floor(Math.random() * 6)
              ],
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 30 - 15, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo with animated balls */}
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            {["#e94560", "#4361ee", "#2ec4b6", "#ffc947"].map((color, i) => (
              <motion.div
                key={i}
                className="w-14 h-14 rounded-full shadow-2xl"
                style={{ backgroundColor: color }}
                animate={{ y: [0, -15, 0] }}
                transition={{
                  duration: 0.7,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
          <h1 className="text-6xl font-bold text-foreground mb-3">Ball Sort Puzzle</h1>
          <p className="text-xl text-muted-foreground">500+ levels of satisfying fun</p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-12"
        >
          {[
            { icon: Trophy, label: "500+ Levels" },
            { icon: Zap, label: "Global Leaderboard" },
            { icon: Wifi, label: "Play Offline" },
          ].map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={i}
                className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 text-center"
              >
                <Icon className="h-6 w-6 text-accent mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">{feature.label}</p>
              </div>
            )
          })}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <Button
            onClick={onPlayFree}
            className="w-full py-6 text-lg font-semibold bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl"
          >
            <Play className="h-5 w-5 mr-2" />
            Play Free (No Signup)
          </Button>

          <Button
            onClick={onSignIn}
            variant="outline"
            className="w-full py-6 text-lg font-semibold border border-border rounded-2xl"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Sign In to Save Progress
          </Button>
        </motion.div>

        {/* Footer text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-4 mt-8"
        >
          <p className="text-center text-sm text-muted-foreground">
            Play first 3 levels for free without an account • No ads in guest mode
          </p>

          {/* Legal links */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-foreground transition-colors underline">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link href="/advertise" className="hover:text-blue-400 transition-colors underline">
              Advertise
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
