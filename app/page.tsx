"use client"

// app/page.tsx — wired to Google Auth + Supabase persistence + GUEST MODE

import { useState, useEffect, useCallback, useRef } from "react"
import { MainMenu } from "@/components/screens/main-menu"
import { LevelSelect } from "@/components/screens/level-select"
import { GameScreen } from "@/components/screens/game-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"
import { ShopScreen } from "@/components/screens/shop-screen"
import { LeaderboardScreen } from "@/components/screens/leaderboard-screen"
import { LoginScreen } from "@/components/screens/login-screen"
import { LandingPage } from "@/components/screens/landing-page"
import { SaveProgressModal } from "@/components/screens/save-progress-modal"
import { PremiumModal } from "@/components/screens/premium-modal"
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
  purchasePremiumDB,
} from "@/lib/save-system-db"
import type { SaveData } from "@/lib/game-types"
import { audioManager } from "@/lib/audio-manager"
import type { Language } from "@/lib/localization"
import { AnimatePresence, motion } from "framer-motion"
import type { AdReward } from "@/lib/ad-manager"
import { Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type Screen = "menu" | "levels" | "game" | "settings" | "shop" | "leaderboard"
type AppMode = "landing" | "guest" | "authenticated"

const GUEST_SAVE_DATA: SaveData = {
  completedLevels: [],
  coins: 0,
  hintsRemaining: 0,
  undosRemaining: 0,
  soundEnabled: true,
  musicEnabled: false,
  colorBlindMode: false,
  language: "en",
  highScores: {},
  isPremium: false,
}

export default function BallSortGame() {
  const { user, loading: authLoading } = useAuth()
  const [screen, setScreen] = useState<Screen>("menu")
  const [appMode, setAppMode] = useState<AppMode>("landing")
  const [saveData, setSaveData] = useState<SaveData | null>(null)
  const [guestData, setGuestData] = useState<SaveData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [showAdModal, setShowAdModal] = useState(false)
  const [showSaveProgressModal, setShowSaveProgressModal] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const guestModeRef = useRef(false)

  // ── Load save data once authenticated ────────────────────

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setAppMode("landing")
      setDataLoading(false)
      return
    }

    setDataLoading(true)
    loadSaveDataFromDB().then((data) => {
      setSaveData(data)
      audioManager.init()
      audioManager.setSoundEnabled(data.soundEnabled)
      audioManager.setMusicEnabled(data.musicEnabled)
      setAppMode("authenticated")
      setDataLoading(false)
    })
  }, [user, authLoading])

  // ── Guest Mode Handlers ──────────────────────────────────

  const handlePlayFree = useCallback(() => {
    guestModeRef.current = true
    setGuestData({ ...GUEST_SAVE_DATA })
    setAppMode("guest")
    setScreen("levels")
    audioManager.init()
    audioManager.setSoundEnabled(GUEST_SAVE_DATA.soundEnabled)
    audioManager.setMusicEnabled(GUEST_SAVE_DATA.musicEnabled)
  }, [])

  const handleGuestLevelSelect = useCallback((level: number) => {
    // Guest can only play levels 1-3
    if (level > 3) {
      setShowSaveProgressModal(true)
      return
    }
    setCurrentLevel(level)
    setScreen("game")
  }, [])

  const handleGuestNextLevel = useCallback(() => {
    const nextLevel = currentLevel + 1
    if (guestData && nextLevel > 3) {
      setShowSaveProgressModal(true)
      return
    }
    setCurrentLevel(nextLevel)
  }, [currentLevel, guestData])

  const handleSaveProgressComplete = useCallback(() => {
    // User signed in, promote guest data
    if (guestData && saveData) {
      const promotedData = { ...saveData }
      promotedData.completedLevels = guestData.completedLevels
      promotedData.highScores = guestData.highScores
      promotedData.coins = Math.max(saveData.coins, guestData.coins)
      setSaveData(promotedData)
      setAppMode("authenticated")
      setGuestData(null)
      guestModeRef.current = false
    }
  }, [guestData, saveData])

  // ── Authenticated Mode Handlers ──────────────────────────

  const handleSoundChange = useCallback(async (enabled: boolean) => {
    if (appMode === "guest" && guestData) {
      setGuestData({ ...guestData, soundEnabled: enabled })
      audioManager.setSoundEnabled(enabled)
    } else if (saveData) {
      const newData = await updateSettingsDB({ soundEnabled: enabled })
      setSaveData(newData)
      audioManager.setSoundEnabled(enabled)
    }
  }, [appMode, guestData, saveData])

  const handleMusicChange = useCallback(async (enabled: boolean) => {
    if (appMode === "guest" && guestData) {
      setGuestData({ ...guestData, musicEnabled: enabled })
      audioManager.setMusicEnabled(enabled)
    } else if (saveData) {
      const newData = await updateSettingsDB({ musicEnabled: enabled })
      setSaveData(newData)
      audioManager.setMusicEnabled(enabled)
    }
  }, [appMode, guestData, saveData])

  const handleColorBlindChange = useCallback(async (enabled: boolean) => {
    if (appMode === "guest" && guestData) {
      setGuestData({ ...guestData, colorBlindMode: enabled })
    } else if (saveData) {
      const newData = await updateSettingsDB({ colorBlindMode: enabled })
      setSaveData(newData)
    }
  }, [appMode, guestData, saveData])

  const handleLanguageChange = useCallback(async (lang: Language) => {
    if (appMode === "guest" && guestData) {
      setGuestData({ ...guestData, language: lang })
    } else if (saveData) {
      const newData = await updateSettingsDB({ language: lang })
      setSaveData(newData)
    }
  }, [appMode, guestData, saveData])

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
    if (appMode === "guest") {
      audioManager.playSound("error")
      return
    }
    const newData = await buyHintsDB(count)
    if (newData) {
      setSaveData(newData)
      audioManager.playSound("complete")
    } else {
      audioManager.playSound("error")
    }
  }, [appMode])

  const handleBuyUndos = useCallback(async (count: number) => {
    if (appMode === "guest") {
      audioManager.playSound("error")
      return
    }
    const newData = await buyUndosDB(count)
    if (newData) {
      setSaveData(newData)
      audioManager.playSound("complete")
    } else {
      audioManager.playSound("error")
    }
  }, [appMode])

  const handleSelectLevel = useCallback((level: number) => {
    if (appMode === "guest") {
      handleGuestLevelSelect(level)
    } else {
      setCurrentLevel(level)
      setScreen("game")
    }
  }, [appMode, handleGuestLevelSelect])

  const handleNextLevel = useCallback(() => {
    if (appMode === "guest") {
      handleGuestNextLevel()
    } else {
      setCurrentLevel((prev) => prev + 1)
    }
  }, [appMode, handleGuestNextLevel])

  const handleLevelComplete = useCallback(
    (newData: SaveData) => {
      if (appMode === "guest" && guestData) {
        setGuestData(newData)
      } else {
        setSaveData(newData)
      }
    },
    [appMode, guestData]
  )

  const handlePremiumPurchase = useCallback(async () => {
    const newData = await purchasePremiumDB()
    setSaveData(newData)
  }, [])

  // ── Loading states ────────────────────────────────────────

  if (authLoading) {
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

  // ── App modes ────────────────────────────────────────────

  // Landing page — not logged in
  if (appMode === "landing") {
    return (
      <LandingPage
        onPlayFree={handlePlayFree}
        onSignIn={() => {
          // Show login screen
          setAppMode("authenticated")
          setDataLoading(false)
        }}
      />
    )
  }

  // Authenticated but loading
  if (appMode === "authenticated" && dataLoading) {
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

  // Show login if authenticated but no user
  if (appMode === "authenticated" && !user) {
    return <LoginScreen />
  }

  // Get active save data
  const activeData = appMode === "guest" ? guestData : saveData
  const language = (activeData?.language as Language) || "en"

  if (!activeData) return null

  // Render appropriate screen based on app mode and current screen
  return (
    <>
      {/* Guest Mode Banner */}
      {appMode === "guest" && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-0 left-0 right-0 bg-accent/90 text-accent-foreground px-4 py-3 z-40 flex items-center justify-between"
        >
          <span className="text-sm font-semibold">
            👋 Playing as guest · Level {Math.max(...activeData.completedLevels, 0)}/3 ·
            Sign in to save progress
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-accent-foreground hover:bg-accent-foreground/20"
              onClick={() => setShowSaveProgressModal(true)}
            >
              Sign In
            </Button>
            <button
              onClick={handlePlayFree}
              className="text-accent-foreground hover:opacity-80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Main content area */}
      <div className={appMode === "guest" ? "pt-14" : ""}>
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
                onLeaderboard={() => appMode === "guest" ? null : setScreen("leaderboard")}
                coins={activeData.coins}
                language={language}
                isPremium={activeData.isPremium}
                isGuest={appMode === "guest"}
              />
            )}

            {screen === "levels" && (
              <LevelSelect
                completedLevels={activeData.completedLevels}
                highScores={activeData.highScores}
                onSelectLevel={handleSelectLevel}
                onBack={() => setScreen("menu")}
                language={language}
                maxLevel={appMode === "guest" ? 3 : undefined}
              />
            )}

            {screen === "game" && (
              <GameScreen
                key={currentLevel}
                levelId={currentLevel}
                saveData={activeData}
                onSaveDataChange={handleLevelComplete}
                onMainMenu={() => setScreen("menu")}
                onNextLevel={handleNextLevel}
                language={language}
                isPremium={activeData.isPremium}
              />
            )}

            {screen === "settings" && activeData && (
              <SettingsScreen
                soundEnabled={activeData.soundEnabled}
                musicEnabled={activeData.musicEnabled}
                colorBlindMode={activeData.colorBlindMode}
                language={language}
                onSoundChange={handleSoundChange}
                onMusicChange={handleMusicChange}
                onColorBlindChange={handleColorBlindChange}
                onLanguageChange={handleLanguageChange}
                onBack={() => setScreen("menu")}
              />
            )}

            {screen === "shop" && activeData && (
              <ShopScreen
                coins={activeData.coins}
                hintsRemaining={activeData.hintsRemaining}
                undosRemaining={activeData.undosRemaining}
                onBuyHints={handleBuyHints}
                onBuyUndos={handleBuyUndos}
                onWatchAd={handleWatchAd}
                onBack={() => setScreen("menu")}
                language={language}
                isPremium={activeData.isPremium}
                onPremiumClick={() => setShowPremiumModal(true)}
                isGuest={appMode === "guest"}
              />
            )}

            {screen === "leaderboard" && appMode !== "guest" && (
              <LeaderboardScreen onBack={() => setScreen("menu")} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AdRewardModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onReward={handleAdReward}
      />

      <SaveProgressModal
        isOpen={showSaveProgressModal}
        onClose={() => setShowSaveProgressModal(false)}
        onSignInComplete={handleSaveProgressComplete}
      />

      {saveData && (
        <PremiumModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onPurchase={handlePremiumPurchase}
          isPremium={saveData.isPremium}
        />
      )}
    </>
  )
}
