"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowLeft, Lock, Star } from "lucide-react"
import { t, type Language } from "@/lib/localization"
import { getLevelDifficulty } from "@/lib/level-generator"
import { cn } from "@/lib/utils"

interface LevelSelectProps {
  completedLevels: number[]
  highScores: Record<number, { moves: number; time: number }>
  onSelectLevel: (level: number) => void
  onBack: () => void
  language: Language
  maxLevel?: number // For guest mode — limits selectable levels to 1-3
}

export function LevelSelect({ completedLevels, highScores, onSelectLevel, onBack, language, maxLevel }: LevelSelectProps) {
  const levels = Array.from({ length: maxLevel ?? 100 }, (_, i) => i + 1)

  const difficultyColors: Record<string, string> = {
    beginner: "bg-green-500/20 border-green-500",
    easy: "bg-blue-500/20 border-blue-500",
    medium: "bg-yellow-500/20 border-yellow-500",
    hard: "bg-orange-500/20 border-orange-500",
    expert: "bg-red-500/20 border-red-500",
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">{t("select", language)}</h1>
      </div>

      {/* Difficulty legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["beginner", "easy", "medium", "hard", "expert"].map((diff) => (
          <div key={diff} className={cn("px-3 py-1 rounded-full text-sm border", difficultyColors[diff])}>
            {t(diff, language)}
          </div>
        ))}
      </div>

      {/* Level grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2"
      >
        {levels.map((level) => {
          const isCompleted = completedLevels.includes(level)
          const isUnlocked = level === 1 || completedLevels.includes(level - 1) || isCompleted
          const difficulty = getLevelDifficulty(level)
          const score = highScores[level]
          const stars = score ? (score.moves <= 10 ? 3 : score.moves <= 20 ? 2 : 1) : 0

          return (
            <motion.button
              key={level}
              whileHover={{ scale: isUnlocked ? 1.1 : 1 }}
              whileTap={{ scale: isUnlocked ? 0.95 : 1 }}
              onClick={() => isUnlocked && onSelectLevel(level)}
              disabled={!isUnlocked}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center",
                "border-2 transition-all relative",
                isUnlocked ? difficultyColors[difficulty] : "bg-muted/30 border-muted",
                isCompleted && "ring-2 ring-accent",
                !isUnlocked && "opacity-50 cursor-not-allowed",
              )}
            >
              {isUnlocked ? (
                <>
                  <span className="font-bold text-lg">{level}</span>
                  {isCompleted && (
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={cn("h-2 w-2", s <= stars ? "text-accent fill-accent" : "text-muted-foreground")}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground" />
              )}
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
