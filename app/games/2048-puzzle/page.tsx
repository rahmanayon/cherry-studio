'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Puzzle2048GameComponent } from '@/components/games/Puzzle2048Game'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Puzzle2048Page() {
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [sessionScore, setSessionScore] = useState<number | null>(null)

  const handleGameEnd = (score: number, finalScore: number) => {
    setSessionScore(score)
    setFinalScore(finalScore)
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
          <h1 className="text-4xl font-bold text-white mb-2">2048 Puzzle</h1>
          <p className="text-slate-300">Merge tiles to reach 2048 before time runs out!</p>
        </div>

        {/* Game Component */}
        <div className="mb-8 flex justify-center">
          <Puzzle2048GameComponent timeLimit={180} onGameEnd={handleGameEnd} />
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
                <Link href="/games/2048-puzzle" className="flex-1">
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
            <CardTitle className="text-white">Strategy Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300 text-sm">
            <div className="flex gap-3">
              <span className="text-game-accent">•</span>
              <p>Plan ahead - think 2-3 moves in advance before making your move</p>
            </div>
            <div className="flex gap-3">
              <span className="text-game-accent">•</span>
              <p>Keep larger tiles on one side to avoid blocking moves</p>
            </div>
            <div className="flex gap-3">
              <span className="text-game-accent">•</span>
              <p>Each merge worth points increases with your combo multiplier</p>
            </div>
            <div className="flex gap-3">
              <span className="text-game-accent">•</span>
              <p>Use Ctrl+Z to undo moves when you make mistakes</p>
            </div>
            <div className="flex gap-3">
              <span className="text-game-accent">•</span>
              <p>Reaching 2048 gives bonus points and unlocks achievement!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
