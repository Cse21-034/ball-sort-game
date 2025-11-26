"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowLeft, Coins, Lightbulb, Undo2, Play, Gift } from "lucide-react"
import { t, type Language } from "@/lib/localization"

interface ShopScreenProps {
  coins: number
  hintsRemaining: number
  undosRemaining: number
  onBuyHints: (count: number) => void
  onBuyUndos: (count: number) => void
  onWatchAd: () => void
  onBack: () => void
  language: Language
}

export function ShopScreen({
  coins,
  hintsRemaining,
  undosRemaining,
  onBuyHints,
  onBuyUndos,
  onWatchAd,
  onBack,
  language,
}: ShopScreenProps) {
  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-foreground">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">{t("shop", language)}</h1>
        </div>

        <div className="flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full">
          <Coins className="h-5 w-5 text-accent" />
          <span className="font-bold text-accent">{coins}</span>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto space-y-6">
        {/* Current inventory */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Your Items</h2>
          <div className="flex justify-around">
            <div className="text-center">
              <Lightbulb className="h-8 w-8 mx-auto text-accent mb-2" />
              <p className="text-2xl font-bold">{hintsRemaining}</p>
              <p className="text-sm text-muted-foreground">{t("hint", language)}s</p>
            </div>
            <div className="text-center">
              <Undo2 className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{undosRemaining}</p>
              <p className="text-sm text-muted-foreground">{t("undo", language)}s</p>
            </div>
          </div>
        </div>

        {/* Watch ad for coins */}
        <div className="bg-card rounded-2xl p-6 border border-accent border-dashed">
          <div className="flex items-center gap-4">
            <div className="bg-accent/20 p-3 rounded-xl">
              <Play className="h-8 w-8 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{t("watchAd", language)}</h3>
              <p className="text-sm text-muted-foreground">Get 10 coins free!</p>
            </div>
            <Button onClick={onWatchAd} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Gift className="h-4 w-4 mr-2" />
              Free
            </Button>
          </div>
        </div>

        {/* Buy hints */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center gap-4 mb-4">
            <Lightbulb className="h-8 w-8 text-accent" />
            <h2 className="text-lg font-semibold">{t("buyHints", language)}</h2>
          </div>
          <div className="space-y-3">
            {[
              { count: 3, cost: 60 },
              { count: 5, cost: 100 },
              { count: 10, cost: 180 },
            ].map((pack) => (
              <Button
                key={pack.count}
                variant="outline"
                className="w-full justify-between border-border bg-transparent"
                onClick={() => onBuyHints(pack.count)}
                disabled={coins < pack.cost}
              >
                <span>{pack.count} Hints</span>
                <span className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-accent" />
                  {pack.cost}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Buy undos */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center gap-4 mb-4">
            <Undo2 className="h-8 w-8 text-primary" />
            <h2 className="text-lg font-semibold">{t("buyUndos", language)}</h2>
          </div>
          <div className="space-y-3">
            {[
              { count: 5, cost: 50 },
              { count: 10, cost: 90 },
              { count: 20, cost: 160 },
            ].map((pack) => (
              <Button
                key={pack.count}
                variant="outline"
                className="w-full justify-between border-border bg-transparent"
                onClick={() => onBuyUndos(pack.count)}
                disabled={coins < pack.cost}
              >
                <span>{pack.count} Undos</span>
                <span className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-accent" />
                  {pack.cost}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
