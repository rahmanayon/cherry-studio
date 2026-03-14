// Game engine types and interfaces

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'levelselect'

export interface GameConfig {
  width: number
  height: number
  fps: number
  backgroundColor: string
  physics: {
    gravity: number
    damping: number
  }
}

export interface GameObject {
  id: string
  type: string
  active: boolean
  visible: boolean
  position: { x: number; y: number }
  rotation: number
  scale: { x: number; y: number }
  velocity: { x: number; y: number }
  acceleration: { x: number; y: number }
  mass: number
  friction: number
  restitution: number
  collider?: {
    type: 'box' | 'circle'
    width?: number
    height?: number
    radius?: number
  }
  spriteKey?: string
  animationFrames?: number[]
  currentFrame?: number
  customProperties?: Record<string, any>
}

export interface GameEvent {
  type: string
  data?: any
  timestamp: number
}

export interface GameStats {
  score: number
  time: number
  level: string
  difficulty: 'easy' | 'medium' | 'hard'
  objectives: {
    completed: number
    total: number
  }
}

export interface EntityComponent {
  name: string
  enabled: boolean
  data: Record<string, any>
}

export interface Entity {
  id: string
  active: boolean
  components: Map<string, EntityComponent>
  parent?: string
  children?: string[]
}
