import { Vector2D } from '@/lib/physics/types'
import {
  Background,
  Particle,
  Light,
  EnvironmentSettings,
  EnvironmentData,
} from './types'

/**
 * Environment Manager - handles backgrounds, particles, lighting, and atmospheric effects
 */
export class EnvironmentManager {
  private backgrounds: Map<string, Background> = new Map()
  private particles: Particle[] = []
  private lights: Map<string, Light> = new Map()
  private settings: EnvironmentSettings = {
    ambientColor: '#1a1a2e',
    ambientIntensity: 0.8,
    windForce: { x: 0.1, y: 0 },
    fogDensity: 0,
    fogColor: '#ffffff',
  }
  private particleIdCounter: number = 0

  /**
   * Add background layer
   */
  addBackground(background: Background): void {
    this.backgrounds.set(background.id, background)
  }

  /**
   * Get all backgrounds sorted by parallax factor
   */
  getBackgrounds(): Background[] {
    return Array.from(this.backgrounds.values()).sort(
      (a, b) => a.parallaxFactor - b.parallaxFactor
    )
  }

  /**
   * Remove background
   */
  removeBackground(id: string): void {
    this.backgrounds.delete(id)
  }

  /**
   * Add particle to the scene
   */
  addParticle(particle: Omit<Particle, 'id'>): string {
    const id = `particle-${this.particleIdCounter++}`
    this.particles.push({
      ...particle,
      id,
    })
    return id
  }

  /**
   * Emit particles from a point
   */
  emitParticles(
    position: Vector2D,
    count: number,
    velocity: Vector2D,
    spread: number = 0.3,
    color: string = '#ffffff'
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * 2 * Math.PI)
      const speed = Math.random() * spread + (1 - spread / 2)
      this.addParticle({
        position: { ...position },
        velocity: {
          x: velocity.x + Math.cos(angle) * speed,
          y: velocity.y + Math.sin(angle) * speed,
        },
        lifetime: 1,
        maxLifetime: 1,
        size: 4 + Math.random() * 4,
        color,
        opacity: 1,
        rotation: Math.random() * Math.PI * 2,
      })
    }
  }

  /**
   * Remove particle
   */
  removeParticle(id: string): void {
    this.particles = this.particles.filter(p => p.id !== id)
  }

  /**
   * Get all particles
   */
  getParticles(): Particle[] {
    return this.particles
  }

  /**
   * Update particles (decay and removal)
   */
  updateParticles(deltaTime: number = 0.016): void {
    this.particles.forEach(particle => {
      particle.lifetime -= deltaTime
      particle.opacity = particle.lifetime / particle.maxLifetime
      particle.position.x += particle.velocity.x
      particle.position.y += particle.velocity.y
      particle.velocity.y += 0.1 // Gravity
      particle.rotation += 0.05
    })

    // Remove dead particles
    this.particles = this.particles.filter(p => p.lifetime > 0)
  }

  /**
   * Add light source
   */
  addLight(light: Light): void {
    this.lights.set(light.id, light)
  }

  /**
   * Get all lights
   */
  getLights(): Light[] {
    return Array.from(this.lights.values())
  }

  /**
   * Remove light
   */
  removeLight(id: string): void {
    this.lights.delete(id)
  }

  /**
   * Get environment settings
   */
  getSettings(): EnvironmentSettings {
    return this.settings
  }

  /**
   * Update environment settings
   */
  updateSettings(settings: Partial<EnvironmentSettings>): void {
    this.settings = { ...this.settings, ...settings }
  }

  /**
   * Set wind force (affects particle movement)
   */
  setWindForce(force: Vector2D): void {
    this.settings.windForce = force
    // Apply wind to particles
    this.particles.forEach(p => {
      p.velocity.x += force.x * 0.01
      p.velocity.y += force.y * 0.01
    })
  }

  /**
   * Get ambient color with intensity
   */
  getAmbientColor(): string {
    return this.settings.ambientColor
  }

  /**
   * Set ambient color
   */
  setAmbientColor(color: string, intensity: number = 0.8): void {
    this.settings.ambientColor = color
    this.settings.ambientIntensity = intensity
  }

  /**
   * Export environment data
   */
  exportData(): EnvironmentData {
    return {
      backgrounds: Array.from(this.backgrounds.values()),
      particles: this.particles,
      lights: Array.from(this.lights.values()),
      settings: this.settings,
    }
  }

  /**
   * Import environment data
   */
  importData(data: EnvironmentData): void {
    this.backgrounds.clear()
    data.backgrounds.forEach(bg => this.addBackground(bg))
    this.particles = data.particles
    this.lights.clear()
    data.lights.forEach(light => this.addLight(light))
    this.settings = data.settings
  }

  /**
   * Clear all environment elements
   */
  clear(): void {
    this.backgrounds.clear()
    this.particles = []
    this.lights.clear()
  }
}
