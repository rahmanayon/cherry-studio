'use client'

import React, { useState } from 'react'
import { GamePlay } from '@/components/game/GamePlay'
import { LevelData } from '@/lib/levelBuilder/types'

// Sample level data - in a real app, this would come from a database or API
const SAMPLE_LEVELS: Record<string, LevelData> = {
  '1': {
    metadata: {
      id: '1',
      name: 'Physics Playground',
      description: 'Test your physics understanding',
      difficulty: 'medium',
      timeLimit: 90,
      targetScore: 1500,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      author: 'Framework',
    },
    objects: [
      {
        id: 'spawn-1',
        type: 'spawn',
        position: { x: 100, y: 100 },
        width: 50,
        height: 50,
        rotation: 0,
        properties: { color: '#4ae290' },
      },
      {
        id: 'platform-1',
        type: 'platform',
        position: { x: 50, y: 500 },
        width: 300,
        height: 20,
        rotation: 0,
        properties: { color: '#888888', isStatic: true },
      },
      {
        id: 'obstacle-1',
        type: 'obstacle',
        position: { x: 400, y: 300 },
        width: 40,
        height: 40,
        rotation: 0,
        properties: { color: '#e24a4a' },
      },
      {
        id: 'goal-1',
        type: 'goal',
        position: { x: 900, y: 150 },
        width: 60,
        height: 60,
        rotation: 0,
        properties: { color: '#ffa500' },
      },
    ],
    environment: {
      ambientColor: '#1a1a2e',
      windForce: { x: 0, y: 0 },
      gravity: { x: 0, y: 0.6 },
    },
  },
  '2': {
    metadata: {
      id: '2',
      name: 'Gravity Rush',
      description: 'Navigate gravity-defying obstacles',
      difficulty: 'hard',
      timeLimit: 120,
      targetScore: 2500,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      author: 'Framework',
    },
    objects: [
      {
        id: 'spawn-2',
        type: 'spawn',
        position: { x: 50, y: 50 },
        width: 50,
        height: 50,
        rotation: 0,
        properties: { color: '#4ae290' },
      },
      {
        id: 'platform-2-1',
        type: 'platform',
        position: { x: 0, y: 550 },
        width: 400,
        height: 20,
        rotation: 0,
        properties: { color: '#888888', isStatic: true },
      },
      {
        id: 'platform-2-2',
        type: 'platform',
        position: { x: 600, y: 350 },
        width: 300,
        height: 20,
        rotation: 0,
        properties: { color: '#888888', isStatic: true },
      },
      {
        id: 'goal-2',
        type: 'goal',
        position: { x: 1100, y: 100 },
        width: 60,
        height: 60,
        rotation: 0,
        properties: { color: '#ffa500' },
      },
    ],
    environment: {
      ambientColor: '#1a1a2e',
      windForce: { x: 0.05, y: 0 },
      gravity: { x: 0, y: 0.8 },
    },
  },
  '3': {
    metadata: {
      id: '3',
      name: 'Time Attack',
      description: 'Complete levels before time runs out',
      difficulty: 'expert',
      timeLimit: 60,
      targetScore: 3000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      author: 'Framework',
    },
    objects: [
      {
        id: 'spawn-3',
        type: 'spawn',
        position: { x: 50, y: 100 },
        width: 50,
        height: 50,
        rotation: 0,
        properties: { color: '#4ae290' },
      },
      {
        id: 'collectible-3-1',
        type: 'collectible',
        position: { x: 250, y: 150 },
        width: 30,
        height: 30,
        rotation: 0,
        properties: { color: '#ffd700', pointValue: 100 },
      },
      {
        id: 'collectible-3-2',
        type: 'collectible',
        position: { x: 450, y: 200 },
        width: 30,
        height: 30,
        rotation: 0,
        properties: { color: '#ffd700', pointValue: 100 },
      },
      {
        id: 'goal-3',
        type: 'goal',
        position: { x: 1100, y: 150 },
        width: 60,
        height: 60,
        rotation: 0,
        properties: { color: '#ffa500' },
      },
    ],
    environment: {
      ambientColor: '#1a1a2e',
      windForce: { x: 0, y: 0 },
      gravity: { x: 0, y: 0.6 },
    },
  },
}

export default function PlayPage({ params }: { params: { id: string } }) {
  const levelData = SAMPLE_LEVELS[params.id]
  const [gameResult, setGameResult] = useState<any>(null)

  if (!levelData) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Level not found</h1>
          <a href="/" className="text-primary hover:underline">
            Back to menu
          </a>
        </div>
      </div>
    )
  }

  if (gameResult) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="bg-background border border-primary rounded-lg p-8 max-w-md text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">Level Complete!</h2>
          <div className="bg-background-alt rounded-lg p-4 mb-6">
            <p className="text-foreground/60 text-sm mb-2">Final Score</p>
            <p className="text-4xl font-bold text-accent">{gameResult}</p>
          </div>
          <a
            href="/"
            className="inline-block w-full px-4 py-2 bg-primary text-background font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Menu
          </a>
        </div>
      </div>
    )
  }

  return <GamePlay levelData={levelData} onGameEnd={setGameResult} />
}
