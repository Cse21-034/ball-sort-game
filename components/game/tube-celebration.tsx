"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface TubeCelebrationProps {
  isComplete: boolean
  tubeId: string
}

export function TubeCelebration({ isComplete, tubeId }: TubeCelebrationProps) {
  const [showCelebration, setShowCelebration] = useState(false)
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; rotation: number; scale: number; color: string }>
  >([])

  useEffect(() => {
    if (isComplete) {
      setShowCelebration(true)

      // Generate star particles
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 100,
        y: -Math.random() * 80 - 20,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        color: ["#ffd700", "#ff6b6b", "#4ecdc4", "#fff", "#ff9ff3"][Math.floor(Math.random() * 5)],
      }))
      setParticles(newParticles)

      // Play celebration sound
      try {
        const audioContext = new (
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        )()

        // Play ascending notes for celebration
        const notes = [523, 659, 784, 1047] // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          oscillator.frequency.value = freq
          oscillator.type = "sine"
          gainNode.gain.value = 0.15
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3 + i * 0.1)
          oscillator.start(audioContext.currentTime + i * 0.1)
          oscillator.stop(audioContext.currentTime + 0.4 + i * 0.1)
        })
      } catch {
        // Audio not supported
      }

      const timer = setTimeout(() => setShowCelebration(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isComplete, tubeId])

  return (
    <AnimatePresence>
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-visible z-10">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: particle.scale,
                opacity: 0,
                rotate: particle.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1,
                ease: "easeOut",
              }}
              className="absolute left-1/2 top-0"
              style={{ color: particle.color }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
