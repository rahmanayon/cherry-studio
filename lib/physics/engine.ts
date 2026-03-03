// Core physics engine with gravity, collision detection, and rigid body dynamics
import { Vector2, Vector2Utils } from './vector2d'
import { Vector2D, RigidBody, Collider, CollisionContact, PhysicsConfig } from '../types/physics'

export class PhysicsBody {
  position: Vector2
  velocity: Vector2
  acceleration: Vector2
  rotation: number = 0
  angularVelocity: number = 0

  constructor(
    public id: string,
    position: Vector2D,
    public mass: number = 1,
    public friction: number = 0.1,
    public restitution: number = 0.5,
    public isKinematic: boolean = false
  ) {
    this.position = new Vector2(position.x, position.y)
    this.velocity = new Vector2(0, 0)
    this.acceleration = new Vector2(0, 0)
  }

  applyForce(force: Vector2D): void {
    if (this.isKinematic) return
    const acceleration = new Vector2(force.x / this.mass, force.y / this.mass)
    this.acceleration = this.acceleration.add(acceleration)
  }

  applyVelocity(velocity: Vector2D): void {
    this.velocity = new Vector2(velocity.x, velocity.y)
  }

  setPosition(position: Vector2D): void {
    this.position = new Vector2(position.x, position.y)
  }

  setRotation(angle: number): void {
    this.rotation = angle
  }

  update(deltaTime: number, gravity: number): void {
    if (this.isKinematic) return

    // Apply gravity
    this.acceleration.y += gravity

    // Update velocity with acceleration
    this.velocity = this.velocity.add(this.acceleration.multiply(deltaTime))

    // Apply friction/damping
    this.velocity = this.velocity.multiply(1 - this.friction * deltaTime)

    // Update position with velocity
    this.position = this.position.add(this.velocity.multiply(deltaTime))

    // Reset acceleration
    this.acceleration = new Vector2(0, 0)
  }

  getRigidBody(): RigidBody {
    return {
      position: this.position,
      velocity: this.velocity,
      acceleration: this.acceleration,
      rotation: this.rotation,
      angularVelocity: this.angularVelocity,
      properties: {
        mass: this.mass,
        friction: this.friction,
        restitution: this.restitution,
        isKinematic: this.isKinematic,
        gravity: 0,
      },
    }
  }
}

export class BoxCollider implements Collider {
  type: 'box' = 'box'
  isTrigger: boolean = false
  layer: number = 0
  mask: number = 0xffffffff

  constructor(
    public offset: Vector2D,
    public width: number,
    public height: number
  ) {}

  getWorldBounds(position: Vector2D): {
    minX: number
    maxX: number
    minY: number
    maxY: number
  } {
    return {
      minX: position.x + this.offset.x - this.width / 2,
      maxX: position.x + this.offset.x + this.width / 2,
      minY: position.y + this.offset.y - this.height / 2,
      maxY: position.y + this.offset.y + this.height / 2,
    }
  }

  properties = {}
}

export class CircleCollider implements Collider {
  type: 'circle' = 'circle'
  isTrigger: boolean = false
  layer: number = 0
  mask: number = 0xffffffff

  constructor(
    public offset: Vector2D,
    public radius: number
  ) {}

  getWorldBounds(position: Vector2D): {
    minX: number
    maxX: number
    minY: number
    maxY: number
  } {
    const worldPos = new Vector2(position.x + this.offset.x, position.y + this.offset.y)
    return {
      minX: worldPos.x - this.radius,
      maxX: worldPos.x + this.radius,
      minY: worldPos.y - this.radius,
      maxY: worldPos.y + this.radius,
    }
  }

  properties = {}
}

export class PhysicsWorld {
  private bodies: Map<string, PhysicsBody> = new Map()
  private colliders: Map<string, Collider> = new Map()
  private contacts: CollisionContact[] = []
  private gravity: number = 400
  private damping: number = 0.99
  private dt: number = 1 / 60

  constructor(config?: PhysicsConfig) {
    if (config) {
      this.gravity = config.gravity
      this.damping = 1 - config.damping
      this.dt = config.timeStep
    }
  }

  addBody(id: string, body: PhysicsBody, collider?: Collider): void {
    this.bodies.set(id, body)
    if (collider) {
      this.colliders.set(id, collider)
    }
  }

  removeBody(id: string): void {
    this.bodies.delete(id)
    this.colliders.delete(id)
  }

  getBody(id: string): PhysicsBody | undefined {
    return this.bodies.get(id)
  }

  applyForce(id: string, force: Vector2D): void {
    const body = this.bodies.get(id)
    if (body) {
      body.applyForce(force)
    }
  }

