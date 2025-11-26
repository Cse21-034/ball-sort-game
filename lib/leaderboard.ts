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

// Generate or get player ID from localStorage
export function getPlayerId(): string {
  if (typeof window === "undefined") return ""

  let playerId = localStorage.getItem("ballsort_player_id")
  if (!playerId) {
    playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem("ballsort_player_id", playerId)
  }
  return playerId
}

// Get player name from localStorage
export function getPlayerName(): string {
  if (typeof window === "undefined") return "Player"
  return localStorage.getItem("ballsort_player_name") || "Player"
}

// Set player name
export function setPlayerName(name: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("ballsort_player_name", name)
}

// Calculate score based on moves and time
export function calculateScore(moves: number, timeSeconds: number, levelId: number): number {
  const baseScore = 10000
  const movePenalty = moves * 50
  const timePenalty = timeSeconds * 5
  const levelBonus = levelId * 100
  return Math.max(0, baseScore - movePenalty - timePenalty + levelBonus)
}

// Submit score to leaderboard
export async function submitScore(
  levelId: number,
  moves: number,
  timeSeconds: number,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const playerId = getPlayerId()
  const playerName = getPlayerName()
  const score = calculateScore(moves, timeSeconds, levelId)

  const { error } = await supabase.from("leaderboard").insert({
    player_id: playerId,
    player_name: playerName,
    level_id: levelId,
    moves,
    time_seconds: timeSeconds,
    score,
  })

  if (error) {
    console.error("Error submitting score:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Get global leaderboard (top scores across all levels)
export async function getGlobalLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("score", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }

  return data || []
}

// Get leaderboard for specific level
export async function getLevelLeaderboard(levelId: number, limit = 20): Promise<LeaderboardEntry[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("level_id", levelId)
    .order("score", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching level leaderboard:", error)
    return []
  }

  return data || []
}

// Get player's rank
export async function getPlayerRank(playerId: string): Promise<number | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("leaderboard")
    .select("player_id, score")
    .order("score", { ascending: false })

  if (error || !data) return null

  const rank = data.findIndex((entry) => entry.player_id === playerId) + 1
  return rank > 0 ? rank : null
}

// Get player's best scores
export async function getPlayerBestScores(playerId: string): Promise<LeaderboardEntry[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("player_id", playerId)
    .order("score", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching player scores:", error)
    return []
  }

  return data || []
}
