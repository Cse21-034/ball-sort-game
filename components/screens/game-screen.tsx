"use client"

// ============================================================
// components/screens/game-screen.tsx
// Key fixes:
//   1. Calls submitScore() when a level is won → leaderboard works
//   2. Starts background music on mount (after first interaction)
// ============================================================

import { useState, useEffect, useCallback } from "react"
import type { Level, MoveRecord, SaveData } from "@/lib/game-types"
import { GameBoard } from "@/components/game/game-board"
import { GameHeader } from "@/components/game/game-header"
import { WinModal } from "@/components/game/win-modal"
import { PauseModal } from "@/components/game/pause-modal"
import { canMoveBall, moveBalls, isLevelComplete, findHint } from "@/lib/game-logic"
import { generateLevel, getLevelDifficulty } from "@/lib/level-generator"
import { markLevelCompleteDB, useHintDB, useUndoDB } from "@/lib/save-system-db"
import { submitScore } from "@/lib/leaderboard"
import { audioManager } from "@/lib/audio-manager"
import type { Language } from "@/lib/localization"
import { motion } from "framer-motion"
import { getRandomAd } from "@/lib/ads-config"
import { GoogleAdInterstitial } from "@/components/ads/GoogleAdInterstitial"

interface GameScreenProps {
  levelId: number
  saveData: SaveData
  onSaveDataChange: (data: SaveData) => void
  onMainMenu: () => void
  onNextLevel: () => void
  language: Language
  isPremium?: boolean
}

