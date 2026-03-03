/**
 * Vector2D: Basic 2D vector for physics calculations
 */
export interface Vector2D {
  x: number
  y: number
}

/**
 * Physics body with position, velocity, acceleration, and mass
 */
export interface PhysicsBody {
  id: string
  position: Vector2D
  velocity: Vector2D
  acceleration: Vector2D
  mass: number
  width: number
  height: number
  isStatic: boolean
  rotation: number
  angularVelocity: number
  restitution: number // bounce factor
  friction: number
}

/**
 * Collision detection result
 */
export interface Collision {
  bodyA: PhysicsBody
  bodyB: PhysicsBody
  point: Vector2D
  normal: Vector2D
  depth: number
}

/**
 * Constraint for physics-based connections
 */
export interface Constraint {
  bodyA: PhysicsBody
  bodyB: PhysicsBody
  distance: number
}

/**
 * Force application parameters
 */
export interface Force {
  x: number
  y: number
}
