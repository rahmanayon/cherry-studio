/**
 * Countdown-Based Scoring System
 */

export interface ScoreEvent {
  type: 'point' | 'combo' | 'timeBonus' | 'milestone' | 'penalty'
  points: number
  timestamp: number
  description: string
}

export interface ScoringConfig {
  basePoints: number
  timeMultiplier: number // Points gained per second remaining
  comboWindow: number // milliseconds to maintain combo
  comboMultiplier: number // multiplier per combo count
  milestoneBonuses: { [score: number]: number } // score thresholds and bonuses
}

/**
 * Scoring Manager - handles countdown timer and point calculation
 */
export class ScoringSystem {
  private score: number = 0
  private timeRemaining: number = 60 // Default 60 seconds
  private maxTime: number = 60
  private isActive: boolean = false
  private comboCount: number = 0
  private lastComboTime: number = 0
  private scoreHistory: ScoreEvent[] = []
  private config: ScoringConfig = {
    basePoints: 10,
    timeMultiplier: 1,
    comboWindow: 2000,
    comboMultiplier: 1.25,
    milestoneBonuses: {
      100: 50,
      500: 200,
      1000: 500,
    },
  }
  private startTime: number = 0
  private pausedTime: number = 0

  constructor(config: Partial<ScoringConfig> = {}) {
    this.config = { ...this.config, ...config }
  }

  /**
   * Initialize and start the countdown
   */
  start(duration: number = 60): void {
    this.maxTime = duration
    this.timeRemaining = duration
    this.score = 0
    this.comboCount = 0
    this.scoreHistory = []
    this.isActive = true
    this.startTime = Date.now()
    this.pausedTime = 0
  }

  /**
   * Add points with combo multiplier
   */
  addPoints(basePoints: number): void {
    if (!this.isActive) return

    const now = Date.now()
    const timeSinceLastCombo = now - this.lastComboTime

    // Reset combo if too much time has passed
    if (timeSinceLastCombo > this.config.comboWindow) {
      this.comboCount = 0
    }

    // Apply combo multiplier
    this.comboCount++
    const comboMultiplier = Math.pow(this.config.comboMultiplier, this.comboCount - 1)
    const pointsToAdd = Math.floor(basePoints * comboMultiplier)

    this.score += pointsToAdd
    this.lastComboTime = now

    // Check for milestones
    const newScore = this.score
    Object.entries(this.config.milestoneBonuses).forEach(([threshold, bonus]) => {
      if (newScore >= parseInt(threshold) && newScore - pointsToAdd < parseInt(threshold)) {
        this.score += bonus
        this.scoreHistory.push({
          type: 'milestone',
          points: bonus,
          timestamp: now,
          description: `Milestone ${threshold} reached!`,
        })
      }
    })

    this.scoreHistory.push({
      type: 'point',
      points: pointsToAdd,
      timestamp: now,
      description: `+${pointsToAdd} points (combo x${this.comboCount})`,
    })
  }

  /**
   * Apply time bonus based on remaining time
   */
  applyTimeBonus(): void {
    if (!this.isActive) return

    const timeBonus = Math.floor(this.timeRemaining * this.config.timeMultiplier)
    this.score += timeBonus

    this.scoreHistory.push({
      type: 'timeBonus',
      points: timeBonus,
      timestamp: Date.now(),
      description: `Time bonus: +${timeBonus} points`,
    })
  }

  /**
   * Penalize player
   */
  penalize(points: number): void {
    if (!this.isActive) return

    this.score = Math.max(0, this.score - points)
    this.comboCount = 0

    this.scoreHistory.push({
      type: 'penalty',
      points: -points,
      timestamp: Date.now(),
      description: `-${points} penalty`,
    })
  }

  /**
   * Update timer (call every frame)
   */
  update(deltaTime: number = 0.016): void {
    if (!this.isActive) return

    const elapsed = (Date.now() - this.startTime - this.pausedTime) / 1000
    this.timeRemaining = Math.max(0, this.maxTime - elapsed)

    // Check if time is up
    if (this.timeRemaining <= 0) {
      this.end()
    }
  }

  /**
   * Pause the timer
   */
  pause(): void {
    this.pausedTime = Date.now() - this.startTime
  }

  /**
   * Resume the timer
   */
  resume(): void {
    this.startTime = Date.now() - this.pausedTime
  }

  /**
   * End the scoring session
   */
  end(): void {
    this.isActive = false
    this.applyTimeBonus()
  }

  /**
   * Get current score
   */
  getScore(): number {
    return this.score
  }

  /**
   * Get remaining time
   */
  getTimeRemaining(): number {
    return Math.max(0, this.timeRemaining)
  }

  /**
   * Get time as formatted string (MM:SS)
   */
  getFormattedTime(): string {
    const minutes = Math.floor(this.timeRemaining / 60)
    const seconds = Math.floor(this.timeRemaining % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  /**
   * Get current combo count
   */
  getComboCount(): number {
    return this.comboCount
  }

  /**
   * Get combo multiplier
   */
  getComboMultiplier(): number {
    return Math.pow(this.config.comboMultiplier, Math.max(0, this.comboCount - 1))
  }

  /**
   * Check if scoring is active
   */
  isRunning(): boolean {
    return this.isActive
  }

  /**
   * Get score history
   */
  getHistory(): ScoreEvent[] {
    return [...this.scoreHistory]
  }

  /**
   * Get stats
   */
  getStats(): {
    finalScore: number
    timeRemaining: number
    maxCombo: number
    accuracy: number
  } {
    const maxCombo = Math.max(1, ...this.scoreHistory.map((e, i, arr) => {
      let count = 1
      for (let j = i - 1; j >= 0 && arr[j].type === 'point'; j--) count++
      return count
    }))

    return {
      finalScore: this.score,
      timeRemaining: this.timeRemaining,
      maxCombo,
      accuracy: Math.min(100, Math.floor((this.score / (this.maxTime * 100)) * 100)),
    }
  }

  /**
   * Reset scoring system
   */
  reset(): void {
    this.score = 0
    this.timeRemaining = this.maxTime
    this.isActive = false
    this.comboCount = 0
    this.scoreHistory = []
    this.startTime = 0
    this.pausedTime = 0
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<ScoringConfig>): void {
    this.config = { ...this.config, ...config }
  }
}
