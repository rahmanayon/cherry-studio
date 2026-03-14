'use client'

import React, { useEffect, useRef, useState } from 'react'
import { LevelData, LevelValidator } from '@/lib/levelBuilder/levelData'
import { Level, GameObjectData } from '@/lib/types/level'
import { Vector2 } from '@/lib/physics/vector2d'

interface LevelEditorProps {
  initialLevel?: Level
  onSave?: (level: Level) => void
  onPublish?: (level: Level) => void
}

export const LevelEditor: React.FC<LevelEditorProps> = ({
  initialLevel,
  onSave,
  onPublish,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [levelData, setLevelData] = useState<LevelData>(() => 
    new LevelData(initialLevel)
  )
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null)
  const [gridSize, setGridSize] = useState(16)
  const [showGrid, setShowGrid] = useState(true)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [zoom, setZoom] = useState(1)
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0 })

  // Render the editor canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const level = levelData.getLevel()

    // Clear background
    ctx.fillStyle = level.environment.backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    }

    // Draw spawn point
    const spawn = level.spawnPoint
    ctx.fillStyle = '#22c55e'
    ctx.beginPath()
    ctx.arc(spawn.x, spawn.y, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px monospace'
    ctx.fillText('S', spawn.x - 4, spawn.y + 4)

    // Draw goal point
    const goal = level.goalPoint
    ctx.fillStyle = '#f59e0b'
    ctx.beginPath()
    ctx.arc(goal.x, goal.y, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.fillText('G', goal.x - 4, goal.y + 4)

    // Draw all objects
    levelData.getObjects().forEach((obj) => {
      const isSelected = obj.id === selectedObjectId

      ctx.save()
      ctx.translate(obj.position.x, obj.position.y)
      ctx.rotate(obj.rotation)

      // Draw object
      const color = isSelected ? '#60a5fa' : '#4f46e5'
      ctx.fillStyle = color
      ctx.fillRect(
        -obj.scale.x * 16,
        -obj.scale.y * 16,
        obj.scale.x * 32,
        obj.scale.y * 32
      )

      // Draw border if selected
      if (isSelected) {
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 3
        ctx.strokeRect(
          -obj.scale.x * 16,
          -obj.scale.y * 16,
          obj.scale.x * 32,
          obj.scale.y * 32
        )
      }

      // Draw label
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 10px monospace'
      ctx.fillText(obj.type.substring(0, 3).toUpperCase(), -10, 5)

      ctx.restore()
    })
  }, [levelData, selectedObjectId, showGrid, gridSize])

  // Handle canvas click to select objects
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    // Check if clicking on spawn or goal point
    const spawn = levelData.getLevel().spawnPoint
    const goal = levelData.getLevel().goalPoint

    const spawnDist = Math.sqrt((x - spawn.x) ** 2 + (y - spawn.y) ** 2)
    const goalDist = Math.sqrt((x - goal.x) ** 2 + (y - goal.y) ** 2)

    if (spawnDist < 15) {
      console.log('Selected spawn point')
      return
    }

    if (goalDist < 15) {
      console.log('Selected goal point')
      return
    }

    // Check objects
    const objects = levelData.getObjects()
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i]
      const dx = x - obj.position.x
      const dy = y - obj.position.y

      const hitRadius = Math.max(obj.scale.x * 16, obj.scale.y * 16)
      if (Math.sqrt(dx * dx + dy * dy) < hitRadius) {
        setSelectedObjectId(obj.id)
        return
      }
    }

    setSelectedObjectId(null)
  }

  // Add new object
  const addObject = (type: 'obstacle' | 'enemy' | 'platform' | 'collectible') => {
    const newObject: GameObjectData = {
      id: `obj-${Date.now()}`,
      type,
      position: { x: 200 + Math.random() * 400, y: 300 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      physics: {
        mass: 1,
        friction: 0.1,
        restitution: 0.5,
      },
      spriteKey: `sprite-${type}`,
      colliderType: 'box',
    }

    levelData.addObject(newObject)
    setLevelData(levelData.clone())
  }

  // Delete selected object
  const deleteSelected = () => {
    if (selectedObjectId) {
      levelData.removeObject(selectedObjectId)
      setLevelData(levelData.clone())
      setSelectedObjectId(null)
    }
  }

  // Validate and save
  const handleSave = () => {
    const level = levelData.getLevel()
    const validation = LevelValidator.validateLevel(level)

    if (!validation.valid) {
      setValidationErrors(validation.errors)
      return
    }

    setValidationErrors([])
    levelData.markClean()
    onSave?.(level)
  }

  // Publish level
  const handlePublish = () => {
    const level = levelData.getLevel()
    const validation = LevelValidator.validateLevel(level)

    if (!validation.valid) {
      setValidationErrors(validation.errors)
      return
    }

    setValidationErrors([])
    onPublish?.(level)
  }

  const level = levelData.getLevel()
  const objectCount = levelData.getObjects().length

  return (
    <div className="w-full h-full flex flex-col bg-slate-900">
      {/* Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">{level.name}</h1>
          <div className="text-sm text-slate-400">
            {objectCount} objects | Level: {level.difficulty}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="w-4 h-4"
            />
            Grid
          </label>

          <select
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="px-3 py-1 bg-slate-700 text-white text-sm rounded border border-slate-600"
          >
            <option value={8}>8px Grid</option>
            <option value={16}>16px Grid</option>
            <option value={32}>32px Grid</option>
          </select>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition-colors"
          >
            Save
          </button>

          <button
            onClick={handlePublish}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded transition-colors"
          >
            Publish
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 bg-black rounded-lg overflow-hidden border-2 border-slate-700">
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-crosshair"
          />
        </div>

        {/* Right Panel */}
        <div className="w-64 bg-slate-800 rounded-lg border border-slate-700 flex flex-col overflow-hidden">
          {/* Object Palette */}
          <div className="border-b border-slate-700 p-3">
            <h3 className="text-sm font-semibold text-white mb-3">Add Object</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addObject('platform')}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors"
              >
                Platform
              </button>
              <button
                onClick={() => addObject('obstacle')}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
              >
                Obstacle
              </button>
              <button
                onClick={() => addObject('collectible')}
                className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-semibold rounded transition-colors"
              >
                Collectible
              </button>
              <button
                onClick={() => addObject('enemy')}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded transition-colors"
              >
                Enemy
              </button>
            </div>
          </div>

          {/* Selected Object Properties */}
          {selectedObjectId && (
            <div className="border-b border-slate-700 p-3">
              <h3 className="text-sm font-semibold text-white mb-2">Properties</h3>
              <button
                onClick={deleteSelected}
                className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
              >
                Delete
              </button>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="flex-1 overflow-auto p-3 bg-red-900/20 border-t border-slate-700">
              <h3 className="text-sm font-semibold text-red-400 mb-2">Validation Errors</h3>
              <ul className="space-y-1">
                {validationErrors.map((error, i) => (
                  <li key={i} className="text-xs text-red-300">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Level Info */}
          <div className="flex-1 overflow-auto p-3 border-t border-slate-700 space-y-2 text-xs text-slate-300">
            <div>
              <p className="font-semibold">Time Limit</p>
              <p>{level.timeLimit}s</p>
            </div>
            <div>
              <p className="font-semibold">Objective</p>
              <p>{level.objective}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
