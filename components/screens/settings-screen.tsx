"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { ArrowLeft, Volume2, Music, Eye, Globe } from "lucide-react"
import { t, type Language, languageNames } from "@/lib/localization"

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

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">{t("settings", language)}</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto space-y-6">
        {/* Sound toggle */}
        <div className="bg-card rounded-2xl p-4 flex items-center justify-between border border-border">
          <div className="flex items-center gap-3">
            <Volume2 className="h-6 w-6 text-primary" />
            <span className="font-medium">{t("sound", language)}</span>
          </div>
          <Switch checked={soundEnabled} onCheckedChange={onSoundChange} />
        </div>

        {/* Music toggle */}
        <div className="bg-card rounded-2xl p-4 flex items-center justify-between border border-border">
          <div className="flex items-center gap-3">
            <Music className="h-6 w-6 text-primary" />
            <span className="font-medium">{t("music", language)}</span>
          </div>
          <Switch checked={musicEnabled} onCheckedChange={onMusicChange} />
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
    </div>
  )
}
