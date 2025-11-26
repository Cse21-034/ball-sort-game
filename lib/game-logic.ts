import type { Tube, Ball, Level } from "./game-types"

export function canMoveBall(fromTube: Tube, toTube: Tube): boolean {
  // Can't move from empty tube
  if (fromTube.balls.length === 0) return false

  // Can't move to full tube
  if (toTube.balls.length >= toTube.capacity) return false

  // Can move to empty tube
  if (toTube.balls.length === 0) return true

  // Can only move if top colors match
  const fromTopBall = fromTube.balls[fromTube.balls.length - 1]
  const toTopBall = toTube.balls[toTube.balls.length - 1]

  return fromTopBall.color === toTopBall.color
}

export function getMovableBalls(tube: Tube): Ball[] {
  if (tube.balls.length === 0) return []

  const balls: Ball[] = []
  const topColor = tube.balls[tube.balls.length - 1].color

  for (let i = tube.balls.length - 1; i >= 0; i--) {
    if (tube.balls[i].color === topColor) {
      balls.unshift(tube.balls[i])
    } else {
      break
    }
  }

  return balls
}

export function moveBalls(fromTube: Tube, toTube: Tube): { newFromTube: Tube; newToTube: Tube; movedBalls: Ball[] } {
  const movableBalls = getMovableBalls(fromTube)
  const availableSpace = toTube.capacity - toTube.balls.length
  const ballsToMove = movableBalls.slice(0, availableSpace)

  const newFromTube: Tube = {
    ...fromTube,
    balls: fromTube.balls.slice(0, fromTube.balls.length - ballsToMove.length),
  }

  const newToTube: Tube = {
    ...toTube,
    balls: [...toTube.balls, ...ballsToMove],
  }

  return { newFromTube, newToTube, movedBalls: ballsToMove }
}

export function isTubeComplete(tube: Tube): boolean {
  if (tube.balls.length !== tube.capacity) return false
  if (tube.balls.length === 0) return true

  const firstColor = tube.balls[0].color
  return tube.balls.every((ball) => ball.color === firstColor)
}

export function isLevelComplete(tubes: Tube[]): boolean {
  return tubes.every((tube) => tube.balls.length === 0 || isTubeComplete(tube))
}

export function findHint(tubes: Tube[]): { fromIndex: number; toIndex: number } | null {
  for (let i = 0; i < tubes.length; i++) {
    for (let j = 0; j < tubes.length; j++) {
      if (i === j) continue
      if (canMoveBall(tubes[i], tubes[j])) {
        // Prefer moves that make progress
        const movableBalls = getMovableBalls(tubes[i])
        const toTube = tubes[j]

        // Skip if moving to empty tube and source tube has only one color
        if (toTube.balls.length === 0 && isTubeComplete(tubes[i])) continue

        // Skip if source tube would be empty and destination is empty
        if (tubes[i].balls.length === movableBalls.length && toTube.balls.length === 0) continue

        return { fromIndex: i, toIndex: j }
      }
    }
  }

  // Fallback: any valid move
  for (let i = 0; i < tubes.length; i++) {
    for (let j = 0; j < tubes.length; j++) {
      if (i === j) continue
      if (canMoveBall(tubes[i], tubes[j])) {
        return { fromIndex: i, toIndex: j }
      }
    }
  }

  return null
}

export function cloneLevel(level: Level): Level {
  return {
    ...level,
    tubes: level.tubes.map((tube) => ({
      ...tube,
      balls: tube.balls.map((ball) => ({ ...ball })),
    })),
  }
}
