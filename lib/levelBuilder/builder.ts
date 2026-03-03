import {
  LevelData,
  LevelMetadata,
  PlacedObject,
  PlacedObjectType,
  LevelValidation,
  EditorState,
} from './types'
import { Vector2D } from '@/lib/physics/types'

/**
 * Level Builder - core functionality for creating and editing levels
 */
export class LevelBuilder {
  private currentLevel: LevelData
  private editorState: EditorState
  private objectIdCounter: number = 0

  constructor(levelName: string = 'New Level') {
    this.currentLevel = {
      metadata: {
        id: `level-${Date.now()}`,
        name: levelName,
        description: '',
        difficulty: 'medium',
        timeLimit: 60,
        targetScore: 1000,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        author: 'Editor',
      },
      objects: [],
      environment: {
        ambientColor: '#1a1a2e',
        windForce: { x: 0, y: 0 },
        gravity: { x: 0, y: 0.6 },
      },
    }

    this.editorState = {
      selectedObjectId: null,
      selectedTool: 'select',
      gridSize: 32,
      showGrid: true,
      showColliders: true,
      zoomLevel: 1,
      panOffset: { x: 0, y: 0 },
      history: [JSON.parse(JSON.stringify(this.currentLevel))],
      historyIndex: 0,
    }
  }

  /**
   * Add an object to the level
   */
  addObject(
    type: PlacedObjectType,
    position: Vector2D,
    width: number,
    height: number,
    properties: PlacedObject['properties'] = {}
  ): string {
    const id = `obj-${this.objectIdCounter++}`
    const object: PlacedObject = {
      id,
      type,
      position,
      width,
      height,
      rotation: 0,
      properties,
    }

    this.currentLevel.objects.push(object)
    this.saveHistory()
    return id
  }

  /**
   * Remove an object
   */
  removeObject(id: string): void {
    this.currentLevel.objects = this.currentLevel.objects.filter(obj => obj.id !== id)
    this.saveHistory()
  }

  /**
   * Update object properties
   */
  updateObject(
    id: string,
    updates: Partial<Omit<PlacedObject, 'id'>>
  ): void {
    const object = this.currentLevel.objects.find(obj => obj.id === id)
    if (object) {
      Object.assign(object, updates)
      this.currentLevel.metadata.updatedAt = Date.now()
      this.saveHistory()
    }
  }

  /**
   * Get object by ID
   */
  getObject(id: string): PlacedObject | undefined {
    return this.currentLevel.objects.find(obj => obj.id === id)
  }

  /**
   * Get all objects
   */
  getObjects(): PlacedObject[] {
    return this.currentLevel.objects
  }

  /**
   * Get objects by type
   */
  getObjectsByType(type: PlacedObjectType): PlacedObject[] {
    return this.currentLevel.objects.filter(obj => obj.type === type)
  }

  /**
   * Get object at position
   */
  getObjectAtPosition(position: Vector2D): PlacedObject | undefined {
    return this.currentLevel.objects.find(obj => {
      return (
        position.x >= obj.position.x &&
        position.x <= obj.position.x + obj.width &&
        position.y >= obj.position.y &&
        position.y <= obj.position.y + obj.height
      )
    })
  }

  /**
   * Duplicate object
   */
  duplicateObject(id: string, offset: Vector2D = { x: 32, y: 32 }): string | null {
    const original = this.getObject(id)
    if (!original) return null

    return this.addObject(
      original.type,
      {
        x: original.position.x + offset.x,
        y: original.position.y + offset.y,
      },
      original.width,
      original.height,
      { ...original.properties }
    )
  }

  /**
   * Update metadata
   */
  updateMetadata(updates: Partial<LevelMetadata>): void {
    this.currentLevel.metadata = {
      ...this.currentLevel.metadata,
      ...updates,
      updatedAt: Date.now(),
    }
  }

  /**
   * Update environment settings
   */
  updateEnvironment(updates: Partial<typeof this.currentLevel.environment>): void {
    this.currentLevel.environment = {
      ...this.currentLevel.environment,
      ...updates,
    }
    this.saveHistory()
  }

  /**
   * Select object
   */
  selectObject(id: string | null): void {
    this.editorState.selectedObjectId = id
  }

