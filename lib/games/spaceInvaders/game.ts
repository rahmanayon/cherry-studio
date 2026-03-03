// Space Invaders Game Logic
// Tournament-based with countdown scoring system

export interface Enemy {
  id: string
  x: number
  y: number
  width: number
  height: number
  health: number
  velocity: number
  type: 'basic' | 'strong' | 'boss'
  points: number
}

export interface Projectile {
  id: string
  x: number
  y: number
  velocity: number
  width: number
  height: number
  fromPlayer: boolean
  damage: number
}

export interface SpaceInvadersState {
  playerX: number
  playerY: number
  playerWidth: number
  playerHeight: number
  playerHealth: number
  maxPlayerHealth: number
  enemies: Enemy[]
  projectiles: Projectile[]
  score: number
  combo: number
  level: number
  gameOver: boolean
  gameStarted: boolean
  timeRemaining: number
  totalTime: number
  waveCount: number
  killCount: number
}

const GAME_WIDTH = 400
const GAME_HEIGHT = 600
const PLAYER_WIDTH = 40
const PLAYER_HEIGHT = 50
const PLAYER_SPEED = 8
const PLAYER_HEALTH = 100
const ENEMY_BULLET_SPEED = 4
const PLAYER_BULLET_SPEED = -8
const WAVE_SPAWN_INTERVAL = 180 // frames

export class SpaceInvadersGame {
  private state: SpaceInvadersState
  private frameCount: number = 0
  private waveCounter: number = 0
  private projectileIdCounter: number = 0
  private enemyIdCounter: number = 0
  private keysPressed: Map<string, boolean> = new Map()

  constructor(timeLimit: number = 120) {
    this.state = {
      playerX: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
      playerY: GAME_HEIGHT - 80,
      playerWidth: PLAYER_WIDTH,
      playerHeight: PLAYER_HEIGHT,
      playerHealth: PLAYER_HEALTH,
      maxPlayerHealth: PLAYER_HEALTH,
      enemies: [],
      projectiles: [],
      score: 0,
      combo: 0,
      level: 1,
      gameOver: false,
      gameStarted: false,
      timeRemaining: timeLimit,
      totalTime: timeLimit,
      waveCount: 0,
      killCount: 0,
    }
  }

  getState(): SpaceInvadersState {
    return {
      ...this.state,
      enemies: this.state.enemies.map(e => ({ ...e })),
      projectiles: this.state.projectiles.map(p => ({ ...p })),
    }
  }

  start(): void {
    this.state.gameStarted = true
    this.spawnWave()
  }

  keyDown(key: string): void {
    this.keysPressed.set(key, true)
  }

  keyUp(key: string): void {
    this.keysPressed.set(key, false)
  }

  shoot(): void {
    if (!this.state.gameStarted || this.state.gameOver) return

    const projectile: Projectile = {
      id: `proj-${this.projectileIdCounter++}`,
      x: this.state.playerX + this.state.playerWidth / 2 - 2,
      y: this.state.playerY,
      velocity: PLAYER_BULLET_SPEED,
      width: 4,
      height: 15,
      fromPlayer: true,
      damage: 10,
    }

    this.state.projectiles.push(projectile)
  }

  update(deltaTime: number = 1): void {
    if (!this.state.gameStarted || this.state.gameOver) return

    // Update timer
    this.state.timeRemaining = Math.max(0, this.state.timeRemaining - deltaTime / 1000)

    if (this.state.timeRemaining <= 0) {
      this.state.gameOver = true
      return
    }

    // Update player position
    if (this.keysPressed.get('ArrowLeft') || this.keysPressed.get('a')) {
      this.state.playerX = Math.max(0, this.state.playerX - PLAYER_SPEED)
    }
    if (this.keysPressed.get('ArrowRight') || this.keysPressed.get('d')) {
      this.state.playerX = Math.min(GAME_WIDTH - this.state.playerWidth, this.state.playerX + PLAYER_SPEED)
    }

    // Update projectiles
    for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
      const proj = this.state.projectiles[i]
      proj.y += proj.velocity

      // Remove off-screen projectiles
      if (proj.y < -proj.height || proj.y > GAME_HEIGHT) {
        this.state.projectiles.splice(i, 1)
        continue
      }

      // Check collision with enemies
      if (proj.fromPlayer) {
        for (let j = this.state.enemies.length - 1; j >= 0; j--) {
          const enemy = this.state.enemies[j]
          if (this.checkCollision(proj, enemy)) {
            enemy.health -= proj.damage

            // Kill enemy if health depleted
            if (enemy.health <= 0) {
              this.scoreKill(enemy)
              this.state.enemies.splice(j, 1)
            }

            // Remove projectile
            this.state.projectiles.splice(i, 1)
            break
          }
        }
      } else {
        // Enemy projectile hitting player
        if (this.checkCollision(proj, {
          x: this.state.playerX,
          y: this.state.playerY,
          width: this.state.playerWidth,
          height: this.state.playerHeight,
        })) {
          this.state.playerHealth -= proj.damage
          this.state.combo = 0

          if (this.state.playerHealth <= 0) {
            this.state.gameOver = true
          }

          this.state.projectiles.splice(i, 1)
        }
      }
    }

