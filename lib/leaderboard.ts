// ============================================================
// lib/leaderboard.ts
//
// Global leaderboard  → one row per PLAYER, sorted by levels_completed
// My Scores tab       → shows only YOUR summary stats (no per-level list)
// Score strategy      → ALWAYS replace with latest attempt (not best)
// ============================================================

import { createClient } from "@/lib/supabase/client"

// ── Types ────────────────────────────────────────────────────

export interface GlobalPlayerEntry {
  player_id: string
  player_name: string
  levels_completed: number
  total_score: number
  total_moves: number
  total_time_seconds: number
  best_level: number
  updated_at: string
  rank?: number
}

// ── Player identity ──────────────────────────────────────────

export async function getAuthUserId(): Promise<string> {
  if (typeof window === "undefined") return "anonymous"
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? getLocalPlayerId()
}

function getLocalPlayerId(): string {
  let id = localStorage.getItem("ballsort_player_id")
  if (!id) {
    id = `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem("ballsort_player_id", id)
  }
  return id
}

export function getPlayerId(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("ballsort_cached_user_id") ?? getLocalPlayerId()
}

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

export function calculateScore(moves: number, timeSeconds: number, levelId: number): number {
  const baseScore = 10000
  const movePenalty = moves * 50
  const timePenalty = timeSeconds * 5
  const levelBonus = levelId * 100
  return Math.max(100, baseScore - movePenalty - timePenalty + levelBonus)
}

// ── Submit score ─────────────────────────────────────────────
// Strategy: ALWAYS replace with latest attempt (not best score)
// Then recompute player_stats from all level rows for this player

export async function submitScore(
  levelId: number,
  moves: number,
  timeSeconds: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const playerId = await getAuthUserId()
  const playerName = getPlayerName()
  const score = calculateScore(moves, timeSeconds, levelId)

  if (typeof window !== "undefined") {
    localStorage.setItem("ballsort_cached_user_id", playerId)
  }

  console.log(`[Leaderboard] submitScore level=${levelId} player=${playerId} score=${score}`)

  // Step 1: Check if a row already exists for this player+level
  const { data: existing } = await supabase
    .from("leaderboard")
    .select("id")
    .eq("player_id", playerId)
    .eq("level_id", levelId)
    .maybeSingle()

  if (existing) {
    // Always replace with latest attempt
    const { error } = await supabase
      .from("leaderboard")
      .update({
        player_name: playerName,
        moves,
        time_seconds: timeSeconds,
        score,
        auth_user_id: playerId,
        created_at: new Date().toISOString(),
      })
      .eq("id", existing.id)

    if (error) {
      console.error("[Leaderboard] update error:", error.message)
      return { success: false, error: error.message }
    }
  } else {
    // New level for this player — insert
    const { error } = await supabase.from("leaderboard").insert({
      player_id: playerId,
      player_name: playerName,
      level_id: levelId,
      moves,
      time_seconds: timeSeconds,
      score,
      auth_user_id: playerId,
    })

    if (error && error.code !== "23505") {
      console.error("[Leaderboard] insert error:", error.message)
      return { success: false, error: error.message }
    }
  }

  // Step 2: Recompute player_stats by aggregating all level rows for this player
  const { data: allRows, error: aggErr } = await supabase
    .from("leaderboard")
    .select("score, moves, time_seconds, level_id")
    .eq("player_id", playerId)

  if (!aggErr && allRows && allRows.length > 0) {
    const totalScore = allRows.reduce((s, r) => s + r.score, 0)
    const totalMoves = allRows.reduce((s, r) => s + r.moves, 0)
    const totalTime = allRows.reduce((s, r) => s + r.time_seconds, 0)
    const levelsCompleted = allRows.length
    const bestLevel = Math.max(...allRows.map((r) => r.level_id))

    const { error: statsErr } = await supabase.from("player_stats").upsert({
      player_id: playerId,
      player_name: playerName,
      levels_completed: levelsCompleted,
      total_score: totalScore,
      total_moves: totalMoves,
      total_time_seconds: totalTime,
      best_level: bestLevel,
      updated_at: new Date().toISOString(),
    }, { onConflict: "player_id" })

    if (statsErr) {
      console.error("[Leaderboard] player_stats upsert error:", statsErr.message)
    } else {
      console.log(`[Leaderboard] stats updated: levels=${levelsCompleted} total_score=${totalScore}`)
    }
  }

  return { success: true }
}

// ── Global leaderboard: one row per PLAYER, sorted by levels_completed ──

export async function getGlobalLeaderboard(limit = 50): Promise<GlobalPlayerEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("player_stats")
    .select("*")
    .order("levels_completed", { ascending: false })
    .order("total_score", { ascending: false }) // tiebreaker: higher total score wins
    .limit(limit)

  if (error) {
    console.error("[Leaderboard] getGlobal error:", error.message)
    return []
  }

  return (data ?? []).map((entry, index) => ({ ...entry, rank: index + 1 }))
}

// ── My stats: full summary for current player ────────────────

export async function getMyStats(playerId: string): Promise<GlobalPlayerEntry | null> {
  if (!playerId) return null
  const supabase = createClient()
  const { data, error } = await supabase
    .from("player_stats")
    .select("*")
    .eq("player_id", playerId)
    .maybeSingle()

  if (error || !data) return null
  return data
}

// Keep these for any legacy references
export async function getGlobalLeaderboardLegacy(limit = 50) { return getGlobalLeaderboard(limit) }
export async function getPlayerBestScores(_playerId: string) { return [] }