  setVelocity(id: string, velocity: Vector2D): void {
    const body = this.bodies.get(id)
    if (body) {
      body.applyVelocity(velocity)
    }
  }

  update(deltaTime: number = this.dt): void {
    // Update all bodies
    this.bodies.forEach((body) => {
      body.update(deltaTime, this.gravity)
    })

    // Check collisions
    this.contacts = []
    this.checkCollisions()

    // Resolve collisions
    this.resolveCollisions()
  }

  private checkCollisions(): void {
    const bodyIds = Array.from(this.bodies.keys())

    for (let i = 0; i < bodyIds.length; i++) {
      for (let j = i + 1; j < bodyIds.length; j++) {
        const idA = bodyIds[i]
        const idB = bodyIds[j]
        const bodyA = this.bodies.get(idA)!
        const bodyB = this.bodies.get(idB)!
        const colliderA = this.colliders.get(idA)
        const colliderB = this.colliders.get(idB)

        if (!colliderA || !colliderB) continue

        const contact = this.checkCollision(
          idA,
          bodyA,
          colliderA,
          idB,
          bodyB,
          colliderB
        )

        if (contact) {
          this.contacts.push(contact)
        }
      }
    }
  }

  private checkCollision(
    idA: string,
    bodyA: PhysicsBody,
    colliderA: Collider,
    idB: string,
    bodyB: PhysicsBody,
    colliderB: Collider
  ): CollisionContact | null {
    // AABB collision detection
    const boundsA = colliderA.getWorldBounds(bodyA.position)
    const boundsB = colliderB.getWorldBounds(bodyB.position)

    if (
      boundsA.maxX < boundsB.minX ||
      boundsA.minX > boundsB.maxX ||
      boundsA.maxY < boundsB.minY ||
      boundsA.minY > boundsB.maxY
    ) {
      return null
    }

    // Calculate overlap
    const overlapX = Math.min(
      boundsA.maxX - boundsB.minX,
      boundsB.maxX - boundsA.minX
    )
    const overlapY = Math.min(
      boundsA.maxY - boundsB.minY,
      boundsB.maxY - boundsA.minY
    )

    const normal = new Vector2(
      overlapX < overlapY ? (boundsA.minX < boundsB.minX ? -1 : 1) : 0,
      overlapY < overlapX ? (boundsA.minY < boundsB.minY ? -1 : 1) : 0
    )

    const depth = Math.min(overlapX, overlapY)

    return {
      objectA: idA,
      objectB: idB,
      point: new Vector2(
        (boundsA.minX + boundsA.maxX) / 2,
        (boundsA.minY + boundsA.maxY) / 2
      ),
      normal,
      depth,
      relativeVelocity: bodyA.velocity.subtract(bodyB.velocity).magnitude(),
    }
  }

  private resolveCollisions(): void {
    for (const contact of this.contacts) {
      const bodyA = this.bodies.get(contact.objectA)
      const bodyB = this.bodies.get(contact.objectB)

      if (!bodyA || !bodyB) continue
      if (bodyA.isKinematic && bodyB.isKinematic) continue

      // Separate overlapping bodies
      const separation = contact.normal.multiply(contact.depth / 2)

      if (!bodyA.isKinematic) {
        bodyA.position = bodyA.position.add(separation)
      }
      if (!bodyB.isKinematic) {
        bodyB.position = bodyB.position.subtract(separation)
      }

      // Calculate restitution (bounce)
      const restitution = Math.min(bodyA.restitution, bodyB.restitution)
      const relativeVelocity = bodyA.velocity.subtract(bodyB.velocity)
      const velocityAlongNormal = relativeVelocity.dot(contact.normal)

      if (velocityAlongNormal >= 0) continue

      const impulse = -(1 + restitution) * velocityAlongNormal
      const impulseMagnitude = impulse / (1 / bodyA.mass + 1 / bodyB.mass)

      if (!bodyA.isKinematic) {
        bodyA.velocity = bodyA.velocity.add(
          contact.normal.multiply(impulseMagnitude / bodyA.mass)
        )
      }
      if (!bodyB.isKinematic) {
        bodyB.velocity = bodyB.velocity.subtract(
          contact.normal.multiply(impulseMagnitude / bodyB.mass)
        )
      }
    }
  }

  getContacts(): CollisionContact[] {
    return this.contacts
  }

  getAllBodies(): Map<string, PhysicsBody> {
    return this.bodies
  }

  setGravity(gravity: number): void {
    this.gravity = gravity
  }

  getGravity(): number {
    return this.gravity
  }
}
