'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { GameCanvas } from '@/components/game/GameCanvas'
import { GameHUD } from '@/components/game/GameHUD'
import { CountdownDisplay } from '@/components/scoring/CountdownDisplay'
import { ResultsScreen } from '@/components/scoring/ResultsScreen'
import { CountdownScorer } from '@/lib/scoring/countdown'
import { Level } from '@/lib/types/level'
import { DEFAULT_LEVEL } from '@/lib/levelBuilder/levelData'
import { Button } from '@/components/ui/button'

interface GamePageProps {
  params: {
    id: string
  }
}

export default function GamePage({ params }: GamePageProps) {
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'paused' | 'gameover'>('loading')
  const [level, setLevel] = useState<Level>(DEFAULT_LEVEL)
  const [scorer, setScorer] = useState<CountdownScorer | null>(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    // Initialize level (in a real app, fetch from database)
    const mockLevel: Level = {
      ...DEFAULT_LEVEL,
      id: params.id,
      name: `Level ${params.id}`,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as any,
      timeLimit: 60,
    }

    setLevel(mockLevel)

    // Initialize scorer
    const newScorer = new CountdownScorer(mockLevel.scoring)
    newScorer.setTimeLimit(mockLevel.timeLimit)
    newScorer.setDifficulty(mockLevel.difficulty)
    setScorer(newScorer)

    setGameState('playing')
  }, [params.id])

  // Update timer
  useEffect(() => {
    if (gameState !== 'playing' || !scorer) return

    const interval = setInterval(() => {
      scorer.updateTime(0.1)

      if (scorer.getTimeRemaining() <= 0) {
        setGameState('gameover')
        setShowResults(true)
        scorer.finalizeScore()
      }
    }, 100)

    return () => clearInterval(interval)
  }, [gameState, scorer])

  const handleGameStateChange = (newState: string) => {
    setGameState(newState as any)
  }

  const handleRetry = () => {
    if (scorer) {
      scorer.reset()
      setShowResults(false)
      setGameState('playing')
    }
  }

  const handleMenu = () => {
    // Reset and go back to menu
    window.location.href = '/'
  }

  if (!scorer) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Loading game...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/40 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-white font-semibold hover:text-blue-400 transition-colors"
          >
            ← Back to Hub
          </Link>

          <h1 className="text-2xl font-bold text-white">{level.name}</h1>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => setGameState(gameState === 'playing' ? 'paused' : 'playing')}
              variant="outline"
              size="sm"
            >
              {gameState === 'playing' ? 'Pause' : 'Resume'}
            </Button>

            <Link href="/">
              <Button variant="outline" size="sm">
                Quit
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Game Container */}
      <div className="max-w-7xl mx-auto p-6 h-[calc(100vh-120px)]">
        <div className="w-full h-full flex gap-6">
          {/* Main Game Canvas */}
          <div className="flex-1 flex flex-col gap-4">
            <GameCanvas
              level={level}
              onGameStateChange={handleGameStateChange}
              width={1280}
              height={720}
            />
          </div>

          {/* Right Sidebar */}
          <div className="w-80 bg-slate-800/50 border border-slate-700 rounded-lg p-6 overflow-auto">
            <div className="space-y-8">
              {/* Level Info */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Level Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-400">Difficulty</p>
                    <p className="text-white font-semibold capitalize">{level.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Objective</p>
                    <p className="text-white font-semibold">{level.objective}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Time Limit</p>
                    <p className="text-white font-semibold">{level.timeLimit}s</p>
                  </div>
                </div>
              </div>

              {/* Countdown Display */}
              <div className="border-t border-slate-700 pt-6">
                <CountdownDisplay scorer={scorer} variant="compact" animated={true} />
              </div>

              {/* Score Info */}
              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Score</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Score</span>
                    <span className="text-white font-semibold">
                      {scorer.getScore().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Combo</span>
                    <span className="text-yellow-400 font-semibold">
                      {scorer.getScoreBreakdown().comboMultiplier.toFixed(1)}x
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls Info */}
              <div className="border-t border-slate-700 pt-6 text-xs text-slate-400 space-y-2">
                <p className="font-semibold text-white mb-2">Controls</p>
                <p>← → - Move Left/Right</p>
                <p>Space - Jump</p>
                <p>P - Pause</p>
                <p>R - Restart Level</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HUD Overlay */}
      <GameHUD
        scorer={scorer}
        level={level.name}
        isGameOver={gameState === 'gameover'}
        isPaused={gameState === 'paused'}
      />

      {/* Results Screen */}
      {showResults && (
        <ResultsScreen
          scorer={scorer}
          levelName={level.name}
          difficulty={level.difficulty}
          onRetry={handleRetry}
          onMenu={handleMenu}
          isNewRecord={scorer.getScore() > 10000}
        />
      )}
    </main>
  )
}
