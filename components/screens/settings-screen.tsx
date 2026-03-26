"use client"

// ============================================================
// components/screens/settings-screen.tsx
// Adds music player section:
//   - Default / custom music toggle
//   - File picker for phone music
//   - Now playing indicator
// ============================================================

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { ArrowLeft, Volume2, Music, Eye, Globe, Upload, RefreshCw, Play, Pause } from "lucide-react"
import { t, type Language, languageNames } from "@/lib/localization"
import { useRef, useState, useEffect } from "react"
import { audioManager } from "@/lib/audio-manager"

interface SettingsScreenProps {
  soundEnabled: boolean
  musicEnabled: boolean
  colorBlindMode: boolean
  language: Language
  onSoundChange: (enabled: boolean) => void
  onMusicChange: (enabled: boolean) => void
  onColorBlindChange: (enabled: boolean) => void
  onLanguageChange: (lang: Language) => void
  onBack: () => void
}

export function SettingsScreen({
  soundEnabled,
  musicEnabled,
  colorBlindMode,
  language,
  onSoundChange,
  onMusicChange,
  onColorBlindChange,
  onLanguageChange,
  onBack,
}: SettingsScreenProps) {
  const languages: Language[] = ["en", "es", "fr", "de", "ja", "zh"]
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [userMusicName, setUserMusicName] = useState<string | null>(null)
  const [loadingMusic, setLoadingMusic] = useState(false)
  const [musicError, setMusicError] = useState<string | null>(null)
  const [isUserMusic, setIsUserMusic] = useState(false)

  // Sync state on mount
  useEffect(() => {
    setIsUserMusic(audioManager.isPlayingUserMusic())
  }, [])

  const handleMusicToggle = (enabled: boolean) => {
    onMusicChange(enabled)
    // Kick off default music on first enable
    if (enabled && !audioManager.isPlayingUserMusic()) {
      audioManager.startDefaultMusic()
    }
  }

  const handlePickFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate audio type
    if (!file.type.startsWith("audio/")) {
      setMusicError("Please select an audio file (MP3, AAC, WAV, OGG, etc.)")
      return
    }

    setLoadingMusic(true)
    setMusicError(null)

    try {
      const name = await audioManager.loadUserMusic(file)
      setUserMusicName(name)
      setIsUserMusic(true)
      // Ensure music is enabled
      if (!musicEnabled) {
        onMusicChange(true)
      }
    } catch {
      setMusicError("Could not play this file. Try a different audio format.")
    } finally {
      setLoadingMusic(false)
      // Reset input so same file can be re-picked
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSwitchToDefault = () => {
    audioManager.switchToDefaultMusic()
    setIsUserMusic(false)
    setUserMusicName(null)
    if (!musicEnabled) {
      onMusicChange(true)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">{t("settings", language)}</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto space-y-6"
      >
        {/* Sound toggle */}
        <div className="bg-card rounded-2xl p-4 flex items-center justify-between border border-border">
          <div className="flex items-center gap-3">
            <Volume2 className="h-6 w-6 text-primary" />
            <span className="font-medium">{t("sound", language)}</span>
          </div>
          <Switch checked={soundEnabled} onCheckedChange={onSoundChange} />
        </div>

        {/* Music toggle + player */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Music on/off row */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="h-6 w-6 text-primary" />
              <span className="font-medium">{t("music", language)}</span>
            </div>
            <Switch checked={musicEnabled} onCheckedChange={handleMusicToggle} />
          </div>

          {/* Music player section (always visible) */}
          <div className="px-4 pb-4 border-t border-border pt-4 space-y-3">

            {/* Now playing indicator */}
            {musicEnabled && (
              <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-3 py-2">
                <div className="flex gap-0.5 items-end h-4">
                  {[0.4, 0.8, 0.6, 1.0, 0.7].map((h, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-primary rounded-full"
                      animate={{ scaleY: [h, 1, h * 0.5, 0.8, h] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                      style={{ height: "100%", transformOrigin: "bottom" }}
                    />
                  ))}
                </div>
                <span className="text-xs text-primary font-medium truncate flex-1">
                  {isUserMusic && userMusicName
                    ? userMusicName
                    : "Ball Sort Ambient Theme"}
                </span>
              </div>
            )}

            {/* Source buttons */}
            <div className="grid grid-cols-2 gap-2">
              {/* Default music button */}
              <button
                onClick={handleSwitchToDefault}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                  !isUserMusic
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/50 text-foreground border-border hover:bg-secondary"
                }`}
              >
                {!isUserMusic ? (
                  <Play className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <RefreshCw className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="truncate">Default Music</span>
              </button>

              {/* Upload from phone button */}
              <button
                onClick={handlePickFile}
                disabled={loadingMusic}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                  isUserMusic
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/50 text-foreground border-border hover:bg-secondary"
                } disabled:opacity-50`}
              >
                {loadingMusic ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="h-4 w-4 flex-shrink-0" />
                  </motion.div>
                ) : (
                  <Upload className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="truncate">
                  {isUserMusic ? "Change Track" : "My Music"}
                </span>
              </button>
            </div>

            {/* Helper text */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isUserMusic
                ? `Playing your track · tap "My Music" to change`
                : `Tap "My Music" to play a song from your device (MP3, AAC, WAV)`}
            </p>

            {/* Error */}
            {musicError && (
              <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
                {musicError}
              </p>
            )}
          </div>
        </div>

        {/* Color blind mode */}
        <div className="bg-card rounded-2xl p-4 flex items-center justify-between border border-border">
          <div className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-primary" />
            <span className="font-medium">{t("colorBlindMode", language)}</span>
          </div>
          <Switch checked={colorBlindMode} onCheckedChange={onColorBlindChange} />
        </div>

        {/* Language selection */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-6 w-6 text-primary" />
            <span className="font-medium">{t("language", language)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <Button
                key={lang}
                variant={language === lang ? "default" : "outline"}
                onClick={() => onLanguageChange(lang)}
                className={language === lang ? "bg-primary" : ""}
              >
                {languageNames[lang]}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
