// Countdown-based scoring system with urgency mechanics

import { ScoringConfig } from '../types/level'

export interface ScoreBreakdown {
  baseScore: number
  timeBonus: number
  difficultyBonus: number
  comboMultiplier: number
  totalScore: number
}

export class CountdownScorer {
  private basePoints: number = 1000
  private timeMultiplier: number = 10
  private bonusPoints: number = 500
  private penaltyPoints: number = 100
  private difficultyModifier: number = 1
  private timeRemaining: number = 0
  private timeLimit: number = 60
  private currentScore: number = 0
  private scoreBreakdown: ScoreBreakdown

  constructor(config?: ScoringConfig) {
    if (config) {
      this.basePoints = config.basePoints
      this.timeMultiplier = config.timeMultiplier
      this.bonusPoints = config.bonusPoints
      this.penaltyPoints = config.penaltyPoints
      this.difficultyModifier = config.difficultyModifier
    }

    this.scoreBreakdown = {
      baseScore: 0,
      timeBonus: 0,
      difficultyBonus: 0,
      comboMultiplier: 1,
      totalScore: 0,
    }
  }

  setTimeLimit(seconds: number): void {
    this.timeLimit = seconds
    this.timeRemaining = seconds
  }

  getTimeRemaining(): number {
    return this.timeRemaining
  }

  getTimeLimit(): number {
    return this.timeLimit
  }

  updateTime(deltaTime: number): void {
    this.timeRemaining = Math.max(0, this.timeRemaining - deltaTime)
  }

  // Add points for completing objectives
  addBasePoints(): void {
    const points = Math.round(this.basePoints * this.scoreBreakdown.comboMultiplier)
    this.currentScore += points
    this.scoreBreakdown.baseScore += points
    this.scoreBreakdown.totalScore = this.calculateTotal()
  }

  // Add time-based bonus (faster completion = higher bonus)
  calculateTimeBonus(): number {
    const timeUsedRatio = (this.timeLimit - this.timeRemaining) / this.timeLimit
    const bonusMultiplier = Math.max(0.5, 2 - timeUsedRatio) // 0.5x to 2x bonus

    const bonus = Math.round(this.timeRemaining * this.timeMultiplier * bonusMultiplier * this.difficultyModifier)
    return Math.max(0, bonus)
  }

  // Add difficulty bonus
  addDifficultyBonus(): void {
    const bonus = Math.round(this.bonusPoints * this.difficultyModifier)
    this.currentScore += bonus
    this.scoreBreakdown.difficultyBonus += bonus
    this.scoreBreakdown.totalScore = this.calculateTotal()
  }

  // Increment combo multiplier
  incrementCombo(): void {
    this.scoreBreakdown.comboMultiplier += 0.1
  }

  // Reset combo multiplier
  resetCombo(): void {
    this.scoreBreakdown.comboMultiplier = 1
  }

  // Deduct points for penalties
  addPenalty(): void {
    const penalty = Math.round(this.penaltyPoints * this.difficultyModifier)
    this.currentScore = Math.max(0, this.currentScore - penalty)
    this.scoreBreakdown.totalScore = this.calculateTotal()
  }

  // Calculate urgency multiplier based on remaining time
  getUrgencyMultiplier(): number {
    const timePercentage = this.timeRemaining / this.timeLimit

    if (timePercentage > 0.5) {
      return 1 // Normal
    } else if (timePercentage > 0.25) {
      return 1.5 // Increased urgency
    } else if (timePercentage > 0.1) {
      return 2 // High urgency
    } else {
      return 3 // Critical urgency
    }
  }

  // Get urgency color for UI feedback
  getUrgencyColor(): string {
    const multiplier = this.getUrgencyMultiplier()

    if (multiplier === 1) return '#4ade80' // Green
    if (multiplier === 1.5) return '#facc15' // Yellow
    if (multiplier === 2) return '#f97316' // Orange
    return '#ef4444' // Red
  }

  // Check if time is critical
  isCritical(): boolean {
    return this.timeRemaining / this.timeLimit < 0.1
  }

  // Finalize score with time bonus
  finalizeScore(): number {
    const timeBonus = this.calculateTimeBonus()
    this.currentScore += timeBonus
    this.scoreBreakdown.timeBonus = timeBonus
    this.scoreBreakdown.totalScore = this.calculateTotal()

    return this.scoreBreakdown.totalScore
  }

  // Get current score
  getScore(): number {
    return this.currentScore
  }

  // Get score breakdown
  getScoreBreakdown(): ScoreBreakdown {
    return { ...this.scoreBreakdown }
  }

  // Calculate final total
  private calculateTotal(): number {
    return (
      this.scoreBreakdown.baseScore +
      this.scoreBreakdown.timeBonus +
      this.scoreBreakdown.difficultyBonus
    )
  }

  // Reset scorer
  reset(): void {
    this.currentScore = 0
    this.timeRemaining = this.timeLimit
    this.scoreBreakdown = {
      baseScore: 0,
      timeBonus: 0,
      difficultyBonus: 0,
      comboMultiplier: 1,
      totalScore: 0,
    }
  }

  // Set difficulty level (easy=0.5, medium=1, hard=2)
  setDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void {
    const modifiers = {
      easy: 0.5,
      medium: 1,
      hard: 2,
    }
    this.difficultyModifier = modifiers[difficulty]
  }

  // Get difficulty modifier
  getDifficultyModifier(): number {
    return this.difficultyModifier
  }
}

// Leaderboard entry structure
export interface LeaderboardEntry {
  rank: number
  playerName: string
  score: number
  level: string
  difficulty: string
  completedAt: Date
  timeUsed: number
  accuracy?: number // 0-100
}

export class Leaderboard {
  private entries: LeaderboardEntry[] = []
  private maxEntries: number = 100

  constructor(maxEntries: number = 100) {
    this.maxEntries = maxEntries
  }

  addEntry(
    playerName: string,
    score: number,
    level: string,
    difficulty: string,
    timeUsed: number,
    accuracy?: number
  ): void {
    const entry: LeaderboardEntry = {
      rank: 0,
      playerName,
      score,
      level,
      difficulty,
      completedAt: new Date(),
      timeUsed,
      accuracy,
    }

    this.entries.push(entry)
    this.entries.sort((a, b) => b.score - a.score)

    // Remove entries beyond max
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries)
    }

    // Update ranks
    this.entries.forEach((e, index) => {
      e.rank = index + 1
    })
  }

  getTopScores(count: number = 10): LeaderboardEntry[] {
    return this.entries.slice(0, count)
  }

  getPlayerRank(playerName: string): number {
    const entry = this.entries.find((e) => e.playerName === playerName)
    return entry?.rank ?? -1
  }

  getEntriesByLevel(level: string): LeaderboardEntry[] {
    return this.entries.filter((e) => e.level === level)
  }

  getEntriesByDifficulty(difficulty: string): LeaderboardEntry[] {
    return this.entries.filter((e) => e.difficulty === difficulty)
  }

  getAllEntries(): LeaderboardEntry[] {
    return [...this.entries]
  }

  clearLeaderboard(): void {
    this.entries = []
  }

  exportLeaderboard(): string {
    return JSON.stringify(this.entries, null, 2)
  }

  importLeaderboard(jsonData: string): void {
    try {
      this.entries = JSON.parse(jsonData)
      this.entries.forEach((e, index) => {
        e.rank = index + 1
        e.completedAt = new Date(e.completedAt)
      })
    } catch (error) {
      console.error('Failed to import leaderboard:', error)
    }
  }
}
