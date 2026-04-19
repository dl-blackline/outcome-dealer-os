export type InventoryPhotoVariant = 'original' | 'enhanced' | 'placeholder'

export type InventoryEnhancementStatus = 'original' | 'enhanced' | 'failed' | 'placeholder'

export interface InventoryPhotoEnhancementMetadata {
  variant: InventoryPhotoVariant
  enhancementStatus: InventoryEnhancementStatus
  originalPhotoId?: string
  isActivePublic?: boolean
  enhancedUrl?: string
  enhancedStoragePath?: string
}

export interface InventoryPhotoEnhanceRequest {
  sourceUrl?: string
  sourceFile?: File
  quality?: number
  upscaleFactor?: number
}

export interface InventoryPhotoEnhanceResult {
  ok: boolean
  method: 'local-canvas' | 'external-endpoint'
  dataUrl?: string
  width?: number
  height?: number
  error?: string
}
