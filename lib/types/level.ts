// Level data types and interfaces

export interface GameObjectData {
  id: string
  type: 'obstacle' | 'enemy' | 'platform' | 'collectible' | 'decoration'
  position: { x: number; y: number }
  rotation: number
  scale: { x: number; y: number }
  physics: {
    mass?: number
    friction?: number
    restitution?: number
    isKinematic?: boolean
  }
  spriteKey: string
  colliderType?: 'box' | 'circle' | 'none'
  customProperties?: Record<string, any>
}

export interface EnvironmentConfig {
  name: string
  backgroundColor: string
  backgroundImage?: string
  parallaxLayers?: {
    depth: number
    speed: number
    imageKey: string
  }[]
  ambience?: {
    musicKey?: string
    soundtrackVolume?: number
  }
  particles?: {
    type: string
    rate: number
    properties: Record<string, any>
  }[]
}

export interface ScoringConfig {
  basePoints: number
  timeMultiplier: number
  bonusPoints: number
  penaltyPoints: number
  difficultyModifier: number
}

export interface Level {
  id: string
  name: string
  description: string
  version: string
  difficulty: 'easy' | 'medium' | 'hard'
  environment: EnvironmentConfig
  objects: GameObjectData[]
  physics: {
    gravity: number
    damping: number
    timeStep: number
  }
  scoring: ScoringConfig
  timeLimit: number // seconds
  objective: string
  spawnPoint: { x: number; y: number }
  goalPoint: { x: number; y: number }
  createdAt: string
  updatedAt: string
  creator: string
  published: boolean
  tags: string[]
}

export interface LevelStats {
  totalPlays: number
  averageScore: number
  highScore: number
  completionRate: number
  averageTime: number
}

export interface SavedLevel extends Level {
  stats?: LevelStats
  thumbnail?: string
}
