// Game progress and statistics storage system

export interface GameStats {
  gameId: string
  bestScore: number
  highestLevel: number
  totalGamesPlayed: number
  totalTime: number // milliseconds
  lastPlayedDate: number // timestamp
  personalRecords: {
    score: number
    level: number
    combo: number
    [key: string]: number | string
  }
}

export interface GameSession {
  id: string
  gameId: string
  score: number
  level: number
  combo: number
  duration: number
  timestamp: number
  completed: boolean
}

const STORAGE_PREFIX = 'dcb_games_'

export class GameStorage {
  static getStats(gameId: string): GameStats | null {
    try {
      const key = `${STORAGE_PREFIX}stats_${gameId}`
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (e) {
      console.error('[v0] Failed to get game stats:', e)
      return null
    }
  }

  static saveStats(gameId: string, stats: GameStats): void {
    try {
      const key = `${STORAGE_PREFIX}stats_${gameId}`
      localStorage.setItem(key, JSON.stringify(stats))
    } catch (e) {
      console.error('[v0] Failed to save game stats:', e)
    }
  }

  static updateStats(gameId: string, updates: Partial<GameStats>): void {
    const current = this.getStats(gameId) || this.createDefaultStats(gameId)
    const updated = { ...current, ...updates }
    this.saveStats(gameId, updated)
  }

  static saveSession(session: GameSession): void {
    try {
      const key = `${STORAGE_PREFIX}session_${session.id}`
      localStorage.setItem(key, JSON.stringify(session))

      // Add to sessions list
      const sessionsList = this.getAllSessions()
      sessionsList.push(session)
      localStorage.setItem(`${STORAGE_PREFIX}sessions_list`, JSON.stringify(sessionsList))
    } catch (e) {
      console.error('[v0] Failed to save session:', e)
    }
  }

  static getAllSessions(gameId?: string): GameSession[] {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}sessions_list`)
      const sessions = data ? JSON.parse(data) : []
      return gameId ? sessions.filter((s: GameSession) => s.gameId === gameId) : sessions
    } catch (e) {
      console.error('[v0] Failed to get sessions:', e)
      return []
    }
  }

  static getLeaderboard(gameId: string, limit: number = 10): GameSession[] {
    const sessions = this.getAllSessions(gameId)
    return sessions
      .filter(s => s.completed)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  static getPlayerStats(gameId: string): {
    totalGames: number
    bestScore: number
    averageScore: number
    highestLevel: number
    totalPlayTime: number
  } {
    const sessions = this.getAllSessions(gameId)
    const completedSessions = sessions.filter(s => s.completed)

    if (completedSessions.length === 0) {
      return {
        totalGames: 0,
        bestScore: 0,
        averageScore: 0,
        highestLevel: 0,
        totalPlayTime: 0,
      }
    }

    const scores = completedSessions.map(s => s.score)
    const levels = completedSessions.map(s => s.level)
    const totalTime = sessions.reduce((acc, s) => acc + s.duration, 0)

    return {
      totalGames: completedSessions.length,
      bestScore: Math.max(...scores),
      averageScore: Math.floor(scores.reduce((a, b) => a + b, 0) / scores.length),
      highestLevel: Math.max(...levels),
      totalPlayTime: totalTime,
    }
  }

  static clearGameData(gameId: string): void {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}stats_${gameId}`)
      const sessionsList = this.getAllSessions()
      const filtered = sessionsList.filter(s => s.gameId !== gameId)
      localStorage.setItem(`${STORAGE_PREFIX}sessions_list`, JSON.stringify(filtered))
    } catch (e) {
      console.error('[v0] Failed to clear game data:', e)
    }
  }

  private static createDefaultStats(gameId: string): GameStats {
    return {
      gameId,
      bestScore: 0,
      highestLevel: 1,
      totalGamesPlayed: 0,
      totalTime: 0,
      lastPlayedDate: Date.now(),
      personalRecords: {
        score: 0,
        level: 1,
        combo: 0,
      },
    }
  }
}
