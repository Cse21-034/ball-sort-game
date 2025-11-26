"use client"

import { useState, useEffect, useCallback } from "react"
import { MainMenu } from "@/components/screens/main-menu"
import { LevelSelect } from "@/components/screens/level-select"
import { GameScreen } from "@/components/screens/game-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"
import { ShopScreen } from "@/components/screens/shop-screen"
import type { SaveData } from "@/lib/game-types"
import { loadSaveData, updateSettings, addCoins, buyHints, buyUndos } from "@/lib/save-system"
import { audioManager } from "@/lib/audio-manager"
import type { Language } from "@/lib/localization"
import { AnimatePresence, motion } from "framer-motion"

type Screen = "menu" | "levels" | "game" | "settings" | "shop" | "leaderboard"

export default function BallSortGame() {
  const [screen, setScreen] = useState<Screen>("menu")
  const [saveData, setSaveData] = useState<SaveData | null>(null)
  const [currentLevel, setCurrentLevel] = useState(1)

  // Load save data on mount
  useEffect(() => {
    const data = loadSaveData()
    setSaveData(data)
    audioManager.init()
    audioManager.setSoundEnabled(data.soundEnabled)
    audioManager.setMusicEnabled(data.musicEnabled)
  }, [])

  // Handle settings changes
  const handleSoundChange = useCallback((enabled: boolean) => {
    const newData = updateSettings({ soundEnabled: enabled })
    setSaveData(newData)
    audioManager.setSoundEnabled(enabled)
  }, [])

  const handleMusicChange = useCallback((enabled: boolean) => {
    const newData = updateSettings({ musicEnabled: enabled })
    setSaveData(newData)
    audioManager.setMusicEnabled(enabled)
  }, [])

  const handleColorBlindChange = useCallback((enabled: boolean) => {
    const newData = updateSettings({ colorBlindMode: enabled })
    setSaveData(newData)
  }, [])

  const handleLanguageChange = useCallback((lang: Language) => {
    const newData = updateSettings({ language: lang })
    setSaveData(newData)
  }, [])

  // Handle shop actions
  const handleWatchAd = useCallback(() => {
    // Simulate watching an ad
    setTimeout(() => {
      const newData = addCoins(10)
      setSaveData(newData)
      audioManager.playSound("complete")
    }, 500)
  }, [])

  const handleBuyHints = useCallback((count: number) => {
    const newData = buyHints(count)
    if (newData) {
      setSaveData(newData)
      audioManager.playSound("complete")
    } else {
      audioManager.playSound("error")
    }
  }, [])

  const handleBuyUndos = useCallback((count: number) => {
    const newData = buyUndos(count)
    if (newData) {
      setSaveData(newData)
      audioManager.playSound("complete")
    } else {
      audioManager.playSound("error")
    }
  }, [])

  // Handle level selection
  const handleSelectLevel = useCallback((level: number) => {
    setCurrentLevel(level)
    setScreen("game")
  }, [])

  // Handle next level
  const handleNextLevel = useCallback(() => {
    setCurrentLevel((prev) => prev + 1)
  }, [])

  if (!saveData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    )
  }

  const language = saveData.language as Language

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {screen === "menu" && (
          <MainMenu
            onPlay={() => setScreen("levels")}
            onSettings={() => setScreen("settings")}
            onShop={() => setScreen("shop")}
            onLeaderboard={() => setScreen("leaderboard")}
            coins={saveData.coins}
            language={language}
          />
        )}

        {screen === "levels" && (
          <LevelSelect
            completedLevels={saveData.completedLevels}
            highScores={saveData.highScores}
            onSelectLevel={handleSelectLevel}
            onBack={() => setScreen("menu")}
            language={language}
          />
        )}

        {screen === "game" && (
          <GameScreen
            key={currentLevel}
            levelId={currentLevel}
            saveData={saveData}
            onSaveDataChange={setSaveData}
            onMainMenu={() => setScreen("menu")}
            onNextLevel={handleNextLevel}
            language={language}
          />
        )}

        {screen === "settings" && (
          <SettingsScreen
            soundEnabled={saveData.soundEnabled}
            musicEnabled={saveData.musicEnabled}
            colorBlindMode={saveData.colorBlindMode}
            language={language}
            onSoundChange={handleSoundChange}
            onMusicChange={handleMusicChange}
            onColorBlindChange={handleColorBlindChange}
            onLanguageChange={handleLanguageChange}
            onBack={() => setScreen("menu")}
          />
        )}

        {screen === "shop" && (
          <ShopScreen
            coins={saveData.coins}
            hintsRemaining={saveData.hintsRemaining}
            undosRemaining={saveData.undosRemaining}
            onBuyHints={handleBuyHints}
            onBuyUndos={handleBuyUndos}
            onWatchAd={handleWatchAd}
            onBack={() => setScreen("menu")}
            language={language}
          />
        )}

        {screen === "leaderboard" && (
          <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
            <p className="text-muted-foreground mb-8">Coming soon! Connect with Google Play or Game Center.</p>
            <button
              onClick={() => setScreen("menu")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl"
            >
              Back to Menu
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
