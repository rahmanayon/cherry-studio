// 2048 Puzzle Game Logic
// Tournament-based with countdown scoring system

export interface Tile {
  id: string
  value: number
  x: number
  y: number
  merged?: boolean
  isNew?: boolean
}

export interface Puzzle2048State {
  tiles: Tile[]
  score: number
  combo: number
  gameOver: boolean
  gameWon: boolean
  gameStarted: boolean
  timeRemaining: number
  totalTime: number
  gridSize: number
  moveCount: number
  bestCombo: number
  level: number
  targetsReached: number
  levelTargets: number[]
}

const GRID_SIZE = 4
const NEW_TILE_PROBABILITY = 0.9 // 90% chance to add 2, 10% chance to add 4

export class Puzzle2048Game {
  private state: Puzzle2048State
  private tileIdCounter: number = 0
  private previousState: Tile[] = []

  constructor(timeLimit: number = 180) {
    this.state = {
      tiles: [],
      score: 0,
      combo: 0,
      gameOver: false,
      gameWon: false,
      gameStarted: false,
      timeRemaining: timeLimit,
      totalTime: timeLimit,
      gridSize: GRID_SIZE,
      moveCount: 0,
      bestCombo: 0,
      level: 1,
      targetsReached: 0,
      levelTargets: [256, 512, 1024, 2048, 4096], // Progressive targets for levels
    }

    // Initialize with 2 tiles
    this.addNewTile()
    this.addNewTile()
  }

  getState(): Puzzle2048State {
    return {
      ...this.state,
      tiles: this.state.tiles.map(t => ({ ...t })),
    }
  }

  start(): void {
    this.state.gameStarted = true
  }

  update(deltaTime: number = 1): void {
    if (!this.state.gameStarted || this.state.gameOver) return

    // Update timer
    this.state.timeRemaining = Math.max(0, this.state.timeRemaining - deltaTime / 1000)

    if (this.state.timeRemaining <= 0) {
      this.state.gameOver = true
    }

    // Check win condition (2048 tile)
    if (!this.state.gameWon && this.state.tiles.some(t => t.value === 2048)) {
      this.state.gameWon = true
      this.state.score += 1000 // Win bonus
    }
  }

  move(direction: 'left' | 'right' | 'up' | 'down'): boolean {
    if (this.state.gameOver || !this.state.gameStarted) return false

    this.previousState = JSON.parse(JSON.stringify(this.state.tiles))

    // Reset merge flags
    this.state.tiles.forEach(tile => (tile.merged = false))

    const moved = this.performMove(direction)

    if (moved) {
      this.state.moveCount++
      this.addNewTile()
      this.checkGameOver()
    }

    return moved
  }

  private performMove(direction: 'left' | 'right' | 'up' | 'down'): boolean {
    let grid: (Tile | null)[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null))

    // Build grid from tiles
    for (const tile of this.state.tiles) {
      grid[tile.y][tile.x] = tile
    }

    // Perform move based on direction
    if (direction === 'left') {
      return this.moveHorizontal(grid, true)
    } else if (direction === 'right') {
      return this.moveHorizontal(grid, false)
    } else if (direction === 'up') {
      return this.moveVertical(grid, true)
    } else if (direction === 'down') {
      return this.moveVertical(grid, false)
    }

