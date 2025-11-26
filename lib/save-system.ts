import type { SaveData } from "./game-types"

const SAVE_KEY = "ballsort_save_v1"

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
}

export function loadSaveData(): SaveData {
  if (typeof window === "undefined") return defaultSaveData

  try {
    const saved = localStorage.getItem(SAVE_KEY)
    if (saved) {
      return { ...defaultSaveData, ...JSON.parse(saved) }
    }
  } catch (e) {
    console.error("Failed to load save data:", e)
  }

  return defaultSaveData
}

export function saveSaveData(data: SaveData): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error("Failed to save data:", e)
  }
}

export function markLevelComplete(levelId: number, moves: number, time: number): SaveData {
  const data = loadSaveData()

  if (!data.completedLevels.includes(levelId)) {
    data.completedLevels.push(levelId)
    data.coins += 10 // Reward for completing level
  }

  const existingScore = data.highScores[levelId]
  if (!existingScore || moves < existingScore.moves) {
    data.highScores[levelId] = { moves, time }
  }

  saveSaveData(data)
  return data
}

export function useHint(): SaveData | null {
  const data = loadSaveData()

  if (data.hintsRemaining > 0) {
    data.hintsRemaining--
    saveSaveData(data)
    return data
  }

  return null
}

export function useUndo(): SaveData | null {
  const data = loadSaveData()

  if (data.undosRemaining > 0) {
    data.undosRemaining--
    saveSaveData(data)
    return data
  }

  return null
}

export function addCoins(amount: number): SaveData {
  const data = loadSaveData()
  data.coins += amount
  saveSaveData(data)
  return data
}

export function spendCoins(amount: number): SaveData | null {
  const data = loadSaveData()

  if (data.coins >= amount) {
    data.coins -= amount
    saveSaveData(data)
    return data
  }

  return null
}

export function buyHints(count: number): SaveData | null {
  const cost = count * 20
  const data = loadSaveData()

  if (data.coins >= cost) {
    data.coins -= cost
    data.hintsRemaining += count
    saveSaveData(data)
    return data
  }

  return null
}

export function buyUndos(count: number): SaveData | null {
  const cost = count * 10
  const data = loadSaveData()

  if (data.coins >= cost) {
    data.coins -= cost
    data.undosRemaining += count
    saveSaveData(data)
    return data
  }

  return null
}

export function addHints(count: number): SaveData {
  const data = loadSaveData()
  data.hintsRemaining += count
  saveSaveData(data)
  return data
}

export function addUndos(count: number): SaveData {
  const data = loadSaveData()
  data.undosRemaining += count
  saveSaveData(data)
  return data
}

export function updateSettings(
  settings: Partial<Pick<SaveData, "soundEnabled" | "musicEnabled" | "colorBlindMode" | "language">>,
): SaveData {
  const data = loadSaveData()
  Object.assign(data, settings)
  saveSaveData(data)
  return data
}