export function GameScreen({
  levelId,
  saveData,
  onSaveDataChange,
  onMainMenu,
  onNextLevel,
  language,
  isPremium = false,
}: GameScreenProps) {
  const [level, setLevel] = useState<Level>(() =>
    generateLevel(levelId, getLevelDifficulty(levelId))
  )
  const [selectedTubeId, setSelectedTubeId] = useState<string | null>(null)
  const [moves, setMoves] = useState(0)
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([])
  const [startTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [hintedTubes, setHintedTubes] = useState<{ from: string; to: string } | null>(null)
  const [showingInterstitial, setShowingInterstitial] = useState(false)
  const [interstitialAd, setInterstitialAd] = useState<ReturnType<typeof getRandomAd>>(null)

  // Start music when entering game screen (user has already interacted)
  useEffect(() => {
    if (saveData.musicEnabled) {
      const t = setTimeout(() => {
        audioManager.startDefaultMusic()
      }, 300)
      return () => clearTimeout(t)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Timer
  useEffect(() => {
    if (isPaused || isComplete) return
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime, isPaused, isComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleTubeClick = useCallback(
    (tubeId: string) => {
      if (isComplete || isPaused) return
      setHintedTubes(null)

      if (selectedTubeId === null) {
        const tube = level.tubes.find((t) => t.id === tubeId)
        if (tube && tube.balls.length > 0) {
          setSelectedTubeId(tubeId)
          audioManager.playSound("click")
        }
      } else if (selectedTubeId === tubeId) {
        setSelectedTubeId(null)
        audioManager.playSound("click")
      } else {
        const fromTube = level.tubes.find((t) => t.id === selectedTubeId)
        const toTube = level.tubes.find((t) => t.id === tubeId)

        if (fromTube && toTube && canMoveBall(fromTube, toTube)) {
          const { newFromTube, newToTube, movedBalls } = moveBalls(fromTube, toTube)
          const newLevel = {
            ...level,
            tubes: level.tubes.map((t) => {
              if (t.id === selectedTubeId) return newFromTube
              if (t.id === tubeId) return newToTube
              return t
            }),
          }
          setLevel(newLevel)
          setMoves((m) => m + 1)
          setMoveHistory((h) => [
            ...h,
            { fromTubeId: selectedTubeId, toTubeId: tubeId, balls: movedBalls },
          ])
          audioManager.playSound("move")

          if (isLevelComplete(newLevel.tubes)) {
            setIsComplete(true)
            audioManager.playSound("win")

            const finalMoves = moves + 1
            const finalTime = elapsedTime

            // Save progress
            markLevelCompleteDB(levelId, finalMoves, finalTime).then(onSaveDataChange)

            // ✅ Submit to leaderboard — was missing before
            submitScore(levelId, finalMoves, finalTime).catch((err) =>
              console.warn("[Leaderboard] submit failed:", err)
            )
          }
        } else {
          audioManager.playSound("error")
        }
        setSelectedTubeId(null)
      }
    },
    [selectedTubeId, level, isComplete, isPaused, levelId, moves, elapsedTime, onSaveDataChange]
  )

  const handleUndo = useCallback(async () => {
    if (moveHistory.length === 0) return
    const newSaveData = await useUndoDB()
    if (!newSaveData) { audioManager.playSound("error"); return }

    const lastMove = moveHistory[moveHistory.length - 1]
    const newLevel = {
      ...level,
      tubes: level.tubes.map((t) => {
        if (t.id === lastMove.fromTubeId)
          return { ...t, balls: [...t.balls, ...lastMove.balls] }
        if (t.id === lastMove.toTubeId)
          return { ...t, balls: t.balls.slice(0, -lastMove.balls.length) }
        return t
      }),
    }
    setLevel(newLevel)
    setMoves((m) => m - 1)
    setMoveHistory((h) => h.slice(0, -1))
    onSaveDataChange(newSaveData)
    audioManager.playSound("click")
  }, [moveHistory, level, onSaveDataChange])

  const handleHint = useCallback(async () => {
    const hintResult = findHint(level.tubes)
    if (!hintResult) { audioManager.playSound("error"); return }

    const newSaveData = await useHintDB()
    if (!newSaveData) { audioManager.playSound("error"); return }
    onSaveDataChange(newSaveData)

    const { fromIndex, toIndex } = hintResult
    setHintedTubes({ from: level.tubes[fromIndex].id, to: level.tubes[toIndex].id })
    setTimeout(() => setHintedTubes(null), 3000)
  }, [level.tubes, onSaveDataChange])

  const handleRestart = useCallback(() => {
    setLevel(generateLevel(levelId, getLevelDifficulty(levelId)))
    setSelectedTubeId(null)
    setMoves(0)
    setMoveHistory([])
    setIsComplete(false)
    setIsPaused(false)
    setHintedTubes(null)
  }, [levelId])

  const handleNextLevelWithAd = useCallback(() => {
    // Skip ads for premium users
    if (isPremium) {
      onNextLevel()
      return
    }

    const shouldShowAd = levelId % 3 === 0
    const ad = shouldShowAd ? getRandomAd("between_levels") : null
    if (ad || (shouldShowAd && process.env.NEXT_PUBLIC_ADSENSE_CLIENT)) {
      // Show interstitial (video ad or Google display ad)
      setInterstitialAd(ad)
      setShowingInterstitial(true)
    } else {
      onNextLevel()
    }
  }, [levelId, onNextLevel, isPremium])

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col p-4">
        <GameHeader
          level={levelId}
          moves={moves}
          time={formatTime(elapsedTime)}
          coins={saveData.coins}
          hintsRemaining={saveData.hintsRemaining}
          undosRemaining={saveData.undosRemaining}
          onPause={() => setIsPaused(true)}
          onRestart={handleRestart}
          onHint={handleHint}
          onUndo={handleUndo}
          canUndo={moveHistory.length > 0 && saveData.undosRemaining > 0}
          language={language}
        />

        <motion.div
          className="flex-1 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <GameBoard
            level={level}
            selectedTubeId={selectedTubeId}
            hintedTubes={hintedTubes}
            onTubeClick={handleTubeClick}
            colorBlindMode={saveData.colorBlindMode}
          />
        </motion.div>

        <PauseModal
          isOpen={isPaused}
          onResume={() => setIsPaused(false)}
          onRestart={handleRestart}
          onQuit={onMainMenu}
          language={language}
        />

        <WinModal
          isOpen={isComplete}
          level={levelId}
          moves={moves}
          time={formatTime(elapsedTime)}
          onNextLevel={handleNextLevelWithAd}
          onMainMenu={onMainMenu}
          language={language}
        />
      </div>

      {/* Interstitial ad shown between levels */}
      <GoogleAdInterstitial
        isOpen={showingInterstitial}
        onComplete={() => {
          setShowingInterstitial(false)
          onNextLevel()
        }}
        ad={interstitialAd}
        levelId={levelId}
      />
    </>
  )
}
