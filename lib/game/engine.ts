import { PhysicsEngine } from '@/lib/physics/engine'
import { PhysicsBody, Vector2D } from '@/lib/physics/types'
import { AssetManager } from '@/lib/assets/manager'
import { EnvironmentManager } from '@/lib/environment/manager'
import { ScoringSystem } from '@/lib/scoring/system'
import { LevelData, PlacedObject } from '@/lib/levelBuilder/types'

/**
 * Game Engine - orchestrates physics, rendering, scoring, and gameplay
 */
export class GameEngine {
  private physicsEngine: PhysicsEngine
  private assetManager: AssetManager
  private environmentManager: EnvironmentManager
  private scoringSystem: ScoringSystem
  private levelData: LevelData | null = null
  private gameObjects: Map<string, { object: PlacedObject; body: PhysicsBody }> = new Map()
  private isRunning: boolean = false
  private isPaused: boolean = false
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private frameTime: number = 0
  private gameSpeed: number = 1.0
  private camera: { x: number; y: number; zoom: number } = { x: 0, y: 0, zoom: 1 }

  constructor(
    physics?: PhysicsEngine,
    assets?: AssetManager,
    environment?: EnvironmentManager,
    scoring?: ScoringSystem
  ) {
    this.physicsEngine = physics || new PhysicsEngine()
    this.assetManager = assets || new AssetManager()
    this.environmentManager = environment || new EnvironmentManager()
    this.scoringSystem = scoring || new ScoringSystem()
  }

  /**
   * Initialize game with a level
   */
  async initializeLevel(levelData: LevelData): Promise<void> {
    this.levelData = levelData

    // Clear previous state
    this.gameObjects.clear()
    this.physicsEngine = new PhysicsEngine(levelData.environment.gravity)
    this.environmentManager.clear()

    // Create physics bodies from level objects
    levelData.objects.forEach(obj => {
      const body: PhysicsBody = {
        id: obj.id,
        position: { ...obj.position },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: obj.properties.mass || 1,
        width: obj.width,
        height: obj.height,
        isStatic: obj.type === 'platform' || obj.properties.isStatic || false,
        rotation: obj.rotation,
        angularVelocity: 0,
        restitution: 0.6,
        friction: 0.8,
      }

      this.physicsEngine.addBody(body)
      this.gameObjects.set(obj.id, { object: obj, body })
    })

    // Load assets
    if (levelData.environment.backgroundId) {
      await this.assetManager.loadSpriteImage(levelData.environment.backgroundId)
    }

    // Initialize scoring
    this.scoringSystem.start(levelData.metadata.timeLimit)
  }

  /**
   * Start the game
   */
  start(): void {
    this.isRunning = true
    this.isPaused = false
  }

  /**
   * Pause the game
   */
  pause(): void {
    this.isPaused = true
    this.scoringSystem.pause()
  }

  /**
   * Resume the game
   */
  resume(): void {
    this.isPaused = false
    this.scoringSystem.resume()
  }

  /**
   * Stop the game
   */
  stop(): void {
    this.isRunning = false
    this.scoringSystem.end()
  }

  /**
   * Set canvas for rendering
   */
  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  /**
   * Get canvas reference
   */
  getCanvas(): HTMLCanvasElement | null {
    return this.canvas
  }

  /**
   * Get physics engine
   */
  getPhysicsEngine(): PhysicsEngine {
    return this.physicsEngine
  }

  /**
   * Get asset manager
   */
  getAssetManager(): AssetManager {
    return this.assetManager
  }

  /**
   * Get environment manager
   */
  getEnvironmentManager(): EnvironmentManager {
    return this.environmentManager
  }

  /**
   * Get scoring system
   */
  getScoringSystem(): ScoringSystem {
    return this.scoringSystem
  }

  /**
   * Apply force to game object
   */
  applyForceToObject(objectId: string, force: Vector2D): void {
    this.physicsEngine.applyForce(objectId, force)
  }

  /**
   * Get game object
   */
  getGameObject(id: string): (typeof this.gameObjects)[''] | undefined {
    return this.gameObjects.get(id)
  }

  /**
   * Get all game objects
   */
  getAllGameObjects(): Array<{ object: PlacedObject; body: PhysicsBody }> {
    return Array.from(this.gameObjects.values())
  }

