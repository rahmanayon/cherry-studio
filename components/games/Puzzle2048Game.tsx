'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Puzzle2048Game } from '@/lib/games/puzzle2048/game'
import { Button } from '@/components/ui/button'

interface Puzzle2048GameProps {
  timeLimit?: number
  onGameEnd?: (score: number, finalScore: number) => void
}

export function Puzzle2048GameComponent({ timeLimit = 180, onGameEnd }: Puzzle2048GameProps) {
  const gameRef = useRef<Puzzle2048Game | null>(null)
  const [state, setState] = useState<any>(null)
  const [gameOver, setGameOver] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const game = new Puzzle2048Game(timeLimit)
    gameRef.current = game
    game.start()

    // Set up timer
    const updateState = () => {
      setState(game.getState())
      if (game.getState().gameOver) {
        setGameOver(true)
        if (onGameEnd) {
          const finalScore = game.getFinalScore()
          onGameEnd(game.getState().score, finalScore.score)
        }
      }
    }

    updateState()
    const interval = setInterval(() => {
      game.update(0.1)
      updateState()
    }, 100)

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(key)) {
        e.preventDefault()

        const directionMap: Record<string, 'left' | 'right' | 'up' | 'down'> = {
          arrowleft: 'left',
          arrowright: 'right',
          arrowup: 'up',
          arrowdown: 'down',
        }

        const direction = directionMap[key]
        if (direction) {
          game.move(direction)
          updateState()
        }
      } else if (key === 'z' && e.ctrlKey) {
        game.undo()
        updateState()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearInterval(interval)
    }
  }, [timeLimit, onGameEnd])

  if (!state) {
    return <div className="text-center">Loading...</div>
  }

  const getTileColor = (value: number): string => {
    const colors: Record<number, string> = {
      2: 'bg-blue-500',
      4: 'bg-blue-600',
      8: 'bg-purple-500',
      16: 'bg-purple-600',
      32: 'bg-pink-500',
      64: 'bg-pink-600',
      128: 'bg-yellow-500',
      256: 'bg-yellow-600',
      512: 'bg-orange-500',
      1024: 'bg-orange-600',
      2048: 'bg-green-500',
    }
    return colors[value] || 'bg-green-600'
  }

  const tilesMap = new Map(state.tiles.map((t: any) => [`${t.x},${t.y}`, t]))

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex justify-between w-full max-w-md">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-3xl font-bold text-game-primary">{state.score}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Combo</p>
          <p className="text-3xl font-bold text-game-accent">{state.combo}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Time</p>
          <p className={`text-3xl font-bold ${state.timeRemaining < 10 ? 'text-red-500' : 'text-green-500'}`}>
            {Math.ceil(state.timeRemaining)}s
          </p>
        </div>
      </div>

      <div
        className="grid gap-2 p-4 bg-slate-800 rounded-lg"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
          width: '300px',
          height: '300px',
        }}
      >
        {Array.from({ length: 16 }).map((_, idx) => {
          const x = idx % 4
          const y = Math.floor(idx / 4)
          const tile = tilesMap.get(`${x},${y}`)

          return (
            <div
              key={`${x}-${y}`}
              className={`flex items-center justify-center rounded-lg font-bold text-2xl text-white transition-all ${tile ? getTileColor(tile.value) : 'bg-slate-700'
                } ${tile?.isNew ? 'pulse-urgency' : ''}`}
            >
              {tile?.value}
            </div>
          )
        })}
      </div>

      <div className="flex gap-2">
        <Button onClick={() => gameRef.current?.undo()} variant="outline" disabled={gameOver}>
          Undo (Ctrl+Z)
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Use arrow keys to move. Merge tiles to reach 2048!
      </p>

      {gameOver && (
        <div className="glass-effect p-6 rounded-lg text-center max-w-md">
          <h3 className="text-2xl font-bold mb-4">Game Over!</h3>
          <p className="text-lg mb-2">Final Score: {state.score}</p>
          <p className="text-lg mb-2">Best Combo: {state.bestCombo}</p>
          {state.gameWon && <p className="text-game-success font-bold text-lg">You won!</p>}
        </div>
      )}
    </div>
  )
}