    return false
  }

  private moveHorizontal(grid: (Tile | null)[][], left: boolean): boolean {
    let moved = false

    for (let y = 0; y < GRID_SIZE; y++) {
      const row = left ? grid[y].slice() : grid[y].slice().reverse()
      const newRow = this.mergeLine(row)
      const resultRow = left ? newRow : newRow.reverse()

      for (let x = 0; x < GRID_SIZE; x++) {
        if (grid[y][x] !== resultRow[x]) {
          moved = true
        }
        grid[y][x] = resultRow[x]
        if (grid[y][x]) {
          grid[y][x]!.x = x
          grid[y][x]!.y = y
        }
      }
    }

    this.state.tiles = grid.flat().filter(t => t !== null) as Tile[]
    return moved
  }

  private moveVertical(grid: (Tile | null)[][], up: boolean): boolean {
    let moved = false

    for (let x = 0; x < GRID_SIZE; x++) {
      const column = up
        ? [grid[0][x], grid[1][x], grid[2][x], grid[3][x]]
        : [grid[3][x], grid[2][x], grid[1][x], grid[0][x]]

      const newColumn = this.mergeLine(column)
      const resultColumn = up ? newColumn : newColumn.reverse()

      for (let y = 0; y < GRID_SIZE; y++) {
        const newTile = resultColumn[y]
        if (grid[y][x] !== newTile) {
          moved = true
        }
        grid[y][x] = newTile
        if (grid[y][x]) {
          grid[y][x]!.x = x
          grid[y][x]!.y = y
        }
      }
    }

    this.state.tiles = grid.flat().filter(t => t !== null) as Tile[]
    return moved
  }

  private mergeLine(line: (Tile | null)[]): (Tile | null)[] {
    // Filter out null values
    let newLine = line.filter(t => t !== null) as Tile[]

    // Merge adjacent tiles with same value
    for (let i = 0; i < newLine.length - 1; i++) {
      if (newLine[i].value === newLine[i + 1].value && !newLine[i].merged && !newLine[i + 1].merged) {
        newLine[i].value *= 2
        newLine[i].merged = true

        const mergePoints = newLine[i].value * (1 + this.state.combo * 0.1)
        this.state.score += Math.floor(mergePoints)
        this.state.combo++

        if (this.state.combo > this.state.bestCombo) {
          this.state.bestCombo = this.state.combo
        }

        newLine.splice(i + 1, 1)
      }
    }

    // Add null values to match grid size
    while (newLine.length < GRID_SIZE) {
      newLine.push(null)
    }

    return newLine
  }

  private addNewTile(): void {
    const emptyPositions = []
    const occupiedPositions = new Set(this.state.tiles.map(t => `${t.x},${t.y}`))

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (!occupiedPositions.has(`${x},${y}`)) {
          emptyPositions.push({ x, y })
        }
      }
    }

    if (emptyPositions.length === 0) return

    const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
    const value = Math.random() < NEW_TILE_PROBABILITY ? 2 : 4

    const newTile: Tile = {
      id: `tile-${this.tileIdCounter++}`,
      value,
      x: randomPos.x,
      y: randomPos.y,
      isNew: true,
    }

    this.state.tiles.push(newTile)
    this.checkLevelMilestones()
  }

  private checkLevelMilestones(): void {
    if (this.state.level <= this.state.levelTargets.length) {
      const currentTarget = this.state.levelTargets[this.state.level - 1]
      const maxTile = Math.max(...this.state.tiles.map(t => t.value))

      if (maxTile >= currentTarget) {
        this.state.level++
        this.state.targetsReached++
        const levelBonus = 500 * this.state.level
        this.state.score += levelBonus
      }
    }
  }

  private checkGameOver(): void {
    // Check if any moves are possible
    if (this.state.tiles.length >= GRID_SIZE * GRID_SIZE) {
      const canMove =
        this.canMoveHorizontal() ||
        this.canMoveVertical() ||
        this.state.tiles.some((t, i) => {
          const neighbors = this.getNeighbors(t.x, t.y)
          return neighbors.some(n => n && n.value === t.value)
        })

      if (!canMove) {
        this.state.gameOver = true
      }
    }
  }

  private canMoveHorizontal(): boolean {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE - 1; x++) {
        const tile1 = this.state.tiles.find(t => t.x === x && t.y === y)
        const tile2 = this.state.tiles.find(t => t.x === x + 1 && t.y === y)

        if (!tile1 || !tile2) return true
        if (tile1.value === tile2.value) return true
      }
    }
    return false
  }

  private canMoveVertical(): boolean {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE - 1; y++) {
        const tile1 = this.state.tiles.find(t => t.x === x && t.y === y)
        const tile2 = this.state.tiles.find(t => t.x === x && t.y === y + 1)

        if (!tile1 || !tile2) return true
        if (tile1.value === tile2.value) return true
      }
    }
    return false
  }

  private getNeighbors(x: number, y: number): (Tile | null)[] {
    return [
      this.state.tiles.find(t => t.x === x - 1 && t.y === y) || null,
      this.state.tiles.find(t => t.x === x + 1 && t.y === y) || null,
      this.state.tiles.find(t => t.x === x && t.y === y - 1) || null,
      this.state.tiles.find(t => t.x === x && t.y === y + 1) || null,
    ]
  }

  undo(): void {
    if (this.previousState.length > 0) {
      this.state.tiles = JSON.parse(JSON.stringify(this.previousState))
      this.previousState = []
    }
  }

  getFinalScore(): { score: number; level: number; targetsReached: number; bestCombo: number; timeBonus: number } {
    const timeBonus = Math.floor(this.state.timeRemaining * 5)
    const levelBonus = (this.state.level - 1) * 100
    const targetBonus = this.state.targetsReached * 250
    return {
      score: this.state.score + timeBonus + levelBonus + targetBonus,
      level: this.state.level,
      targetsReached: this.state.targetsReached,
      bestCombo: this.state.bestCombo,
      timeBonus,
    }
  }
}
