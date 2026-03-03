'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { LevelEditorUI } from '@/components/editor/LevelEditorUI'
import { LevelData } from '@/lib/levelBuilder/types'

export default function LevelEditorPage() {
  const [saveMessage, setSaveMessage] = useState('')

  const handleSave = (levelData: LevelData) => {
    // Save to localStorage for demo
    localStorage.setItem(`level-${levelData.metadata.id}`, JSON.stringify(levelData))
    setSaveMessage('Level saved successfully!')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-primary/20 px-6 py-4 flex justify-between items-center bg-background/50">
        <div>
          <h1 className="text-2xl font-bold text-primary">Level Editor</h1>
          <p className="text-sm text-foreground/60">Create and customize game levels</p>
        </div>
        <div className="flex gap-4 items-center">
          {saveMessage && (
            <div className="text-sm text-green-400 bg-green-400/10 px-4 py-2 rounded-lg">
              {saveMessage}
            </div>
          )}
          <Link
            href="/"
            className="px-4 py-2 bg-background border border-primary/30 text-foreground font-bold rounded-lg hover:bg-background/80 transition-colors"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Editor */}
      <LevelEditorUI onSave={handleSave} />
    </div>
  )
}
