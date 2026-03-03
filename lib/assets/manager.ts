import { Sprite, AudioAsset, ParticleAsset, Tilemap, AssetLibrary } from './types'

/**
 * Asset Manager - handles loading, caching, and optimization of game assets
 */
export class AssetManager {
  private library: AssetLibrary = {
    sprites: new Map(),
    tilemaps: new Map(),
    audio: new Map(),
    particles: new Map(),
  }

  private imageCache: Map<string, HTMLImageElement> = new Map()
  private audioCache: Map<string, HTMLAudioElement> = new Map()
  private loadedAssets: Set<string> = new Set()

  /**
   * Register a sprite asset
   */
  registerSprite(sprite: Sprite): void {
    this.library.sprites.set(sprite.id, sprite)
  }

  /**
   * Register multiple sprites
   */
  registerSprites(sprites: Sprite[]): void {
    sprites.forEach(sprite => this.registerSprite(sprite))
  }

  /**
   * Get sprite by ID
   */
  getSprite(id: string): Sprite | undefined {
    return this.library.sprites.get(id)
  }

  /**
   * Load and cache sprite image
   */
  async loadSpriteImage(spriteId: string): Promise<HTMLImageElement> {
    const sprite = this.library.sprites.get(spriteId)
    if (!sprite) throw new Error(`Sprite ${spriteId} not found`)

    if (this.imageCache.has(spriteId)) {
      return this.imageCache.get(spriteId)!
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        this.imageCache.set(spriteId, img)
        this.loadedAssets.add(spriteId)
        resolve(img)
      }
      img.onerror = () => reject(new Error(`Failed to load sprite: ${spriteId}`))
      img.src = sprite.imageUrl
    })
  }

  /**
   * Get cached sprite image
   */
  getSpriteImage(spriteId: string): HTMLImageElement | undefined {
    return this.imageCache.get(spriteId)
  }

  /**
   * Register audio asset
   */
  registerAudio(audio: AudioAsset): void {
    this.library.audio.set(audio.id, audio)
  }

  /**
   * Get audio asset
   */
  getAudio(id: string): AudioAsset | undefined {
    return this.library.audio.get(id)
  }

  /**
   * Load and cache audio
   */
  async loadAudio(audioId: string): Promise<HTMLAudioElement> {
    const audio = this.library.audio.get(audioId)
    if (!audio) throw new Error(`Audio ${audioId} not found`)

    if (this.audioCache.has(audioId)) {
      return this.audioCache.get(audioId)!
    }

    return new Promise((resolve, reject) => {
      const audioElement = new Audio()
      audioElement.oncanplaythrough = () => {
        this.audioCache.set(audioId, audioElement)
        this.loadedAssets.add(audioId)
        resolve(audioElement)
      }
      audioElement.onerror = () => reject(new Error(`Failed to load audio: ${audioId}`))
      audioElement.src = audio.audioUrl
      audioElement.loop = audio.loop || false
      audioElement.volume = audio.volume || 1
    })
  }

  /**
   * Get cached audio
   */
  getAudioElement(audioId: string): HTMLAudioElement | undefined {
    return this.audioCache.get(audioId)
  }

  /**
   * Register particle asset
   */
  registerParticle(particle: ParticleAsset): void {
    this.library.particles.set(particle.id, particle)
  }

  /**
   * Get particle asset
   */
  getParticle(id: string): ParticleAsset | undefined {
    return this.library.particles.get(id)
  }

  /**
   * Register tilemap
   */
  registerTilemap(tilemap: Tilemap): void {
    this.library.tilemaps.set(tilemap.id, tilemap)
  }

  /**
   * Get tilemap
   */
  getTilemap(id: string): Tilemap | undefined {
    return this.library.tilemaps.get(id)
  }

  /**
   * Preload multiple assets
   */
  async preloadAssets(assetIds: string[]): Promise<void> {
    const promises: Promise<any>[] = []

    assetIds.forEach(id => {
      if (this.library.sprites.has(id)) {
        promises.push(this.loadSpriteImage(id))
      } else if (this.library.audio.has(id)) {
        promises.push(this.loadAudio(id))
      }
    })

    await Promise.all(promises)
  }

  /**
   * Get all sprites
   */
  getAllSprites(): Sprite[] {
    return Array.from(this.library.sprites.values())
  }

  /**
   * Get all audio
   */
  getAllAudio(): AudioAsset[] {
    return Array.from(this.library.audio.values())
  }

  /**
   * Get all particles
   */
  getAllParticles(): ParticleAsset[] {
    return Array.from(this.library.particles.values())
  }

  /**
   * Clear cache (useful for memory management)
   */
  clearCache(assetId?: string): void {
    if (assetId) {
      this.imageCache.delete(assetId)
      this.audioCache.delete(assetId)
      this.loadedAssets.delete(assetId)
    } else {
      this.imageCache.clear()
      this.audioCache.clear()
      this.loadedAssets.clear()
    }
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage(): { images: number; audio: number } {
    return {
      images: this.imageCache.size,
      audio: this.audioCache.size,
    }
  }

  /**
   * Check if asset is loaded
   */
  isAssetLoaded(assetId: string): boolean {
    return this.loadedAssets.has(assetId)
  }

  /**
   * Export library as JSON
   */
  exportLibrary(): object {
    return {
      sprites: Array.from(this.library.sprites.values()),
      audio: Array.from(this.library.audio.values()),
      particles: Array.from(this.library.particles.values()),
    }
  }
}
