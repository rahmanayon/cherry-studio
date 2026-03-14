'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface GameResultsProps {
  gameName: string
  finalScore: number
  stats: {
    level?: number
    kills?: number
    pipesPassed?: number
    bestCombo?: number
    targetsReached?: number
    timeBonus: number
  }
  onPlayAgain: () => void
  onBackToGames: () => void
}

export function GameResults({ gameName, finalScore, stats, onPlayAgain, onBackToGames }: GameResultsProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-background border-game-primary/50 p-6">
        <h2 className="text-3xl font-bold text-center mb-6 text-game-accent">Game Over!</h2>

        <div className="space-y-4 mb-8">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-game-primary/30">
            <p className="text-sm text-muted-foreground mb-1">Final Score</p>
            <p className="text-4xl font-bold text-game-primary">{finalScore.toLocaleString()}</p>
          </div>

          {stats.level !== undefined && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/50 rounded-lg p-3 border border-game-primary/30">
                <p className="text-xs text-muted-foreground mb-1">Level Reached</p>
                <p className="text-2xl font-bold text-game-accent">{stats.level}</p>
              </div>
              {stats.bestCombo !== undefined && (
                <div className="bg-slate-900/50 rounded-lg p-3 border border-game-primary/30">
                  <p className="text-xs text-muted-foreground mb-1">Best Combo</p>
                  <p className="text-2xl font-bold text-game-secondary">{stats.bestCombo}x</p>
                </div>
              )}
            </div>
          )}

          {stats.pipesPassed !== undefined && (
            <div className="bg-slate-900/50 rounded-lg p-3 border border-game-primary/30">
              <p className="text-xs text-muted-foreground mb-1">Pipes Navigated</p>
              <p className="text-xl font-bold text-game-accent">{stats.pipesPassed}</p>
            </div>
          )}

          {stats.kills !== undefined && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/50 rounded-lg p-3 border border-game-primary/30">
                <p className="text-xs text-muted-foreground mb-1">Enemies Defeated</p>
                <p className="text-2xl font-bold text-game-danger">{stats.kills}</p>
              </div>
              {stats.targetsReached !== undefined && (
                <div className="bg-slate-900/50 rounded-lg p-3 border border-game-primary/30">
                  <p className="text-xs text-muted-foreground mb-1">Milestones</p>
                  <p className="text-2xl font-bold text-game-success">{stats.targetsReached}</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-slate-900/50 rounded-lg p-3 border border-game-primary/30">
            <p className="text-xs text-muted-foreground mb-1">Time Bonus</p>
            <p className="text-lg font-bold text-game-success">+{stats.timeBonus.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={onPlayAgain} className="flex-1 bg-game-primary hover:bg-game-primary/90">
            Play Again
          </Button>
          <Button onClick={onBackToGames} variant="outline" className="flex-1">
            Back to Games
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">Score saved to your profile!</p>
      </Card>
    </div>
  )
}
