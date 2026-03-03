'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface GameTemplate {
  id: string
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  bestscore: number
  timesPlayed: number
  icon: string
}

export default function Dashboard() {
  const [games, setGames] = useState<GameTemplate[]>([
    {
      id: '1',
      name: 'Platform Explorer',
      description: 'Navigate through challenging platforms to reach the goal',
      difficulty: 'medium',
      bestscore: 5240,
      timesPlayed: 12,
      icon: '🏃',
    },
    {
      id: '2',
      name: 'Obstacle Runner',
      description: 'Dodge obstacles and collect coins in this fast-paced level',
      difficulty: 'hard',
      bestscore: 8920,
      timesPlayed: 23,
      icon: '⚡',
    },
    {
      id: '3',
      name: 'Collectibles Quest',
      description: 'Gather all collectibles before time runs out',
      difficulty: 'easy',
      bestscore: 3450,
      timesPlayed: 8,
      icon: '💎',
    },
  ])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'hard':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Game Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">Advanced Game Development Framework</p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/builder">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create Level
              </Button>
            </Link>

            <Link href="/assets">
              <Button variant="outline">
                Assets
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Featured Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Featured Games</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card
                key={game.id}
                className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 group-hover:from-blue-600/20 group-hover:to-purple-600/20 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{game.icon}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(game.difficulty)}`}>
                      {game.difficulty}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                  <p className="text-sm text-slate-300">{game.description}</p>
                </div>

                {/* Card Stats */}
                <div className="p-6 border-t border-slate-700">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Best Score</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {game.bestscore.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Times Played</p>
                      <p className="text-2xl font-bold text-purple-400">{game.timesPlayed}</p>
                    </div>
                  </div>

                  <Link href={`/game/${game.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Play Game
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Framework Features */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Framework Capabilities</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Advanced Physics Engine',
                description: 'Realistic collision detection with customizable gravity and friction',
                icon: '⚙️',
              },
              {
                title: 'Countdown Scoring System',
                description: 'Time-based scoring with multipliers for added urgency',
                icon: '⏱️',
              },
              {
                title: 'Level Builder Tool',
                description: 'Intuitive drag-and-drop interface for level creation',
                icon: '🏗️',
              },
              {
                title: 'Asset Management',
                description: 'Optimized sprite and audio loading with caching',
                icon: '🎨',
              },
              {
                title: 'Immersive Environments',
                description: 'Parallax scrolling, particle effects, and environmental physics',
                icon: '🌍',
              },
              {
                title: 'Modular Architecture',
                description: 'Entity-Component System for scalable game development',
                icon: '🔧',
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-slate-800/30 border-slate-700 hover:border-slate-600 transition-colors p-4"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Games', value: '3' },
            { label: 'Total Score', value: '17,610' },
            { label: 'Total Playtime', value: '43 hrs' },
            { label: 'Highest Streak', value: '12 days' },
          ].map((stat, index) => (
            <Card
              key={index}
              className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-slate-700 p-6 text-center"
            >
              <p className="text-sm text-slate-400 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
            </Card>
          ))}
        </section>
      </div>
    </main>
  )
}
