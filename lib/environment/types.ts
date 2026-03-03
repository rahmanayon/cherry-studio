import { Vector2D } from '@/lib/physics/types'

/**
 * Environment configuration and entities
 */

export interface Background {
  id: string
  imageUrl: string
  parallaxFactor: number // 0 = static, 1 = same speed as camera
  scale: number
  opacity: number
}

export interface Particle {
  id: string
  position: Vector2D
  velocity: Vector2D
  lifetime: number
  maxLifetime: number
  size: number
  color: string
  opacity: number
  rotation: number
}

export interface Light {
  id: string
  position: Vector2D
  radius: number
  color: string
  intensity: number
}

export interface EnvironmentSettings {
  ambientColor: string
  ambientIntensity: number
  windForce: Vector2D
  fogDensity: number
  fogColor: string
}

export interface EnvironmentData {
  backgrounds: Background[]
  particles: Particle[]
  lights: Light[]
  settings: EnvironmentSettings
}
