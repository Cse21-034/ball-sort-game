// ============================================================
// lib/leaderboard.ts
// Bulletproof upsert: SELECT → INSERT or UPDATE
// Also populates auth_user_id column
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

// ── Submit score — SELECT then INSERT or UPDATE ──────────────

export async function submitScore(
  levelId: number,
  moves: number,
  timeSeconds: number
): Promise<{ success: boolean; updated: boolean; error?: string }> {
  const supabase = createClient()
  const playerId = await getAuthUserId()
  const playerName = getPlayerName()
  const newScore = calculateScore(moves, timeSeconds, levelId)

  // Cache for sync reads elsewhere in the app
  if (typeof window !== "undefined") {
    localStorage.setItem("ballsort_cached_user_id", playerId)
  }

  console.log(`[Leaderboard] submitScore level=${levelId} player=${playerId} score=${newScore}`)

  // Step 1: check for existing row for this player + level
  const { data: existing, error: fetchErr } = await supabase
    .from("leaderboard")
    .select("id, score")
    .eq("player_id", playerId)
    .eq("level_id", levelId)
    .maybeSingle()

  if (fetchErr) {
    console.error("[Leaderboard] fetch error:", fetchErr.message, fetchErr.code)
    return { success: false, updated: false, error: fetchErr.message }
  }

  console.log("[Leaderboard] existing row:", existing)

  if (existing) {
    // Row exists — only update if score improved
    if (newScore <= existing.score) {
      console.log(`[Leaderboard] No update — existing ${existing.score} >= new ${newScore}`)
      return { success: true, updated: false }
    }

    const { error: updateErr } = await supabase
      .from("leaderboard")
      .update({
        player_name: playerName,
        moves,
        time_seconds: timeSeconds,
        score: newScore,
        auth_user_id: playerId,
      })
      .eq("id", existing.id)

    if (updateErr) {
      console.error("[Leaderboard] update error:", updateErr.message, updateErr.code, updateErr.details)
      return { success: false, updated: false, error: updateErr.message }
    }

    console.log(`[Leaderboard] Updated row ${existing.id}: ${existing.score} → ${newScore}`)
    return { success: true, updated: true }
  }

  // Step 2: no existing row — insert fresh
  const { error: insertErr } = await supabase.from("leaderboard").insert({
    player_id: playerId,
    player_name: playerName,
    level_id: levelId,
    moves,
    time_seconds: timeSeconds,
    score: newScore,
    auth_user_id: playerId,
  })

  if (insertErr) {
    // Unique constraint violation = concurrent insert, retry as update
    if (insertErr.code === "23505") {
      console.warn("[Leaderboard] Unique conflict — retrying as update")
      const { data: retry } = await supabase
        .from("leaderboard")
        .select("id, score")
        .eq("player_id", playerId)
        .eq("level_id", levelId)
        .maybeSingle()

      if (retry && newScore > retry.score) {
        await supabase
          .from("leaderboard")
          .update({ player_name: playerName, moves, time_seconds: timeSeconds, score: newScore, auth_user_id: playerId })
          .eq("id", retry.id)
      }
      return { success: true, updated: true }
    }

    console.error("[Leaderboard] insert error:", insertErr.message, insertErr.code, insertErr.details)
    return { success: false, updated: false, error: insertErr.message }
  }

  console.log(`[Leaderboard] Inserted new row for level ${levelId}: score=${newScore}`)
  return { success: true, updated: true }
}

// ── Read queries ─────────────────────────────────────────────

export async function getGlobalLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("score", { ascending: false })
    .limit(limit)

  if (error) { console.error("[Leaderboard] getGlobal error:", error.message); return [] }
  return data ?? []
}

export async function getLevelLeaderboard(levelId: number, limit = 20): Promise<LeaderboardEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("level_id", levelId)
    .order("score", { ascending: false })
    .limit(limit)

  if (error) { console.error("[Leaderboard] getLevel error:", error.message); return [] }
  return data ?? []
}

export async function getPlayerBestScores(playerId: string): Promise<LeaderboardEntry[]> {
  if (!playerId) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("player_id", playerId)
    .order("score", { ascending: false })
    .limit(50)

  if (error) { console.error("[Leaderboard] getPlayerBest error:", error.message); return [] }
  return data ?? []
}

export async function getPlayerRank(playerId: string): Promise<number | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("leaderboard")
    .select("player_id, score")
    .order("score", { ascending: false })

  if (error || !data) return null
  const rank = data.findIndex((e) => e.player_id === playerId) + 1
  return rank > 0 ? rank : null
}
