'use client'

import React from 'react'

interface GameHUDProps {
  score: number
  timeRemaining: string
  combo: number
  targetScore: number
  isPaused: boolean
  onPause: () => void
  onResume: () => void
  onQuit: () => void
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  timeRemaining,
  combo,
  targetScore,
  isPaused,
  onPause,
  onResume,
  onQuit,
}) => {
  const scorePercentage = Math.min(100, (score / targetScore) * 100)
  const isLowTime = parseInt(timeRemaining.split(':')[1]) < 10

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-0 right-0 flex justify-between items-start px-6 pointer-events-auto">
        {/* Score and Progress */}
        <div className="bg-background/80 backdrop-blur border border-primary/20 rounded-lg p-4 min-w-64">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm text-foreground/60">Score</span>
            <span className="text-2xl font-bold text-primary">{score}</span>
          </div>
          <div className="w-full h-2 bg-background-alt rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
          <div className="text-xs text-foreground/50 mt-1">
            Target: {targetScore}
          </div>
        </div>

        {/* Time Display */}
        <div
          className={`text-6xl font-bold font-mono transition-colors ${
            isLowTime ? 'text-destructive animate-pulse' : 'text-primary'
          }`}
        >
          {timeRemaining}
        </div>

        {/* Combo Meter */}
        {combo > 1 && (
          <div className="bg-background/80 backdrop-blur border border-accent/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-accent">{combo}x</div>
            <div className="text-xs text-foreground/60">COMBO</div>
          </div>
        )}
      </div>

      {/* Pause Menu */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto">
          <h2 className="text-4xl font-bold text-foreground mb-8">PAUSED</h2>
          <div className="flex gap-4">
            <button
              onClick={onResume}
              className="px-8 py-3 bg-primary text-background font-bold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Resume
            </button>
            <button
              onClick={onQuit}
              className="px-8 py-3 bg-background border border-foreground/30 text-foreground font-bold rounded-lg hover:bg-background/80 transition-colors"
            >
              Quit
            </button>
          </div>
        </div>
      )}

      {/* Pause Button */}
      {!isPaused && (
        <button
          onClick={onPause}
          className="absolute top-4 right-4 px-4 py-2 bg-background/80 backdrop-blur border border-primary/20 rounded-lg hover:bg-background/90 transition-colors text-sm font-medium pointer-events-auto"
        >
          Pause
        </button>
      )}
    </div>
  )
}
