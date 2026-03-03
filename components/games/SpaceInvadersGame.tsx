'use client'

import React, { useState, useEffect, useRef } from 'react'
import { SpaceInvadersGame } from '@/lib/games/spaceInvaders/game'

interface SpaceInvadersGameProps {
  timeLimit?: number
  onGameEnd?: (score: number, finalScore: number) => void
}

export function SpaceInvadersGameComponent({ timeLimit = 120, onGameEnd }: SpaceInvadersGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<SpaceInvadersGame | null>(null)
  const animationRef = useRef<number | null>(null)
  const [gameState, setGameState] = useState('ready') // ready, playing, gameOver

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize game
    const game = new SpaceInvadersGame(timeLimit)
    gameRef.current = game

    // Keyboard controls
    const keysPressed: Record<string, boolean> = {}

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.key] = true

      if (e.key === ' ' && gameState === 'ready') {
        e.preventDefault()
        setGameState('playing')
        game.start()
      }
      if (e.key === ' ' && gameState === 'playing') {
        e.preventDefault()
        game.shoot()
      }

      game.keyDown(e.key)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.key] = false
      game.keyUp(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Game loop
    let lastTime = Date.now()
    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = (now - lastTime) / 1000
      lastTime = now

      const state = game.getState()

      // Clear canvas
      ctx.fillStyle = '#000814'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw space background
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)'
      for (let i = 0; i < 50; i++) {
        const x = (i * 80 + Date.now() * 0.02) % canvas.width
        const y = i * 12
        ctx.fillRect(x, y, 2, 2)
      }

      // Update game
      game.update(deltaTime)

      // Draw enemies
      ctx.fillStyle = '#ef4444'
      for (const enemy of state.enemies) {
        if (enemy.type === 'strong') {
          ctx.fillStyle = '#f97316'
        } else {
          ctx.fillStyle = '#ef4444'
        }
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height)

        // Draw enemy eyes
        ctx.fillStyle = '#000'
        ctx.fillRect(enemy.x + 8, enemy.y + 8, 4, 4)
        ctx.fillRect(enemy.x + 28, enemy.y + 8, 4, 4)
      }

      // Draw projectiles
      ctx.fillStyle = '#10b981'
      for (const proj of state.projectiles) {
        if (proj.fromPlayer) {
          ctx.fillStyle = '#10b981'
        } else {
          ctx.fillStyle = '#ef4444'
        }
        ctx.fillRect(proj.x, proj.y, proj.width, proj.height)
      }

      // Draw player
      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(state.playerX, state.playerY, state.playerWidth, state.playerHeight)

      // Draw player cannon
      ctx.fillStyle = '#60a5fa'
      ctx.fillRect(state.playerX + state.playerWidth / 2 - 2, state.playerY - 10, 4, 10)

      // Draw HUD
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 20px Arial'
      ctx.fillText(`Score: ${state.score}`, 20, 30)
      ctx.fillText(`Level: ${state.level}`, 20, 60)
      ctx.fillText(`Health: ${state.playerHealth}/${state.maxPlayerHealth}`, 20, 90)

      // Draw timer
      ctx.fillStyle = state.timeRemaining < 10 ? '#ef4444' : '#10b981'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'right'
      ctx.fillText(`${Math.ceil(state.timeRemaining)}s`, canvas.width - 20, 30)

      // Draw kills
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 20px Arial'
      ctx.fillText(`Kills: ${state.killCount}`, canvas.width - 20, 60)

      // Health bar
      const healthPercentage = state.playerHealth / state.maxPlayerHealth
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(20, canvas.height - 20, 100, 10)
      ctx.fillStyle = '#10b981'
      ctx.fillRect(20, canvas.height - 20, 100 * healthPercentage, 10)

      // Draw game over screen
      if (state.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const finalScore = game.getFinalScore()
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 40px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 80)

        ctx.font = '24px Arial'
        ctx.fillText(`Final Score: ${finalScore.score}`, canvas.width / 2, canvas.height / 2)
        ctx.fillText(`Level: ${finalScore.level}`, canvas.width / 2, canvas.height / 2 + 40)
        ctx.fillText(`Kills: ${finalScore.kills}`, canvas.width / 2, canvas.height / 2 + 80)

        setGameState('gameOver')
        if (onGameEnd) {
          onGameEnd(state.score, finalScore.score)
        }
      } else if (gameState === 'ready') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = 'bold 32px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2)
        ctx.font = '18px Arial'
        ctx.fillText('Use ARROW KEYS to move, SPACE to shoot', canvas.width / 2, canvas.height / 2 + 50)
      }

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
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
        className="border-2 border-game-primary rounded-lg shadow-lg glow-purple"
      />
      <p className="text-center text-sm text-muted-foreground">
        Arrow keys to move, Space to shoot. Destroy enemies and survive!
      </p>
    </div>
  )
}
