import { Vector2D } from '@/lib/physics/types'

/**
 * Level Builder Types and Schemas
 */

export type PlacedObjectType = 'platform' | 'obstacle' | 'collectible' | 'spawn' | 'goal'

export interface PlacedObject {
  id: string
  type: PlacedObjectType
  position: Vector2D
  width: number
  height: number
  rotation: number
  properties: {
    spriteId?: string
    color?: string
    mass?: number
    isStatic?: boolean
    pointValue?: number
    [key: string]: any
  }
}

export interface LevelMetadata {
  id: string
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  timeLimit: number
  targetScore: number
  createdAt: number
  updatedAt: number
  author: string
}

export interface LevelData {
  metadata: LevelMetadata
  objects: PlacedObject[]
  environment: {
    backgroundId?: string
    ambientColor: string
    windForce: Vector2D
    gravity: Vector2D
  }
}

export interface LevelValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface EditorState {
  selectedObjectId: string | null
  selectedTool: PlacedObjectType | 'select' | 'delete'
  gridSize: number
  showGrid: boolean
  showColliders: boolean
  zoomLevel: number
  panOffset: Vector2D
  history: LevelData[]
  historyIndex: number
}

export interface GridConfig {
  enabled: boolean
  size: number
  snapToGrid: boolean
}

export interface ToolConfig {
  currentTool: PlacedObjectType | 'select'
  defaultWidth: number
  defaultHeight: number
  defaultColor: string
}
