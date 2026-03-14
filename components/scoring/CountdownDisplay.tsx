'use client'

import React, { useEffect, useState } from 'react'
import { CountdownScorer } from '@/lib/scoring/countdown'

interface CountdownDisplayProps {
  scorer: CountdownScorer
  variant?: 'compact' | 'full'
  animated?: boolean
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  scorer,
  variant = 'full',
  animated = true,
}) => {
  const [, setUpdateTrigger] = useState(0)
  const [isPulsing, setIsPulsing] = useState(false)

  useEffect(() => {
    if (!animated) return

    const interval = setInterval(() => {
      setUpdateTrigger((prev) => prev + 1)

      // Check if critical
      if (scorer.isCritical()) {
        setIsPulsing(true)
      } else {
        setIsPulsing(false)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [animated, scorer])

  const timeRemaining = Math.ceil(scorer.getTimeRemaining())
  const urgencyColor = scorer.getUrgencyColor()
  const multiplier = scorer.getUrgencyMultiplier()

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getUrgencyLabel = (): string => {
    if (multiplier === 1) return 'Normal'
    if (multiplier === 1.5) return 'Hurry!'
    if (multiplier === 2) return 'Urgent!'
    return 'CRITICAL!'
  }

  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
          isPulsing ? 'animate-pulse' : ''
        }`}
        style={{
          borderColor: urgencyColor,
          backgroundColor: urgencyColor + '10',
        }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: urgencyColor,
            animation: isPulsing ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
          }}
        />
        <span
          className="text-lg font-mono font-bold"
          style={{ color: urgencyColor }}
        >
          {formatTime(timeRemaining)}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main Timer Display */}
      <div
        className={`relative flex items-center justify-center ${
          isPulsing ? 'animate-pulse' : ''
        }`}
      >
        {/* Outer ring */}
        <div
          className="absolute w-32 h-32 rounded-full border-4 transition-colors duration-300"
          style={{ borderColor: urgencyColor }}
        />

        {/* Inner circle */}
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm border-2 transition-colors duration-300"
          style={{ borderColor: urgencyColor + '80' }}
        >
          <div className="text-center">
            <div
              className="text-5xl font-mono font-bold"
              style={{ color: urgencyColor }}
            >
              {formatTime(timeRemaining)}
            </div>
            <div
              className="text-xs font-semibold uppercase tracking-wider mt-2 transition-colors duration-300"
              style={{ color: urgencyColor }}
            >
              {getUrgencyLabel()}
            </div>
          </div>
        </div>
      </div>

      {/* Multiplier Info */}
      <div className="flex gap-4 text-center">
        <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Score Multiplier</p>
          <p
            className="text-xl font-bold"
            style={{ color: urgencyColor }}
          >
            {multiplier.toFixed(1)}x
          </p>
        </div>

        <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Combo</p>
          <p className="text-xl font-bold text-yellow-400">
            {scorer.getScoreBreakdown().comboMultiplier.toFixed(1)}x
          </p>
        </div>
      </div>

      {/* Warning bar */}
      {scorer.isCritical() && (
        <div className="w-full max-w-xs h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 animate-pulse"
            style={{
              width: `${(timeRemaining / scorer.getTimeLimit()) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  )
}
