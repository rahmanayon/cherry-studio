import { PhysicsBody, Collision, Vector2D } from './types'
import { Vector } from './vector'

/**
 * AABB (Axis-Aligned Bounding Box) collision detection
 */
export class CollisionDetector {
  /**
   * Check if two AABB bodies are colliding
   */
  static checkAABBCollision(bodyA: PhysicsBody, bodyB: PhysicsBody): boolean {
    return (
      bodyA.position.x < bodyB.position.x + bodyB.width &&
      bodyA.position.x + bodyA.width > bodyB.position.x &&
      bodyA.position.y < bodyB.position.y + bodyB.height &&
      bodyA.position.y + bodyA.height > bodyB.position.y
    )
  }

  /**
   * Get collision details between two bodies
   */
  static getCollisionInfo(bodyA: PhysicsBody, bodyB: PhysicsBody): Collision | null {
    if (!this.checkAABBCollision(bodyA, bodyB)) {
      return null
    }

    // Find collision point (center of overlap)
    const overlapLeft = bodyA.position.x + bodyA.width - bodyB.position.x
    const overlapRight = bodyB.position.x + bodyB.width - bodyA.position.x
    const overlapTop = bodyA.position.y + bodyA.height - bodyB.position.y
    const overlapBottom = bodyB.position.y + bodyB.height - bodyA.position.y

    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)

    let normal: Vector2D = { x: 0, y: 0 }
    let depth = minOverlap

    if (minOverlap === overlapLeft) {
      normal = { x: -1, y: 0 }
    } else if (minOverlap === overlapRight) {
      normal = { x: 1, y: 0 }
    } else if (minOverlap === overlapTop) {
      normal = { x: 0, y: -1 }
    } else {
      normal = { x: 0, y: 1 }
    }

    const centerA = {
      x: bodyA.position.x + bodyA.width / 2,
      y: bodyA.position.y + bodyA.height / 2,
    }
    const centerB = {
      x: bodyB.position.x + bodyB.width / 2,
      y: bodyB.position.y + bodyB.height / 2,
    }

    return {
      bodyA,
      bodyB,
      point: Vector.lerp(centerA, centerB, 0.5),
      normal,
      depth,
    }
  }

  /**
   * Point-in-body test
   */
  static isPointInBody(point: Vector2D, body: PhysicsBody): boolean {
    return (
      point.x >= body.position.x &&
      point.x <= body.position.x + body.width &&
      point.y >= body.position.y &&
      point.y <= body.position.y + body.height
    )
  }

  /**
   * Circle-to-AABB collision (for more refined detection)
   */
  static checkCircleAABBCollision(
    circlePos: Vector2D,
    radius: number,
    body: PhysicsBody
  ): boolean {
    const closestX = Math.max(body.position.x, Math.min(circlePos.x, body.position.x + body.width))
    const closestY = Math.max(body.position.y, Math.min(circlePos.y, body.position.y + body.height))

    const distance = Math.sqrt(
      (circlePos.x - closestX) ** 2 + (circlePos.y - closestY) ** 2
    )
    return distance < radius
  }
}
