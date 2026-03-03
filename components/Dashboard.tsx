'use client'

import React, { useState } from 'react'
import Link from 'next/link'

interface Game {
  id: string
  name: string
  description: string
  difficulty: string
  thumbnail?: string
}

const FEATURED_GAMES: Game[] = [
  {
    id: '1',
    name: 'Physics Playground',
    description: 'Test your physics understanding with challenging puzzles.',
    difficulty: 'Medium',
  },
  {
    id: '2',
    name: 'Gravity Rush',
    description: 'Navigate through gravity-defying obstacles.',
    difficulty: 'Hard',
  },
  {
    id: '3',
    name: 'Time Attack',
    description: 'Complete levels before time runs out.',
    difficulty: 'Expert',
  },
]

export const Dashboard: React.FC = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)

  const filteredGames = selectedDifficulty
    ? FEATURED_GAMES.filter(g => g.difficulty === selectedDifficulty)
    : FEATURED_GAMES

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-alt to-background p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary mb-2">Game Framework</h1>
          <p className="text-foreground/60">Advanced 3D Physics & Level Creation Engine</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <Link
            href="/level-editor"
            className="px-6 py-2 bg-primary text-background font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Level Editor
          </Link>
          <Link
            href="/asset-manager"
            className="px-6 py-2 bg-background border border-primary/30 text-foreground font-bold rounded-lg hover:bg-background/80 transition-colors"
          >
            Asset Manager
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Difficulty Filter */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Filter by Difficulty</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedDifficulty(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDifficulty === null
                  ? 'bg-primary text-background'
                  : 'bg-background border border-primary/30 text-foreground hover:bg-background/80'
              }`}
            >
              All
            </button>
            {['Easy', 'Medium', 'Hard', 'Expert'].map(difficulty => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDifficulty === difficulty
                    ? 'bg-primary text-background'
                    : 'bg-background border border-primary/30 text-foreground hover:bg-background/80'
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredGames.map(game => (
            <div
              key={game.id}
              className="bg-background border border-primary/20 rounded-lg overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg"
            >
              {/* Game Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary/50">{game.id}</div>
                  <p className="text-foreground/30 text-sm mt-2">Game Preview</p>
                </div>
              </div>

              {/* Game Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-foreground mb-2">{game.name}</h3>
                <p className="text-sm text-foreground/60 mb-4">{game.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    game.difficulty === 'Easy'
                      ? 'bg-green-500/20 text-green-400'
                      : game.difficulty === 'Medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : game.difficulty === 'Hard'
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {game.difficulty}
                  </span>
                </div>

                <Link
                  href={`/play/${game.id}`}
                  className="w-full inline-block text-center px-4 py-2 bg-primary text-background font-bold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Play
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-background/50 border border-primary/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Framework Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Physics Engine',
                description: 'Advanced 2D physics with collision detection, gravity, and impulse resolution',
              },
              {
                title: 'Asset Management',
                description: 'Optimized sprite loading and caching system for performance',
              },
              {
                title: 'Environment System',
                description: 'Particle effects, parallax backgrounds, and dynamic lighting',
              },
              {
                title: 'Countdown Scoring',
                description: 'Time-based gameplay with combo system and milestone bonuses',
              },
              {
                title: 'Level Editor',
                description: 'Full-featured drag-and-drop level designer with undo/redo',
              },
              {
                title: 'Game Engine',
                description: 'Complete orchestration of physics, rendering, and gameplay systems',
              },
            ].map((feature, i) => (
              <div key={i} className="bg-background border border-primary/10 rounded-lg p-4">
                <h3 className="font-bold text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-foreground/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
