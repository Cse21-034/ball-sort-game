"use client"

import type { Level } from "@/lib/game-types"
import { Tube } from "./tube"
import { motion } from "framer-motion"

interface GameBoardProps {
  level: Level
  selectedTubeId: string | null
  hintedTubes: { from: string; to: string } | null
  onTubeClick: (tubeId: string) => void
  colorBlindMode?: boolean
}

export function GameBoard({ level, selectedTubeId, hintedTubes, onTubeClick, colorBlindMode }: GameBoardProps) {
  const tubes = level.tubes
  const tubesPerRow = tubes.length <= 6 ? tubes.length : Math.ceil(tubes.length / 2)

  const topRow = tubes.slice(0, tubesPerRow)
  const bottomRow = tubes.length > 6 ? tubes.slice(tubesPerRow) : []

  return (
    <motion.div
      className="flex flex-col items-center gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top row */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 flex-wrap">
        {topRow.map((tube) => (
          <Tube
            key={tube.id}
            tube={tube}
            isSelected={selectedTubeId === tube.id}
            isHinted={hintedTubes?.from === tube.id || hintedTubes?.to === tube.id}
            onClick={() => onTubeClick(tube.id)}
            colorBlindMode={colorBlindMode}
          />
        ))}
      </div>

      {/* Bottom row */}
      {bottomRow.length > 0 && (
        <div className="flex items-end justify-center gap-2 sm:gap-4 flex-wrap">
          {bottomRow.map((tube) => (
            <Tube
              key={tube.id}
              tube={tube}
              isSelected={selectedTubeId === tube.id}
              isHinted={hintedTubes?.from === tube.id || hintedTubes?.to === tube.id}
              onClick={() => onTubeClick(tube.id)}
              colorBlindMode={colorBlindMode}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
