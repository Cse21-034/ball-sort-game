export interface Ball {
  id: string
  color: BallColor
}

export type BallColor = "red" | "blue" | "green" | "yellow" | "purple" | "orange" | "pink" | "cyan"

export interface Tube {
  id: string
  balls: Ball[]
  capacity: number
}

export interface Level {
  id: number
  difficulty: "beginner" | "easy" | "medium" | "hard" | "expert"
  tubes: Tube[]
  tubeCapacity: number
}

export interface GameState {
  level: Level
  moves: number
  selectedTubeId: string | null
  moveHistory: MoveRecord[]
  isComplete: boolean
  startTime: number
  elapsedTime: number
}

export interface MoveRecord {
  fromTubeId: string
  toTubeId: string
  balls: Ball[]
}

export interface SaveData {
  completedLevels: number[]
  coins: number
  hintsRemaining: number
  undosRemaining: number
  soundEnabled: boolean
  musicEnabled: boolean
  colorBlindMode: boolean
  language: string
  highScores: Record<number, { moves: number; time: number }>
}

export const BALL_COLORS: BallColor[] = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "cyan"]

export const BALL_COLOR_MAP: Record<BallColor, string> = {
  red: "bg-gradient-to-br from-[#ff4d6d] via-[#ff2a4d] to-[#c9184a]",
  blue: "bg-gradient-to-br from-[#4cc9f0] via-[#4895ef] to-[#3f37c9]",
  green: "bg-gradient-to-br from-[#80ffdb] via-[#5cdb95] to-[#05a167]",
  yellow: "bg-gradient-to-br from-[#ffea00] via-[#ffd000] to-[#ffb700]",
  purple: "bg-gradient-to-br from-[#d8bbff] via-[#b388ff] to-[#7b2cbf]",
  orange: "bg-gradient-to-br from-[#ffb347] via-[#ff9500] to-[#ff6d00]",
  pink: "bg-gradient-to-br from-[#ffafcc] via-[#ff85a1] to-[#ff5c8a]",
  cyan: "bg-gradient-to-br from-[#00f5d4] via-[#00bbf9] to-[#00a6fb]",
}

export const BALL_COLOR_BLIND_MAP: Record<BallColor, string> = {
  red: 'bg-gradient-to-br from-[#ff4d6d] via-[#ff2a4d] to-[#c9184a] after:content-["●"]',
  blue: 'bg-gradient-to-br from-[#4cc9f0] via-[#4895ef] to-[#3f37c9] after:content-["▲"]',
  green: 'bg-gradient-to-br from-[#80ffdb] via-[#5cdb95] to-[#05a167] after:content-["■"]',
  yellow: 'bg-gradient-to-br from-[#ffea00] via-[#ffd000] to-[#ffb700] after:content-["◆"]',
  purple: 'bg-gradient-to-br from-[#d8bbff] via-[#b388ff] to-[#7b2cbf] after:content-["★"]',
  orange: 'bg-gradient-to-br from-[#ffb347] via-[#ff9500] to-[#ff6d00] after:content-["✕"]',
  pink: 'bg-gradient-to-br from-[#ffafcc] via-[#ff85a1] to-[#ff5c8a] after:content-["○"]',
  cyan: 'bg-gradient-to-br from-[#00f5d4] via-[#00bbf9] to-[#00a6fb] after:content-["△"]',
}
