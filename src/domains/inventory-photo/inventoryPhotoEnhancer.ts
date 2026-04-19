import type { InventoryPhotoEnhanceRequest, InventoryPhotoEnhanceResult } from './inventoryPhoto.types'

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function createImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Unable to decode image'))
    }
    img.src = objectUrl
  })
}

async function loadSourceAsBlob(input: InventoryPhotoEnhanceRequest): Promise<Blob> {
  if (input.sourceFile) return input.sourceFile
  if (!input.sourceUrl) throw new Error('No image source provided')

  const res = await fetch(input.sourceUrl)
  if (!res.ok) throw new Error(`Source fetch failed: ${res.status}`)
  return await res.blob()
}

function applySharpenPass(ctx: CanvasRenderingContext2D, width: number, height: number, strength = 0.35) {
  const src = ctx.getImageData(0, 0, width, height)
  const dst = ctx.createImageData(width, height)
  const s = src.data
  const d = dst.data

  const k = [0, -1, 0, -1, 5, -1, 0, -1, 0]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      for (let c = 0; c < 3; c++) {
        let acc = 0
        let ki = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const si = ((y + ky) * width + (x + kx)) * 4 + c
            acc += s[si] * k[ki++]
          }
        }
        const orig = s[idx + c]
        const mixed = orig + (acc - orig) * strength
        d[idx + c] = clamp(Math.round(mixed), 0, 255)
      }
      d[idx + 3] = s[idx + 3]
    }
  }

  ctx.putImageData(dst, 0, 0)
}

async function enhanceLocally(input: InventoryPhotoEnhanceRequest): Promise<InventoryPhotoEnhanceResult> {
  const blob = await loadSourceAsBlob(input)
  const img = await createImageFromBlob(blob)

  const upscale = clamp(input.upscaleFactor ?? 1.18, 1, 1.35)
  const maxLongEdge = 2200
  const srcW = img.naturalWidth || img.width
  const srcH = img.naturalHeight || img.height
  const longEdge = Math.max(srcW, srcH)
  const targetLong = Math.min(Math.round(longEdge * upscale), maxLongEdge)
  const ratio = targetLong / longEdge
  const width = Math.max(1, Math.round(srcW * ratio))
  const height = Math.max(1, Math.round(srcH * ratio))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Unable to initialize canvas context')

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Pass 1: upscale and normalize tone for cleaner luxury presentation.
  ctx.filter = 'contrast(1.08) saturate(1.06) brightness(1.03)'
  ctx.drawImage(img, 0, 0, width, height)
  ctx.filter = 'none'

  // Pass 2: very light denoise via subtle blur blend.
  const denoiseCanvas = document.createElement('canvas')
  denoiseCanvas.width = width
  denoiseCanvas.height = height
  const denoiseCtx = denoiseCanvas.getContext('2d')
  if (denoiseCtx) {
    denoiseCtx.filter = 'blur(0.35px)'
    denoiseCtx.drawImage(canvas, 0, 0)
    ctx.globalAlpha = 0.12
    ctx.drawImage(denoiseCanvas, 0, 0)
    ctx.globalAlpha = 1
  }

  // Pass 3: sharpen edge detail without changing vehicle identity.
  applySharpenPass(ctx, width, height, 0.3)

  const dataUrl = canvas.toDataURL('image/jpeg', clamp(input.quality ?? 0.9, 0.75, 0.96))
  return {
    ok: true,
    method: 'local-canvas',
    dataUrl,
    width,
    height,
  }
}

async function enhanceViaEndpoint(input: InventoryPhotoEnhanceRequest): Promise<InventoryPhotoEnhanceResult> {
  const endpoint = import.meta.env.VITE_INVENTORY_PHOTO_ENHANCER_ENDPOINT
  if (!endpoint) throw new Error('No external enhancement endpoint configured')

  const blob = await loadSourceAsBlob(input)
  const form = new FormData()
  form.append('file', blob, 'inventory-photo.jpg')

  const res = await fetch(endpoint, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`External enhancer failed: ${res.status}`)

  const responseBlob = await res.blob()
  const reader = new FileReader()
  const dataUrl = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read enhanced response'))
    reader.readAsDataURL(responseBlob)
  })

  return {
    ok: true,
    method: 'external-endpoint',
    dataUrl,
  }
}

export async function enhanceInventoryPhotoAsset(
  input: InventoryPhotoEnhanceRequest,
): Promise<InventoryPhotoEnhanceResult> {
  try {
    if (import.meta.env.VITE_INVENTORY_PHOTO_ENHANCER_ENDPOINT) {
      return await enhanceViaEndpoint(input)
    }
    return await enhanceLocally(input)
  } catch (error) {
    return {
      ok: false,
      method: import.meta.env.VITE_INVENTORY_PHOTO_ENHANCER_ENDPOINT ? 'external-endpoint' : 'local-canvas',
      error: error instanceof Error ? error.message : 'Enhancement failed',
    }
  }
}
