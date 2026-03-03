'use client'

import React, { useEffect, useRef, useState } from 'react'
import { GameEngine } from '@/lib/game/engine'
import { LevelData } from '@/lib/levelBuilder/types'
import { GameCanvas } from './GameCanvas'
import { GameHUD } from './GameHUD'

interface GamePlayProps {
  levelData: LevelData
  onGameEnd?: (score: number, stats: any) => void
}

export const GamePlay: React.FC<GamePlayProps> = ({ levelData, onGameEnd }) => {
  const gameEngineRef = useRef<GameEngine | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [gameState, setGameState] = useState({
    score: 0,
    time: '00:00',
    combo: 0,
  })
  const [isGameOver, setIsGameOver] = useState(false)

  useEffect(() => {
    const gameEngine = new GameEngine()
    gameEngineRef.current = gameEngine

    const initGame = async () => {
      await gameEngine.initializeLevel(levelData)
      gameEngine.start()
    }

    initGame()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [levelData])

  const handleCanvasReady = (canvas: HTMLCanvasElement) => {
    if (!gameEngineRef.current) return

    gameEngineRef.current.setCanvas(canvas)

    const gameLoop = () => {
      const engine = gameEngineRef.current!

      engine.update()
      engine.render()

      const state = engine.getGameState()
      setGameState({
        score: state.score,
        time: state.time,
        combo: state.combo,
      })

      if (!state.isRunning && !isPaused) {
        setIsGameOver(true)
        const stats = engine.getScoringSystem().getStats()
        onGameEnd?.(stats.finalScore, stats)
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }

  const handlePause = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.pause()
      setIsPaused(true)
    }
  }

  const handleResume = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resume()
      setIsPaused(false)
    }
  }

  const handleQuit = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    onGameEnd?.(gameState.score, null)
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-background">
      <GameCanvas onCanvasReady={handleCanvasReady} />
      <GameHUD
        score={gameState.score}
        timeRemaining={gameState.time}
        combo={gameState.combo}
        targetScore={levelData.metadata.targetScore}
        isPaused={isPaused}
        onPause={handlePause}
        onResume={handleResume}
        onQuit={handleQuit}
      />

      {isGameOver && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center">
          <div className="bg-background border border-primary rounded-lg p-8 max-w-md text-center">
            <h2 className="text-3xl font-bold text-primary mb-4">Game Over</h2>
            <p className="text-2xl font-bold text-foreground mb-2">{gameState.score} points</p>
            <p className="text-foreground/60 mb-6">Level: {levelData.metadata.name}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 bg-primary text-background font-bold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
