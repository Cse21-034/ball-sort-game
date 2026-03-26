"use client"

// app/page.tsx — wired to Google Auth + Supabase persistence

import { useState, useEffect, useCallback } from "react"
import { MainMenu } from "@/components/screens/main-menu"
import { LevelSelect } from "@/components/screens/level-select"
import { GameScreen } from "@/components/screens/game-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"
import { ShopScreen } from "@/components/screens/shop-screen"
import { LeaderboardScreen } from "@/components/screens/leaderboard-screen"
import { LoginScreen } from "@/components/screens/login-screen"
import { AdRewardModal } from "@/components/ads/AdRewardModal"
import { useAuth } from "@/lib/auth/AuthContext"
import {
  loadSaveDataFromDB,
  updateSettingsDB,
  addCoinsDB,
  buyHintsDB,
  buyUndosDB,
  addHintsDB,
  addUndosDB,
} from "@/lib/save-system-db"
import type { SaveData } from "@/lib/game-types"
import { audioManager } from "@/lib/audio-manager"
import type { Language } from "@/lib/localization"
import { AnimatePresence, motion } from "framer-motion"
import type { AdReward } from "@/lib/ad-manager"
import { Loader2 } from "lucide-react"

type Screen = "menu" | "levels" | "game" | "settings" | "shop" | "leaderboard"

export default function BallSortGame() {
  const { user, loading: authLoading } = useAuth()
  const [screen, setScreen] = useState<Screen>("menu")
  const [saveData, setSaveData] = useState<SaveData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [showAdModal, setShowAdModal] = useState(false)

  // Load save data once authenticated
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setDataLoading(false)
      return
    }

    setDataLoading(true)
    loadSaveDataFromDB().then((data) => {
      setSaveData(data)
      audioManager.init()
      audioManager.setSoundEnabled(data.soundEnabled)
      audioManager.setMusicEnabled(data.musicEnabled)
      setDataLoading(false)
    })
  }, [user, authLoading])

  const handleSoundChange = useCallback(async (enabled: boolean) => {
    const newData = await updateSettingsDB({ soundEnabled: enabled })
    setSaveData(newData)
    audioManager.setSoundEnabled(enabled)
  }, [])

  const handleMusicChange = useCallback(async (enabled: boolean) => {
    const newData = await updateSettingsDB({ musicEnabled: enabled })
    setSaveData(newData)
    audioManager.setMusicEnabled(enabled)
  }, [])

  const handleColorBlindChange = useCallback(async (enabled: boolean) => {
    const newData = await updateSettingsDB({ colorBlindMode: enabled })
    setSaveData(newData)
  }, [])

  const handleLanguageChange = useCallback(async (lang: Language) => {
    const newData = await updateSettingsDB({ language: lang })
    setSaveData(newData)
  }, [])

  const handleAdReward = useCallback(async (reward: AdReward) => {
    let newData: SaveData | null = null
    if (reward.type === "coins") newData = await addCoinsDB(reward.amount)
    else if (reward.type === "hint") newData = await addHintsDB(reward.amount)
    else if (reward.type === "undo") newData = await addUndosDB(reward.amount)
    if (newData) {
      setSaveData(newData)
      audioManager.playSound("complete")
    }
  }, [])

  const handleWatchAd = useCallback(() => setShowAdModal(true), [])

  const handleBuyHints = useCallback(async (count: number) => {
    const newData = await buyHintsDB(count)
    if (newData) { setSaveData(newData); audioManager.playSound("complete") }
    else audioManager.playSound("error")
  }, [])

  const handleBuyUndos = useCallback(async (count: number) => {
    const newData = await buyUndosDB(count)
    if (newData) { setSaveData(newData); audioManager.playSound("complete") }
    else audioManager.playSound("error")
  }, [])

  const handleSelectLevel = useCallback((level: number) => {
    setCurrentLevel(level)
    setScreen("game")
  }, [])

  const handleNextLevel = useCallback(() => {
    setCurrentLevel((prev) => prev + 1)
  }, [])

  // ── Loading states ────────────────────────────────────────

  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="flex gap-2">
          {["#e94560", "#4361ee", "#2ec4b6", "#ffc947"].map((color, i) => (
            <motion.div
              key={i}
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: color }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading your game…</span>
        </div>
      </div>
    )
  }

  // ── Not logged in → show login screen ─────────────────────

  if (!user) return <LoginScreen />

  if (!saveData) return null

  const language = saveData.language as Language

  return (
    <>
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
            <LeaderboardScreen onBack={() => setScreen("menu")} />
          )}
        </motion.div>
      </AnimatePresence>

      <AdRewardModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onReward={handleAdReward}
      />
    </>
  )
}
