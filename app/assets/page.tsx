'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAssetLoader } from '@/lib/assets/loader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Asset {
  id: string
  name: string
  type: 'sprite' | 'audio' | 'background'
  size: number
  dimensions?: string
  duration?: string
  created: string
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filter, setFilter] = useState<'all' | 'sprite' | 'audio' | 'background'>('all')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    // Load assets from loader
    const loader = getAssetLoader()
    const metadata = loader.getAllAssets()

    const formattedAssets: Asset[] = metadata.map((m) => ({
      id: m.id,
      name: m.id,
      type: m.type,
      size: m.size || 0,
      dimensions: m.width && m.height ? `${m.width}x${m.height}` : undefined,
      duration: m.duration ? `${Math.round(m.duration)}s` : undefined,
      created: m.loadedAt ? new Date(m.loadedAt).toLocaleDateString() : 'Unknown',
    }))

    setAssets(formattedAssets)
  }, [])

  const filteredAssets = assets.filter((asset) => filter === 'all' || asset.type === filter)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setIsUploading(true)

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 50))
      setUploadProgress(i)
    }

    // Create mock assets
    const newAssets: Asset[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const isImage = file.type.startsWith('image/')
      const isAudio = file.type.startsWith('audio/')

      newAssets.push({
        id: `asset-${Date.now()}-${i}`,
        name: file.name,
        type: isImage ? 'sprite' : isAudio ? 'audio' : 'background',
        size: file.size,
        dimensions: isImage ? '512x512' : undefined,
        duration: isAudio ? '3:45' : undefined,
        created: new Date().toLocaleDateString(),
      })
    }

    setAssets([...assets, ...newAssets])
    setIsUploading(false)
    setUploadProgress(0)
    event.target.value = '' // Reset input
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sprite':
        return '🖼️'
      case 'audio':
        return '🔊'
      case 'background':
        return '🌅'
      default:
        return '📄'
    }
  }

  const stats = {
    totalAssets: assets.length,
    totalSize: assets.reduce((sum, a) => sum + a.size, 0),
    spriteCount: assets.filter((a) => a.type === 'sprite').length,
    audioCount: assets.filter((a) => a.type === 'audio').length,
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            ← Game Hub
          </Link>
          <h1 className="text-2xl font-bold text-white">Asset Manager</h1>
          <div className="w-40" />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Upload Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Upload Assets</h2>

          <Card className="bg-slate-800/50 border-slate-700 border-dashed border-2 p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="text-6xl">📤</div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Upload Game Assets</h3>
                <p className="text-slate-400 mb-4">Drag and drop images, audio, and backgrounds</p>
              </div>

              <input
                type="file"
                multiple
                accept="image/*,audio/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
              />

              <label htmlFor="file-upload">
                <Button asChild>
                  <span className="cursor-pointer">Choose Files</span>
                </Button>
              </label>

              {isUploading && (
                <div className="w-full max-w-xs">
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-400 mt-2 text-center">{uploadProgress}%</p>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Statistics */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Statistics</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Assets', value: stats.totalAssets },
              { label: 'Total Size', value: formatFileSize(stats.totalSize) },
              { label: 'Sprites', value: stats.spriteCount },
              { label: 'Audio Files', value: stats.audioCount },
            ].map((stat, index) => (
              <Card key={index} className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-slate-700 p-6 text-center">
                <p className="text-sm text-slate-400 mb-2">{stat.label}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Asset Browser */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Asset Library</h2>

            <div className="flex gap-2">
              {['all', 'sprite', 'audio', 'background'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type as any)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'sprite' ? 'Sprites' : type === 'audio' ? 'Audio' : 'Backgrounds'}
                </button>
              ))}
            </div>
          </div>

          {filteredAssets.length === 0 ? (
            <Card className="bg-slate-800/30 border-slate-700 p-12 text-center">
              <p className="text-slate-400 text-lg">No assets found. Upload your first asset to get started!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => (
                <Card
                  key={asset.id}
                  className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-colors overflow-hidden group"
                >
                  {/* Thumbnail */}
                  <div className="h-32 bg-slate-700/50 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                    <span className="text-5xl">{getTypeIcon(asset.type)}</span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="font-semibold text-white truncate mb-2">{asset.name}</p>

                    <div className="space-y-1 text-xs text-slate-400 mb-4">
                      <p>Type: {asset.type}</p>
                      <p>Size: {formatFileSize(asset.size)}</p>
                      {asset.dimensions && <p>Dimensions: {asset.dimensions}</p>}
                      {asset.duration && <p>Duration: {asset.duration}</p>}
                      <p>Created: {asset.created}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Use
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
