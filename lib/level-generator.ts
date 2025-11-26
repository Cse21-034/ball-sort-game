import { type Level, type Tube, type Ball, BALL_COLORS } from "./game-types"

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export function generateLevel(levelId: number, difficulty: Level["difficulty"]): Level {
  const config = getDifficultyConfig(difficulty)
  const { numColors, numEmptyTubes, tubeCapacity } = config

  const colors = BALL_COLORS.slice(0, numColors)
  const balls: Ball[] = []

  // Create balls - each color appears tubeCapacity times
  for (const color of colors) {
    for (let i = 0; i < tubeCapacity; i++) {
      balls.push({ id: generateId(), color })
    }
  }

  // Shuffle balls
  const shuffledBalls = shuffleArray(balls)

  // Create tubes with balls
  const tubes: Tube[] = []
  let ballIndex = 0

  for (let i = 0; i < numColors; i++) {
    const tubeBalls: Ball[] = []
    for (let j = 0; j < tubeCapacity; j++) {
      tubeBalls.push(shuffledBalls[ballIndex++])
    }
    tubes.push({
      id: generateId(),
      balls: tubeBalls,
      capacity: tubeCapacity,
    })
  }

  // Add empty tubes
  for (let i = 0; i < numEmptyTubes; i++) {
    tubes.push({
      id: generateId(),
      balls: [],
      capacity: tubeCapacity,
    })
  }

  return {
    id: levelId,
    difficulty,
    tubes,
    tubeCapacity,
  }
}

function getDifficultyConfig(difficulty: Level["difficulty"]) {
  switch (difficulty) {
    case "beginner":
      return { numColors: 3, numEmptyTubes: 2, tubeCapacity: 4 }
    case "easy":
      return { numColors: 4, numEmptyTubes: 2, tubeCapacity: 4 }
    case "medium":
      return { numColors: 5, numEmptyTubes: 2, tubeCapacity: 4 }
    case "hard":
      return { numColors: 6, numEmptyTubes: 2, tubeCapacity: 4 }
    case "expert":
      return { numColors: 7, numEmptyTubes: 2, tubeCapacity: 4 }
  }
}

export function getLevelDifficulty(levelId: number): Level["difficulty"] {
  if (levelId <= 20) return "beginner"
  if (levelId <= 50) return "easy"
  if (levelId <= 100) return "medium"
  if (levelId <= 200) return "hard"
  return "expert"
}

export function generateAllLevels(count = 500): Level[] {
  const levels: Level[] = []
  for (let i = 1; i <= count; i++) {
    const difficulty = getLevelDifficulty(i)
    levels.push(generateLevel(i, difficulty))
  }
  return levels
}
