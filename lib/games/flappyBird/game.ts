// Flappy Bird Game Logic
// Tournament-based with countdown scoring system

export interface FlappyBirdState {
  birdY: number
  birdVelocity: number
  birdRotation: number
  pipes: Pipe[]
  score: number
  combo: number
  gameOver: boolean
  gameStarted: boolean
  timeRemaining: number
  totalTime: number
  pipeGap: number
  pipeWidth: number
  groundHeight: number
  level: number
  pipesPassed: number
  bestCombo: number
}

export interface Pipe {
  id: string
  x: number
  topHeight: number
  passed: boolean
}

const GRAVITY = 0.6
const FLAP_STRENGTH = -12
const PIPE_SPEED = 5
const PIPE_SPAWN_RATE = 120 // frames
const GROUND_HEIGHT = 80
const BIRD_SIZE = 40
const PIPE_GAP = 120
const PIPE_WIDTH = 80
const GAME_WIDTH = 400
const GAME_HEIGHT = 600

export class FlappyBirdGame {
  private state: FlappyBirdState
  private frameCount: number = 0
  private pipeSpawnCounter: number = 0

  constructor(timeLimit: number = 120) {
    this.state = {
      birdY: GAME_HEIGHT / 2,
      birdVelocity: 0,
      birdRotation: 0,
      pipes: [],
      score: 0,
      combo: 0,
      gameOver: false,
      gameStarted: false,
      timeRemaining: timeLimit,
      totalTime: timeLimit,
      pipeGap: PIPE_GAP,
      pipeWidth: PIPE_WIDTH,
      groundHeight: GROUND_HEIGHT,
      level: 1,
      pipesPassed: 0,
      bestCombo: 0,
    }
  }

  getState(): FlappyBirdState {
    return { ...this.state }
  }

  start(): void {
    this.state.gameStarted = true
  }

  flap(): void {
    if (!this.state.gameOver && this.state.gameStarted) {
      this.state.birdVelocity = FLAP_STRENGTH
    }
  }

  update(deltaTime: number = 1): void {
    if (!this.state.gameStarted || this.state.gameOver) return

    // Update timer
    this.state.timeRemaining = Math.max(0, this.state.timeRemaining - deltaTime / 1000)

    if (this.state.timeRemaining <= 0) {
      this.state.gameOver = true
      return
    }

    // Apply gravity
    this.state.birdVelocity += GRAVITY
    this.state.birdY += this.state.birdVelocity

    // Bird rotation based on velocity
    this.state.birdRotation = Math.max(-45, Math.min(45, this.state.birdVelocity * 3))

    // Collision detection - ground
    if (this.state.birdY + BIRD_SIZE / 2 >= GAME_HEIGHT - this.state.groundHeight) {
      this.state.gameOver = true
      return
    }

    // Collision detection - ceiling
    if (this.state.birdY - BIRD_SIZE / 2 <= 0) {
      this.state.gameOver = true
      return
    }

    // Spawn pipes
    this.pipeSpawnCounter++
    if (this.pipeSpawnCounter >= PIPE_SPAWN_RATE) {
      this.spawnPipe()
      this.pipeSpawnCounter = 0
    }

    // Update pipes
    this.state.pipes = this.state.pipes.filter(pipe => pipe.x > -this.state.pipeWidth)

    for (const pipe of this.state.pipes) {
      pipe.x -= PIPE_SPEED

      // Check collision with bird
      if (this.checkPipeCollision(pipe)) {
        this.state.gameOver = true
        return
      }

      // Check if pipe passed
      if (!pipe.passed && pipe.x + this.state.pipeWidth < GAME_WIDTH / 2 - BIRD_SIZE / 2) {
        pipe.passed = true
        this.scorePoint()
      }
    }

    this.frameCount++
  }

  private spawnPipe(): void {
    const minTopHeight = 50
    const maxTopHeight = GAME_HEIGHT - this.state.groundHeight - this.state.pipeGap - 50

    const topHeight = minTopHeight + Math.random() * (maxTopHeight - minTopHeight)

    const pipe: Pipe = {
      id: `pipe-${Date.now()}-${Math.random()}`,
      x: GAME_WIDTH,
      topHeight,
      passed: false,
    }

    this.state.pipes.push(pipe)
  }

  private checkPipeCollision(pipe: Pipe): boolean {
    const birdX = GAME_WIDTH / 2
    const birdLeft = birdX - BIRD_SIZE / 2
    const birdRight = birdX + BIRD_SIZE / 2
    const birdTop = this.state.birdY - BIRD_SIZE / 2
    const birdBottom = this.state.birdY + BIRD_SIZE / 2

    const pipeLeft = pipe.x
    const pipeRight = pipe.x + this.state.pipeWidth
    const pipeTopBottom = pipe.topHeight
    const pipeBottomTop = pipe.topHeight + this.state.pipeGap

    // Check if bird overlaps with pipe
    if (birdRight > pipeLeft && birdLeft < pipeRight) {
      if (birdTop < pipeTopBottom || birdBottom > pipeBottomTop) {
        return true
      }
    }

    return false
  }

  private scorePoint(): void {
    this.state.pipesPassed++

    // Level up every 5 pipes passed
    if (this.state.pipesPassed % 5 === 0) {
      this.levelUp()
    }

    // Base score depends on remaining time (urgency multiplier)
    const timeMultiplier = 1 + (this.state.timeRemaining / this.state.totalTime) * 0.5
    const levelMultiplier = 1 + (this.state.level - 1) * 0.3

    this.state.combo++
    if (this.state.combo > this.state.bestCombo) {
      this.state.bestCombo = this.state.combo
    }

    const comboBonus = Math.floor(this.state.combo * 1.1)
    const levelBonus = (this.state.level - 1) * 5
    const points = Math.floor((10 * timeMultiplier * levelMultiplier + comboBonus + levelBonus) * (1 + this.state.combo * 0.1))

    this.state.score += points
  }

  private levelUp(): void {
    this.state.level++
    // Increase difficulty: reduce pipe gap and increase pipe speed
    this.state.pipeGap = Math.max(90, PIPE_GAP - this.state.level * 5)
  }

  resetCombo(): void {
    this.state.combo = 0
  }

  pause(): void {
    // For tournament use
  }

  resume(): void {
    // For tournament use
  }

  getFinalScore(): { score: number; level: number; pipesPassed: number; bestCombo: number; timeBonus: number } {
    const timeBonus = Math.floor(this.state.timeRemaining * 10)
    const levelBonus = (this.state.level - 1) * 50
    return {
      score: this.state.score + timeBonus + levelBonus,
      level: this.state.level,
      pipesPassed: this.state.pipesPassed,
      bestCombo: this.state.bestCombo,
      timeBonus,
    }
  }
}
