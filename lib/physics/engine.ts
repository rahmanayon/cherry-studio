import { PhysicsBody, Collision, Vector2D, Force } from './types'
import { Vector } from './vector'
import { CollisionDetector } from './collision'

/**
 * Main Physics Engine - simulates 2D physics with gravity, collision, and forces
 */
export class PhysicsEngine {
  private bodies: Map<string, PhysicsBody> = new Map()
  private gravity: Vector2D = { x: 0, y: 0.6 } // pixels/frame²
  private damping: number = 0.99
  private friction: number = 0.8
  private collisions: Collision[] = []
  private timeScale: number = 1.0

  constructor(gravity: Vector2D = { x: 0, y: 0.6 }) {
    this.gravity = gravity
  }

  /**
   * Add a body to the physics simulation
   */
  addBody(body: PhysicsBody): void {
    this.bodies.set(body.id, body)
  }

  /**
   * Remove a body from the simulation
   */
  removeBody(id: string): void {
    this.bodies.delete(id)
  }

  /**
   * Get a body by ID
   */
  getBody(id: string): PhysicsBody | undefined {
    return this.bodies.get(id)
  }

  /**
   * Get all bodies
   */
  getAllBodies(): PhysicsBody[] {
    return Array.from(this.bodies.values())
  }

  /**
   * Apply a force to a body
   */
  applyForce(bodyId: string, force: Force): void {
    const body = this.bodies.get(bodyId)
    if (body && !body.isStatic) {
      body.acceleration = Vector.add(
        body.acceleration,
        Vector.scale(force, 1 / body.mass)
      )
    }
  }

  /**
   * Apply impulse (instant velocity change)
   */
  applyImpulse(bodyId: string, impulse: Vector2D): void {
    const body = this.bodies.get(bodyId)
    if (body && !body.isStatic) {
      body.velocity = Vector.add(
        body.velocity,
        Vector.scale(impulse, 1 / body.mass)
      )
    }
  }

  /**
   * Set velocity directly
   */
  setVelocity(bodyId: string, velocity: Vector2D): void {
    const body = this.bodies.get(bodyId)
    if (body) {
      body.velocity = velocity
    }
  }

  /**
   * Get current collisions
   */
  getCollisions(): Collision[] {
    return this.collisions
  }

  /**
   * Set time scale for slow motion effects
   */
  setTimeScale(scale: number): void {
    this.timeScale = Math.max(0, scale)
  }

  /**
   * Main physics update loop (call once per frame)
   */
  update(): void {
    const dt = (1 / 60) * this.timeScale // 60 FPS target

    // Apply gravity and update velocity
    this.bodies.forEach((body) => {
      if (!body.isStatic) {
        // Apply gravity
        body.acceleration = Vector.add(body.acceleration, this.gravity)

        // Apply damping
        body.velocity = Vector.scale(body.velocity, this.damping)

        // Update velocity from acceleration
        body.velocity = Vector.add(
          body.velocity,
          Vector.scale(body.acceleration, dt)
        )

        // Update position from velocity
        body.position = Vector.add(
          body.position,
          Vector.scale(body.velocity, dt)
        )

        // Update rotation
        body.rotation += body.angularVelocity * dt
        body.angularVelocity *= 0.99 // Angular damping

        // Reset acceleration each frame
        body.acceleration = { x: 0, y: 0 }
      }
    })

    // Detect collisions
    this.detectCollisions()

    // Resolve collisions
    this.resolveCollisions()

    // Apply constraints
    this.resolveConstraints()
  }

  /**
   * Detect all collisions
   */
  private detectCollisions(): void {
    this.collisions = []
    const bodiesArray = Array.from(this.bodies.values())

    for (let i = 0; i < bodiesArray.length; i++) {
      for (let j = i + 1; j < bodiesArray.length; j++) {
        const collision = CollisionDetector.getCollisionInfo(bodiesArray[i], bodiesArray[j])
        if (collision) {
          this.collisions.push(collision)
        }
      }
    }
  }

  /**
   * Resolve collisions with impulse-based response
   */
  private resolveCollisions(): void {
    this.collisions.forEach((collision) => {
      const { bodyA, bodyB, normal, depth } = collision

      // Don't resolve if both bodies are static
      if (bodyA.isStatic && bodyB.isStatic) return

      // Separate overlapping bodies
      const totalMass = (bodyA.isStatic ? Infinity : bodyA.mass) +
        (bodyB.isStatic ? Infinity : bodyB.mass)
      
      if (!bodyA.isStatic) {
        const separation = Vector.scale(
          normal,
          (depth / 2) * ((bodyB.isStatic ? Infinity : bodyB.mass) / totalMass)
        )
        bodyA.position = Vector.subtract(bodyA.position, separation)
      }

      if (!bodyB.isStatic) {
        const separation = Vector.scale(
          normal,
          (depth / 2) * ((bodyA.isStatic ? Infinity : bodyA.mass) / totalMass)
        )
        bodyB.position = Vector.add(bodyB.position, separation)
      }

      // Calculate relative velocity
      const relativeVelocity = Vector.subtract(bodyA.velocity, bodyB.velocity)
      const velocityAlongNormal = Vector.dot(relativeVelocity, normal)

      // Don't resolve if velocities are separating
      if (velocityAlongNormal > 0) return

      // Calculate restitution (bounce)
      const restitution = Math.min(bodyA.restitution, bodyB.restitution)

      // Calculate impulse scalar
      let impulseMagnitude = -(1 + restitution) * velocityAlongNormal
      impulseMagnitude /= (bodyA.isStatic ? 0 : 1 / bodyA.mass) +
        (bodyB.isStatic ? 0 : 1 / bodyB.mass)

      // Apply impulse
      const impulse = Vector.scale(normal, impulseMagnitude)

      if (!bodyA.isStatic) {
        bodyA.velocity = Vector.add(bodyA.velocity, Vector.scale(impulse, 1 / bodyA.mass))
      }

      if (!bodyB.isStatic) {
        bodyB.velocity = Vector.subtract(bodyB.velocity, Vector.scale(impulse, 1 / bodyB.mass))
      }
    })
  }

  /**
   * Resolve distance constraints
   */
  private resolveConstraints(): void {
    // Placeholder for constraint resolution
    // Can be extended for rope, springs, etc.
  }

  /**
   * Raycast to detect bodies along a line
   */
  raycast(
    start: Vector2D,
    end: Vector2D,
    maxDistance: number = Infinity
  ): { body: PhysicsBody; distance: number } | null {
    const direction = Vector.normalize(Vector.subtract(end, start))
    let closest: { body: PhysicsBody; distance: number } | null = null

    this.bodies.forEach((body) => {
      // Simple raycast: check if ray intersects body
      const toBody = Vector.subtract(body.position, start)
      const distanceToBody = Vector.dot(toBody, direction)

      if (distanceToBody > 0 && distanceToBody < maxDistance) {
        const closest2D = Vector.add(start, Vector.scale(direction, distanceToBody))
        const distance = Vector.distance(closest2D, body.position)

        if (distance < Math.max(body.width, body.height) / 2) {
          if (!closest || distanceToBody < closest.distance) {
            closest = { body, distance: distanceToBody }
          }
        }
      }
    })

    return closest
  }
}
