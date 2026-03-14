// Environment system for detailed, immersive game worlds

import { EnvironmentConfig } from '../types/level'

export interface ParallaxLayer {
  depth: number
  speed: number
  imageKey: string
  offsetX: number
  offsetY: number
  width: number
  height: number
}

export interface ParticleEffect {
  type: string
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  lifetime: number
  maxLifetime: number
  size: number
  color: string
  opacity: number
  rotation: number
  angularVelocity: number
}

export class Particle {
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  lifetime: number
  maxLifetime: number
  size: number
  color: string
  opacity: number
  rotation: number
  angularVelocity: number

  constructor(effect: Partial<ParticleEffect>) {
    this.position = effect.position || { x: 0, y: 0 }
    this.velocity = effect.velocity || { x: 0, y: 0 }
    this.lifetime = effect.lifetime || 0
    this.maxLifetime = effect.maxLifetime || 1
    this.size = effect.size || 5
    this.color = effect.color || '#ffffff'
    this.opacity = effect.opacity || 1
    this.rotation = effect.rotation || 0
    this.angularVelocity = effect.angularVelocity || 0
  }

  update(deltaTime: number): void {
    // Update position
    this.position.x += this.velocity.x * deltaTime
    this.position.y += this.velocity.y * deltaTime

    // Apply gravity to particles
    this.velocity.y += 100 * deltaTime

    // Update lifetime
    this.lifetime += deltaTime

    // Update rotation
    this.rotation += this.angularVelocity * deltaTime

    // Fade out over time
    const progress = this.lifetime / this.maxLifetime
    this.opacity = Math.max(0, 1 - progress)

    // Shrink over time
    this.size = this.size * (1 - 0.5 * deltaTime)
  }

  isDead(): boolean {
    return this.lifetime >= this.maxLifetime
  }
}

export class ParticleSystem {
  private particles: Particle[] = []
  private emissionRate: number = 10 // particles per second
  private emissionTimer: number = 0

  constructor(
    private emitterConfig: {
      position: { x: number; y: number }
      velocity: { x: number; y: number }
      size: number
      color: string
      lifetime: number
      spreadAngle: number
      speedVariation: number
    }
  ) {}

  emit(deltaTime: number): void {
    this.emissionTimer += deltaTime

    const particlesToEmit = Math.floor(this.emissionTimer * this.emissionRate)

    for (let i = 0; i < particlesToEmit; i++) {
      const angle = (Math.random() - 0.5) * this.emitterConfig.spreadAngle
      const speed = 1 + (Math.random() - 0.5) * this.emitterConfig.speedVariation

      const velocity = {
        x: this.emitterConfig.velocity.x * speed + Math.cos(angle) * 50,
        y: this.emitterConfig.velocity.y * speed + Math.sin(angle) * 50,
      }

      const particle = new Particle({
        position: { ...this.emitterConfig.position },
        velocity,
        size: this.emitterConfig.size,
        color: this.emitterConfig.color,
        maxLifetime: this.emitterConfig.lifetime,
        lifetime: 0,
      })

      this.particles.push(particle)
    }

    this.emissionTimer = 0
  }

  update(deltaTime: number): void {
    this.emit(deltaTime)

    // Update all particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(deltaTime)

      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1)
      }
    }
  }

  getParticles(): Particle[] {
    return this.particles
  }

  setEmissionRate(rate: number): void {
    this.emissionRate = rate
  }

  clear(): void {
    this.particles = []
  }
}

export class EnvironmentBuilder {
  private parallaxLayers: ParallaxLayer[] = []
  private particleSystems: Map<string, ParticleSystem> = new Map()
  private config: EnvironmentConfig

  constructor(config: EnvironmentConfig) {
    this.config = config
    this.setupParallaxLayers()
    this.setupParticleSystems()
  }

  private setupParallaxLayers(): void {
    if (!this.config.parallaxLayers) return

    this.parallaxLayers = this.config.parallaxLayers.map((layer) => ({
      ...layer,
      offsetX: 0,
      offsetY: 0,
      width: 1280, // Default, can be set per layer
      height: 720, // Default, can be set per layer
    }))
  }

