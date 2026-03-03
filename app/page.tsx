'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-black/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">DCB Tournament</h1>
          <div className="flex gap-4">
            <Link href="/games">
              <Button variant="outline">Games</Button>
            </Link>
            <Link href="/leaderboard">
              <Button className="gradient-gaming text-white">Leaderboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="mb-8">
          <h2 className="text-6xl font-bold text-white mb-4">
            <span className="gradient-gaming bg-clip-text text-transparent">Weekly Game Tournament</span>
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Challenge yourself in three arcade games. Compete for the top spot on the global leaderboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Flappy Bird Card */}
          <Card className="glass-effect border-blue-500/30 hover:border-blue-500/60 transition-colors">
            <CardHeader>
              <div className="text-6xl mb-4">🐦</div>
              <CardTitle className="text-white text-2xl">Flappy Bird</CardTitle>
              <CardDescription>Navigate through pipes with precision timing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-blue-400 font-semibold">120 seconds</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Difficulty</span>
                  <span className="text-yellow-400 font-semibold">Medium</span>
                </div>
              </div>
              <Link href="/games/flappy-bird" className="block">
                <Button className="w-full gradient-gaming text-white hover:opacity-90">Play Now</Button>
              </Link>
            </CardContent>
          </Card>

          {/* 2048 Puzzle Card */}
          <Card className="glass-effect border-purple-500/30 hover:border-purple-500/60 transition-colors">
            <CardHeader>
              <div className="text-6xl mb-4">🧩</div>
              <CardTitle className="text-white text-2xl">2048 Puzzle</CardTitle>
              <CardDescription>Merge tiles to reach 2048 and beyond</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-purple-400 font-semibold">180 seconds</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Difficulty</span>
                  <span className="text-yellow-400 font-semibold">Medium</span>
                </div>
              </div>
              <Link href="/games/2048-puzzle" className="block">
                <Button className="w-full gradient-gaming text-white hover:opacity-90">Play Now</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Space Invaders Card */}
          <Card className="glass-effect border-red-500/30 hover:border-red-500/60 transition-colors">
            <CardHeader>
              <div className="text-6xl mb-4">👾</div>
              <CardTitle className="text-white text-2xl">Space Invaders</CardTitle>
              <CardDescription>Defend against enemy waves and maximize kills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-red-400 font-semibold">120 seconds</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Difficulty</span>
                  <span className="text-red-400 font-semibold">Hard</span>
                </div>
              </div>
              <Link href="/games/space-invaders" className="block">
                <Button className="w-full gradient-gaming text-white hover:opacity-90">Play Now</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="glass-effect border-slate-600 max-w-2xl mx-auto mb-12">
          <CardHeader>
            <CardTitle className="text-white text-2xl">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-game-primary mb-2">1</div>
                <h3 className="text-white font-semibold mb-2">Choose a Game</h3>
                <p className="text-sm text-slate-300">Select from three unique arcade challenges</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-game-accent mb-2">2</div>
                <h3 className="text-white font-semibold mb-2">Play & Score</h3>
                <p className="text-sm text-slate-300">Master the mechanics and rack up points</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-game-success mb-2">3</div>
                <h3 className="text-white font-semibold mb-2">Climb Ranks</h3>
                <p className="text-sm text-slate-300">Compete on the global leaderboard</p>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h4 className="text-white font-semibold mb-3">Scoring System</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-game-primary">•</span>
                  <span>
                    <strong>Time Multiplier:</strong> Points increase as time dwindles - faster play = higher scores
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-game-primary">•</span>
                  <span>
                    <strong>Combo Streaks:</strong> Chain successful actions for exponential multipliers
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-game-primary">•</span>
                  <span>
                    <strong>Time Bonus:</strong> Remaining seconds add to your final score
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Link href="/games">
          <Button size="lg" className="gradient-gaming text-white text-lg px-8 py-6 h-auto">
            Start Tournament →
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="bg-black/40 py-16 mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Real-time Scoring', icon: '⚡' },
              { title: 'Global Leaderboard', icon: '🌍' },
              { title: 'Weekly Tournaments', icon: '🏆' },
              { title: 'Skill Progression', icon: '📈' },
            ].map(feature => (
              <Card key={feature.title} className="glass-effect border-slate-600">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h4 className="text-white font-semibold">{feature.title}</h4>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
