'use client'

import React, { useEffect, useRef, useState } from 'react'
import { GameEngine } from '@/lib/game/engine'
import { EnvironmentBuilder } from '@/lib/environment/builder'
import { AssetLoader } from '@/lib/assets/loader'
import { Level } from '@/lib/types/level'

interface GameCanvasProps {
  level: Level
  onGameStateChange?: (state: string) => void
  onCollision?: (data: any) => void
  width?: number
  height?: number
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  onGameStateChange,
  onCollision,
  width = 1280,
  height = 720,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [fps, setFps] = useState(60)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize engine
    const engine = new GameEngine({
      width,
      height,
      fps: 60,
      backgroundColor: level.environment.backgroundColor,
      physics: {
        gravity: level.physics.gravity,
        damping: level.physics.damping,
      },
    })

    engineRef.current = engine

    // Setup event listeners
    const unsubscribeStateChange = engine.onStateChange('playing', () => {
      onGameStateChange?.('playing')
    })

    const unsubscribeCollision = engine.on('collision', (data) => {
      onCollision?.(data)
    })

    let frameCount = 0
    let lastTime = Date.now()

    const unsubscribeUpdate = engine.on('update', ({ deltaTime }) => {
      // Clear canvas
      ctx.fillStyle = level.environment.backgroundColor
      ctx.fillRect(0, 0, width, height)

      // Render game objects
      const objects = engine.getAllGameObjects()
      objects.forEach((obj) => {
        if (!obj.visible) return

        ctx.save()
        ctx.translate(obj.position.x, obj.position.y)
        ctx.rotate(obj.rotation)

        // Draw placeholder if no sprite
        ctx.fillStyle = '#4f46e5'
        ctx.fillRect(
          -obj.scale.x * 16,
          -obj.scale.y * 16,
          obj.scale.x * 32,
          obj.scale.y * 32
        )

        // Draw debug info
        ctx.fillStyle = '#fff'
        ctx.font = '10px monospace'
        ctx.fillText(`${obj.id.substring(0, 8)}`, 5, -20)

        ctx.restore()
      })

      // Update FPS display
      frameCount++
      const now = Date.now()
      if (now - lastTime >= 1000) {
        setFps(frameCount)
        frameCount = 0
        lastTime = now
      }
    })

    // Start engine
    engine.start()
    setIsRunning(true)

    return () => {
      engine.stop()
      unsubscribeStateChange()
      unsubscribeCollision()
      unsubscribeUpdate()
      engine.destroy()
      engineRef.current = null
    }
  }, [level, onGameStateChange, onCollision, width, height])

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden border border-slate-700">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full"
      />

      {/* FPS Counter */}
      <div className="absolute top-4 left-4 bg-black/50 text-green-400 px-3 py-2 rounded font-mono text-sm border border-green-400/30">
        FPS: {fps}
      </div>

      {/* Game Status */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-2 rounded font-mono text-sm">
        {isRunning ? '▶ Running' : '⏸ Paused'}
      </div>
    </div>
  )
}
