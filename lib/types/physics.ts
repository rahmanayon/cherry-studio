// Physics engine types and interfaces

export interface Vector2D {
  x: number
  y: number
}

export interface PhysicsProperties {
  mass: number
  friction: number
  restitution: number // bounciness
  isKinematic: boolean
  gravity: number
}

export interface RigidBody {
  position: Vector2D
  velocity: Vector2D
  acceleration: Vector2D
  rotation: number
  angularVelocity: number
  properties: PhysicsProperties
}

export interface Collider {
  type: 'box' | 'circle' | 'polygon'
  offset: Vector2D
  properties: {
    width?: number
    height?: number
    radius?: number
    vertices?: Vector2D[]
  }
  isTrigger: boolean
  layer: number
  mask: number
}

export interface CollisionContact {
  objectA: string
  objectB: string
  point: Vector2D
  normal: Vector2D
  depth: number
  relativeVelocity: number
}

export interface PhysicsConfig {
  gravity: number
  timeStep: number
  iterations: number
  damping: number
  angularDamping: number
}
