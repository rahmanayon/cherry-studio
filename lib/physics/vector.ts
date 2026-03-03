import { Vector2D } from './types'

/**
 * Vector2D utilities for physics calculations
 */
export class Vector {
  static create(x: number = 0, y: number = 0): Vector2D {
    return { x, y }
  }

  static add(v1: Vector2D, v2: Vector2D): Vector2D {
    return {
      x: v1.x + v2.x,
      y: v1.y + v2.y,
    }
  }

  static subtract(v1: Vector2D, v2: Vector2D): Vector2D {
    return {
      x: v1.x - v2.x,
      y: v1.y - v2.y,
    }
  }

  static scale(v: Vector2D, scalar: number): Vector2D {
    return {
      x: v.x * scalar,
      y: v.y * scalar,
    }
  }

  static dot(v1: Vector2D, v2: Vector2D): number {
    return v1.x * v2.x + v1.y * v2.y
  }

  static magnitude(v: Vector2D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y)
  }

  static normalize(v: Vector2D): Vector2D {
    const mag = this.magnitude(v)
    if (mag === 0) return { x: 0, y: 0 }
    return {
      x: v.x / mag,
      y: v.y / mag,
    }
  }

  static distance(v1: Vector2D, v2: Vector2D): number {
    return this.magnitude(this.subtract(v1, v2))
  }

  static rotate(v: Vector2D, angle: number): Vector2D {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return {
      x: v.x * cos - v.y * sin,
      y: v.x * sin + v.y * cos,
    }
  }

  static perpendicular(v: Vector2D): Vector2D {
    return { x: -v.y, y: v.x }
  }

  static clamp(v: Vector2D, max: number): Vector2D {
    const mag = this.magnitude(v)
    if (mag > max) {
      return this.scale(this.normalize(v), max)
    }
    return v
  }

  static lerp(v1: Vector2D, v2: Vector2D, t: number): Vector2D {
    return {
      x: v1.x + (v2.x - v1.x) * t,
      y: v1.y + (v2.y - v1.y) * t,
    }
  }
}
