"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowLeft, Coins, Lightbulb, Undo2, Play, Gift, Crown, AlertCircle } from "lucide-react"
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
  isPremium?: boolean
  onPremiumClick?: () => void
  isGuest?: boolean
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
  isPremium = false,
  onPremiumClick = () => {},
  isGuest = false,
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
        {/* Premium upsell banner */}
        {!isPremium && !isGuest && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-accent/20 to-accent/10 border-2 border-accent rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <Crown className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Go Premium</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Remove all ads forever • Unlimited hints & undos • Exclusive skins
                </p>
                <Button
                  onClick={onPremiumClick}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-semibold"
                >
                  $2.99 One-time Purchase
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {isPremium && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-accent/20 border-2 border-accent rounded-2xl p-4 text-center"
          >
            <p className="text-accent font-bold">✓ Premium Active - No Ads</p>
          </motion.div>
        )}

        {isGuest && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-destructive/20 border-2 border-destructive rounded-2xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">
              Shop features available after signing in
            </p>
          </motion.div>
        )}
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
        {!isGuest && (
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
        )}

        {/* Buy hints */}
        <div className={`bg-card rounded-2xl p-6 border border-border ${isGuest ? "opacity-50" : ""}`}>
          <div className="flex items-center gap-4 mb-4">
            <Lightbulb className="h-8 w-8 text-accent" />
            <h2 className="text-lg font-semibold">{t("buyHints", language)}</h2>
            {isPremium && <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">Unlimited</span>}
          </div>
          {isGuest ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Sign in to unlock
            </p>
          ) : (
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
                  disabled={coins < pack.cost || isPremium}
                >
                  <span>{pack.count} Hints</span>
                  <span className="flex items-center gap-1">
                    {isPremium ? <span>∞</span> : (
                      <>
                        <Coins className="h-4 w-4 text-accent" />
                        {pack.cost}
                      </>
                    )}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Buy undos */}
        <div className={`bg-card rounded-2xl p-6 border border-border ${isGuest ? "opacity-50" : ""}`}>
          <div className="flex items-center gap-4 mb-4">
            <Undo2 className="h-8 w-8 text-primary" />
            <h2 className="text-lg font-semibold">{t("buyUndos", language)}</h2>
            {isPremium && <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">Unlimited</span>}
          </div>
          {isGuest ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Sign in to unlock
            </p>
          ) : (
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
                  disabled={coins < pack.cost || isPremium}
                >
                  <span>{pack.count} Undos</span>
                  <span className="flex items-center gap-1">
                    {isPremium ? <span>∞</span> : (
                      <>
                        <Coins className="h-4 w-4 text-accent" />
                        {pack.cost}
                      </>
                    )}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
