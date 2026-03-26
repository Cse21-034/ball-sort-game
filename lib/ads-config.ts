// ============================================================
// lib/ads-config.ts
// Central config for ALL your advertisers and affiliate links
// ADD YOUR PAYING CUSTOMERS HERE
// ============================================================

export type RewardType = "coins" | "hint" | "undo"

export interface VideoAd {
  id: string
  type: "video"
  advertiserName: string
  advertiserLogo?: string          // Optional logo shown during ad
  localVideoPath: string           // e.g. /ads/videos/pizza-30s.mp4
  cloudinaryVideoUrl?: string      // Fallback if local fails
  clickUrl: string                 // Advertiser website
  callToAction: string             // Button text e.g. "Shop Now"
  skipAfterSeconds: number         // 0 = unskippable, 5 = skip after 5s
  durationSeconds: number
  reward: {
    type: RewardType
    amount: number
  }
  active: boolean
  startsAt: string                 // ISO date string
  expiresAt: string                // ISO date string
  targetPlacement: AdPlacement[]  // Where this ad can appear
  priority: number                 // Higher = shown more often
  packageTier: "basic" | "standard" | "premium"
}

export interface AffiliateLink {
  id: string
  type: "affiliate"
  name: string
  description: string
  logoUrl?: string
  affiliateUrl: string             // Your tracking link with affiliate code
  category: AffiliateCategory
  badgeText?: string               // e.g. "20% OFF" or "Free Trial"
  reward?: {                       // Optional reward for clicking
    type: RewardType
    amount: number
  }
  active: boolean
  featured: boolean                // Show in featured section
  expiresAt?: string
}

export type AdPlacement =
  | "between_levels"    // After completing a level
  | "reward_modal"      // When player taps "Watch Ad for Reward"
  | "pause_menu"        // In the pause screen
  | "game_over"         // When stuck / out of moves

export type AffiliateCategory =
  | "gaming"
  | "apps"
  | "shopping"
  | "food"
  | "services"
  | "finance"
  | "health"

// ============================================================
// YOUR VIDEO ADS — ADD PAYING ADVERTISERS HERE
// ============================================================
export const VIDEO_ADS: VideoAd[] = [
  // EXAMPLE — Replace with your real advertisers
  {
    id: "ad_001",
    type: "video",
    advertiserName: "TechGadgets Store",
    localVideoPath: "/ads/videos/techgadgets-30s.mp4",
    cloudinaryVideoUrl: "https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v1/ads/techgadgets-30s.mp4",
    clickUrl: "https://techgadgets.com?ref=ballsort",
    callToAction: "Shop Now",
    skipAfterSeconds: 5,
    durationSeconds: 30,
    reward: { type: "coins", amount: 25 },
    active: false,                 // Set to true when you have real videos
    startsAt: "2025-01-01",
    expiresAt: "2025-12-31",
    targetPlacement: ["reward_modal", "between_levels"],
    priority: 10,
    packageTier: "standard",
  },
  {
    id: "ad_002",
    type: "video",
    advertiserName: "Pizza Palace",
    localVideoPath: "/ads/videos/pizza-palace-15s.mp4",
    cloudinaryVideoUrl: "https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v1/ads/pizza-palace-15s.mp4",
    clickUrl: "https://pizzapalace.com?source=ballsort_game",
    callToAction: "Order Now",
    skipAfterSeconds: 0,           // Unskippable 15s ad (higher rate)
    durationSeconds: 15,
    reward: { type: "hint", amount: 1 },
    active: false,
    startsAt: "2025-01-01",
    expiresAt: "2025-06-30",
    targetPlacement: ["reward_modal"],
    priority: 15,
    packageTier: "premium",
  },
]

// ============================================================
// YOUR AFFILIATE LINKS — ADD YOUR AFFILIATE PROGRAMS HERE
// ============================================================
export const AFFILIATE_LINKS: AffiliateLink[] = [
  // EXAMPLE — Replace with your real affiliate programs
  {
    id: "aff_001",
    type: "affiliate",
    name: "Amazon",
    description: "Shop millions of products",
    affiliateUrl: "https://amzn.to/YOUR_AFFILIATE_CODE",
    category: "shopping",
    badgeText: "Best Deals",
    active: false,
    featured: true,
  },
  {
    id: "aff_002",
    type: "affiliate",
    name: "Skillshare",
    description: "Learn new skills online",
    affiliateUrl: "https://skl.sh/YOUR_AFFILIATE_CODE",
    category: "apps",
    badgeText: "1 Month Free",
    reward: { type: "coins", amount: 50 },  // Bonus coins for clicking
    active: false,
    featured: true,
  },
]

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getAvailableAds(placement: AdPlacement): VideoAd[] {
  const now = new Date()
  return VIDEO_ADS.filter(
    (ad) =>
      ad.active &&
      ad.targetPlacement.includes(placement) &&
      new Date(ad.startsAt) <= now &&
      new Date(ad.expiresAt) > now
  ).sort((a, b) => b.priority - a.priority)
}

export function getRandomAd(placement: AdPlacement): VideoAd | null {
  const available = getAvailableAds(placement)
  if (available.length === 0) return null
  // Weighted random selection based on priority
  const totalWeight = available.reduce((sum, ad) => sum + ad.priority, 0)
  let random = Math.random() * totalWeight
  for (const ad of available) {
    random -= ad.priority
    if (random <= 0) return ad
  }
  return available[0]
}

export function getActiveAffiliateLinks(featured?: boolean): AffiliateLink[] {
  return AFFILIATE_LINKS.filter(
    (link) =>
      link.active &&
      (!link.expiresAt || new Date(link.expiresAt) > new Date()) &&
      (featured === undefined || link.featured === featured)
  )
}

export function hasAnyActiveAds(): boolean {
  return getAvailableAds("reward_modal").length > 0
}
