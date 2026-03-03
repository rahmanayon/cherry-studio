'use client'

import React, { useEffect, useRef, useState } from 'react'
import { LevelBuilder } from '@/lib/levelBuilder/builder'
import { LevelData, PlacedObjectType } from '@/lib/levelBuilder/types'

interface LevelEditorUIProps {
  onSave?: (levelData: LevelData) => void
  initialLevel?: LevelData
}

export const LevelEditorUI: React.FC<LevelEditorUIProps> = ({ onSave, initialLevel }) => {
  const builderRef = useRef<LevelBuilder>(new LevelBuilder())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTool, setActiveTool] = useState<PlacedObjectType | 'select'>('select')
  const [selectedObject, setSelectedObject] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [gridSize, setGridSize] = useState(32)
  const [zoom, setZoom] = useState(1)
  const [objectCount, setObjectCount] = useState(0)
  const [levelName, setLevelName] = useState('New Level')

  useEffect(() => {
    const builder = builderRef.current

    // Load initial level if provided
    if (initialLevel) {
      builder.importJSON(JSON.stringify(initialLevel))
      setLevelName(initialLevel.metadata.name)
    }

    setObjectCount(builder.getObjects().length)
  }, [initialLevel])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const builder = builderRef.current

    // Clear canvas
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#2a2a4e'
      ctx.lineWidth = 0.5
      for (let x = 0; x < canvas.width; x += gridSize * zoom) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += gridSize * zoom) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }

    // Draw objects
    const objects = builder.getObjects()
    objects.forEach(obj => {
      const isSelected = obj.id === selectedObject
      const color = obj.properties.color || '#4a90e2'

      ctx.fillStyle = isSelected ? '#e94b3c' : color
      ctx.globalAlpha = isSelected ? 1 : 0.8
      ctx.fillRect(
        obj.position.x * zoom,
        obj.position.y * zoom,
        obj.width * zoom,
        obj.height * zoom
      )

      // Draw border
      ctx.strokeStyle = isSelected ? '#ff6b6b' : '#2a2a4e'
      ctx.lineWidth = isSelected ? 3 : 1
      ctx.globalAlpha = 1
      ctx.strokeRect(
        obj.position.x * zoom,
        obj.position.y * zoom,
        obj.width * zoom,
        obj.height * zoom
      )

      // Draw type label
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 10px monospace'
      ctx.fillText(
        obj.type.toUpperCase(),
        obj.position.x * zoom + 4,
        obj.position.y * zoom + 14
      )
    })
  }, [selectedObject, showGrid, gridSize, zoom, objectCount])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    const builder = builderRef.current

    if (activeTool === 'select') {
      const obj = builder.getObjectAtPosition({ x, y })
      setSelectedObject(obj?.id || null)
    } else if (activeTool !== 'delete') {
      const snappedPos = builder.snapToGrid({ x, y })
      builder.addObject(activeTool, snappedPos, 64, 64, {
        color: ['#4a90e2', '#e24a4a', '#4ae290', '#ffa500'][Math.floor(Math.random() * 4)],
      })
      setObjectCount(builder.getObjects().length)
    }
  }

  const handleDeleteSelected = () => {
    if (selectedObject) {
      builderRef.current.removeObject(selectedObject)
      setSelectedObject(null)
      setObjectCount(builderRef.current.getObjects().length)
    }
  }

  const handleUndo = () => {
    builderRef.current.undo()
    setObjectCount(builderRef.current.getObjects().length)
    setSelectedObject(null)
  }

  const handleRedo = () => {
    builderRef.current.redo()
    setObjectCount(builderRef.current.getObjects().length)
  }

  const handleSave = () => {
    const levelData = builderRef.current.getLevelData()
    onSave?.(levelData)
  }

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <div className="border-b border-primary/20 p-4 bg-background/50">
        <div className="flex gap-4 items-center justify-between">
          <div className="flex gap-2">
            {/* Tool Buttons */}
            <div className="flex gap-1 bg-background-alt rounded-lg p-1">
              {(['select', 'platform', 'obstacle', 'collectible', 'spawn', 'goal'] as const).map(
                tool => (
                  <button
                    key={tool}
                    onClick={() => setActiveTool(tool)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      activeTool === tool
                        ? 'bg-primary text-background'
                        : 'text-foreground hover:bg-background'
                    }`}
                  >
                    {tool.charAt(0).toUpperCase() + tool.slice(1)}
                  </button>
                )
              )}
            </div>

            {/* Edit Buttons */}
            <div className="flex gap-1 bg-background-alt rounded-lg p-1 ml-2">
              <button
                onClick={handleUndo}
                className="px-3 py-1 rounded text-sm font-medium text-foreground hover:bg-background transition-colors"
              >
                Undo
              </button>
              <button
                onClick={handleRedo}
                className="px-3 py-1 rounded text-sm font-medium text-foreground hover:bg-background transition-colors"
              >
                Redo
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={!selectedObject}
                className="px-3 py-1 rounded text-sm font-medium text-destructive hover:bg-background transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground/60">Zoom:</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={e => setZoom(parseFloat(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-foreground/60">{Math.round(zoom * 100)}%</span>
            </div>

            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                showGrid
                  ? 'bg-primary text-background'
                  : 'text-foreground hover:bg-background-alt'
              }`}
            >
              Grid
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-accent text-background font-bold rounded-lg hover:bg-accent/90 transition-colors"
            >
              Save Level
            </button>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 flex flex-col">
          <canvas
            ref={canvasRef}
            width={1000}
            height={600}
            onClick={handleCanvasClick}
            className="flex-1 bg-background-alt border border-primary/20 rounded-lg cursor-crosshair"
          />
        </div>

        {/* Properties Panel */}
        <div className="w-64 bg-background border border-primary/20 rounded-lg p-4 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Level Name</label>
            <input
              type="text"
              value={levelName}
              onChange={e => {
                setLevelName(e.target.value)
                builderRef.current.updateMetadata({ name: e.target.value })
              }}
              className="w-full px-3 py-2 bg-background-alt border border-primary/20 rounded text-foreground"
            />
          </div>

          <div className="border-t border-primary/20 pt-4">
            <h3 className="font-bold text-foreground mb-3">Grid</h3>
            <label className="block text-sm font-medium text-foreground/60 mb-2">Grid Size</label>
            <input
              type="number"
              value={gridSize}
              onChange={e => setGridSize(Math.max(8, parseInt(e.target.value)))}
              className="w-full px-3 py-2 bg-background-alt border border-primary/20 rounded text-foreground"
            />
          </div>

          <div className="border-t border-primary/20 pt-4">
            <h3 className="font-bold text-foreground mb-3">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/60">Objects:</span>
                <span className="text-foreground font-bold">{objectCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Active Tool:</span>
                <span className="text-foreground font-bold capitalize">{activeTool}</span>
              </div>
            </div>
          </div>

          {selectedObject && (
            <div className="border-t border-primary/20 pt-4">
              <h3 className="font-bold text-foreground mb-3">Selected Object</h3>
              <div className="space-y-2 text-sm">
                <button
                  onClick={handleDeleteSelected}
                  className="w-full px-2 py-1 bg-destructive/20 text-destructive rounded hover:bg-destructive/30 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
