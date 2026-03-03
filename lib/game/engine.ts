// Main game engine orchestrating physics, rendering, and game loop

import { PhysicsWorld, PhysicsBody, BoxCollider } from '../physics/engine'
import { Vector2 } from '../physics/vector2d'
import { Scene, Entity } from './ecs'
import { GameState as GameStateType, GameConfig, GameObject, GameEvent } from '../types/game'

export class GameStateManager {
  private currentState: GameStateType = 'menu'
  private stateCallbacks: Map<GameStateType, Function[]> = new Map()

  constructor() {
    const states: GameStateType[] = ['menu', 'playing', 'paused', 'gameover', 'levelselect']
    states.forEach((state) => {
      this.stateCallbacks.set(state, [])
    })
  }

  setState(state: GameStateType): void {
    if (this.currentState !== state) {
      this.currentState = state
      const callbacks = this.stateCallbacks.get(state) || []
      callbacks.forEach((cb) => cb())
    }
  }

  getState(): GameStateType {
    return this.currentState
  }

  onStateChange(state: GameStateType, callback: Function): () => void {
    const callbacks = this.stateCallbacks.get(state) || []
    callbacks.push(callback)
    this.stateCallbacks.set(state, callbacks)

    return () => {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }
}

export class GameEngine {
  private physics: PhysicsWorld
  private scene: Scene
  private stateManager: GameStateManager
  private gameObjects: Map<string, GameObject> = new Map()
  private entityBodyMap: Map<string, string> = new Map() // entity id -> body id
  private eventListeners: Map<string, Function[]> = new Map()
  private running: boolean = false
  private deltaTime: number = 0
  private lastFrameTime: number = 0
  private fps: number = 60
  private targetFPS: number = 60
  private width: number
  private height: number
  private backgroundColor: string

  constructor(config: GameConfig) {
    this.physics = new PhysicsWorld({
      gravity: config.physics.gravity,
      damping: config.physics.damping,
      timeStep: 1 / config.fps,
      iterations: 4,
      angularDamping: 0.1,
    })

    this.scene = new Scene()
    this.stateManager = new GameStateManager()
    this.targetFPS = config.fps
    this.width = config.width
    this.height = config.height
    this.backgroundColor = config.backgroundColor
  }

  // Object management
  addGameObject(object: GameObject): void {
    this.gameObjects.set(object.id, object)

    // Create physics body if has collider
    if (object.collider) {
      const body = new PhysicsBody(
        object.id,
        object.position,
        object.mass,
        object.friction,
        object.restitution
      )

      const collider = new BoxCollider(
        { x: 0, y: 0 },
        object.collider.width || 32,
        object.collider.height || 32
      )

      this.physics.addBody(object.id, body, collider)
      this.entityBodyMap.set(object.id, object.id)
    }
  }

  removeGameObject(id: string): void {
    this.gameObjects.delete(id)
    const bodyId = this.entityBodyMap.get(id)
    if (bodyId) {
      this.physics.removeBody(bodyId)
      this.entityBodyMap.delete(id)
    }
  }

  getGameObject(id: string): GameObject | undefined {
    return this.gameObjects.get(id)
  }

  getAllGameObjects(): GameObject[] {
    return Array.from(this.gameObjects.values())
  }

  // Physics interactions
  applyForce(objectId: string, forceX: number, forceY: number): void {
    const body = this.physics.getBody(objectId)
    if (body) {
      body.applyForce({ x: forceX, y: forceY })
    }
  }

  setVelocity(objectId: string, vx: number, vy: number): void {
    const body = this.physics.getBody(objectId)
    if (body) {
      body.applyVelocity({ x: vx, y: vy })
    }
  }

  getVelocity(objectId: string): { x: number; y: number } | undefined {
    const body = this.physics.getBody(objectId)
    if (body) {
      return { x: body.velocity.x, y: body.velocity.y }
    }
    return undefined
  }

  // Event system
  on(event: string, callback: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }

    const listeners = this.eventListeners.get(event)!
    listeners.push(callback)

    // Return unsubscribe function
    return () => {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event) || []
    listeners.forEach((callback) => {
      callback(data)
    })
  }

  // State management
  setState(state: GameStateType): void {
    this.stateManager.setState(state)
  }

  getState(): GameStateType {
    return this.stateManager.getState()
  }

  onStateChange(state: GameStateType, callback: Function): () => void {
    return this.stateManager.onStateChange(state, callback)
  }

  // Game loop
  start(): void {
    if (this.running) return

    this.running = true
    this.lastFrameTime = performance.now()
    this.gameLoop()
  }

  stop(): void {
    this.running = false
  }

  private gameLoop = (): void => {
    if (!this.running) return

    const currentTime = performance.now()
    this.deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, 0.016) // Cap at 60fps
    this.lastFrameTime = currentTime

    // Update physics
    this.physics.update(this.deltaTime)

    // Sync game objects with physics bodies
    this.gameObjects.forEach((obj, id) => {
      const body = this.physics.getBody(id)
      if (body) {
        obj.position = { x: body.position.x, y: body.position.y }
        obj.velocity = { x: body.velocity.x, y: body.velocity.y }
        obj.rotation = body.rotation
      }
    })

    // Check collisions and emit events
    const contacts = this.physics.getContacts()
    contacts.forEach((contact) => {
      this.emit('collision', {
        objectA: contact.objectA,
        objectB: contact.objectB,
        point: contact.point,
        normal: contact.normal,
        depth: contact.depth,
      })
    })

    // Update ECS scene
    this.scene.update(this.deltaTime)

    // Emit frame event
    this.emit('update', { deltaTime: this.deltaTime, fps: this.fps })

    requestAnimationFrame(this.gameLoop)
  }

  // Rendering information
  getFrameTime(): number {
    return this.deltaTime
  }

  getFPS(): number {
    return this.fps
  }

  getCanvasSize(): { width: number; height: number } {
    return { width: this.width, height: this.height }
  }

  getBackgroundColor(): string {
    return this.backgroundColor
  }

  // Cleanup
  destroy(): void {
    this.stop()
    this.gameObjects.clear()
    this.scene.clear()
    this.eventListeners.clear()
  }

  // Query game state
  getPhysicsWorld(): PhysicsWorld {
    return this.physics
  }

  getScene(): Scene {
    return this.scene
  }

  // Reset level
  reset(): void {
    this.gameObjects.clear()
    this.scene.clear()
    this.eventListeners.clear()
  }
}

// Singleton instance for easy access
let engineInstance: GameEngine | null = null

export function createGameEngine(config: GameConfig): GameEngine {
  if (engineInstance) {
    engineInstance.destroy()
  }
  engineInstance = new GameEngine(config)
  return engineInstance
}

export function getGameEngine(): GameEngine | null {
  return engineInstance
}
