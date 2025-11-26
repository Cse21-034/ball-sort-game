"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Play, Settings, ShoppingBag, Trophy } from "lucide-react"
import { t, type Language } from "@/lib/localization"

interface MainMenuProps {
  onPlay: () => void
  onSettings: () => void
  onShop: () => void
  onLeaderboard: () => void
  coins: number
  language: Language
}

export function MainMenu({ onPlay, onSettings, onShop, onLeaderboard, coins, language }: MainMenuProps) {
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

      {/* Coins display */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="bg-accent/20 px-6 py-3 rounded-full mb-8 relative z-10"
      >
        <span className="text-accent font-bold text-xl">
          {coins} {t("coins", language)}
        </span>
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
          className="w-full h-14 text-lg border-border bg-secondary/50 hover:bg-secondary rounded-2xl"
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
    </div>
  )
}
