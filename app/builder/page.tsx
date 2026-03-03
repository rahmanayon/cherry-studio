'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { LevelEditor } from '@/components/levelBuilder/LevelEditor'
import { Level, LEVEL_PRESETS } from '@/lib/levelBuilder/levelData'
import { Button } from '@/components/ui/button'

export default function BuilderPage() {
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null)
  const [showLevelSelect, setShowLevelSelect] = useState(true)

  const handleSaveLevel = (level: Level) => {
    console.log('Saving level:', level)
    // In a real app, this would save to a database
    alert(`Level "${level.name}" saved!`)
  }

  const handlePublishLevel = (level: Level) => {
    console.log('Publishing level:', level)
    alert(`Level "${level.name}" published!`)
  }

  const startNewLevel = (preset?: keyof typeof LEVEL_PRESETS) => {
    if (preset) {
      setCurrentLevel({ ...LEVEL_PRESETS[preset] })
    } else {
      setCurrentLevel(undefined)
    }
    setShowLevelSelect(false)
  }

  if (showLevelSelect) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-black/40 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              ← Game Hub
            </Link>
            <h1 className="text-2xl font-bold text-white">Level Builder</h1>
            <div className="w-32" />
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Create a New Level</h2>
            <p className="text-slate-400 mb-8">Choose a preset template or start from scratch</p>

            {/* Preset Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {/* From Scratch */}
              <div
                onClick={() => startNewLevel()}
                className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg p-8 cursor-pointer hover:border-blue-500 hover:bg-slate-800/70 transition-all group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📝</div>
                <h3 className="text-lg font-bold text-white mb-2">From Scratch</h3>
                <p className="text-sm text-slate-400">Start with a blank canvas</p>
              </div>

              {/* Platformer */}
              <div
                onClick={() => startNewLevel('platformer')}
                className="bg-slate-800/50 border-2 border-slate-700 rounded-lg p-8 cursor-pointer hover:border-blue-500 hover:bg-slate-800/70 transition-all group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏃</div>
                <h3 className="text-lg font-bold text-white mb-2">Platformer</h3>
                <p className="text-sm text-slate-400">Jump and navigate platforms</p>
              </div>

              {/* Obstacle */}
              <div
                onClick={() => startNewLevel('obstacle')}
                className="bg-slate-800/50 border-2 border-slate-700 rounded-lg p-8 cursor-pointer hover:border-blue-500 hover:bg-slate-800/70 transition-all group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚡</div>
                <h3 className="text-lg font-bold text-white mb-2">Obstacle</h3>
                <p className="text-sm text-slate-400">Dodge obstacles and hazards</p>
              </div>

              {/* Collectibles */}
              <div
                onClick={() => startNewLevel('collectibles')}
                className="bg-slate-800/50 border-2 border-slate-700 rounded-lg p-8 cursor-pointer hover:border-blue-500 hover:bg-slate-800/70 transition-all group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💎</div>
                <h3 className="text-lg font-bold text-white mb-2">Collectibles</h3>
                <p className="text-sm text-slate-400">Collect items for points</p>
              </div>

              {/* Survival */}
              <div
                onClick={() => startNewLevel('survival')}
                className="bg-slate-800/50 border-2 border-slate-700 rounded-lg p-8 cursor-pointer hover:border-blue-500 hover:bg-slate-800/70 transition-all group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🛡️</div>
                <h3 className="text-lg font-bold text-white mb-2">Survival</h3>
                <p className="text-sm text-slate-400">Avoid enemies and survive</p>
              </div>
            </div>
          </div>

          {/* Recent Levels */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Recent Levels</h2>
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8 text-center">
              <p className="text-slate-400">No recent levels. Create one to get started!</p>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return <LevelEditor initialLevel={currentLevel} onSave={handleSaveLevel} onPublish={handlePublishLevel} />
}