  /**
   * Get selected object
   */
  getSelectedObject(): PlacedObject | null {
    if (!this.editorState.selectedObjectId) return null
    return this.getObject(this.editorState.selectedObjectId) || null
  }

  /**
   * Set active tool
   */
  setActiveTool(tool: PlacedObjectType | 'select' | 'delete'): void {
    this.editorState.selectedTool = tool
  }

  /**
   * Get active tool
   */
  getActiveTool(): string {
    return this.editorState.selectedTool
  }

  /**
   * Toggle grid
   */
  toggleGrid(): void {
    this.editorState.showGrid = !this.editorState.showGrid
  }

  /**
   * Set grid size
   */
  setGridSize(size: number): void {
    this.editorState.gridSize = Math.max(8, size)
  }

  /**
   * Snap position to grid
   */
  snapToGrid(position: Vector2D): Vector2D {
    const size = this.editorState.gridSize
    return {
      x: Math.round(position.x / size) * size,
      y: Math.round(position.y / size) * size,
    }
  }

  /**
   * Set zoom level
   */
  setZoom(level: number): void {
    this.editorState.zoomLevel = Math.max(0.1, Math.min(5, level))
  }

  /**
   * Get zoom level
   */
  getZoom(): number {
    return this.editorState.zoomLevel
  }

  /**
   * Pan view
   */
  pan(offset: Vector2D): void {
    this.editorState.panOffset.x += offset.x
    this.editorState.panOffset.y += offset.y
  }

  /**
   * Get editor state
   */
  getEditorState(): EditorState {
    return this.editorState
  }

  /**
   * Validate level
   */
  validate(): LevelValidation {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for required elements
    const spawns = this.getObjectsByType('spawn')
    if (spawns.length === 0) {
      errors.push('Level must have at least one spawn point')
    }

    const goals = this.getObjectsByType('goal')
    if (goals.length === 0) {
      warnings.push('Level has no goal point')
    }

    // Check for reasonable object count
    if (this.currentLevel.objects.length > 500) {
      warnings.push('Level has many objects; performance may suffer')
    }

    // Check metadata
    if (!this.currentLevel.metadata.name || this.currentLevel.metadata.name.trim() === '') {
      errors.push('Level must have a name')
    }

    if (this.currentLevel.metadata.timeLimit < 10) {
      warnings.push('Time limit is very short')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Save history state
   */
  private saveHistory(): void {
    // Remove any redo history
    this.editorState.history = this.editorState.history.slice(
      0,
      this.editorState.historyIndex + 1
    )

    // Add current state
    this.editorState.history.push(JSON.parse(JSON.stringify(this.currentLevel)))
    this.editorState.historyIndex++

    // Limit history size
    if (this.editorState.history.length > 50) {
      this.editorState.history.shift()
      this.editorState.historyIndex--
    }
  }

  /**
   * Undo
   */
  undo(): void {
    if (this.editorState.historyIndex > 0) {
      this.editorState.historyIndex--
      this.currentLevel = JSON.parse(
        JSON.stringify(this.editorState.history[this.editorState.historyIndex])
      )
    }
  }

  /**
   * Redo
   */
  redo(): void {
    if (this.editorState.historyIndex < this.editorState.history.length - 1) {
      this.editorState.historyIndex++
      this.currentLevel = JSON.parse(
        JSON.stringify(this.editorState.history[this.editorState.historyIndex])
      )
    }
  }

  /**
   * Export level as JSON
   */
  exportJSON(): string {
    return JSON.stringify(this.currentLevel, null, 2)
  }

  /**
   * Import level from JSON
   */
  importJSON(json: string): boolean {
    try {
      const data = JSON.parse(json)
      this.currentLevel = data
      this.editorState.history = [JSON.parse(JSON.stringify(data))]
      this.editorState.historyIndex = 0
      return true
    } catch {
      return false
    }
  }

  /**
   * Get current level data
   */
  getLevelData(): LevelData {
    return JSON.parse(JSON.stringify(this.currentLevel))
  }

  /**
   * Clear level
   */
  clear(): void {
    this.currentLevel.objects = []
    this.editorState.selectedObjectId = null
    this.saveHistory()
  }
}
