"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download, X, Share } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [platform, setPlatform] = useState<"android" | "ios" | "other">("other")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // ── 1. Already installed as PWA? Hide forever ──────────
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // ── 2. Already dismissed this session? ─────────────────
    if (sessionStorage.getItem("pwa_prompt_dismissed")) return

    // ── 3. Detect platform ─────────────────────────────────
    const ua = navigator.userAgent
    const isIOS = /ipad|iphone|ipod/i.test(ua) && !/windows phone/i.test(ua)
    const isAndroid = /android/i.test(ua)
    setPlatform(isIOS ? "ios" : isAndroid ? "android" : "other")

    // ── 4. Android / Chrome: wait for native prompt event ──
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show banner after 3 s so user has time to look around first
      timerRef.current = setTimeout(() => setShowPrompt(true), 3000)
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    // ── 5. iOS Safari: show manual instructions after 4 s ──
    // beforeinstallprompt NEVER fires on iOS — we show instructions instead
    let iosTimer: ReturnType<typeof setTimeout> | null = null
    if (isIOS) {
      iosTimer = setTimeout(() => setShowPrompt(true), 4000)
    }

    // ── 6. Detect successful install ───────────────────────
    const handleInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
    }
    window.addEventListener("appinstalled", handleInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleInstalled)
      if (timerRef.current) clearTimeout(timerRef.current)
      if (iosTimer) clearTimeout(iosTimer)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
    }
    setShowPrompt(false)
    sessionStorage.setItem("pwa_prompt_dismissed", "1")
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    sessionStorage.setItem("pwa_prompt_dismissed", "1")
  }

  if (isInstalled || !showPrompt) return null

  // ── iOS Safari: show "Share → Add to Home Screen" guide ─
  if (platform === "ios") {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[200] animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Share className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Install Ball Sort</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Tap the <strong>Share</strong> button ↑ in Safari,
                  then tap <strong>"Add to Home Screen"</strong>
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground p-1 flex-shrink-0 mt-0.5"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-center mt-3">
            <span className="text-xs text-muted-foreground animate-bounce">▼ look for the share icon in the toolbar</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Android / Chrome / Edge / Samsung Internet ───────────
  // Only render if we actually have a deferred prompt to trigger
  if (!deferredPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[200] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm">Install Ball Sort</h3>
          <p className="text-xs text-muted-foreground">Play offline, no browser needed!</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground p-1"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
          <Button
            size="sm"
            onClick={handleInstall}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3"
          >
            Install
          </Button>
        </div>
      </div>
    </div>
  )
}
