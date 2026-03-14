'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { GameState } from '@/lib/types/gameState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const GAMES: GameState[] = [
  {
    id: 'flappy-bird',
    name: 'Flappy Bird',
    description: 'Navigate through pipes before time runs out. Timing and reflexes are key!',
    icon: '🐦',
    category: 'arcade',
    difficulty: 'medium',
    maxScore: 10000,
    timeLimit: 120,
    rules: [
      'Flap to move up, fall from gravity',
      'Avoid pipes and ground',
      'Pass through pipes for points',
      'Time multiplier increases your score',
    ],
  },
  {
    id: '2048-puzzle',
    name: '2048 Puzzle',
    description: 'Merge tiles to reach 2048 and maximize your score before time expires.',
    icon: '🧩',
    category: 'puzzle',
    difficulty: 'medium',
    maxScore: 50000,
    timeLimit: 180,
    rules: [
      'Swipe or use arrow keys to move tiles',
      'Merge tiles with same value to create larger numbers',
      'Reach 2048 for bonus points',
      'Plan your moves strategically',
    ],
  },
  {
    id: 'space-invaders',
    name: 'Space Invaders',
    description: 'Defend against enemy ships. Shoot enemies and survive waves!',
    icon: '👾',
    category: 'arcade',
    difficulty: 'hard',
    maxScore: 100000,
    timeLimit: 120,
    rules: [
      'Use arrow keys to move, space to shoot',
      'Destroy enemies for points',
      'Avoid enemy fire and collisions',
      'Difficulty increases with each wave',
    ],
  },
]

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-2">DCB Weekly Tournament</h1>
          <p className="text-xl text-slate-300">Master three arcade games. Claim the top spot.</p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {GAMES.map(game => (
            <Card
              key={game.id}
              className="glass-effect cursor-pointer transition-transform hover:scale-105 border-game-primary/50"
              onClick={() => setSelectedGame(game.id)}
            >
              <CardHeader>
                <div className="text-5xl mb-4">{game.icon}</div>
                <CardTitle className="text-2xl text-white">{game.name}</CardTitle>
                <CardDescription className="text-slate-300">{game.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Difficulty</p>
                    <p className="text-white font-semibold capitalize">{game.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Time Limit</p>
                    <p className="text-white font-semibold">{game.timeLimit}s</p>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-xs mb-2 font-semibold">RULES</p>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {game.rules.slice(0, 2).map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-game-accent mt-1">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href={`/games/${game.id}`} className="block mt-6">
                  <Button className="w-full gradient-gaming text-white hover:opacity-90" size="lg">
                    Play Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <Card className="glass-effect border-game-primary/50 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Tournament Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300">
            <p>
              Compete in three challenging arcade games throughout the week. Your best scores across all games
              contribute to the leaderboard.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-game-primary mb-1">3</div>
                <div className="text-sm">Games</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-game-accent mb-1">∞</div>
                <div className="text-sm">Attempts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-game-success mb-1">🏆</div>
                <div className="text-sm">Prizes</div>
              </div>
            </div>
            <p className="text-sm pt-4 border-t border-slate-700">
              High scores are recorded automatically. Play strategically and optimize your technique to dominate the
              leaderboard!
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
