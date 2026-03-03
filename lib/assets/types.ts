/**
 * Asset types for the game framework
 */

export type AssetType = 'sprite' | 'tilemap' | 'audio' | 'particle'

export interface Sprite {
  id: string
  name: string
  imageUrl: string
  width: number
  height: number
  frameWidth?: number
  frameHeight?: number
  frames?: number
  animationSpeed?: number
  cached?: boolean
}

export interface Tilemap {
  id: string
  name: string
  tileSize: number
  tiles: number[][]
  tileAssets: Map<number, Sprite>
}

export interface AudioAsset {
  id: string
  name: string
  audioUrl: string
  loop?: boolean
  volume?: number
}

export interface ParticleAsset {
  id: string
  name: string
  spriteId: string
  particleCount: number
  lifetime: number
  speed: number
  color?: string
  opacity?: number
}

export interface AssetLibrary {
  sprites: Map<string, Sprite>
  tilemaps: Map<string, Tilemap>
  audio: Map<string, AudioAsset>
  particles: Map<string, ParticleAsset>
}
