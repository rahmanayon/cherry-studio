'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { SpaceInvadersGameComponent } from '@/components/games/SpaceInvadersGame'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SpaceInvadersPage() {
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
          <h1 className="text-4xl font-bold text-white mb-2">Space Invaders</h1>
          <p className="text-slate-300">Defend against waves of enemies for 120 seconds!</p>
        </div>

        {/* Game Component */}
        <div className="mb-8 flex justify-center">
          <SpaceInvadersGameComponent timeLimit={120} onGameEnd={handleGameEnd} />
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
                <Link href="/games/space-invaders" className="flex-1">
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
            <CardTitle className="text-white">Combat Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300 text-sm">
            <div className="flex gap-3">
              <span className="text-game-accent">•</span>
              <p>Use arrow keys to move and space to shoot continuously</p>
            </div>
            <div className="flex gap-3">
              <span className="text-game-accent">•</span>
              <p>Enemies become faster and stronger with each wave - adapt your strategy</p>
            </div>
            <div className="flex gap-3">
              <span className="text-game-accent">•</span>
              <p>Maintain a kill combo for massive point multipliers</p>
            </div>
            <div className="flex gap-3">
              <span className="text-game-accent">•</span>
              <p>Manage health carefully - prioritize dodging over aggressive shooting</p>
            </div>
            <div className="flex gap-3">
              <span className="text-game-accent">•</span>
              <p>Time bonus multiplies by remaining seconds - survive longer for more points!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
