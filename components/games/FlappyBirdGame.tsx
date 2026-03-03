'use client'

import React, { useState, useEffect, useRef } from 'react'
import { FlappyBirdGame } from '@/lib/games/flappyBird/game'

interface FlappyBirdGameProps {
  timeLimit?: number
  onGameEnd?: (score: number, finalScore: number) => void
}

export function FlappyBirdGameComponent({ timeLimit = 120, onGameEnd }: FlappyBirdGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<FlappyBirdGame | null>(null)
  const animationRef = useRef<number | null>(null)
  const [gameState, setGameState] = useState('ready') // ready, playing, gameOver

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize game
    const game = new FlappyBirdGame(timeLimit)
    gameRef.current = game

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault()
        if (gameState === 'ready') {
          setGameState('playing')
          game.start()
        }
        game.flap()
      }
    }

    // Touch/mouse controls
    const handleClick = () => {
      if (gameState === 'ready') {
        setGameState('playing')
        game.start()
      }
      game.flap()
    }

    window.addEventListener('keydown', handleKeyDown)
    canvas.addEventListener('click', handleClick)

    // Game loop
    let lastTime = Date.now()
    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = (now - lastTime) / 1000
      lastTime = now

      const state = game.getState()

      // Clear canvas
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#1e293b')
      gradient.addColorStop(1, '#0f172a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update game
      game.update(deltaTime)

      // Draw pipes
      ctx.fillStyle = '#10b981'
      for (const pipe of state.pipes) {
        // Top pipe
        ctx.fillRect(pipe.x, 0, state.pipeWidth, pipe.topHeight)
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.topHeight + state.pipeGap, state.pipeWidth, canvas.height - (pipe.topHeight + state.pipeGap))
      }

      // Draw ground
      ctx.fillStyle = '#7c2d12'
      ctx.fillRect(0, canvas.height - state.groundHeight, canvas.width, state.groundHeight)

      // Draw bird
      ctx.save()
      ctx.translate(canvas.width / 2, state.birdY)
      ctx.rotate((state.birdRotation * Math.PI) / 180)
      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(-20, -20, 40, 40)
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.arc(8, -8, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Draw score
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 32px Arial'
      ctx.fillText(`${state.score}`, 20, 40)

      // Draw timer
      ctx.fillStyle = state.timeRemaining < 10 ? '#ef4444' : '#10b981'
      ctx.font = 'bold 24px Arial'
      ctx.fillText(`${Math.ceil(state.timeRemaining)}s`, canvas.width - 120, 40)

      // Draw level and stats
      ctx.fillStyle = '#3b82f6'
      ctx.font = 'bold 18px Arial'
      ctx.fillText(`Level: ${state.level}`, 20, 80)
      ctx.fillText(`Pipes: ${state.pipesPassed}`, 20, 110)

      // Draw combo
      if (state.combo > 0) {
        ctx.fillStyle = '#8b5cf6'
        ctx.font = 'bold 20px Arial'
        ctx.fillText(`Combo: ${state.combo}x`, 20, 140)
      }

      // Draw game over screen
      if (state.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const finalScore = game.getFinalScore()
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 40px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 80)

        ctx.font = '20px Arial'
        ctx.fillText(`Final Score: ${finalScore.score}`, canvas.width / 2, canvas.height / 2 - 20)
        ctx.fillText(`Level: ${finalScore.level} | Pipes: ${finalScore.pipesPassed}`, canvas.width / 2, canvas.height / 2 + 20)
        ctx.fillText(`Best Combo: ${finalScore.bestCombo}x`, canvas.width / 2, canvas.height / 2 + 60)
        ctx.fillText(`Time Bonus: +${finalScore.timeBonus}`, canvas.width / 2, canvas.height / 2 + 100)

        setGameState('gameOver')
        if (onGameEnd) {
          onGameEnd(state.score, finalScore.score)
        }
      } else if (gameState === 'playing') {
        setGameState('playing')
      } else if (gameState === 'ready') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = 'bold 32px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Click or Press SPACE to Start', canvas.width / 2, canvas.height / 2)
      }

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      canvas.removeEventListener('click', handleClick)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState, timeLimit, onGameEnd])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <canvas
        ref={canvasRef}
        width={400}
        height={600}
        className="border-2 border-game-primary rounded-lg shadow-lg glow-blue"
      />
      <p className="text-center text-sm text-muted-foreground">
        Click canvas or press SPACE to flap. Avoid pipes and survive the countdown!
      </p>
    </div>
  )
}
