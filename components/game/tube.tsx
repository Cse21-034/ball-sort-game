"use client"

import type { Tube as TubeType } from "@/lib/game-types"
import { Ball } from "./ball"
import { TubeCelebration } from "./tube-celebration"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { isTubeComplete } from "@/lib/game-logic"
import { useState, useEffect } from "react"

interface TubeProps {
  tube: TubeType
  isSelected?: boolean
  isHinted?: boolean
  onClick?: () => void
  colorBlindMode?: boolean
}

export function Tube({ tube, isSelected, isHinted, onClick, colorBlindMode }: TubeProps) {
  const isComplete = isTubeComplete(tube) && tube.balls.length === tube.capacity
  const [wasComplete, setWasComplete] = useState(false)
  const [celebrationKey, setCelebrationKey] = useState(0)

  useEffect(() => {
    if (isComplete && !wasComplete) {
      setCelebrationKey((prev) => prev + 1)
    }
    setWasComplete(isComplete)
  }, [isComplete, wasComplete])

  const tubeHeight = tube.capacity * 48 + (tube.capacity - 1) * 4 + 16

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn("relative flex flex-col items-center", "w-14 sm:w-16", "transition-all duration-200")}
    >
      {/* Tube celebration effect */}
      <TubeCelebration isComplete={isComplete} tubeId={`${tube.id}-${celebrationKey}`} />

      <div
        className={cn(
          "relative flex flex-col items-center justify-end",
          "w-full",
          "rounded-b-[28px] rounded-t-lg",
          "p-1.5 pb-2",
          "overflow-hidden",
          // Selection states
          isSelected && "ring-2 ring-accent ring-offset-2 ring-offset-background",
          isHinted && "ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse",
          isComplete && "ring-2 ring-green-400 ring-offset-2 ring-offset-background",
        )}
        style={{
          height: tubeHeight,
          background: `
            linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%),
            linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%),
            linear-gradient(180deg, 
              rgba(255,255,255,0.2) 0%, 
              rgba(255,255,255,0.05) 20%, 
              rgba(255,255,255,0.02) 50%, 
              rgba(255,255,255,0.08) 80%, 
              rgba(255,255,255,0.15) 100%
            )
          `,
          backdropFilter: "blur(8px)",
          border: isComplete
            ? "2px solid rgba(74, 222, 128, 0.5)"
            : isSelected
              ? "2px solid rgba(255, 201, 71, 0.5)"
              : "2px solid rgba(255,255,255,0.2)",
          boxShadow: isComplete
            ? "inset 0 0 30px rgba(74, 222, 128, 0.15), 0 8px 32px rgba(0,0,0,0.3), inset -2px 0 8px rgba(255,255,255,0.1), inset 2px 0 8px rgba(0,0,0,0.1)"
            : isSelected
              ? "inset 0 0 30px rgba(255, 201, 71, 0.15), 0 8px 32px rgba(0,0,0,0.3), inset -2px 0 8px rgba(255,255,255,0.1), inset 2px 0 8px rgba(0,0,0,0.1)"
              : "inset 0 0 20px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.3), inset -2px 0 8px rgba(255,255,255,0.1), inset 2px 0 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Left edge glass highlight */}
        <div
          className="absolute left-0.5 top-3 bottom-6 w-1.5 rounded-full pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.3) 100%)",
          }}
        />

        {/* Right edge subtle shadow */}
        <div
          className="absolute right-0.5 top-4 bottom-8 w-1 rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 100%)",
          }}
        />

        {/* Ripple/wave effect overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-b-[26px] rounded-t-md"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.03) 10px,
                rgba(255,255,255,0.03) 11px
              )
            `,
          }}
        />

        {/* Balls container - justify-end makes balls stack from bottom */}
        <div className="flex flex-col-reverse items-center gap-1 w-full relative z-[1]">
          {tube.balls.map((ball, index) => (
            <Ball
              key={ball.id}
              ball={ball}
              isSelected={isSelected && index === tube.balls.length - 1}
              colorBlindMode={colorBlindMode}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Complete checkmark indicator */}
      {isComplete && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 rounded-full w-7 h-7 flex items-center justify-center shadow-lg z-20"
        >
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  )
}
