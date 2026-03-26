// ============================================================
// lib/ad-tracker-db.ts
// Sends ad & affiliate events to Supabase so the admin
// dashboard can see ALL users' data, not just their own.
// ============================================================

import { createClient } from "@/lib/supabase/client"

// ── Session ID ───────────────────────────────────────────────

function getSessionId(): string {
  if (typeof window === "undefined") return "server"
  const key = "ballsort_session_id"
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    sessionStorage.setItem(key, id)
  }
  return id
}

async function getUserId(): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// ── Ad event helpers ─────────────────────────────────────────

export async function trackAdStarted(
  adId: string,
  advertiserName: string,
  placement: string
): Promise<void> {
  const supabase = createClient()
  const userId = await getUserId()
  await supabase.from("ad_events").insert({
    user_id: userId,
    ad_id: adId,
    advertiser_name: advertiserName,
    placement,
    event_type: "started",
    session_id: getSessionId(),
  })
}

export async function trackAdCompleted(
  adId: string,
  advertiserName: string,
  watchedFull: boolean,
  rewardEarned: boolean
): Promise<void> {
  const supabase = createClient()
  const userId = await getUserId()
  await supabase.from("ad_events").insert({
    user_id: userId,
    ad_id: adId,
    advertiser_name: advertiserName,
    placement: "unknown",
    event_type: watchedFull ? "completed" : "skipped",
    watched_full: watchedFull,
    reward_earned: rewardEarned,
    session_id: getSessionId(),
  })
}

export async function trackAdClicked(
  adId: string,
  advertiserName: string
): Promise<void> {
  const supabase = createClient()
  const userId = await getUserId()
  await supabase.from("ad_events").insert({
    user_id: userId,
    ad_id: adId,
    advertiser_name: advertiserName,
    placement: "unknown",
    event_type: "clicked",
    session_id: getSessionId(),
  })
}

export async function trackAffiliateClick(
  linkId: string,
  linkName: string
): Promise<void> {
  const supabase = createClient()
  const userId = await getUserId()
  await supabase.from("affiliate_clicks").insert({
    user_id: userId,
    link_id: linkId,
    link_name: linkName,
    session_id: getSessionId(),
  })
}

// ── Analytics queries (for admin dashboard) ──────────────────

export interface AdvertiserStats {
  advertiserName: string
  views: number
  completions: number
  skips: number
  clicks: number
  completionRate: number
  clickThroughRate: number
}

export interface AdAnalytics {
  totalViews: number
  totalCompletions: number
  totalSkips: number
  totalClicks: number
  completionRate: number
  clickThroughRate: number
  uniqueUsers: number
  byAdvertiser: Record<string, AdvertiserStats>
}

export async function getAdAnalyticsFromDB(): Promise<AdAnalytics> {
  const supabase = createClient()

  const { data: events, error } = await supabase
    .from("ad_events")
    .select("advertiser_name, event_type, watched_full, reward_earned, user_id")

  if (error || !events) {
    return {
      totalViews: 0,
      totalCompletions: 0,
      totalSkips: 0,
      totalClicks: 0,
      completionRate: 0,
      clickThroughRate: 0,
      uniqueUsers: 0,
      byAdvertiser: {},
    }
  }

  const byAdvertiser: Record<string, AdvertiserStats> = {}
  const uniqueUsers = new Set<string>()

  for (const e of events) {
    if (e.user_id) uniqueUsers.add(e.user_id)

    if (!byAdvertiser[e.advertiser_name]) {
      byAdvertiser[e.advertiser_name] = {
        advertiserName: e.advertiser_name,
        views: 0,
        completions: 0,
        skips: 0,
        clicks: 0,
        completionRate: 0,
        clickThroughRate: 0,
      }
    }

    const s = byAdvertiser[e.advertiser_name]
    if (e.event_type === "started") s.views++
    if (e.event_type === "completed") s.completions++
    if (e.event_type === "skipped") s.skips++
    if (e.event_type === "clicked") s.clicks++
  }

  for (const s of Object.values(byAdvertiser)) {
    s.completionRate = s.views > 0 ? Math.round((s.completions / s.views) * 100) : 0
    s.clickThroughRate = s.views > 0 ? Math.round((s.clicks / s.views) * 100) : 0
  }

  const totalViews = events.filter((e) => e.event_type === "started").length
  const totalCompletions = events.filter((e) => e.event_type === "completed").length
  const totalSkips = events.filter((e) => e.event_type === "skipped").length
  const totalClicks = events.filter((e) => e.event_type === "clicked").length

  return {
    totalViews,
    totalCompletions,
    totalSkips,
    totalClicks,
    completionRate: totalViews > 0 ? Math.round((totalCompletions / totalViews) * 100) : 0,
    clickThroughRate: totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0,
    uniqueUsers: uniqueUsers.size,
    byAdvertiser,
  }
}

export async function getAffiliateAnalyticsFromDB(): Promise<Record<string, number>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("affiliate_clicks")
    .select("link_name")

  if (error || !data) return {}

  return data.reduce(
    (acc, row) => {
      acc[row.link_name] = (acc[row.link_name] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
}
