// 2D Vector mathematics for physics calculations
import { Vector2D } from '../types/physics'

export class Vector2 implements Vector2D {
  constructor(public x: number = 0, public y: number = 0) {}

  // Basic operations
  add(v: Vector2D): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y)
  }

  subtract(v: Vector2D): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y)
  }

  multiply(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar)
  }

  divide(scalar: number): Vector2 {
    return new Vector2(this.x / scalar, this.y / scalar)
  }

  dot(v: Vector2D): number {
    return this.x * v.x + this.y * v.y
  }

  cross(v: Vector2D): number {
    return this.x * v.y - this.y * v.x
  }

  // Magnitude and normalization
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  normalize(): Vector2 {
    const mag = this.magnitude()
    if (mag === 0) return new Vector2(0, 0)
    return this.divide(mag)
  }

  // Distance calculations
  distance(v: Vector2D): number {
    const dx = this.x - v.x
    const dy = this.y - v.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  distanceSquared(v: Vector2D): number {
    const dx = this.x - v.x
    const dy = this.y - v.y
    return dx * dx + dy * dy
  }

  // Angle operations
  angle(): number {
    return Math.atan2(this.y, this.x)
  }

  angleTo(v: Vector2D): number {
    const dx = v.x - this.x
    const dy = v.y - this.y
    return Math.atan2(dy, dx)
  }

  rotateBy(angle: number): Vector2 {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return new Vector2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    )
  }

  // Utility functions
  clone(): Vector2 {
    return new Vector2(this.x, this.y)
  }

  equals(v: Vector2D, epsilon = 0.0001): boolean {
    return Math.abs(this.x - v.x) < epsilon && Math.abs(this.y - v.y) < epsilon
  }

  // Project this vector onto another
  project(v: Vector2D): Vector2 {
    const dotProduct = this.dot(v)
    const magnitudeSquared = v.x * v.x + v.y * v.y
    return new Vector2(
      (dotProduct / magnitudeSquared) * v.x,
      (dotProduct / magnitudeSquared) * v.y
    )
  }

  // Linear interpolation
  lerp(v: Vector2D, t: number): Vector2 {
    return new Vector2(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t
    )
  }

  // Clamp magnitude
  clampMagnitude(max: number): Vector2 {
    const mag = this.magnitude()
    if (mag > max) {
      return this.normalize().multiply(max)
    }
    return this.clone()
  }
}

// Static factory methods
export const Vector2Utils = {
  zero: () => new Vector2(0, 0),
  one: () => new Vector2(1, 1),
  up: () => new Vector2(0, -1),
  down: () => new Vector2(0, 1),
  left: () => new Vector2(-1, 0),
  right: () => new Vector2(1, 0),

  // Create from angle and magnitude
  fromAngle(angle: number, magnitude = 1): Vector2 {
    return new Vector2(
      Math.cos(angle) * magnitude,
      Math.sin(angle) * magnitude
    )
  },

  // Reflect a vector across a normal
  reflect(vector: Vector2, normal: Vector2): Vector2 {
    const dotProduct = vector.dot(normal)
    return vector.subtract(normal.multiply(2 * dotProduct))
  },

  // Perpendicular vector
  perpendicular(v: Vector2): Vector2 {
    return new Vector2(-v.y, v.x)
  },
}
