"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Play, Settings, ShoppingBag, Trophy, Crown } from "lucide-react"
import { t, type Language } from "@/lib/localization"
import { useAuth } from "@/lib/auth/AuthContext"
import { GoogleAdBanner } from "@/components/ads/GoogleAdBanner"
import Image from "next/image"

interface MainMenuProps {
  onPlay: () => void
  onSettings: () => void
  onShop: () => void
  onLeaderboard: () => void
  coins: number
  language: Language
  isPremium?: boolean
  isGuest?: boolean
}

export function MainMenu({
  onPlay,
  onSettings,
  onShop,
  onLeaderboard,
  coins,
  language,
  isPremium = false,
  isGuest = false,
}: MainMenuProps) {
  const { googleName, googleAvatar } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      {/* Animated background balls */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: Math.random() * 60 + 20,
              height: Math.random() * 60 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ["#e94560", "#4361ee", "#2ec4b6", "#ffc947", "#9b5de5", "#ff6b35"][
                Math.floor(Math.random() * 6)
              ],
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Google profile badge with premium indicator (top-right corner) */}
      {(googleName || googleAvatar) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 flex items-center gap-3 bg-card/80 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 z-10"
        >
          {isPremium && (
            <span className="text-lg" title="Premium member">👑</span>
          )}
          {googleAvatar ? (
            <img
              src={googleAvatar}
              alt={googleName ?? ""}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">
                {googleName?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
          )}
          <span className="text-xs font-medium text-foreground/80 max-w-[120px] truncate">
            {googleName}
          </span>
        </motion.div>
      )}

      {/* Logo */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
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
              transition={{
                duration: 0.6,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
        <h1 className="text-5xl font-bold text-foreground mb-2">Ball Sort</h1>
        <p className="text-muted-foreground">Puzzle Game</p>
      </motion.div>

      {/* Greeting + coins */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex flex-col items-center gap-2 mb-8 relative z-10"
      >
        {googleName && (
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{googleName.split(" ")[0]}</span>!
          </p>
        )}
        <div className="bg-accent/20 px-6 py-3 rounded-full">
          <span className="text-accent font-bold text-xl">
            {coins} {t("coins", language)}
          </span>
        </div>
      </motion.div>

      {/* Menu buttons */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-4 w-full max-w-xs relative z-10"
      >
        <Button
          size="lg"
          onClick={onPlay}
          className="w-full h-16 text-xl bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl"
        >
          <Play className="mr-3 h-6 w-6" />
          {t("play", language)}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={onShop}
          className="w-full h-14 text-lg border-border bg-secondary/50 hover:bg-secondary rounded-2xl"
        >
          <ShoppingBag className="mr-3 h-5 w-5" />
          {t("shop", language)}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={onLeaderboard}
          disabled={isGuest}
          className="w-full h-14 text-lg border-border bg-secondary/50 hover:bg-secondary rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          title={isGuest ? "Sign in to view leaderboard" : ""}
        >
          <Trophy className="mr-3 h-5 w-5" />
          Leaderboard
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={onSettings}
          className="w-full h-14 text-lg border-border bg-secondary/50 hover:bg-secondary rounded-2xl"
        >
          <Settings className="mr-3 h-5 w-5" />
          {t("settings", language)}
        </Button>
      </motion.div>

      {/* Google AdSense banner — hidden for premium users or guests */}
      {!isPremium && !isGuest && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-xs mt-8 relative z-10"
        >
          <GoogleAdBanner
            slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER || "0000000000"}
            format="auto"
            className="w-full"
          />
        </motion.div>
      )}
    </div>
  )
}
