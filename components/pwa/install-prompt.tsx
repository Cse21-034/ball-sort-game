"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem("install_prompt_dismissed")) {
      return
    }

    // Check if already running as installed PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // Listen for the native install prompt event (Chrome/Edge/Android)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show our custom banner after a short delay
      setTimeout(() => setShowPrompt(true), 2000)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // Fallback: show a manual install hint after 5s on browsers that
    // don't fire beforeinstallprompt (e.g. Safari iOS, Firefox)
    // Only show if not on desktop Chrome where the native prompt will appear
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    if (isIOS && isSafari) {
      const timer = setTimeout(() => setShowPrompt(true), 5000)
      return () => {
        window.removeEventListener("beforeinstallprompt", handler)
        clearTimeout(timer)
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Native install prompt available — use it
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
    }
    // If no native prompt (iOS Safari), the banner itself is the instruction
    handleDismiss()
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setIsDismissed(true)
    sessionStorage.setItem("install_prompt_dismissed", "1")
  }

  if (isInstalled || !showPrompt || isDismissed) return null

  const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent)

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">Install Ball Sort</h3>
          {isIOS ? (
            <p className="text-sm text-muted-foreground">
              Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Play offline anytime!</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleDismiss} className="flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
          {!isIOS && (
            <Button onClick={handleInstall} className="flex-shrink-0">
              Install
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
