'use client'

import React from 'react'
import { CountdownScorer } from '@/lib/scoring/countdown'

interface ResultsScreenProps {
  scorer: CountdownScorer
  levelName: string
  difficulty: string
  onRetry?: () => void
  onMenu?: () => void
  isNewRecord?: boolean
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  scorer,
  levelName,
  difficulty,
  onRetry,
  onMenu,
  isNewRecord = false,
}) => {
  const breakdown = scorer.getScoreBreakdown()
  const finalScore = breakdown.totalScore
  const timeBonus = breakdown.timeBonus
  const timeUsed = scorer.getTimeLimit() - scorer.getTimeRemaining()

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${mins}m ${secs}s`
  }

  const getDifficultyColor = (): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-400'
      case 'medium':
        return 'text-yellow-400'
      case 'hard':
        return 'text-red-400'
      default:
        return 'text-white'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 text-center border-b border-slate-700">
          <h1 className="text-5xl font-bold text-white mb-2">Level Complete!</h1>
          <p className="text-xl text-blue-100">{levelName}</p>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8">
          {/* Record Banner */}
          {isNewRecord && (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 text-center border-2 border-yellow-400 animate-pulse">
              <p className="text-2xl font-bold text-white">🏆 NEW RECORD! 🏆</p>
            </div>
          )}

          {/* Final Score */}
          <div className="text-center">
            <p className="text-sm font-mono text-slate-400 uppercase tracking-wider mb-2">Final Score</p>
            <p className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              {finalScore.toLocaleString()}
            </p>

            {/* Difficulty Badge */}
            <div className={`inline-block px-6 py-2 rounded-full border-2 border-current ${getDifficultyColor()}`}>
              <p className="font-bold uppercase tracking-wider">{difficulty}</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 text-center">
              <p className="text-sm text-slate-400 mb-2">Base Points</p>
              <p className="text-3xl font-bold text-green-400">
                {breakdown.baseScore.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 text-center">
              <p className="text-sm text-slate-400 mb-2">Difficulty Bonus</p>
              <p className="text-3xl font-bold text-blue-400">
                {breakdown.difficultyBonus.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 text-center col-span-2">
              <p className="text-sm text-slate-400 mb-2">Time Bonus</p>
              <p className="text-3xl font-bold text-yellow-400">
                +{timeBonus.toLocaleString()} ({formatTime(scorer.getTimeRemaining())} remaining)
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-xs text-slate-400 mb-2">Time Used</p>
                <p className="text-2xl font-mono font-bold text-white">
                  {formatTime(timeUsed)}
                </p>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-xs text-slate-400 mb-2">Combo Multiplier</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {breakdown.comboMultiplier.toFixed(1)}x
                </p>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-xs text-slate-400 mb-2">Multiplier</p>
                <p className="text-2xl font-bold text-purple-400">
                  {scorer.getDifficultyModifier().toFixed(1)}x
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-slate-700 pt-6 flex gap-4">
            <button
              onClick={onRetry}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-lg rounded-lg transition-all transform hover:scale-105 active:scale-95"
            >
              Retry
            </button>

            <button
              onClick={onMenu}
              className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg rounded-lg transition-all transform hover:scale-105 active:scale-95"
            >
              Back to Menu
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-500 border-t border-slate-700 pt-6">
            <p>Completed at {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