  /**
   * Update game state (call every frame)
   */
  update(deltaTime: number = 0.016): void {
    if (!this.isRunning || this.isPaused) return

    const dt = deltaTime * this.gameSpeed

    // Update physics
    this.physicsEngine.update()

    // Update scoring
    this.scoringSystem.update(dt)

    // Update environment
    this.environmentManager.updateParticles(dt)

    // Update camera to follow player (optional - can be customized)
    this.updateCamera()

    this.frameTime += dt
  }

  /**
   * Update camera position
   */
  private updateCamera(): void {
    // Default: center on first spawn point or level center
    const spawns = this.gameObjects.size > 0
      ? Array.from(this.gameObjects.values()).filter(g => g.object.type === 'spawn')
      : []

    if (spawns.length > 0) {
      const spawn = spawns[0]
      this.camera.x = spawn.body.position.x - (this.canvas?.width || 800) / 2
      this.camera.y = spawn.body.position.y - (this.canvas?.height || 600) / 2
    }
  }

  /**
   * Render game state
   */
  render(): void {
    if (!this.ctx || !this.canvas) return

    const width = this.canvas.width
    const height = this.canvas.height

    // Clear canvas
    this.ctx.fillStyle = this.environmentManager.getSettings().ambientColor
    this.ctx.fillRect(0, 0, width, height)

    this.ctx.save()
    this.ctx.translate(-this.camera.x * this.camera.zoom, -this.camera.y * this.camera.zoom)
    this.ctx.scale(this.camera.zoom, this.camera.zoom)

    // Draw backgrounds
    this.environmentManager.getBackgrounds().forEach(bg => {
      const img = this.assetManager.getSpriteImage(bg.id)
      if (img) {
        const parallaxX = this.camera.x * (1 - bg.parallaxFactor)
        this.ctx!.globalAlpha = bg.opacity
        this.ctx!.drawImage(img, parallaxX, 0, img.width * bg.scale, img.height * bg.scale)
        this.ctx!.globalAlpha = 1
      }
    })

    // Draw game objects
    this.gameObjects.forEach(({ object, body }) => {
      const img = object.properties.spriteId
        ? this.assetManager.getSpriteImage(object.properties.spriteId)
        : null

      this.ctx!.save()
      this.ctx!.translate(body.position.x + body.width / 2, body.position.y + body.height / 2)
      this.ctx!.rotate(body.rotation)

      if (img) {
        this.ctx!.drawImage(
          img,
          -body.width / 2,
          -body.height / 2,
          body.width,
          body.height
        )
      } else {
        // Draw colored rectangle as fallback
        this.ctx!.fillStyle = object.properties.color || '#4a90e2'
        this.ctx!.fillRect(-body.width / 2, -body.height / 2, body.width, body.height)
      }

      this.ctx!.restore()
    })

    // Draw particles
    this.environmentManager.getParticles().forEach(particle => {
      this.ctx!.globalAlpha = particle.opacity
      this.ctx!.fillStyle = particle.color
      this.ctx!.save()
      this.ctx!.translate(particle.position.x, particle.position.y)
      this.ctx!.rotate(particle.rotation)
      this.ctx!.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
      this.ctx!.restore()
      this.ctx!.globalAlpha = 1
    })

    this.ctx.restore()
  }

  /**
   * Handle mouse click for interactions
   */
  handleClick(screenPos: Vector2D): PlacedObject | null {
    const worldPos = {
      x: screenPos.x / this.camera.zoom + this.camera.x,
      y: screenPos.y / this.camera.zoom + this.camera.y,
    }

    for (const { object, body } of this.gameObjects.values()) {
      if (
        worldPos.x >= body.position.x &&
        worldPos.x <= body.position.x + body.width &&
        worldPos.y >= body.position.y &&
        worldPos.y <= body.position.y + body.height
      ) {
        return object
      }
    }

    return null
  }

  /**
   * Set game speed
   */
  setGameSpeed(speed: number): void {
    this.gameSpeed = Math.max(0, speed)
  }

  /**
   * Get game speed
   */
  getGameSpeed(): number {
    return this.gameSpeed
  }

  /**
   * Get game state
   */
  getGameState(): {
    isRunning: boolean
    isPaused: boolean
    score: number
    time: string
    combo: number
  } {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      score: this.scoringSystem.getScore(),
      time: this.scoringSystem.getFormattedTime(),
      combo: this.scoringSystem.getComboCount(),
    }
  }

  /**
   * Reset game
   */
  reset(): void {
    this.isRunning = false
    this.isPaused = false
    this.scoringSystem.reset()
    if (this.levelData) {
      this.initializeLevel(this.levelData)
    }
  }
}
