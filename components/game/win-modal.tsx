"use client"

import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Home, ArrowRight, Star } from "lucide-react"
import { t, type Language } from "@/lib/localization"
import Confetti from "react-confetti"
import { useEffect, useState } from "react"

interface WinModalProps {
  isOpen: boolean
  level: number
  moves: number
  time: string
  onNextLevel: () => void
  onMainMenu: () => void
  language: Language
}

export function WinModal({ isOpen, level, moves, time, onNextLevel, onMainMenu, language }: WinModalProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  const stars = moves <= 10 ? 3 : moves <= 20 ? 2 : 1

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-border"
            >
              <motion.div initial={{ y: -20 }} animate={{ y: 0 }} transition={{ type: "spring", bounce: 0.5 }}>
                <Trophy className="h-20 w-20 mx-auto text-accent mb-4" />
              </motion.div>

              <h2 className="text-3xl font-bold mb-2 text-foreground">{t("congratulations", language)}</h2>
              <p className="text-muted-foreground mb-6">{t("levelComplete", language)}</p>

              {/* Stars */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3].map((star) => (
                  <motion.div
                    key={star}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: star <= stars ? 1 : 0.5, rotate: 0 }}
                    transition={{ delay: star * 0.2, type: "spring" }}
                  >
                    <Star
                      className={`h-10 w-10 ${star <= stars ? "text-accent fill-accent" : "text-muted-foreground"}`}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex justify-center gap-8 mb-8">
                <div>
                  <p className="text-sm text-muted-foreground">{t("level", language)}</p>
                  <p className="text-2xl font-bold">{level}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("moves", language)}</p>
                  <p className="text-2xl font-bold">{moves}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("time", language)}</p>
                  <p className="text-2xl font-bold">{time}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  onClick={onNextLevel}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {t("nextLevel", language)}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={onMainMenu}
                  className="w-full border-border bg-transparent"
                >
                  <Home className="mr-2 h-5 w-5" />
                  {t("mainMenu", language)}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
