import { useCallback, useRef, useState } from 'react'
import {
  useInventoryCatalog,
  createRuntimeInventoryRecord,
  updateRuntimeInventoryRecordFull,
  attachInventoryPhotos,
  removeInventoryPhoto,
  setInventoryCoverPhoto,
  reorderInventoryPhotos,
  uploadInventoryPhotoFile,
  enhanceInventoryPhoto,
  enhanceAllInventoryPhotos,
  useEnhancedPhotoAsPublic as setEnhancedPhotoAsPublic,
  revertEnhancedPhotoToOriginal,
  pickBestInventoryPhoto,
  type InventoryRecord,
  type InventoryPhotoRecord,
  type InventoryRecordCreateInput,
  type InventoryRecordFullUpdate,
} from '@/domains/inventory/inventory.runtime'
import { useRouter } from '@/app/router'
import { InventoryPhotoImage } from '@/components/inventory/InventoryPhotoImage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  ArrowLeft,
  FloppyDisk,
  Trash,
  Star,
  Upload,
  Image,
  ArrowUp,
  ArrowDown,
  ArrowCounterClockwise,
  Eye,
  EyeSlash,
  MagnifyingGlass,
  CheckCircle,
  Warning,
  X,
  Camera,
  Sparkle,
} from '@phosphor-icons/react'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type View = 'list' | 'add' | 'edit'

interface UnitFormState {
  stockNumber: string
  vin: string
  year: string
  make: string
  model: string
  trim: string
  mileage: string
  bodyStyle: string
  price: string
  status: string
  color: string
  condition: string
  drivetrain: string
  engine: string
  transmission: string
  description: string
  featuresRaw: string
  available: boolean
  isPublished: boolean
  isFeatured: boolean
}

interface StagedPhoto {
  localId: string
  file: File
  previewUrl: string
  alt: string
  isCover: boolean
  uploading: boolean
  error: string | null
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

// ─────────────────────────────────────────
// Form defaults
// ─────────────────────────────────────────

const BLANK_FORM: UnitFormState = {
  stockNumber: '',
  vin: '',
  year: String(new Date().getFullYear()),
  make: '',
  model: '',
  trim: '',
  mileage: '',
  bodyStyle: '',
  price: '',
  status: 'inventory',
  color: '',
  condition: 'pre-owned',
  drivetrain: '',
  engine: '',
  transmission: '',
  description: '',
  featuresRaw: '',
  available: true,
  isPublished: false,
  isFeatured: false,
}

function recordToForm(r: InventoryRecord): UnitFormState {
  return {
    stockNumber: r.stockNumber || '',
    vin: r.vin || '',
    year: String(r.year),
    make: r.make,
    model: r.model,
    trim: r.trim || '',
    mileage: r.mileage > 0 ? String(r.mileage) : '',
    bodyStyle: r.bodyStyle || '',
    price: r.price > 0 ? String(r.price) : '',
    status: r.status || 'inventory',
    color: r.color || '',
    condition: r.condition || 'pre-owned',
    drivetrain: r.drivetrain || '',
    engine: r.engine || '',
    transmission: r.transmission || '',
    description: r.description || '',
    featuresRaw: (r.features || []).join('\n'),
    available: r.available,
    isPublished: r.isPublished,
    isFeatured: r.isFeatured,
  }
}

function validateForm(f: UnitFormState): string[] {
  const errors: string[] = []
  if (!f.make.trim()) errors.push('Make is required')
  if (!f.model.trim()) errors.push('Model is required')
  const yr = parseInt(f.year, 10)
  if (isNaN(yr) || yr < 1900 || yr > new Date().getFullYear() + 2)
    errors.push('Year must be a valid model year')
  if (f.price && isNaN(parseFloat(f.price))) errors.push('Price must be a number')
  if (f.mileage && isNaN(parseInt(f.mileage, 10))) errors.push('Mileage must be a number')
  return errors
}

function formToCreateInput(f: UnitFormState): InventoryRecordCreateInput {
  return {
    stockNumber: f.stockNumber || undefined,
    vin: f.vin || undefined,
    year: parseInt(f.year, 10),
    make: f.make.trim(),
    model: f.model.trim(),
    trim: f.trim || undefined,
    mileage: f.mileage ? parseInt(f.mileage, 10) : 0,
    bodyStyle: f.bodyStyle || undefined,
    price: f.price ? parseFloat(f.price) : 0,
    status: f.status,
    available: f.available,
    isPublished: f.isPublished,
    isFeatured: f.isFeatured,
    description: f.description || undefined,
    features: f.featuresRaw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    color: f.color || undefined,
    condition: f.condition || undefined,
    drivetrain: f.drivetrain || undefined,
    engine: f.engine || undefined,
    transmission: f.transmission || undefined,
  }
}

function formToFullUpdate(f: UnitFormState): InventoryRecordFullUpdate {
  return {
    stockNumber: f.stockNumber || undefined,
    vin: f.vin || undefined,
    year: parseInt(f.year, 10),
    make: f.make.trim(),
    model: f.model.trim(),
    trim: f.trim || undefined,
    mileage: f.mileage ? parseInt(f.mileage, 10) : 0,
    bodyStyle: f.bodyStyle || undefined,
    price: f.price ? parseFloat(f.price) : 0,
    status: f.status,
    available: f.available,
    isPublished: f.isPublished,
    isFeatured: f.isFeatured,
    description: f.description || undefined,
    features: f.featuresRaw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    color: f.color || undefined,
    condition: f.condition || undefined,
    drivetrain: f.drivetrain || undefined,
    engine: f.engine || undefined,
    transmission: f.transmission || undefined,
  }
}

// ─────────────────────────────────────────
// Toast
// ─────────────────────────────────────────

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const push = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++counter.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  return { toasts, push }
}

// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
        checked
          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
          : 'border-white/15 bg-white/5 text-slate-400 hover:border-white/30 hover:text-slate-200'
      }`}
    >
      {checked ? <CheckCircle size={13} weight="fill" /> : <X size={13} />}
      {label}
    </button>
  )
}

// ─────────────────────────────────────────
// Photo Manager
// ─────────────────────────────────────────

interface PhotoManagerProps {
  unitId: string
  existingPhotos: InventoryPhotoRecord[]
  isSupabaseBacked: boolean
  onRefresh: () => void
  toast: (msg: string, type?: Toast['type']) => void
}

function PhotoManager({ unitId, existingPhotos, isSupabaseBacked, onRefresh, toast }: PhotoManagerProps) {
  const [staged, setStaged] = useState<StagedPhoto[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [saving, setSaving] = useState(false)
  const [enhancingPhotoId, setEnhancingPhotoId] = useState<string | null>(null)
  const [enhancingAll, setEnhancingAll] = useState(false)

  const sorted = [...existingPhotos].sort((a, b) => a.sortOrder - b.sortOrder)

  function stageFiles(files: FileList | null) {
    if (!files) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const maxBytes = 10 * 1024 * 1024

    Array.from(files).forEach((file) => {
      if (!allowed.includes(file.type)) {
        toast(`${file.name}: unsupported format`, 'error')
        return
      }
      if (file.size > maxBytes) {
        toast(`${file.name}: exceeds 10MB limit`, 'error')
        return
      }
      const previewUrl = URL.createObjectURL(file)
      setStaged((prev) => [
        ...prev,
        {
          localId: `staged-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          previewUrl,
          alt: file.name.replace(/\.[^.]+$/, ''),
          isCover: existingPhotos.length === 0 && prev.length === 0,
          uploading: false,
          error: null,
        },
      ])
    })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    stageFiles(e.dataTransfer.files)
  }

  function removeStaged(localId: string) {
    setStaged((prev) => {
      const next = prev.filter((s) => s.localId !== localId)
      if (next.length > 0 && !next.some((s) => s.isCover)) {
        next[0].isCover = true
      }
      return next
    })
  }

  function setStagedCover(localId: string) {
    setStaged((prev) => prev.map((s) => ({ ...s, isCover: s.localId === localId })))
  }

  async function savePhotos() {
    if (staged.length === 0) return
    setSaving(true)

    try {
      const baseOrder = sorted.length
      const photosToAttach: Omit<InventoryPhotoRecord, 'id' | 'inventoryId'>[] = []

      for (let i = 0; i < staged.length; i++) {
        const s = staged[i]
        let url = s.previewUrl
        let storagePath: string | undefined

        if (isSupabaseBacked) {
          const uploaded = await uploadInventoryPhotoFile(unitId, s.file)
          if (uploaded) {
            url = uploaded.url
            storagePath = uploaded.storagePath
          } else {
            // fall through to data URL for resilience
            const reader = new FileReader()
            url = await new Promise<string>((res) => {
              reader.onload = (ev) => res(ev.target!.result as string)
              reader.readAsDataURL(s.file)
            })
          }
        } else {
          // Local fallback: store data URLs
          const reader = new FileReader()
          url = await new Promise<string>((res) => {
            reader.onload = (ev) => res(ev.target!.result as string)
            reader.readAsDataURL(s.file)
          })
        }

        photosToAttach.push({
          url,
          storagePath,
          alt: s.alt,
          sortOrder: baseOrder + i,
          isCover: s.isCover,
          source: isSupabaseBacked ? 'supabase' : 'repo',
        })
      }

      await attachInventoryPhotos(unitId, photosToAttach)

      // If a staged photo was marked cover, update existing to not be cover
      const hasCoverInStaged = photosToAttach.some((p) => p.isCover)
      if (hasCoverInStaged) {
        for (const existing of existingPhotos) {
          if (existing.isCover) {
            // remove cover from existing by picking it freshly after attach — let the first saved cover win
          }
        }
      }

      staged.forEach((s) => URL.revokeObjectURL(s.previewUrl))
      setStaged([])
      onRefresh()
      toast(`${photosToAttach.length} photo${photosToAttach.length !== 1 ? 's' : ''} saved`)
    } catch {
      toast('Failed to save photos', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(photoId: string) {
    await removeInventoryPhoto(unitId, photoId)
    onRefresh()
    toast('Photo removed')
  }

  async function handleCover(photoId: string) {
    await setInventoryCoverPhoto(unitId, photoId)
    onRefresh()
    toast('Cover photo updated')
  }

  async function handleMoveUp(idx: number) {
    if (idx === 0) return
    const ids = sorted.map((p) => p.id)
    ;[ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]]
    await reorderInventoryPhotos(unitId, ids)
    onRefresh()
  }

  async function handleMoveDown(idx: number) {
    if (idx >= sorted.length - 1) return
    const ids = sorted.map((p) => p.id)
    ;[ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]]
    await reorderInventoryPhotos(unitId, ids)
    onRefresh()
  }

  async function handleEnhance(photoId: string) {
    setEnhancingPhotoId(photoId)
    try {
      const enhanced = await enhanceInventoryPhoto(unitId, photoId)
      if (enhanced) {
        onRefresh()
        toast('Photo enhanced successfully')
      } else {
        toast('Unable to enhance this photo', 'error')
      }
    } catch {
      toast('Photo enhancement failed', 'error')
    } finally {
      setEnhancingPhotoId(null)
    }
  }

  async function handleEnhanceAll() {
    setEnhancingAll(true)
    try {
      const count = await enhanceAllInventoryPhotos(unitId)
      onRefresh()
      toast(count > 0 ? `Enhanced ${count} photo${count === 1 ? '' : 's'}` : 'No eligible photos to enhance')
    } catch {
      toast('Bulk enhancement failed', 'error')
    } finally {
      setEnhancingAll(false)
    }
  }

  async function handleUseEnhancedAsPublic(photoId: string) {
    try {
      await setEnhancedPhotoAsPublic(unitId, photoId)
      onRefresh()
      toast('Enhanced photo is now public cover')
    } catch {
      toast('Failed to set enhanced cover', 'error')
    }
  }

  async function handleRevertToOriginal(photoId: string) {
    try {
      await revertEnhancedPhotoToOriginal(unitId, photoId)
      onRefresh()
      toast('Reverted cover back to original photo')
    } catch {
      toast('Failed to revert enhanced cover', 'error')
    }
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Existing photos */}
      {sorted.length > 0 && (
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Attached Photos ({sorted.length})
          </p>
          {sorted.some((photo) => photo.variant !== 'enhanced' && photo.variant !== 'placeholder') && (
            <div className="mb-3 flex justify-end">
              <Button
                variant="outline"
                onClick={() => void handleEnhanceAll()}
                disabled={enhancingAll}
                className="gap-1.5 rounded-full text-xs uppercase tracking-[0.12em]"
              >
                <Sparkle size={14} />
                {enhancingAll ? 'Enhancing...' : 'Enhance All Photos'}
              </Button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {sorted.map((photo, idx) => (
              <div
                key={photo.id}
                className={`relative rounded-xl overflow-hidden border ${photo.isCover ? 'border-amber-400/50 ring-2 ring-amber-400/25' : 'border-white/15'}`}
              >
                <InventoryPhotoImage
                  photo={photo}
                  alt={photo.alt}
                  className="aspect-4/3 w-full object-cover bg-muted/30"
                />
                {photo.isCover && (
                  <div className="absolute left-2 top-2">
                    <Badge className="rounded-full bg-amber-500/80 text-[0.6rem] text-white px-1.5 py-0.5">
                      <Star size={9} weight="fill" className="mr-0.5" />
                      Cover
                    </Badge>
                  </div>
                )}
                {photo.variant === 'enhanced' && (
                  <div className="absolute right-2 top-2">
                    <Badge className="rounded-full bg-blue-500/80 px-1.5 py-0.5 text-[0.6rem] text-white">
                      Enhanced
                    </Badge>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/70 p-1.5">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="rounded p-1 text-slate-300 hover:text-white disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx >= sorted.length - 1}
                      className="rounded p-1 text-slate-300 hover:text-white disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    {!photo.isCover && (
                      <button
                        onClick={() => handleCover(photo.id)}
                        className="rounded p-1 text-amber-300 hover:text-amber-100"
                        title="Set as cover"
                      >
                        <Star size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(photo.id)}
                      className="rounded p-1 text-red-400 hover:text-red-200"
                      title="Remove"
                    >
                      <Trash size={12} />
                    </button>
                    {photo.variant !== 'enhanced' && photo.variant !== 'placeholder' && (
                      <button
                        onClick={() => void handleEnhance(photo.id)}
                        disabled={enhancingPhotoId === photo.id}
                        className="rounded p-1 text-blue-300 hover:text-blue-100 disabled:opacity-40"
                        title="Enhance photo"
                      >
                        <Sparkle size={12} />
                      </button>
                    )}
                    {photo.variant === 'enhanced' && (
                      <>
                        {!photo.isCover && (
                          <button
                            onClick={() => void handleUseEnhancedAsPublic(photo.id)}
                            className="rounded p-1 text-emerald-300 hover:text-emerald-100"
                            title="Use enhanced as cover"
                          >
                            <Eye size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => void handleRevertToOriginal(photo.id)}
                          className="rounded p-1 text-amber-300 hover:text-amber-100"
                          title="Revert to original cover"
                        >
                          <ArrowCounterClockwise size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staged (not yet saved) photos */}
      {staged.length > 0 && (
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.14em] text-amber-400">
            Pending Upload ({staged.length})
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {staged.map((s) => (
              <div
                key={s.localId}
                className={`relative rounded-xl overflow-hidden border border-dashed ${s.isCover ? 'border-amber-400/60' : 'border-white/20'}`}
              >
                <img src={s.previewUrl} alt={s.alt} className="aspect-4/3 w-full object-cover bg-muted/30" />
                {s.isCover && (
                  <div className="absolute left-2 top-2">
                    <Badge className="rounded-full bg-amber-500/80 text-[0.6rem] text-white px-1.5 py-0.5">
                      <Star size={9} weight="fill" className="mr-0.5" />
                      Cover
                    </Badge>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/70 p-1.5">
                  {!s.isCover && (
                    <button
                      onClick={() => setStagedCover(s.localId)}
                      className="rounded p-1 text-amber-300 hover:text-amber-100 text-[0.6rem] flex items-center gap-0.5"
                    >
                      <Star size={11} /> Cover
                    </button>
                  )}
                  <button
                    onClick={() => removeStaged(s.localId)}
                    className="ml-auto rounded p-1 text-red-400 hover:text-red-200"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-10 text-center transition-all ${
          dragOver ? 'border-blue-400/60 bg-blue-400/10' : 'border-white/15 hover:border-white/30 hover:bg-white/2'
        }`}
      >
        <Camera size={36} className="mb-3 text-muted-foreground/50" />
        <p className="text-sm font-medium text-slate-300">Drop photos here or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, WebP · Max 10MB per file</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          onChange={(e) => stageFiles(e.target.files)}
        />
      </div>

      {staged.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={savePhotos}
            disabled={saving}
            className="gap-1.5 rounded-full text-xs uppercase tracking-[0.12em]"
          >
            {saving ? (
              <>Saving…</>
            ) : (
              <>
                <Upload size={14} />
                Save {staged.length} Photo{staged.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}

      {sorted.length === 0 && staged.length === 0 && (
        <p className="text-center text-xs text-muted-foreground py-4">
          No photos yet — drag and drop images above to add them.
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Unit Form (Add / Edit)
// ─────────────────────────────────────────

interface UnitFormProps {
  mode: 'add' | 'edit'
  record?: InventoryRecord
  isSupabaseBacked: boolean
  onSave: (record: InventoryRecord) => void
  onCancel: () => void
  toast: (msg: string, type?: Toast['type']) => void
}

function UnitForm({ mode, record, isSupabaseBacked, onSave, onCancel, toast }: UnitFormProps) {
  const [form, setForm] = useState<UnitFormState>(
    record ? recordToForm(record) : BLANK_FORM,
  )
  const [tab, setTab] = useState<'details' | 'photos'>('details')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [currentRecord, setCurrentRecord] = useState<InventoryRecord | null>(record || null)
  const { refresh } = useInventoryCatalog()

  function set<K extends keyof UnitFormState>(key: K, value: UnitFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors([])
  }

  async function handleSave() {
    const errs = validateForm(form)
    if (errs.length > 0) {
      setErrors(errs)
      return
    }
    setSaving(true)
    try {
      let saved: InventoryRecord | null = null
      if (mode === 'add') {
        saved = await createRuntimeInventoryRecord(formToCreateInput(form))
        if (saved) {
          setCurrentRecord(saved)
          setTab('photos')
          toast('Unit created — add photos below')
        } else {
          toast('Failed to create unit', 'error')
        }
      } else if (record) {
        saved = await updateRuntimeInventoryRecordFull(record.id, formToFullUpdate(form))
        if (saved) {
          setCurrentRecord(saved)
          toast('Changes saved')
          onSave(saved)
        } else {
          toast('Failed to save changes', 'error')
        }
      }
    } catch {
      toast('An error occurred while saving', 'error')
    } finally {
      setSaving(false)
    }
  }

  const photosUnit = currentRecord || record

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="rounded-full border border-white/15 p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg font-bold">
              {mode === 'add' ? 'Add New Unit' : `Edit — ${record?.year} ${record?.make} ${record?.model}`}
            </h2>
            {mode === 'edit' && record && (
              <p className="text-xs text-muted-foreground mt-0.5">
                ID: {record.id} · Source: {record.source}
              </p>
            )}
          </div>
        </div>

        {/* Publish toggles */}
        <div className="hidden sm:flex items-center gap-2">
          <Toggle checked={form.available} onChange={(v) => set('available', v)} label="Available" />
          <Toggle checked={form.isPublished} onChange={(v) => set('isPublished', v)} label="Published" />
          <Toggle checked={form.isFeatured} onChange={(v) => set('isFeatured', v)} label="Featured" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-fit gap-1 rounded-xl border border-white/10 bg-white/3 p-1">
        {(['details', 'photos'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            disabled={t === 'photos' && mode === 'add' && !currentRecord}
            className={`rounded-lg px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all disabled:opacity-40 ${
              tab === t
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'details' ? 'Vehicle Details' : 'Photos'}
            {t === 'photos' && photosUnit && photosUnit.photos.length > 0 && (
              <span className="ml-1.5 rounded-full bg-white/15 px-1.5 py-0.5 text-[0.6rem]">
                {photosUnit.photos.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
          {errors.map((e) => (
            <p key={e} className="text-sm text-red-300 flex items-center gap-2">
              <Warning size={14} /> {e}
            </p>
          ))}
        </div>
      )}

      {tab === 'details' && (
        <div className="space-y-6">
          {/* Mobile toggles */}
          <div className="flex sm:hidden flex-wrap gap-2">
            <Toggle checked={form.available} onChange={(v) => set('available', v)} label="Available" />
            <Toggle checked={form.isPublished} onChange={(v) => set('isPublished', v)} label="Published" />
            <Toggle checked={form.isFeatured} onChange={(v) => set('isFeatured', v)} label="Featured" />
          </div>

          <Card className="border-white/10 bg-white/2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Identification</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FieldRow label="Stock # (optional)">
                <Input placeholder="STK-001" value={form.stockNumber} onChange={(e) => set('stockNumber', e.target.value)} />
              </FieldRow>
              <FieldRow label="VIN (optional)">
                <Input placeholder="1HGBH41J..." value={form.vin} onChange={(e) => set('vin', e.target.value.toUpperCase())} className="uppercase font-mono" />
              </FieldRow>
              <FieldRow label="Status">
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="inventory">Inventory</option>
                  <option value="frontline">Frontline</option>
                  <option value="recon">In Recon</option>
                  <option value="sold">Sold</option>
                  <option value="wholesale">Wholesale</option>
                </select>
              </FieldRow>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Vehicle *</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FieldRow label="Year *">
                <Input type="number" min="1900" max={new Date().getFullYear() + 2} placeholder="2024" value={form.year} onChange={(e) => set('year', e.target.value)} />
              </FieldRow>
              <FieldRow label="Make *">
                <Input placeholder="Toyota" value={form.make} onChange={(e) => set('make', e.target.value)} />
              </FieldRow>
              <FieldRow label="Model *">
                <Input placeholder="Camry" value={form.model} onChange={(e) => set('model', e.target.value)} />
              </FieldRow>
              <FieldRow label="Trim">
                <Input placeholder="XSE" value={form.trim} onChange={(e) => set('trim', e.target.value)} />
              </FieldRow>
              <FieldRow label="Body Style">
                <Input placeholder="Sedan" value={form.bodyStyle} onChange={(e) => set('bodyStyle', e.target.value)} />
              </FieldRow>
              <FieldRow label="Mileage">
                <Input type="number" min="0" placeholder="28500" value={form.mileage} onChange={(e) => set('mileage', e.target.value)} />
              </FieldRow>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Specs & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FieldRow label="Sale Price ($)">
                <Input type="number" min="0" placeholder="24900" value={form.price} onChange={(e) => set('price', e.target.value)} />
              </FieldRow>
              <FieldRow label="Color">
                <Input placeholder="Midnight Blue" value={form.color} onChange={(e) => set('color', e.target.value)} />
              </FieldRow>
              <FieldRow label="Condition">
                <select
                  value={form.condition}
                  onChange={(e) => set('condition', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="new">New</option>
                  <option value="pre-owned">Pre-Owned</option>
                  <option value="certified">Certified Pre-Owned</option>
                </select>
              </FieldRow>
              <FieldRow label="Drivetrain">
                <select
                  value={form.drivetrain}
                  onChange={(e) => set('drivetrain', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Not specified</option>
                  <option value="FWD">FWD</option>
                  <option value="RWD">RWD</option>
                  <option value="AWD">AWD</option>
                  <option value="4WD">4WD</option>
                </select>
              </FieldRow>
              <FieldRow label="Transmission">
                <Input placeholder="8-speed automatic" value={form.transmission} onChange={(e) => set('transmission', e.target.value)} />
              </FieldRow>
              <FieldRow label="Engine">
                <Input placeholder="2.5L 4-cylinder" value={form.engine} onChange={(e) => set('engine', e.target.value)} />
              </FieldRow>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Listing Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldRow label="Public Description">
                <Textarea
                  rows={3}
                  placeholder="Describe the vehicle for buyers…"
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                />
              </FieldRow>
              <FieldRow label="Highlights / Features (one per line)">
                <Textarea
                  rows={4}
                  placeholder="Sunroof&#10;Heated seats&#10;Apple CarPlay&#10;Backup camera"
                  value={form.featuresRaw}
                  onChange={(e) => set('featuresRaw', e.target.value)}
                />
              </FieldRow>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel} className="rounded-full text-xs uppercase tracking-[0.12em]">
              Cancel
            </Button>
            <Button
              disabled={saving}
              onClick={handleSave}
              className="gap-1.5 rounded-full text-xs uppercase tracking-[0.12em]"
            >
              <FloppyDisk size={14} />
              {saving ? 'Saving…' : mode === 'add' ? 'Create Unit' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

      {tab === 'photos' && photosUnit && (
        <Card className="border-white/10 bg-white/2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Image size={15} />
              Photo Management
              {isSupabaseBacked ? (
                <Badge className="rounded-full bg-emerald-600/20 text-emerald-300 text-[0.6rem]">Supabase Storage</Badge>
              ) : (
                <Badge className="rounded-full bg-amber-600/20 text-amber-300 text-[0.6rem]">Local Fallback</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoManager
              unitId={photosUnit.id}
              existingPhotos={photosUnit.photos}
              isSupabaseBacked={isSupabaseBacked}
              onRefresh={() => { void refresh() }}
              toast={toast}
            />
          </CardContent>
        </Card>
      )}

      {tab === 'photos' && !photosUnit && (
        <div className="rounded-xl border border-white/10 bg-white/2 p-8 text-center text-sm text-muted-foreground">
          Save the vehicle details first to enable photo management.
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Inventory List
// ─────────────────────────────────────────

interface InventoryListProps {
  records: InventoryRecord[]
  loading: boolean
  onAdd: () => void
  onEdit: (record: InventoryRecord) => void
}

const fmt = new Intl.NumberFormat('en-US')
const fmtPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function InventoryList({ records, loading, onAdd, onEdit }: InventoryListProps) {
  const [search, setSearch] = useState('')

  const filtered = records.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.year.toString().includes(q) ||
      r.make.toLowerCase().includes(q) ||
      r.model.toLowerCase().includes(q) ||
      (r.vin || '').toLowerCase().includes(q) ||
      (r.stockNumber || '').toLowerCase().includes(q)
    )
  })

  const coverPhoto = (r: InventoryRecord) => pickBestInventoryPhoto(r)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {records.length} unit{records.length !== 1 ? 's' : ''} total ·{' '}
            {records.filter((r) => r.isPublished).length} published
          </p>
        </div>
        <Button onClick={onAdd} className="gap-1.5 rounded-full text-xs uppercase tracking-[0.12em] shrink-0">
          <Plus size={14} />
          Add New Unit
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlass
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search by year, make, model, VIN, or stock…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <Card>
        {loading ? (
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Loading inventory…
          </CardContent>
        ) : filtered.length === 0 ? (
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            {search ? `No results for "${search}"` : 'No inventory units yet. Click Add New Unit to get started.'}
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Photo</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="hidden md:table-cell">VIN / Stock</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Miles</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Visibility</TableHead>
                  <TableHead className="w-8 text-center">Photos</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((record) => {
                  const cover = coverPhoto(record)
                  const photoCount = record.photos.filter(
                    (p) => p.source !== 'placeholder',
                  ).length
                  return (
                    <TableRow
                      key={record.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => onEdit(record)}
                    >
                      <TableCell>
                        <div className="h-10 w-14 overflow-hidden rounded-lg border border-white/10 bg-muted/30">
                          <InventoryPhotoImage
                            record={record}
                            photo={cover}
                            alt={cover?.alt || `${record.year} ${record.make} ${record.model}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-sm">
                          {record.year} {record.make} {record.model}
                        </p>
                        {record.trim && (
                          <p className="text-xs text-muted-foreground">{record.trim}</p>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-mono text-xs text-muted-foreground">
                          {record.vin || record.stockNumber || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right text-sm">
                        {record.mileage > 0 ? fmt.format(record.mileage) : '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        {record.price > 0 ? fmtPrice.format(record.price) : '—'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="text-[0.65rem]">
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          {record.isPublished ? (
                            <Badge className="rounded-full bg-emerald-600/20 text-emerald-300 text-[0.6rem] flex items-center gap-1">
                              <Eye size={9} weight="fill" /> Public
                            </Badge>
                          ) : (
                            <Badge className="rounded-full bg-white/8 text-muted-foreground text-[0.6rem] flex items-center gap-1">
                              <EyeSlash size={9} /> Draft
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {photoCount > 0 ? (
                          <span className="flex items-center justify-center gap-1 text-slate-300">
                            <Image size={11} />
                            {photoCount}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(record)
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────
// Page root
// ─────────────────────────────────────────

export function InventoryManagePage() {
  const { records, loading, refresh, isSupabaseBacked } = useInventoryCatalog()
  const { navigate } = useRouter()
  const [view, setView] = useState<View>('list')
  const [editingRecord, setEditingRecord] = useState<InventoryRecord | null>(null)
  const { toasts, push: toast } = useToasts()

  function goAdd() {
    setEditingRecord(null)
    setView('add')
  }

  function goEdit(record: InventoryRecord) {
    setEditingRecord(record)
    setView('edit')
  }

  function goBack() {
    setEditingRecord(null)
    setView('list')
    void refresh()
  }

  function handleSaved(updated: InventoryRecord) {
    setEditingRecord(updated)
    void refresh()
  }

  return (
    <div className="relative space-y-0">
      {/* Toast stack */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm shadow-xl backdrop-blur-md pointer-events-auto ${
              t.type === 'error'
                ? 'border-red-500/30 bg-red-900/80 text-red-100'
                : 'border-emerald-500/30 bg-emerald-900/80 text-emerald-100'
            }`}
          >
            {t.type === 'error' ? (
              <Warning size={14} weight="fill" />
            ) : (
              <CheckCircle size={14} weight="fill" />
            )}
            {t.message}
          </div>
        ))}
      </div>

      {view === 'list' && (
        <InventoryList
          records={records}
          loading={loading}
          onAdd={goAdd}
          onEdit={goEdit}
        />
      )}

      {view === 'add' && (
        <UnitForm
          mode="add"
          isSupabaseBacked={isSupabaseBacked}
          onSave={(r) => {
            setEditingRecord(r)
            setView('edit')
            void refresh()
          }}
          onCancel={goBack}
          toast={toast}
        />
      )}

      {view === 'edit' && editingRecord && (
        <UnitForm
          mode="edit"
          record={editingRecord}
          isSupabaseBacked={isSupabaseBacked}
          onSave={handleSaved}
          onCancel={goBack}
          toast={toast}
        />
      )}

      {/* Separator before CSV import link */}
      {view === 'list' && (
        <div className="pt-10">
          <Separator className="mb-6" />
          <p className="text-xs text-muted-foreground text-center">
            Need to bulk import?{' '}
            <a
              href="#"
              className="text-blue-300 hover:text-blue-100 underline underline-offset-2"
              onClick={(e) => {
                e.preventDefault()
                navigate('/app/settings/inventory-import')
              }}
            >
              Use CSV Import →
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
