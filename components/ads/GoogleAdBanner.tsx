"use client"

/**
 * GoogleAdBanner.tsx
 * Renders a Google AdSense banner ad.
 * 
 * Usage:
 * <GoogleAdBanner
 *   slot="1234567890"
 *   format="auto"
 *   className="my-4"
 * />
 */

import { useEffect, useRef } from "react"

interface GoogleAdBannerProps {
  slot: string
  format?: "auto" | "rectangle" | "leaderboard" | "vertical"
  className?: string
}

export function GoogleAdBanner({
  slot,
  format = "auto",
  className = "",
}: GoogleAdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return

    // Skip if AdSense client is not configured
    if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT) {
      console.warn("[GoogleAdBanner] NEXT_PUBLIC_ADSENSE_CLIENT not configured")
      return
    }

    // Check if adsbygoogle script loaded
    if (typeof window.adsbygoogle === "undefined") {
      console.warn("[GoogleAdBanner] Google AdSense script not loaded")
      return
    }

    try {
      // Push ad request to Google AdSense
      ;(window.adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
        adsbygoogle: window.adsbygoogle,
        enable_page_level_ads: true,
      })
    } catch (err) {
      // Silent fail - ad blockers or network issues
      console.debug("[GoogleAdBanner] Ad failed to load", err)
    }
  }, [])

  // If AdSense not configured in dev, show placeholder
  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT) {
    return (
      <div
        className={`bg-secondary/50 border-2 border-dashed border-border rounded-lg p-4 text-center text-muted-foreground text-sm ${className}`}
      >
        📢 Google AdSense Banner Placeholder
        <br />
        <span className="text-xs">(Add NEXT_PUBLIC_ADSENSE_CLIENT to show real ads)</span>
      </div>
    )
  }

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}

// Augment window type for adsbygoogle
declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}
