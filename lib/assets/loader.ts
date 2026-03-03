// Asset management system for sprites, audio, and optimized rendering

export interface AssetMetadata {
  id: string
  type: 'sprite' | 'audio' | 'background'
  path: string
  width?: number
  height?: number
  frameCount?: number
  duration?: number // for audio
  optimized: boolean
  cached: boolean
  loadedAt?: number
  size?: number // bytes
}

export interface SpriteFrame {
  x: number
  y: number
  width: number
  height: number
  duration?: number
}

export class AssetLoader {
  private imageCache: Map<string, HTMLImageElement> = new Map()
  private audioCache: Map<string, HTMLAudioElement> = new Map()
  private spriteSheets: Map<string, SpriteFrame[]> = new Map()
  private assetMetadata: Map<string, AssetMetadata> = new Map()
  private loadPromises: Map<string, Promise<any>> = new Map()
  private maxCacheSize: number = 50 * 1024 * 1024 // 50MB

  // Preload images
  async loadImage(id: string, path: string): Promise<HTMLImageElement> {
    // Return from cache if available
    if (this.imageCache.has(id)) {
      return this.imageCache.get(id)!
    }

    // Return existing promise if loading
    if (this.loadPromises.has(`image-${id}`)) {
      return this.loadPromises.get(`image-${id}`)!
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        this.imageCache.set(id, img)
        this.assetMetadata.set(id, {
          id,
          type: 'sprite',
          path,
          width: img.width,
          height: img.height,
          optimized: true,
          cached: true,
          loadedAt: Date.now(),
          size: this.estimateImageSize(img),
        })
        this.loadPromises.delete(`image-${id}`)
        resolve(img)
      }

      img.onerror = () => {
        this.loadPromises.delete(`image-${id}`)
        reject(new Error(`Failed to load image: ${path}`))
      }

      img.src = path
    })

    this.loadPromises.set(`image-${id}`, promise)
    return promise
  }

  // Preload audio
  async loadAudio(id: string, path: string): Promise<HTMLAudioElement> {
    if (this.audioCache.has(id)) {
      return this.audioCache.get(id)!
    }

    if (this.loadPromises.has(`audio-${id}`)) {
      return this.loadPromises.get(`audio-${id}`)!
    }

    const promise = new Promise<HTMLAudioElement>((resolve, reject) => {
      const audio = new Audio()
      audio.crossOrigin = 'anonymous'

      audio.onloadedmetadata = () => {
        this.audioCache.set(id, audio)
        this.assetMetadata.set(id, {
          id,
          type: 'audio',
          path,
          duration: audio.duration,
          optimized: true,
          cached: true,
          loadedAt: Date.now(),
        })
        this.loadPromises.delete(`audio-${id}`)
        resolve(audio)
      }

      audio.onerror = () => {
        this.loadPromises.delete(`audio-${id}`)
        reject(new Error(`Failed to load audio: ${path}`))
      }

      audio.src = path
    })

    this.loadPromises.set(`audio-${id}`, promise)
    return promise
  }

  // Define sprite sheet animation frames
  registerSpriteSheet(id: string, frames: SpriteFrame[]): void {
    this.spriteSheets.set(id, frames)
  }

  getSpriteSheet(id: string): SpriteFrame[] | undefined {
    return this.spriteSheets.get(id)
  }

  // Batch load multiple assets
  async loadBatch(
    assets: Array<{ id: string; path: string; type: 'sprite' | 'audio' }>
  ): Promise<void> {
    const promises = assets.map((asset) => {
      if (asset.type === 'sprite') {
        return this.loadImage(asset.id, asset.path)
      } else {
        return this.loadAudio(asset.id, asset.path)
      }
    })

    await Promise.all(promises)
  }

  // Get cached image
  getImage(id: string): HTMLImageElement | undefined {
    return this.imageCache.get(id)
  }

  // Get cached audio
  getAudio(id: string): HTMLAudioElement | undefined {
    return this.audioCache.get(id)
  }

  // Get asset metadata
  getAssetMetadata(id: string): AssetMetadata | undefined {
    return this.assetMetadata.get(id)
  }

  // Get all assets metadata
  getAllAssets(): AssetMetadata[] {
    return Array.from(this.assetMetadata.values())
  }

  // Unload specific asset
  unloadAsset(id: string): void {
    const metadata = this.assetMetadata.get(id)

    if (metadata?.type === 'sprite') {
      this.imageCache.delete(id)
    } else if (metadata?.type === 'audio') {
      const audio = this.audioCache.get(id)
      if (audio) {
        audio.pause()
        this.audioCache.delete(id)
      }
    }

    this.assetMetadata.delete(id)
  }

  // Clear entire cache
  clearCache(): void {
    this.imageCache.forEach((img) => {
      // Images don't have a specific cleanup
    })

    this.audioCache.forEach((audio) => {
      audio.pause()
    })

    this.imageCache.clear()
    this.audioCache.clear()
    this.spriteSheets.clear()
    this.assetMetadata.clear()
    this.loadPromises.clear()
  }

  // Get cache statistics
  getCacheStats(): {
    imageCount: number
    audioCount: number
    estimatedSize: number
    spriteSheetCount: number
  } {
    let totalSize = 0
    this.assetMetadata.forEach((metadata) => {
      if (metadata.size) {
        totalSize += metadata.size
      }
    })

    return {
      imageCount: this.imageCache.size,
      audioCount: this.audioCache.size,
      estimatedSize: totalSize,
      spriteSheetCount: this.spriteSheets.size,
    }
  }

  // Optimize asset (convert, compress, etc)
  async optimizeAsset(id: string): Promise<void> {
    const metadata = this.assetMetadata.get(id)
    if (!metadata) return

    // Mark as optimized (in real implementation, would do compression)
    metadata.optimized = true
    this.assetMetadata.set(id, metadata)
  }

  // Estimate image file size
  private estimateImageSize(img: HTMLImageElement): number {
    return img.width * img.height * 4 // RGBA = 4 bytes per pixel (rough estimate)
  }

  // Check if cache is full
  isCacheFull(): boolean {
    const stats = this.getCacheStats()
    return stats.estimatedSize > this.maxCacheSize
  }

  // Set max cache size
  setMaxCacheSize(bytes: number): void {
    this.maxCacheSize = bytes
  }
}

// Singleton instance
let loaderInstance: AssetLoader | null = null

export function getAssetLoader(): AssetLoader {
  if (!loaderInstance) {
    loaderInstance = new AssetLoader()
  }
  return loaderInstance
}

export function createAssetLoader(): AssetLoader {
  loaderInstance = new AssetLoader()
  return loaderInstance
}
