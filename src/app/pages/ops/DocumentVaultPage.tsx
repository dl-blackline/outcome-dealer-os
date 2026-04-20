import { useState, useMemo, useRef } from 'react'
import {
  FolderOpen,
  Plus,
  MagnifyingGlass,
  Funnel,
  FilePdf,
  FileImage,
  FileXls,
  File,
  Trash,
  Archive,
  DownloadSimple,
  Eye,
  UploadSimple,
  CheckCircle,
  Tag,
  X,
} from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useDocumentVaultRuntime } from '@/domains/document-vault/documentVault.runtime'
import {
  DOC_CATEGORIES,
  DOC_CATEGORY_LABELS,
  DOC_FILE_TYPES,
  DOC_FILE_TYPE_LABELS,
  type DocCategory,
  type DocFileType,
  type VaultDocument,
  type UploadDocumentInput,
} from '@/domains/document-vault/documentVault.types'

function fmtSize(bytes?: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fmtDate(s?: string): string {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function FileTypeIcon({ type }: { type: DocFileType }) {
  const cls = 'h-5 w-5 shrink-0'
  switch (type) {
    case 'pdf': return <FilePdf className={cn(cls, 'text-red-500')} />
    case 'image': return <FileImage className={cn(cls, 'text-blue-500')} />
    case 'spreadsheet': return <FileXls className={cn(cls, 'text-green-600')} />
    default: return <File className={cn(cls, 'text-muted-foreground')} />
  }
}

function CategoryBadge({ category }: { category: DocCategory }) {
  const colors: Partial<Record<DocCategory, string>> = {
    deal: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
    inventory: 'bg-green-500/15 text-green-700 dark:text-green-400',
    customer: 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
    back_office: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
    title_payoff: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
    recon: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400',
    compliance: 'bg-red-500/15 text-red-700 dark:text-red-400',
  }
  return (
    <Badge variant="secondary" className={cn('text-xs', colors[category] ?? 'bg-slate-500/15 text-slate-600 dark:text-slate-400')}>
      {DOC_CATEGORY_LABELS[category]}
    </Badge>
  )
}

// ─── Document Card ─────────────────────────────────────────────────────────────

function DocCard({ doc, onPreview, onArchive, onDelete }: {
  doc: VaultDocument
  onPreview: (doc: VaultDocument) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className={cn('rounded-xl border bg-card p-4 flex items-start gap-3 hover:shadow-sm transition-shadow', doc.status === 'archived' && 'opacity-60')}>
      <div className="mt-0.5">
        <FileTypeIcon type={doc.fileType} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{doc.name}</p>
        {doc.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{doc.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={doc.category} />
          {doc.status === 'pending_review' && <Badge variant="secondary" className="text-xs bg-yellow-500/15 text-yellow-700 dark:text-yellow-400">Pending Review</Badge>}
          {doc.status === 'archived' && <Badge variant="secondary" className="text-xs">Archived</Badge>}
          {doc.entityLabel && <span className="text-xs text-muted-foreground">{doc.entityLabel}</span>}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{fmtSize(doc.fileSize)}</span>
          {doc.pageCount && <span>{doc.pageCount}p</span>}
          {doc.uploadedBy && <span>by {doc.uploadedBy}</span>}
          <span>{fmtDate(doc.uploadedAt)}</span>
        </div>
        {doc.tags && doc.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {doc.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[0.65rem] text-muted-foreground">
                <Tag className="h-2.5 w-2.5" />{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Preview" onClick={() => onPreview(doc)}>
          <Eye className="h-3.5 w-3.5" />
        </Button>
        {doc.downloadUrl && (
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Download" asChild>
            <a href={doc.downloadUrl} download={doc.name}><DownloadSimple className="h-3.5 w-3.5" /></a>
          </Button>
        )}
        {doc.status !== 'archived' && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" title="Archive" onClick={() => onArchive(doc.id)}>
            <Archive className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" title="Delete" onClick={() => onDelete(doc.id)}>
          <Trash className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ─── All Documents Tab ─────────────────────────────────────────────────────────

function AllDocumentsTab({
  onPreview,
}: {
  onPreview: (doc: VaultDocument) => void
}) {
  const { documents, archiveDocument, deleteDocument } = useDocumentVaultRuntime()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<DocCategory | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<DocFileType | 'all'>('all')
  const [showArchived, setShowArchived] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filtered = useMemo(() => {
    let list = documents
    if (!showArchived) list = list.filter((d) => d.status !== 'archived')
    if (categoryFilter !== 'all') list = list.filter((d) => d.category === categoryFilter)
    if (typeFilter !== 'all') list = list.filter((d) => d.fileType === typeFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((d) => `${d.name} ${d.description ?? ''} ${d.entityLabel ?? ''} ${(d.tags ?? []).join(' ')}`.toLowerCase().includes(q))
    }
    return list
  }, [documents, search, categoryFilter, typeFilter, showArchived])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlass className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents…" className="h-8 pl-8 text-xs" />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as DocCategory | 'all')}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Categories</SelectItem>
            {DOC_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="text-xs">{DOC_CATEGORY_LABELS[c]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as DocFileType | 'all')}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Types</SelectItem>
            {DOC_FILE_TYPES.map((t) => <SelectItem key={t} value={t} className="text-xs">{DOC_FILE_TYPE_LABELS[t]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button
          variant={showArchived ? 'secondary' : 'outline'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setShowArchived(!showArchived)}
        >
          {showArchived ? 'Hiding Archived' : 'Show Archived'}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No documents found</p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((doc) => (
            <DocCard key={doc.id} doc={doc} onPreview={onPreview} onArchive={archiveDocument} onDelete={deleteDocument} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── By Category Tab ──────────────────────────────────────────────────────────

function ByCategoryTab({ onPreview }: { onPreview: (doc: VaultDocument) => void }) {
  const { documents, archiveDocument, deleteDocument } = useDocumentVaultRuntime()

  const byCategory = useMemo(() => {
    const map: Partial<Record<DocCategory, VaultDocument[]>> = {}
    for (const d of documents.filter((d) => d.status !== 'archived')) {
      if (!map[d.category]) map[d.category] = []
      map[d.category]!.push(d)
    }
    return map
  }, [documents])

  return (
    <div className="space-y-6">
      {DOC_CATEGORIES.filter((c) => (byCategory[c]?.length ?? 0) > 0).map((category) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-3">
            <CategoryBadge category={category} />
            <span className="text-xs text-muted-foreground">{byCategory[category]!.length} document{byCategory[category]!.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {byCategory[category]!.map((doc) => (
              <DocCard key={doc.id} doc={doc} onPreview={onPreview} onArchive={archiveDocument} onDelete={deleteDocument} />
            ))}
          </div>
        </div>
      ))}
      {Object.keys(byCategory).length === 0 && (
        <div className="py-16 text-center">
          <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No documents in vault</p>
        </div>
      )}
    </div>
  )
}

// ─── Upload Tab ────────────────────────────────────────────────────────────────

function UploadTab({ onUploaded }: { onUploaded: () => void }) {
  const { addDocument } = useDocumentVaultRuntime()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<Partial<UploadDocumentInput>>({
    category: 'deal',
    fileType: 'pdf',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [fileName, setFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setForm((f) => ({
      ...f,
      name: f.name || file.name,
      fileSize: file.size,
      mimeType: file.type,
      fileType: file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : file.type.includes('spreadsheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv') ? 'spreadsheet' : 'other',
    }))
  }

  function addTag() {
    if (!tagInput.trim()) return
    setForm((f) => ({ ...f, tags: [...(f.tags ?? []), tagInput.trim()] }))
    setTagInput('')
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: (f.tags ?? []).filter((t) => t !== tag) }))
  }

  function handleSubmit() {
    if (!form.name || !form.category || !form.fileType) return
    setUploading(true)
    setTimeout(() => {
      addDocument({
        name: form.name!,
        description: form.description,
        category: form.category!,
        fileType: form.fileType!,
        fileSize: form.fileSize,
        mimeType: form.mimeType,
        entityType: form.entityType,
        entityId: form.entityId,
        entityLabel: form.entityLabel,
        tags: form.tags,
        uploadedBy: form.uploadedBy,
        pageCount: form.pageCount,
      })
      setUploading(false)
      setSuccess(true)
      setTimeout(() => { setSuccess(false); onUploaded() }, 1200)
    }, 600) // simulate upload
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Drop area */}
      <div
        className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        <UploadSimple className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm font-medium">{fileName || 'Click to select a file'}</p>
        <p className="mt-1 text-xs text-muted-foreground">PDF, images, spreadsheets — up to 50 MB</p>
        <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Document Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Document Name *</Label>
              <Input value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="h-8 text-xs" placeholder="e.g. Buyer Order — D-10900" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="min-h-[60px] text-xs" placeholder="Optional description" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as DocCategory }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{DOC_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="text-xs">{DOC_CATEGORY_LABELS[c]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">File Type</Label>
              <Select value={form.fileType} onValueChange={(v) => setForm((f) => ({ ...f, fileType: v as DocFileType }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{DOC_FILE_TYPES.map((t) => <SelectItem key={t} value={t} className="text-xs">{DOC_FILE_TYPE_LABELS[t]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Entity Type</Label>
              <Select value={form.entityType ?? ''} onValueChange={(v) => setForm((f) => ({ ...f, entityType: v || undefined }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-xs">None</SelectItem>
                  {['deal', 'inventory', 'customer', 'credit_application', 'recon'].map((t) => (
                    <SelectItem key={t} value={t} className="text-xs capitalize">{t.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Entity ID / Label</Label>
              <Input value={form.entityLabel ?? ''} onChange={(e) => setForm((f) => ({ ...f, entityLabel: e.target.value, entityId: e.target.value }))} className="h-8 text-xs" placeholder="e.g. D-10900 or A1055" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Uploaded By</Label>
              <Input value={form.uploadedBy ?? ''} onChange={(e) => setForm((f) => ({ ...f, uploadedBy: e.target.value }))} className="h-8 text-xs" placeholder="Staff name" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Page Count</Label>
              <Input value={form.pageCount ?? ''} onChange={(e) => setForm((f) => ({ ...f, pageCount: e.target.value ? parseInt(e.target.value) : undefined }))} type="number" className="h-8 text-xs" placeholder="1" />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-xs">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                className="h-8 text-xs flex-1"
                placeholder="Add tag and press Enter"
              />
              <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={addTag}>Add</Button>
            </div>
            {(form.tags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(form.tags ?? []).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} className="gap-2 w-full sm:w-auto" disabled={!form.name || uploading || success}>
            {success ? (
              <><CheckCircle className="h-4 w-4" /> Saved to Vault</>
            ) : uploading ? (
              'Uploading…'
            ) : (
              <><UploadSimple className="h-4 w-4" /> Upload Document</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Preview Dialog ────────────────────────────────────────────────────────────

function PreviewDialog({ doc, onClose }: { doc: VaultDocument | null; onClose: () => void }) {
  if (!doc) return null
  return (
    <Dialog open={!!doc} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileTypeIcon type={doc.fileType} />
            {doc.name}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-1">
              {doc.description && <p className="text-sm">{doc.description}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                <CategoryBadge category={doc.category} />
                {doc.entityLabel && <span className="text-xs text-muted-foreground">{doc.entityLabel}</span>}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-6 text-center space-y-3">
          <FileTypeIcon type={doc.fileType} />
          <p className="text-sm text-muted-foreground">
            {doc.fileType === 'pdf' ? 'PDF Document' : doc.fileType === 'image' ? 'Image File' : 'File'} · {fmtSize(doc.fileSize)}{doc.pageCount ? ` · ${doc.pageCount} pages` : ''}
          </p>
          {doc.previewUrl ? (
            doc.fileType === 'image'
              ? <img src={doc.previewUrl} alt={doc.name} className="mx-auto max-h-64 rounded-lg object-contain" />
              : <p className="text-xs text-muted-foreground">Preview not available in this environment</p>
          ) : (
            <p className="text-xs text-muted-foreground">No preview available — document is stored in vault</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Uploaded by:</span> {doc.uploadedBy ?? '—'}</div>
          <div><span className="text-muted-foreground">Uploaded:</span> {fmtDate(doc.uploadedAt)}</div>
          <div><span className="text-muted-foreground">Type:</span> {DOC_FILE_TYPE_LABELS[doc.fileType]}</div>
          <div><span className="text-muted-foreground">Size:</span> {fmtSize(doc.fileSize)}</div>
        </div>

        <DialogFooter>
          {doc.downloadUrl && (
            <Button variant="outline" className="gap-2" asChild>
              <a href={doc.downloadUrl} download={doc.name}><DownloadSimple className="h-4 w-4" /> Download</a>
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Stats Cards ───────────────────────────────────────────────────────────────

function VaultStats() {
  const { documents } = useDocumentVaultRuntime()

  const active = documents.filter((d) => d.status === 'active').length
  const pending = documents.filter((d) => d.status === 'pending_review').length
  const archived = documents.filter((d) => d.status === 'archived').length
  const totalSize = documents.reduce((s, d) => s + (d.fileSize ?? 0), 0)

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {[
        { label: 'Active Documents', value: active, color: 'text-blue-600' },
        { label: 'Pending Review', value: pending, color: 'text-yellow-600' },
        { label: 'Archived', value: archived, color: 'text-muted-foreground' },
        { label: 'Total Storage', value: fmtSize(totalSize), color: 'text-purple-600' },
      ].map(({ label, value, color }) => (
        <Card key={label}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={cn('mt-2 text-2xl font-bold', color)}>{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function DocumentVaultPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Document Vault</h1>
          <p className="mt-1 text-sm text-muted-foreground">Centralized document storage — deals, inventory, customers, recon, title, compliance</p>
        </div>
        <Button className="gap-2" onClick={() => setActiveTab('upload')}>
          <UploadSimple className="h-4 w-4" /> Upload Document
        </Button>
      </div>

      <VaultStats />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9">
          <TabsTrigger value="all" className="text-xs">All Documents</TabsTrigger>
          <TabsTrigger value="by-category" className="text-xs">By Category</TabsTrigger>
          <TabsTrigger value="upload" className="text-xs gap-1.5"><Plus className="h-3.5 w-3.5" />Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <AllDocumentsTab onPreview={setPreviewDoc} />
        </TabsContent>

        <TabsContent value="by-category" className="mt-6">
          <ByCategoryTab onPreview={setPreviewDoc} />
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <UploadTab onUploaded={() => setActiveTab('all')} />
        </TabsContent>
      </Tabs>

      <PreviewDialog doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  )
}
