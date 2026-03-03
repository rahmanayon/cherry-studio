// Level data management and validation

import { Level, GameObjectData, SavedLevel } from '../types/level'

// Re-export Level type for convenience
export type { Level, GameObjectData, SavedLevel }

// Default level template
export const DEFAULT_LEVEL: Level = {
  id: 'new-level-' + Date.now(),
  name: 'Untitled Level',
  description: 'A new level created in the level builder',
  version: '1.0.0',
  difficulty: 'medium',
  environment: {
    name: 'default',
    backgroundColor: '#1a1a2e',
    parallaxLayers: [
      {
        depth: 0.1,
        speed: 0.5,
        imageKey: 'bg-sky',
      },
      {
        depth: 0.5,
        speed: 0.8,
        imageKey: 'bg-mountains',
      },
    ],
    particles: [],
  },
  objects: [],
  physics: {
    gravity: 500,
    damping: 0.1,
    timeStep: 1 / 60,
  },
  scoring: {
    basePoints: 1000,
    timeMultiplier: 10,
    bonusPoints: 500,
    penaltyPoints: 100,
    difficultyModifier: 1,
  },
  timeLimit: 60,
  objective: 'Reach the goal',
  spawnPoint: { x: 100, y: 300 },
  goalPoint: { x: 1000, y: 300 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  creator: 'anonymous',
  published: false,
  tags: [],
}

export class LevelData {
  private level: Level
  private isDirty: boolean = false
  private lastSaved: string = ''

  constructor(level?: Level) {
    this.level = level || { ...DEFAULT_LEVEL }
    this.level.id = level?.id || `level-${Date.now()}`
  }

  // Getters
  getLevel(): Level {
    return { ...this.level }
  }

  getId(): string {
    return this.level.id
  }

  getName(): string {
    return this.level.name
  }

  getObjects(): GameObjectData[] {
    return [...this.level.objects]
  }

  getObject(id: string): GameObjectData | undefined {
    return this.level.objects.find((obj) => obj.id === id)
  }

  getDifficulty(): string {
    return this.level.difficulty
  }

  getTimeLimit(): number {
    return this.level.timeLimit
  }

  // Setters
  setName(name: string): void {
    this.level.name = name
    this.markDirty()
  }

  setDescription(description: string): void {
    this.level.description = description
    this.markDirty()
  }

  setDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void {
    this.level.difficulty = difficulty
    this.markDirty()
  }

  setTimeLimit(seconds: number): void {
    this.level.timeLimit = Math.max(10, seconds)
    this.markDirty()
  }

  setObjective(objective: string): void {
    this.level.objective = objective
    this.markDirty()
  }

  setSpawnPoint(x: number, y: number): void {
    this.level.spawnPoint = { x, y }
    this.markDirty()
  }

  setGoalPoint(x: number, y: number): void {
    this.level.goalPoint = { x, y }
    this.markDirty()
  }

  // Object management
  addObject(object: GameObjectData): void {
    this.level.objects.push(object)
    this.markDirty()
  }

  updateObject(id: string, updates: Partial<GameObjectData>): boolean {
    const index = this.level.objects.findIndex((obj) => obj.id === id)
    if (index !== -1) {
      this.level.objects[index] = { ...this.level.objects[index], ...updates }
      this.markDirty()
      return true
    }
    return false
  }

  removeObject(id: string): boolean {
    const index = this.level.objects.findIndex((obj) => obj.id === id)
    if (index !== -1) {
      this.level.objects.splice(index, 1)
      this.markDirty()
      return true
    }
    return false
  }

  duplicateObject(id: string): GameObjectData | undefined {
    const original = this.getObject(id)
    if (!original) return undefined

    const duplicate: GameObjectData = {
      ...original,
      id: `${original.id}-copy-${Date.now()}`,
      position: {
        x: original.position.x + 20,
        y: original.position.y + 20,
      },
    }

    this.addObject(duplicate)
    return duplicate
  }

  // Batch operations
  clearObjects(): void {
    this.level.objects = []
    this.markDirty()
  }

  addObjects(objects: GameObjectData[]): void {
    this.level.objects.push(...objects)
    this.markDirty()
  }

  // Physics settings
  setPhysics(gravity: number, damping: number): void {
    this.level.physics.gravity = gravity
    this.level.physics.damping = damping
    this.markDirty()
  }

  getPhysics() {
    return { ...this.level.physics }
  }

  // Scoring settings
  setScoring(config: Partial<typeof this.level.scoring>): void {
    this.level.scoring = { ...this.level.scoring, ...config }
    this.markDirty()
  }

  getScoring() {
    return { ...this.level.scoring }
  }

  // Serialization
  toJSON(): string {
    this.level.updatedAt = new Date().toISOString()
    return JSON.stringify(this.level, null, 2)
  }

  static fromJSON(json: string): LevelData {
    try {
      const level = JSON.parse(json) as Level
      return new LevelData(level)
    } catch (error) {
      console.error('Failed to parse level JSON:', error)
      return new LevelData()
    }
  }

  // State tracking
  markDirty(): void {
    this.isDirty = true
    this.level.updatedAt = new Date().toISOString()
  }

  markClean(): void {
    this.isDirty = false
    this.lastSaved = new Date().toISOString()
  }

  isDirtyFlag(): boolean {
    return this.isDirty
  }

  getLastSaved(): string {
    return this.lastSaved
  }

  // Clone
  clone(): LevelData {
    return new LevelData(JSON.parse(JSON.stringify(this.level)) as Level)
  }
}

export class LevelValidator {
  static validateLevel(level: Level): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check required fields
    if (!level.id) errors.push('Level must have an ID')
    if (!level.name || level.name.trim() === '') errors.push('Level must have a name')
    if (!level.objects || level.objects.length === 0) errors.push('Level must have at least one object')

    // Check bounds
    if (level.timeLimit < 10) errors.push('Time limit must be at least 10 seconds')

    // Check physics
    if (level.physics.gravity < 0) errors.push('Gravity cannot be negative')
    if (level.physics.damping < 0 || level.physics.damping > 1) {
      errors.push('Damping must be between 0 and 1')
    }

    // Validate objects
    level.objects.forEach((obj, index) => {
      if (!obj.id) errors.push(`Object ${index} must have an ID`)
      if (!obj.type) errors.push(`Object ${index} must have a type`)
      if (!obj.spriteKey) errors.push(`Object ${index} must have a sprite key`)
    })

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  static getValidationReport(level: Level): string {
    const { valid, errors } = this.validateLevel(level)

    if (valid) {
      return 'Level validation passed! ✓'
    }

    return `Level validation failed:\n${errors.map((e) => `  • ${e}`).join('\n')}`
  }
}

// Level template presets
export const LEVEL_PRESETS = {
  platformer: {
    ...DEFAULT_LEVEL,
    name: 'Platformer Level',
    objective: 'Jump to the platform and reach the goal',
    difficulty: 'medium' as const,
  },

  obstacle: {
    ...DEFAULT_LEVEL,
    name: 'Obstacle Course',
    objective: 'Navigate through obstacles to reach the goal',
    timeLimit: 120,
    difficulty: 'hard' as const,
  },

  collectibles: {
    ...DEFAULT_LEVEL,
    name: 'Collectibles Challenge',
    objective: 'Collect all items before reaching the goal',
    difficulty: 'medium' as const,
  },

  survival: {
    ...DEFAULT_LEVEL,
    name: 'Survival Level',
    objective: 'Avoid enemies and survive as long as possible',
    timeLimit: 180,
    difficulty: 'hard' as const,
  },
}
