"use client"

import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Home, RotateCcw } from "lucide-react"
import { t, type Language } from "@/lib/localization"

interface PauseModalProps {
  isOpen: boolean
  onResume: () => void
  onRestart: () => void
  onQuit: () => void
  language: Language
}

export function PauseModal({ isOpen, onResume, onRestart, onQuit, language }: PauseModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
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
            <h2 className="text-3xl font-bold mb-8 text-foreground">{t("pause", language)}</h2>

            <div className="flex flex-col gap-4">
              <Button
                size="lg"
                onClick={onResume}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Play className="mr-2 h-5 w-5" />
                {t("resume", language)}
              </Button>

              <Button variant="outline" size="lg" onClick={onRestart} className="w-full border-border bg-transparent">
                <RotateCcw className="mr-2 h-5 w-5" />
                {t("restart", language)}
              </Button>

              <Button variant="outline" size="lg" onClick={onQuit} className="w-full border-border bg-transparent">
                <Home className="mr-2 h-5 w-5" />
                {t("quit", language)}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
