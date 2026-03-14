export interface GameState {
  id: string
  name: string
  description: string
  icon: string
  category: 'arcade' | 'puzzle' | 'strategy'
  difficulty: 'easy' | 'medium' | 'hard'
  maxScore: number
  timeLimit: number
  rules: string[]
}

export interface PlayerScore {
  gameId: string
  playerId: string
  playerName: string
  score: number
  timeRemaining: number
  completedAt: Date
  difficulty: string
  combo: number
  accuracy?: number
}

export interface TournamentWeek {
  weekNumber: number
  startDate: Date
  endDate: Date
  games: GameState[]
  leaderboard: PlayerScore[]
  active: boolean
}

export interface GameSession {
  sessionId: string
  gameId: string
  playerId: string
  startTime: Date
  endTime?: Date
  score: number
  timeRemaining: number
  isPaused: boolean
  gameState: Record<string, any>
}
