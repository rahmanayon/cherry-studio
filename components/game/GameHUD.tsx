'use client'

import React from 'react'
import { CountdownScorer } from '@/lib/scoring/countdown'

interface GameHUDProps {
  scorer: CountdownScorer
  level: string
  isGameOver?: boolean
  isPaused?: boolean
}

export const GameHUD: React.FC<GameHUDProps> = ({
  scorer,
  level,
  isGameOver = false,
  isPaused = false,
}) => {
  const timeRemaining = Math.ceil(scorer.getTimeRemaining())
  const urgencyMultiplier = scorer.getUrgencyMultiplier()
  const urgencyColor = scorer.getUrgencyColor()
  const score = scorer.getScore()
  const breakdown = scorer.getScoreBreakdown()

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getUrgencyLabel = (): string => {
    if (urgencyMultiplier === 1) return 'Normal'
    if (urgencyMultiplier === 1.5) return 'Hurry!'
    if (urgencyMultiplier === 2) return 'Urgent!'
    return 'CRITICAL!'
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top HUD Bar */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm pointer-events-auto flex items-center justify-between px-6">
        {/* Score */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Score</span>
          <span className="text-3xl font-bold text-white tabular-nums">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Level */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Level</span>
          <span className="text-xl font-bold text-white">{level}</span>
        </div>

        {/* Countdown Timer */}
        <div className="flex flex-col items-end gap-1">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300"
            style={{
              borderColor: urgencyColor,
              backgroundColor: urgencyColor + '10',
            }}
          >
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: urgencyColor }}
            />
            <span
              className="text-2xl font-mono font-bold"
              style={{ color: urgencyColor }}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
          <span
            className="text-xs font-mono font-semibold uppercase tracking-wider"
            style={{ color: urgencyColor }}
          >
            {getUrgencyLabel()}
          </span>
        </div>
      </div>

      {/* Bottom HUD Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm pointer-events-auto flex items-center justify-between px-6">
        {/* Combo Multiplier */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Combo</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-yellow-400">
              {breakdown.comboMultiplier.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="flex gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono text-slate-400">Base</span>
            <span className="text-lg font-bold text-green-400">
              +{breakdown.baseScore.toLocaleString()}
            </span>
          </div>
          {breakdown.timeBonus > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono text-slate-400">Time Bonus</span>
              <span className="text-lg font-bold text-blue-400">
                +{breakdown.timeBonus.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Difficulty Badge */}
        <div className="px-4 py-2 rounded-lg border border-slate-600 bg-slate-900/50">
          <span className="text-xs font-mono text-slate-300 uppercase tracking-wider">
            Multiplier: {scorer.getDifficultyModifier().toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Game Over Screen */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-8 text-center max-w-md">
            <h2 className="text-4xl font-bold text-white mb-6">Game Over!</h2>

            <div className="space-y-4 mb-8">
              <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-2">Final Score</p>
                <p className="text-4xl font-bold text-white">
                  {score.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Base Points</p>
                  <p className="text-lg font-bold text-green-400">
                    {breakdown.baseScore.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Time Bonus</p>
                  <p className="text-lg font-bold text-blue-400">
                    {breakdown.timeBonus.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                Retry
              </button>
              <button className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors">
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Screen */}
      {isPaused && !isGameOver && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-8">Paused</h2>
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              Resume
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
