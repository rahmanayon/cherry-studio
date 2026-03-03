'use client'

import React from 'react'
import { Card } from '@/components/ui/card'

interface PlayerStatsCardProps {
  gameId: string
  gameName: string
  stats: {
    totalGames: number
    bestScore: number
    averageScore: number
    highestLevel: number
    totalPlayTime: number
  }
}

export function PlayerStatsCard({ gameName, stats }: PlayerStatsCardProps) {
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  return (
    <Card className="bg-slate-900/50 border-game-primary/30 p-4">
      <h3 className="font-bold text-game-accent mb-3">{gameName} Stats</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Games Played:</span>
          <span className="font-semibold text-foreground">{stats.totalGames}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Best Score:</span>
          <span className="font-semibold text-game-primary">{stats.bestScore.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Average Score:</span>
          <span className="font-semibold text-game-secondary">{stats.averageScore.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Highest Level:</span>
          <span className="font-semibold text-game-accent">{stats.highestLevel}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Play Time:</span>
          <span className="font-semibold text-game-success">{formatTime(stats.totalPlayTime)}</span>
        </div>
      </div>
    </Card>
  )
}
