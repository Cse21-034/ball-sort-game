"use client"

import { type Ball as BallType, BALL_COLOR_MAP, BALL_COLOR_BLIND_MAP } from "@/lib/game-types"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface BallProps {
  ball: BallType
  isSelected?: boolean
  isAnimating?: boolean
  colorBlindMode?: boolean
  index?: number
}

export function Ball({ ball, isSelected, isAnimating, colorBlindMode, index = 0 }: BallProps) {
  const colorClass = colorBlindMode ? BALL_COLOR_BLIND_MAP[ball.color] : BALL_COLOR_MAP[ball.color]

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{
        scale: 1,
        y: isSelected ? -8 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        delay: index * 0.05,
      }}
      className={cn(
        "w-10 h-10 sm:w-11 sm:h-11 rounded-full",
        "flex items-center justify-center relative",
        colorClass,
        isSelected && "ring-4 ring-white/80",
        colorBlindMode && "after:text-white after:text-xs after:font-bold",
      )}
      style={{
        boxShadow: isSelected
          ? "0 0 20px rgba(255,255,255,0.5), 0 8px 25px rgba(0,0,0,0.4), inset 0 -3px 6px rgba(0,0,0,0.2), inset 0 3px 6px rgba(255,255,255,0.4)"
          : "0 4px 15px rgba(0,0,0,0.3), inset 0 -3px 6px rgba(0,0,0,0.2), inset 0 3px 6px rgba(255,255,255,0.4)",
      }}
    >
      {/* Highlight shine effect */}
      <div className="absolute top-1 left-1.5 w-3 h-3 rounded-full bg-white/50 blur-[2px]" />
      <div className="absolute top-2 left-3 w-1.5 h-1.5 rounded-full bg-white/80" />
    </motion.div>
  )
}
