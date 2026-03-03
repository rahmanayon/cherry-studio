'use client'

import React, { useEffect, useRef } from 'react'

interface GameCanvasProps {
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
  width?: number
  height?: number
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onCanvasReady,
  width = 1200,
  height = 700,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && onCanvasReady) {
      onCanvasReady(canvasRef.current)
    }
  }, [onCanvasReady])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full bg-background border border-primary/20 rounded-lg shadow-lg"
      style={{ maxWidth: '100%', height: 'auto', aspectRatio: `${width}/${height}` }}
    />
  )
}
