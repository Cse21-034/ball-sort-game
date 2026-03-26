// ============================================================
// lib/ad-tracker.ts
// Tracks ad views, clicks, completions for billing advertisers
// Data stored in localStorage + optionally sent to your backend
// ============================================================

export interface AdViewRecord {
  adId: string
  advertiserName: string
  placement: string
  startedAt: string
  completedAt?: string
  watchedFull: boolean
  skipped: boolean
  clicked: boolean
  rewardEarned: boolean
  sessionId: string
}

export interface AffiliateClickRecord {
  linkId: string
  linkName: string
  clickedAt: string
  sessionId: string
}

export interface AdAnalytics {
  totalViews: number
  totalCompletions: number
  totalSkips: number
  totalClicks: number
  completionRate: number
  clickThroughRate: number
  byAdvertiser: Record<string, AdvertiserStats>
}

export interface AdvertiserStats {
  advertiserName: string
  views: number
  completions: number
  clicks: number
  completionRate: number
  clickThroughRate: number
}

const AD_VIEWS_KEY = "ballsort_ad_views"
const AFFILIATE_CLICKS_KEY = "ballsort_affiliate_clicks"
const SESSION_ID_KEY = "ballsort_session_id"

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server"
  let id = sessionStorage.getItem(SESSION_ID_KEY)
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    sessionStorage.setItem(SESSION_ID_KEY, id)
  }
  return id
}

function getAdViews(): AdViewRecord[] {
  try {
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem(AD_VIEWS_KEY) || "[]")
  } catch {
    return []
  }
}

function saveAdViews(views: AdViewRecord[]): void {
  try {
    // Keep only last 500 records to avoid bloating localStorage
    const trimmed = views.slice(-500)
    localStorage.setItem(AD_VIEWS_KEY, JSON.stringify(trimmed))
  } catch {
    // localStorage full — clear old records
    localStorage.removeItem(AD_VIEWS_KEY)
  }
}

function getAffiliateClicks(): AffiliateClickRecord[] {
  try {
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem(AFFILIATE_CLICKS_KEY) || "[]")
  } catch {
    return []
  }
}

// ── Public API ──────────────────────────────────────────────

export function trackAdStarted(
  adId: string,
  advertiserName: string,
  placement: string
): string {
  const recordId = `${adId}_${Date.now()}`
  const views = getAdViews()
  views.push({
    adId,
    advertiserName,
    placement,
    startedAt: new Date().toISOString(),
    watchedFull: false,
    skipped: false,
    clicked: false,
    rewardEarned: false,
    sessionId: getOrCreateSessionId(),
  })
  saveAdViews(views)

  // Optional: send to your backend
  sendToBackend("ad_started", { adId, advertiserName, placement }).catch(() => {})

  return recordId
}

export function trackAdCompleted(
  adId: string,
  advertiserName: string,
  watchedFull: boolean,
  rewardEarned: boolean
): void {
  const views = getAdViews()
  // Update the most recent record for this ad
  const idx = views.map((v) => v.adId).lastIndexOf(adId)
  if (idx !== -1) {
    views[idx] = {
      ...views[idx],
      completedAt: new Date().toISOString(),
      watchedFull,
      skipped: !watchedFull,
      rewardEarned,
    }
    saveAdViews(views)
  }

  sendToBackend("ad_completed", {
    adId,
    advertiserName,
    watchedFull,
    rewardEarned,
  }).catch(() => {})
}

export function trackAdClicked(adId: string, advertiserName: string): void {
  const views = getAdViews()
  const idx = views.map((v) => v.adId).lastIndexOf(adId)
  if (idx !== -1) {
    views[idx].clicked = true
    saveAdViews(views)
  }

  sendToBackend("ad_clicked", { adId, advertiserName }).catch(() => {})
}

export function trackAffiliateClick(linkId: string, linkName: string): void {
  const clicks = getAffiliateClicks()
  clicks.push({
    linkId,
    linkName,
    clickedAt: new Date().toISOString(),
    sessionId: getOrCreateSessionId(),
  })
  try {
    localStorage.setItem(AFFILIATE_CLICKS_KEY, JSON.stringify(clicks.slice(-200)))
  } catch {
    localStorage.removeItem(AFFILIATE_CLICKS_KEY)
  }

  sendToBackend("affiliate_clicked", { linkId, linkName }).catch(() => {})
}

// ── Analytics ───────────────────────────────────────────────

export function getAdAnalytics(): AdAnalytics {
  const views = getAdViews()
  const byAdvertiser: Record<string, AdvertiserStats> = {}

  for (const view of views) {
    if (!byAdvertiser[view.advertiserName]) {
      byAdvertiser[view.advertiserName] = {
        advertiserName: view.advertiserName,
        views: 0,
        completions: 0,
        clicks: 0,
        completionRate: 0,
        clickThroughRate: 0,
      }
    }
    const stats = byAdvertiser[view.advertiserName]
    stats.views++
    if (view.watchedFull) stats.completions++
    if (view.clicked) stats.clicks++
  }

  // Calculate rates
  for (const stats of Object.values(byAdvertiser)) {
    stats.completionRate =
      stats.views > 0 ? Math.round((stats.completions / stats.views) * 100) : 0
    stats.clickThroughRate =
      stats.views > 0 ? Math.round((stats.clicks / stats.views) * 100) : 0
  }

  const totalViews = views.length
  const totalCompletions = views.filter((v) => v.watchedFull).length
  const totalSkips = views.filter((v) => v.skipped).length
  const totalClicks = views.filter((v) => v.clicked).length

  return {
    totalViews,
    totalCompletions,
    totalSkips,
    totalClicks,
    completionRate:
      totalViews > 0 ? Math.round((totalCompletions / totalViews) * 100) : 0,
    clickThroughRate:
      totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0,
    byAdvertiser,
  }
}

export function getAffiliateAnalytics(): Record<string, number> {
  const clicks = getAffiliateClicks()
  return clicks.reduce(
    (acc, click) => {
      acc[click.linkName] = (acc[click.linkName] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
}

// ── Backend sync (optional) ─────────────────────────────────
// Set NEXT_PUBLIC_AD_TRACKING_URL in your .env to enable
async function sendToBackend(
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_AD_TRACKING_URL
  if (!url) return // No backend configured — skip silently

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString(),
      gameVersion: "1.0.0",
    }),
    // Non-blocking — don't wait for response
    keepalive: true,
  })
}
