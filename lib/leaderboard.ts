// ============================================================
// lib/leaderboard.ts
// Fixed: upserts best score per player+level (no duplicate entries)
// ============================================================

import { createClient } from "@/lib/supabase/client"

export interface LeaderboardEntry {
  id: string
  player_name: string
  player_id: string
  level_id: number
  moves: number
  time_seconds: number
  score: number
  created_at: string
}

// ── Player identity — uses Supabase Auth user ID ────────────

export async function getAuthUserId(): Promise<string> {
  if (typeof window === "undefined") return "anonymous"
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? getLocalPlayerId()
}

// Fallback for unauthenticated (shouldn't happen with Google Auth)
function getLocalPlayerId(): string {
  let id = localStorage.getItem("ballsort_player_id")
  if (!id) {
    id = `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem("ballsort_player_id", id)
  }
  return id
}

// Sync version used in display (leaderboard screen comparison)
export function getPlayerId(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("ballsort_cached_user_id") ?? getLocalPlayerId()
}

// Called after auth resolves so getPlayerId() stays in sync
export async function cacheUserId(): Promise<void> {
  const id = await getAuthUserId()
  if (typeof window !== "undefined") {
    localStorage.setItem("ballsort_cached_user_id", id)
  }
}

// ── Player name ─────────────────────────────────────────────

export function getPlayerName(): string {
  if (typeof window === "undefined") return "Player"
  return localStorage.getItem("ballsort_player_name") || "Player"
}

export function setPlayerName(name: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("ballsort_player_name", name)
}

// ── Score calculation ────────────────────────────────────────

export function calculateScore(
  moves: number,
  timeSeconds: number,
  levelId: number
): number {
  const baseScore = 10000
  const movePenalty = moves * 50
  const timePenalty = timeSeconds * 5
  const levelBonus = levelId * 100
  return Math.max(100, baseScore - movePenalty - timePenalty + levelBonus)
}

// ── Submit score — upsert best score per player+level ────────
// Instead of always inserting, we check if an existing entry exists.
// If the new score is BETTER (higher), we update it.
// If no entry exists, we insert.

export async function submitScore(
  levelId: number,
  moves: number,
  timeSeconds: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const playerId = await getAuthUserId()
  const playerName = getPlayerName()
  const newScore = calculateScore(moves, timeSeconds, levelId)

  // Cache the user ID for sync reads
  if (typeof window !== "undefined") {
    localStorage.setItem("ballsort_cached_user_id", playerId)
  }

  // Check if this player already has an entry for this level
  const { data: existing, error: fetchError } = await supabase
    .from("leaderboard")
    .select("id, score, moves")
    .eq("player_id", playerId)
    .eq("level_id", levelId)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError) {
    console.error("[Leaderboard] fetch existing error:", fetchError.message)
    // Fall through and try to insert anyway
  }

  if (existing) {
    // Only update if the new score is better (higher score = better)
    if (newScore > existing.score) {
      const { error } = await supabase
        .from("leaderboard")
        .update({
          player_name: playerName,
          moves,
          time_seconds: timeSeconds,
          score: newScore,
        })
        .eq("id", existing.id)

      if (error) {
        console.error("[Leaderboard] update error:", error.message)
        return { success: false, error: error.message }
      }
      console.log(`[Leaderboard] Updated score for level ${levelId}: ${existing.score} → ${newScore}`)
    } else {
      console.log(`[Leaderboard] Kept existing score for level ${levelId}: ${existing.score} (new: ${newScore})`)
    }
    return { success: true }
  }

  // No existing entry — insert new
  const { error } = await supabase.from("leaderboard").insert({
    player_id: playerId,
    player_name: playerName,
    level_id: levelId,
    moves,
    time_seconds: timeSeconds,
    score: newScore,
  })

  if (error) {
    console.error("[Leaderboard] insert error:", error.message)
    return { success: false, error: error.message }
  }

  console.log(`[Leaderboard] Inserted new score for level ${levelId}: ${newScore}`)
  return { success: true }
}

// ── Read queries ─────────────────────────────────────────────

export async function getGlobalLeaderboard(
  limit = 50
): Promise<LeaderboardEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("score", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[Leaderboard] getGlobal error:", error.message)
    return []
  }
  return data ?? []
}

export async function getLevelLeaderboard(
  levelId: number,
  limit = 20
): Promise<LeaderboardEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("level_id", levelId)
    .order("score", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[Leaderboard] getLevel error:", error.message)
    return []
  }
  return data ?? []
}

export async function getPlayerBestScores(
  playerId: string
): Promise<LeaderboardEntry[]> {
  if (!playerId) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("player_id", playerId)
    .order("score", { ascending: false })
    .limit(20)

  if (error) {
    console.error("[Leaderboard] getPlayerBest error:", error.message)
    return []
  }
  return data ?? []
}

export async function getPlayerRank(
  playerId: string
): Promise<number | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("leaderboard")
    .select("player_id, score")
    .order("score", { ascending: false })

  if (error || !data) return null
  const rank = data.findIndex((e) => e.player_id === playerId) + 1
  return rank > 0 ? rank : null
}