    // Update enemies
    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      const enemy = this.state.enemies[i]

      // Simple movement pattern
      enemy.x += Math.sin(this.frameCount * 0.02) * 0.5
      enemy.y += enemy.velocity

      // Randomly shoot
      if (Math.random() < 0.02) {
        this.enemyShoot(enemy)
      }

      // Remove off-screen enemies
      if (enemy.y > GAME_HEIGHT) {
        this.state.enemies.splice(i, 1)
      }

      // Collision with player
      if (this.checkCollision(enemy, {
        x: this.state.playerX,
        y: this.state.playerY,
        width: this.state.playerWidth,
        height: this.state.playerHeight,
      })) {
        this.state.playerHealth -= 15
        this.state.enemies.splice(i, 1)

        if (this.state.playerHealth <= 0) {
          this.state.gameOver = true
        }
      }
    }

    // Spawn waves
    this.waveCounter++
    if (this.waveCounter >= WAVE_SPAWN_INTERVAL) {
      this.spawnWave()
      this.waveCounter = 0
    }

    // Increase difficulty over time
    if (this.frameCount % 600 === 0) {
      this.state.level++
    }

    this.frameCount++
  }

  private spawnWave(): void {
    const enemyCount = 3 + this.state.waveCount
    const enemyType: ('basic' | 'strong')[] = this.state.waveCount % 3 === 2 ? ['strong'] : ['basic']

    for (let i = 0; i < enemyCount; i++) {
      const type = enemyType[Math.floor(Math.random() * enemyType.length)]
      const isStrong = type === 'strong'

      const enemy: Enemy = {
        id: `enemy-${this.enemyIdCounter++}`,
        x: Math.random() * (GAME_WIDTH - 40),
        y: -40,
        width: 40,
        height: 40,
        health: isStrong ? 20 : 10,
        velocity: 1 + this.state.level * 0.2,
        type: isStrong ? 'strong' : 'basic',
        points: isStrong ? 50 : 25,
      }

      this.state.enemies.push(enemy)
    }

    this.state.waveCount++
  }

  private enemyShoot(enemy: Enemy): void {
    const projectile: Projectile = {
      id: `enemy-proj-${this.projectileIdCounter++}`,
      x: enemy.x + enemy.width / 2 - 2,
      y: enemy.y + enemy.height,
      velocity: ENEMY_BULLET_SPEED,
      width: 4,
      height: 12,
      fromPlayer: false,
      damage: isStrong(enemy) ? 20 : 10,
    }

    this.state.projectiles.push(projectile)
  }

  private scoreKill(enemy: Enemy): void {
    this.state.killCount++
    this.state.combo++

    // Time-based multiplier
    const timeMultiplier = 1 + (this.state.timeRemaining / this.state.totalTime) * 0.5
    const comboBonus = this.state.combo * 2
    const levelBonus = this.state.level * 5

    const points = Math.floor((enemy.points * timeMultiplier + comboBonus + levelBonus) * (1 + this.state.combo * 0.1))
    this.state.score += points
  }

  private checkCollision(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    )
  }

  getFinalScore(): { score: number; level: number; kills: number; timeBonus: number } {
    const timeBonus = Math.floor(this.state.timeRemaining * 15)
    return {
      score: this.state.score + timeBonus,
      level: this.state.level,
      kills: this.state.killCount,
      timeBonus,
    }
  }
}

function isStrong(enemy: Enemy): boolean {
  return enemy.type === 'strong'
}
