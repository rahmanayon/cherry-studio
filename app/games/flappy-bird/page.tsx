'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { FlappyBirdGameComponent } from '@/components/games/FlappyBirdGame'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GameStorage, GameSession } from '@/lib/games/gameStorage'

export default function FlappyBirdPage() {
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [sessionScore, setSessionScore] = useState<number | null>(null)
  const [gameLevel, setGameLevel] = useState<number>(1)
  const [bestScore, setBestScore] = useState<number>(0)

  useEffect(() => {
    const stats = GameStorage.getStats('flappy-bird')
    if (stats) {
      setBestScore(stats.bestScore)
    }
  }, [])

  const handleGameEnd = (score: number, finalScore: number) => {
    setSessionScore(score)
    setFinalScore(finalScore)

    // Save session
    const session: GameSession = {
      id: `fb-${Date.now()}`,
      gameId: 'flappy-bird',
      score: finalScore,
      level: gameLevel,
      combo: 0,
      duration: 120000,
      timestamp: Date.now(),
      completed: true,
    }

    GameStorage.saveSession(session)

    // Update stats
    GameStorage.updateStats('flappy-bird', {
      gameId: 'flappy-bird',
      bestScore: Math.max(bestScore, finalScore),
      highestLevel: Math.max(gameLevel, bestScore > 0 ? 1 : 0),
      totalGamesPlayed: (GameStorage.getAllSessions('flappy-bird').length || 0) + 1,
      lastPlayedDate: Date.now(),
      totalTime: 0,
      personalRecords: {
        score: Math.max(bestScore, finalScore),
        level: gameLevel,
        combo: 0,
      },
    })

    setBestScore(Math.max(bestScore, finalScore))
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/games">
            <Button variant="outline" className="mb-4">
              ← Back to Games
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Flappy Bird</h1>
          <p className="text-slate-300">Survive 120 seconds. Avoid pipes. Maximize your score!</p>
          {bestScore > 0 && (
            <p className="text-game-primary font-semibold mt-2">Best Score: {bestScore.toLocaleString()}</p>
          )}
        </div>

        {/* Game Component */}
        <div className="mb-8 flex justify-center">
          <FlappyBirdGameComponent timeLimit={120} onGameEnd={handleGameEnd} />
        </div>

        {/* Results */}
        {finalScore !== null && (
          <Card className="glass-effect border-game-primary/50 mb-8">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Session Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-black/20 rounded-lg">
                  <p className="text-slate-400 text-sm mb-2">Base Score</p>
                  <p className="text-3xl font-bold text-game-primary">{sessionScore}</p>
                </div>
                <div className="text-center p-4 bg-black/20 rounded-lg">
                  <p className="text-slate-400 text-sm mb-2">Final Score</p>
                  <p className="text-3xl font-bold text-game-accent">{finalScore}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Link href="/games/flappy-bird" className="flex-1">
                  <Button className="w-full gradient-gaming text-white">Play Again</Button>
                </Link>
                <Link href="/games" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Games
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="glass-effect border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Tips & Tricks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300 text-sm">
            <div className="flex gap-3">
              <span className="text-game-accent">•</span>
              <p>Time your flaps to navigate through narrow pipe gaps</p>
            </div>
            <div className="flex gap-3">
              <span className="text-game-accent">•</span>
              <p>Each pipe passed is worth 10 points + time multiplier bonus</p>
            </div>
            <div className="flex gap-3">
              <span className="text-game-accent">•</span>
              <p>Maintain a combo streak by avoiding crashes for combo multipliers</p>
            </div>
            <div className="flex gap-3">
              <span className="text-game-accent">•</span>
              <p>Remaining time at the end adds to your final score</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
