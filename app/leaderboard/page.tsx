'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LeaderboardEntry {
  rank: number
  playerName: string
  totalScore: number
  gameBreakdown: {
    flappyBird: number
    puzzle2048: number
    spaceInvaders: number
  }
  timestamp: string
}

export default function LeaderboardPage() {
  const [gameFilter, setGameFilter] = useState<'all' | 'flappy-bird' | '2048-puzzle' | 'space-invaders'>('all')

  // Mock leaderboard data
  const mockLeaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      playerName: 'ShadowNinja',
      totalScore: 145680,
      gameBreakdown: { flappyBird: 52400, puzzle2048: 48920, spaceInvaders: 44360 },
      timestamp: 'Today',
    },
    {
      rank: 2,
      playerName: 'PhoenixFire',
      totalScore: 138450,
      gameBreakdown: { flappyBird: 48200, puzzle2048: 45680, spaceInvaders: 44570 },
      timestamp: 'Today',
    },
    {
      rank: 3,
      playerName: 'LunaEcho',
      totalScore: 131200,
      gameBreakdown: { flappyBird: 45800, puzzle2048: 42900, spaceInvaders: 42500 },
      timestamp: 'Today',
    },
    {
      rank: 4,
      playerName: 'CrimsonStar',
      totalScore: 127850,
      gameBreakdown: { flappyBird: 44100, puzzle2048: 41200, spaceInvaders: 42550 },
      timestamp: 'Today',
    },
    {
      rank: 5,
      playerName: 'AzureWolf',
      totalScore: 124600,
      gameBreakdown: { flappyBird: 42800, puzzle2048: 39900, spaceInvaders: 41900 },
      timestamp: 'Yesterday',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              ← Back Home
            </Button>
          </Link>
          <h1 className="text-5xl font-bold text-white mb-2">Global Leaderboard</h1>
          <p className="text-xl text-slate-300">Top players of the DCB Weekly Tournament</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['all', 'flappy-bird', '2048-puzzle', 'space-invaders'] as const).map(filter => (
            <Button
              key={filter}
              variant={gameFilter === filter ? 'default' : 'outline'}
              className={gameFilter === filter ? 'gradient-gaming text-white' : ''}
              onClick={() => setGameFilter(filter)}
            >
              {filter === 'all' ? 'All Games' : filter === 'flappy-bird' ? 'Flappy Bird' : filter === '2048-puzzle' ? '2048' : 'Space Invaders'}
            </Button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="space-y-3">
          {mockLeaderboard.map(entry => (
            <Card key={entry.rank} className={`glass-effect border-slate-700 overflow-hidden ${entry.rank === 1 ? 'border-game-accent/50 bg-game-accent/5' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          entry.rank === 1
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                            : entry.rank === 2
                              ? 'bg-slate-400/20 text-slate-300 border border-slate-400/50'
                              : entry.rank === 3
                                ? 'bg-orange-600/20 text-orange-400 border border-orange-600/50'
                                : 'bg-slate-700/50 text-slate-300'
                        }`}
                      >
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                      </div>
                    </div>

                    {/* Player Info */}
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{entry.playerName}</h3>
                      <p className="text-sm text-slate-400">{entry.timestamp}</p>
                    </div>

                    {/* Score Breakdown (Hidden on Mobile) */}
                    <div className="hidden md:grid grid-cols-3 gap-4 flex-1">
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Flappy</p>
                        <p className="text-white font-semibold">{entry.gameBreakdown.flappyBird}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">2048</p>
                        <p className="text-white font-semibold">{entry.gameBreakdown.puzzle2048}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Invaders</p>
                        <p className="text-white font-semibold">{entry.gameBreakdown.spaceInvaders}</p>
                      </div>
                    </div>

                    {/* Total Score */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-400 mb-1">Total Score</p>
                      <p className={`text-2xl font-bold ${entry.rank === 1 ? 'text-game-accent' : 'text-game-primary'}`}>
                        {entry.totalScore.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="glass-effect border-game-primary/50 mt-12">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to climb the ranks?</h3>
            <p className="text-slate-300 mb-6">Start playing and see your name on the leaderboard!</p>
            <Link href="/games">
              <Button className="gradient-gaming text-white text-lg px-8">Start Playing Now</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
