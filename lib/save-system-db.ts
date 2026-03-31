// ============================================================
// lib/save-system-db.ts
// Supabase-backed save system.
// localStorage = fast local cache
// Supabase = persistent source of truth
// ============================================================

import type { SaveData } from "./game-types"
import { createClient } from "@/lib/supabase/client"

const SAVE_KEY = "ballsort_save_v2"

const defaultSaveData: SaveData = {
  completedLevels: [],
  coins: 100,
  hintsRemaining: 5,
  undosRemaining: 10,
  soundEnabled: true,
  musicEnabled: true,
  colorBlindMode: false,
  language: "en",
  highScores: {},
  isPremium: false,
}

// ── Local cache helpers ─────────────────────────────────────

function readLocalCache(): SaveData {
  if (typeof window === "undefined") return defaultSaveData
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    return raw ? { ...defaultSaveData, ...JSON.parse(raw) } : defaultSaveData
  } catch {
    return defaultSaveData
  }
}

function writeLocalCache(data: SaveData): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch {
    // storage full — ignore
  }
}

// ── DB row → SaveData ────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSaveData(row: any): SaveData {
  return {
    completedLevels: row.completed_levels ?? [],
    coins: row.coins ?? 100,
    hintsRemaining: row.hints_remaining ?? 5,
    undosRemaining: row.undos_remaining ?? 10,
    soundEnabled: row.sound_enabled ?? true,
    musicEnabled: row.music_enabled ?? true,
    colorBlindMode: row.color_blind_mode ?? false,
    language: row.language ?? "en",
    highScores: row.high_scores ?? {},
    isPremium: row.is_premium ?? false,
  }
}

// ── SaveData → DB row ────────────────────────────────────────

function saveDataToRow(userId: string, data: SaveData) {
  return {
    user_id: userId,
    coins: data.coins,
    hints_remaining: data.hintsRemaining,
    undos_remaining: data.undosRemaining,
    completed_levels: data.completedLevels,
    high_scores: data.highScores,
    sound_enabled: data.soundEnabled,
    music_enabled: data.musicEnabled,
    color_blind_mode: data.colorBlindMode,
    language: data.language,
    is_premium: data.isPremium,
  }
}

// ── Public API ───────────────────────────────────────────────

/**
 * Load save data. Tries Supabase first; falls back to local cache.
 * Also seeds local cache from DB so the game can run immediately.
 */
export async function loadSaveDataFromDB(): Promise<SaveData> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return readLocalCache()

  const { data, error } = await supabase
    .from("user_save_data")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error || !data) {
    // First time — create a row seeded from local cache (migration path)
    const local = readLocalCache()
    await supabase
      .from("user_save_data")
      .upsert(saveDataToRow(user.id, local), { onConflict: "user_id" })
    return local
  }

  const save = rowToSaveData(data)
  writeLocalCache(save) // keep local in sync
  return save
}

/**
 * Persist save data to both local cache and Supabase.
 */
export async function persistSaveData(data: SaveData): Promise<void> {
  writeLocalCache(data)

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from("user_save_data")
    .upsert(saveDataToRow(user.id, data), { onConflict: "user_id" })
}

// ── Game actions (mirrors save-system.ts but persists to DB) ─

export async function markLevelCompleteDB(
  levelId: number,
  moves: number,
  time: number
): Promise<SaveData> {
  const data = readLocalCache()

  if (!data.completedLevels.includes(levelId)) {
    data.completedLevels = [...data.completedLevels, levelId]
    data.coins += 10
  }

  const existing = data.highScores[levelId]
  if (!existing || moves < existing.moves) {
    data.highScores = { ...data.highScores, [levelId]: { moves, time } }
  }

  await persistSaveData(data)
  return data
}

export async function useHintDB(): Promise<SaveData | null> {
  const data = readLocalCache()
  if (data.hintsRemaining <= 0) return null
  data.hintsRemaining -= 1
  await persistSaveData(data)
  return data
}

export async function useUndoDB(): Promise<SaveData | null> {
  const data = readLocalCache()
  if (data.undosRemaining <= 0) return null
  data.undosRemaining -= 1
  await persistSaveData(data)
  return data
}

export async function addCoinsDB(amount: number): Promise<SaveData> {
  const data = readLocalCache()
  data.coins += amount
  await persistSaveData(data)
  return data
}

export async function buyHintsDB(count: number): Promise<SaveData | null> {
  const data = readLocalCache()
  const cost = count * 20
  if (data.coins < cost) return null
  data.coins -= cost
  data.hintsRemaining += count
  await persistSaveData(data)
  return data
}

export async function buyUndosDB(count: number): Promise<SaveData | null> {
  const data = readLocalCache()
  const cost = count * 10
  if (data.coins < cost) return null
  data.coins -= cost
  data.undosRemaining += count
  await persistSaveData(data)
  return data
}

export async function addHintsDB(count: number): Promise<SaveData> {
  const data = readLocalCache()
  data.hintsRemaining += count
  await persistSaveData(data)
  return data
}

export async function addUndosDB(count: number): Promise<SaveData> {
  const data = readLocalCache()
  data.undosRemaining += count
  await persistSaveData(data)
  return data
}

export async function updateSettingsDB(
  settings: Partial<
    Pick<
      SaveData,
      "soundEnabled" | "musicEnabled" | "colorBlindMode" | "language"
    >
  >
): Promise<SaveData> {
  const data = { ...readLocalCache(), ...settings }
  await persistSaveData(data)
  return data
}

/**
 * Purchase premium — one-time unlock of ad-free experience.
 * TODO: In production, integrate with Stripe/RevenueCat for real payment processing.
 */
export async function purchasePremiumDB(): Promise<SaveData> {
  const data = readLocalCache()
  data.isPremium = true
  await persistSaveData(data)
  return data
}
