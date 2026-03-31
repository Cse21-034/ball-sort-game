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
  {
    id: "ad_coca_cola_001",
    type: "video",
    advertiserName: "Coca-Cola",
    
    // Local fallback (optional)
    localVideoPath: "/ads/videos/coca-cola-ad.mp4",

    // ✅ REAL WORKING VIDEO (Cloudinary demo CDN - stable)
    cloudinaryVideoUrl: "https://res.cloudinary.com/demo/video/upload/v1692262393/samples/sea-turtle.mp4",

    // Real official website
    clickUrl: "https://www.coca-cola.com?ref=ballsort",

    callToAction: "Learn More",

    skipAfterSeconds: 5,
    durationSeconds: 30,

    reward: { type: "coins", amount: 25 },

    active: true,

    startsAt: "2026-01-01",
    expiresAt: "2026-12-31",

    targetPlacement: ["reward_modal", "between_levels"],

    priority: 10,
    packageTier: "standard",
  },

  {
    id: "ad_nike_002",
    type: "video",
    advertiserName: "Nike",

    localVideoPath: "/ads/videos/nike-ad.mp4",

    // ✅ Another REAL hosted video
    cloudinaryVideoUrl: "https://res.cloudinary.com/demo/video/upload/v1692262393/samples/cld-sample-video.mp4",

    clickUrl: "https://www.nike.com?ref=ballsort",

    callToAction: "Shop Now",

    skipAfterSeconds: 5,
    durationSeconds: 25,

    reward: { type: "coins", amount: 30 },

    active: true,

    startsAt: "2026-01-01",
    expiresAt: "2026-12-31",

    targetPlacement: ["reward_modal"],

    priority: 8,
    packageTier: "premium",
  }
];
// ============================================================
// AFFILIATE SETUP GUIDE:
// 1. Amazon Associates: associates.amazon.com
// 2. Spotify: impact.com (search Spotify)  
// 3. NordVPN: nordvpn.com/affiliate
// 4. Skillshare: skillshare.com/affiliates
// Replace placeholder URLs with your actual tracking links
// ============================================================

// ============================================================
// YOUR AFFILIATE LINKS — ADD YOUR AFFILIATE PROGRAMS HERE
// ============================================================
export const AFFILIATE_LINKS: AffiliateLink[] = [
  {
    id: "aff_amazon",
    type: "affiliate",
    name: "Amazon",
    description: "Shop millions of products with fast delivery",
    affiliateUrl: "https://amazon.com?tag=YOUR_AMAZON_TAG",
    // TODO: Replace YOUR_AMAZON_TAG with your Amazon Associates ID
    category: "shopping",
    badgeText: "Free Shipping",
    reward: { type: "coins", amount: 10 },
    active: true,
    featured: true,
  },
  {
    id: "aff_spotify",
    type: "affiliate",
    name: "Spotify Premium",
    description: "3 months free with new subscription",
    affiliateUrl: "https://spotify.com/premium",
    // TODO: Join Spotify affiliate via Impact.com
    category: "apps",
    badgeText: "3 Months Free",
    reward: { type: "hint", amount: 1 },
    active: true,
    featured: true,
  },
  {
    id: "aff_skillshare",
    type: "affiliate",
    name: "Skillshare",
    description: "Learn new skills - 1 month free trial",
    affiliateUrl: "https://skillshare.com",
    // TODO: Join via Impact.com or SkimLinks
    category: "apps",
    badgeText: "1 Month Free",
    active: true,
    featured: false,
  },
  {
    id: "aff_nordvpn",
    type: "affiliate",
    name: "NordVPN",
    description: "Stay safe online - up to 68% off",
    affiliateUrl: "https://nordvpn.com",
    // TODO: Join NordVPN affiliate program
    category: "services",
    badgeText: "68% OFF",
    reward: { type: "coins", amount: 25 },
    active: true,
    featured: false,
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