  private setupParticleSystems(): void {
    if (!this.config.particles) return

    this.config.particles.forEach((particleConfig, index) => {
      const particleSystem = new ParticleSystem({
        position: { x: 640, y: 360 },
        velocity: { x: 0, y: 0 },
        size: particleConfig.properties.size || 5,
        color: particleConfig.properties.color || '#ffffff',
        lifetime: particleConfig.properties.lifetime || 1,
        spreadAngle: particleConfig.properties.spreadAngle || Math.PI * 2,
        speedVariation: particleConfig.properties.speedVariation || 0.5,
      })

      particleSystem.setEmissionRate(particleConfig.rate)
      this.particleSystems.set(`particle-${index}`, particleSystem)
    })
  }

  updateParallax(cameraX: number, cameraY: number): void {
    this.parallaxLayers.forEach((layer) => {
      // Parallax offset based on depth (depth closer to 1 = closer to camera = moves faster)
      layer.offsetX = -(cameraX * (1 - layer.depth))
      layer.offsetY = -(cameraY * (1 - layer.depth))
    })
  }

  updateParticles(deltaTime: number): void {
    this.particleSystems.forEach((system) => {
      system.update(deltaTime)
    })
  }

  getParallaxLayers(): ParallaxLayer[] {
    return this.parallaxLayers
  }

  getParticleSystems(): Map<string, ParticleSystem> {
    return this.particleSystems
  }

  getBackgroundColor(): string {
    return this.config.backgroundColor
  }

  getBackgroundImage(): string | undefined {
    return this.config.backgroundImage
  }

  getMusicKey(): string | undefined {
    return this.config.ambience?.musicKey
  }

  getMusicVolume(): number {
    return this.config.ambience?.soundtrackVolume || 0.7
  }

  createParticleSystem(
    id: string,
    position: { x: number; y: number },
    config: {
      size: number
      color: string
      lifetime: number
      spreadAngle: number
      speedVariation: number
      emissionRate: number
    }
  ): ParticleSystem {
    const system = new ParticleSystem({
      position,
      velocity: { x: 0, y: 0 },
      ...config,
    })

    this.particleSystems.set(id, system)
    return system
  }

  removeParticleSystem(id: string): void {
    this.particleSystems.delete(id)
  }

  setParallexLayerSpeed(index: number, speed: number): void {
    if (this.parallaxLayers[index]) {
      this.parallaxLayers[index].speed = speed
    }
  }

  getConfig(): EnvironmentConfig {
    return this.config
  }

  setConfig(config: EnvironmentConfig): void {
    this.config = config
    this.parallaxLayers = []
    this.particleSystems.clear()
    this.setupParallaxLayers()
    this.setupParticleSystems()
  }
}

export class EnvironmentTheme {
  private colorPalette: Map<string, string> = new Map()
  private textureSet: Map<string, string> = new Map()

  constructor(
    public name: string,
    colorPalette?: Record<string, string>,
    textureSet?: Record<string, string>
  ) {
    if (colorPalette) {
      Object.entries(colorPalette).forEach(([key, value]) => {
        this.colorPalette.set(key, value)
      })
    }

    if (textureSet) {
      Object.entries(textureSet).forEach(([key, value]) => {
        this.textureSet.set(key, value)
      })
    }
  }

  getColor(key: string): string | undefined {
    return this.colorPalette.get(key)
  }

  setColor(key: string, value: string): void {
    this.colorPalette.set(key, value)
  }

  getTexture(key: string): string | undefined {
    return this.textureSet.get(key)
  }

  setTexture(key: string, value: string): void {
    this.textureSet.set(key, value)
  }

  getAllColors(): Record<string, string> {
    const result: Record<string, string> = {}
    this.colorPalette.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  getAllTextures(): Record<string, string> {
    const result: Record<string, string> = {}
    this.textureSet.forEach((value, key) => {
      result[key] = value
    })
    return result
  }
}
