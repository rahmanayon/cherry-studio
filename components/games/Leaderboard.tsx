'use client'

import React from 'react'
import { Card } from '@/components/ui/card'

export interface LeaderboardEntry {
  rank: number
  score: number
  level: number
  gameId: string
  timestamp: number
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  gameId: string
  gameName: string
  maxEntries?: number
}

export function Leaderboard({ entries, gameName, maxEntries = 5 }: LeaderboardProps) {
  const displayEntries = entries.slice(0, maxEntries)
  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `${rank}.`
    }
  }

  return (
    <Card className="bg-slate-900/50 border-game-primary/30 p-4">
      <h3 className="font-bold text-game-accent mb-4">{gameName} Top Scores</h3>

      {displayEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No scores yet. Be the first!</p>
      ) : (
        <div className="space-y-2">
          {displayEntries.map((entry, index) => (
            <div key={`${entry.gameId}-${entry.timestamp}`} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
              <div className="flex items-center gap-3 flex-1">
                <span className="w-6 text-center font-bold text-game-primary">{getMedalEmoji(index + 1)}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Level {entry.level}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className="font-bold text-game-accent text-lg">{entry.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
