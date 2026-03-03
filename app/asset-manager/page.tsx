'use client'

import Link from 'next/link'

export default function AssetManagerPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-primary hover:underline mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-primary mb-2">Asset Manager</h1>
          <p className="text-foreground/60">Manage and optimize your game assets</p>
        </div>

        {/* Asset Management Interface */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sprite Management */}
          <div className="bg-background border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Sprites</h2>
            <p className="text-foreground/60 text-sm mb-4">
              Upload and manage sprite assets with automatic optimization
            </p>
            <button className="w-full px-4 py-2 bg-primary text-background font-bold rounded-lg hover:bg-primary/90 transition-colors">
              Upload Sprites
            </button>
          </div>

          {/* Audio Management */}
          <div className="bg-background border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Audio Assets</h2>
            <p className="text-foreground/60 text-sm mb-4">
              Manage background music and sound effects
            </p>
            <button className="w-full px-4 py-2 bg-primary text-background font-bold rounded-lg hover:bg-primary/90 transition-colors">
              Upload Audio
            </button>
          </div>

          {/* Particle Effects */}
          <div className="bg-background border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Particles</h2>
            <p className="text-foreground/60 text-sm mb-4">
              Create and configure particle effect systems
            </p>
            <button className="w-full px-4 py-2 bg-primary text-background font-bold rounded-lg hover:bg-primary/90 transition-colors">
              Create Particle Effect
            </button>
          </div>

          {/* Memory Usage */}
          <div className="bg-background border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Memory Usage</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-foreground/60">Images</span>
                  <span className="text-sm font-bold text-foreground">0 MB</span>
                </div>
                <div className="h-2 bg-background-alt rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '0%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-foreground/60">Audio</span>
                  <span className="text-sm font-bold text-foreground">0 MB</span>
                </div>
                <div className="h-2 bg-background-alt rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '0%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Library */}
        <div className="mt-8 bg-background border border-primary/20 rounded-lg p-6">
          <h2 className="text-xl font-bold text-primary mb-4">Asset Library</h2>
          <div className="bg-background-alt rounded-lg p-8 text-center">
            <p className="text-foreground/60 mb-4">No assets uploaded yet</p>
            <p className="text-sm text-foreground/40">
              Upload sprites, audio, and particle effects to populate your asset library
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
