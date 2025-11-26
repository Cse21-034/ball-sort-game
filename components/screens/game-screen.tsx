"use client"

import { useState, useEffect, useCallback } from "react"
import type { Level, MoveRecord, SaveData } from "@/lib/game-types"
import { GameBoard } from "@/components/game/game-board"
import { GameHeader } from "@/components/game/game-header"
import { WinModal } from "@/components/game/win-modal"
import { PauseModal } from "@/components/game/pause-modal"
import { canMoveBall, moveBalls, isLevelComplete, findHint } from "@/lib/game-logic"
import { generateLevel, getLevelDifficulty } from "@/lib/level-generator"
import { markLevelComplete, useHint, useUndo } from "@/lib/save-system"
import { audioManager } from "@/lib/audio-manager"
import type { Language } from "@/lib/localization"
import { motion } from "framer-motion"

interface GameScreenProps {
  levelId: number
  saveData: SaveData
  onSaveDataChange: (data: SaveData) => void
  onMainMenu: () => void
  onNextLevel: () => void
  language: Language
}

export function GameScreen({
  levelId,
  saveData,
  onSaveDataChange,
  onMainMenu,
  onNextLevel,
  language,
}: GameScreenProps) {
  const [level, setLevel] = useState<Level>(() => generateLevel(levelId, getLevelDifficulty(levelId)))
  const [selectedTubeId, setSelectedTubeId] = useState<string | null>(null)
  const [moves, setMoves] = useState(0)
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([])
  const [startTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [hintedTubes, setHintedTubes] = useState<{ from: string; to: string } | null>(null)
  const undo = useUndo()
  const hint = useHint()

  // Timer
  useEffect(() => {
    if (isPaused || isComplete) return

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, isPaused, isComplete])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Handle tube click
  const handleTubeClick = useCallback(
    (tubeId: string) => {
      if (isComplete || isPaused) return

      // Clear hint
      setHintedTubes(null)

      if (selectedTubeId === null) {
        // Select tube if it has balls
        const tube = level.tubes.find((t) => t.id === tubeId)
        if (tube && tube.balls.length > 0) {
          setSelectedTubeId(tubeId)
          audioManager.playSound("click")
        }
      } else if (selectedTubeId === tubeId) {
        // Deselect
        setSelectedTubeId(null)
        audioManager.playSound("click")
      } else {
        // Try to move
        const fromTube = level.tubes.find((t) => t.id === selectedTubeId)
        const toTube = level.tubes.find((t) => t.id === tubeId)

        if (fromTube && toTube && canMoveBall(fromTube, toTube)) {
          const { newFromTube, newToTube, movedBalls } = moveBalls(fromTube, toTube)

          // Update level
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
          setMoveHistory((h) => [...h, { fromTubeId: selectedTubeId, toTubeId: tubeId, balls: movedBalls }])
          audioManager.playSound("move")

          // Check win
          if (isLevelComplete(newLevel.tubes)) {
            setIsComplete(true)
            audioManager.playSound("win")
            const newSaveData = markLevelComplete(levelId, moves + 1, elapsedTime)
            onSaveDataChange(newSaveData)
          }
        } else {
          audioManager.playSound("error")
        }

        setSelectedTubeId(null)
      }
    },
    [selectedTubeId, level, isComplete, isPaused, levelId, moves, elapsedTime, onSaveDataChange],
  )

  // Handle undo
  const handleUndo = useCallback(() => {
    if (moveHistory.length === 0) return

    const newSaveData = undo()
    if (!newSaveData) {
      audioManager.playSound("error")
      return
    }

    const lastMove = moveHistory[moveHistory.length - 1]

    // Reverse the move
    const newLevel = {
      ...level,
      tubes: level.tubes.map((t) => {
        if (t.id === lastMove.fromTubeId) {
          return { ...t, balls: [...t.balls, ...lastMove.balls] }
        }
        if (t.id === lastMove.toTubeId) {
          return { ...t, balls: t.balls.slice(0, -lastMove.balls.length) }
        }
        return t
      }),
    }

    setLevel(newLevel)
    setMoves((m) => m - 1)
    setMoveHistory((h) => h.slice(0, -1))
    onSaveDataChange(newSaveData)
    audioManager.playSound("click")
  }, [moveHistory, level, onSaveDataChange, undo])

  // Handle hint
  const handleHint = useCallback(() => {
    const hintResult = findHint(level.tubes)
    if (!hintResult) {
      audioManager.playSound("error")
      return
    }

    const { fromIndex, toIndex } = hintResult
    const fromTube = level.tubes[fromIndex]
    const toTube = level.tubes[toIndex]
    setHintedTubes({ from: fromTube.id, to: toTube.id })

    // Clear hint after 3 seconds
    setTimeout(() => setHintedTubes(null), 3000)
  }, [level.tubes])

  // Handle restart
  const handleRestart = useCallback(() => {
    setLevel(generateLevel(levelId, getLevelDifficulty(levelId)))
    setSelectedTubeId(null)
    setMoves(0)
    setMoveHistory([])
    setIsComplete(false)
    setIsPaused(false)
    setHintedTubes(null)
  }, [levelId])

  return (
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

      <motion.div className="flex-1 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
        onNextLevel={onNextLevel}
        onMainMenu={onMainMenu}
        language={language}
      />
    </div>
  )
}
