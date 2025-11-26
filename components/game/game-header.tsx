"use client"

import { Button } from "@/components/ui/button"
import { Pause, RotateCcw, Lightbulb, Undo2, Coins } from "lucide-react"
import { t, type Language } from "@/lib/localization"

interface GameHeaderProps {
  level: number
  moves: number
  time: string
  coins: number
  hintsRemaining: number
  undosRemaining: number
  onPause: () => void
  onRestart: () => void
  onHint: () => void
  onUndo: () => void
  canUndo: boolean
  language: Language
}

export function GameHeader({
  level,
  moves,
  time,
  coins,
  hintsRemaining,
  undosRemaining,
  onPause,
  onRestart,
  onHint,
  onUndo,
  canUndo,
  language,
}: GameHeaderProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={onPause} className="text-foreground hover:bg-muted">
          <Pause className="h-6 w-6" />
        </Button>

        <div className="flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full">
          <Coins className="h-5 w-5 text-accent" />
          <span className="font-bold text-accent">{coins}</span>
        </div>
      </div>

      {/* Level info */}
      <div className="flex items-center justify-center gap-8 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t("level", language)}</p>
          <p className="text-2xl font-bold">{level}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t("moves", language)}</p>
          <p className="text-2xl font-bold">{moves}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t("time", language)}</p>
          <p className="text-2xl font-bold">{time}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={onRestart}
          className="bg-secondary hover:bg-secondary/80 border-border"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={onUndo}
          disabled={!canUndo}
          className="bg-secondary hover:bg-secondary/80 border-border relative"
        >
          <Undo2 className="h-5 w-5" />
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {undosRemaining}
          </span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={onHint}
          className="bg-secondary hover:bg-secondary/80 border-border relative"
        >
          <Lightbulb className="h-5 w-5" />
          <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {hintsRemaining}
          </span>
        </Button>
      </div>
    </div>
  )
}
