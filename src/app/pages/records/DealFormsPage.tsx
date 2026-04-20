/**
 * Deal Forms Page — full-page deal forms printing workflow.
 *
 * Route: /app/records/deals/:id/forms
 *
 * Workflow:
 *  1. Select forms / choose a preset packet
 *  2. Review missing fields & apply manual overrides
 *  3. Preview populated forms
 *  4. Print or save the packet
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '@/components/core/SectionHeader'
import { PageLoadingState, PageNotFoundState } from '@/components/core/PageStates'
import { useRouter } from '@/app/router'
import { useRouteParam, hasRouteParam } from '@/app/router/routeParams'
import { useDeal } from '@/domains/deals/deal.hooks'
import {
  ArrowLeft,
  Printer,
  FileText,
  CheckCircle,
  Warning,
  Eye,
  FloppyDisk,
  MagnifyingGlass,
  X,
  CaretRight,
  CaretLeft,
  Stack,
  ListChecks,
  Pencil,
} from '@phosphor-icons/react'
import {
  DEAL_FORM_TEMPLATES,
  PACKET_PRESETS,
  FORM_CATEGORY_LABELS,
} from '@/domains/forms/dealForms.templates'
import {
  buildPacket,
  applyOverrides,
  getMissingFieldSummary,
} from '@/domains/forms/dealForms.runtime'
import { savePacketRecord, listPacketsForDeal } from '@/domains/forms/dealForms.service'
import type { DealFormPacket, GeneratedForm, GeneratedFormField, SavedPacketRecord } from '@/domains/forms/dealForms.types'

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

type WorkflowStep = 'select' | 'override' | 'preview' | 'print'

const STEPS: { id: WorkflowStep; label: string; icon: React.ReactNode }[] = [
  { id: 'select', label: 'Select Forms', icon: <ListChecks className="h-4 w-4" /> },
  { id: 'override', label: 'Review Fields', icon: <Pencil className="h-4 w-4" /> },
  { id: 'preview', label: 'Preview', icon: <Eye className="h-4 w-4" /> },
  { id: 'print', label: 'Print & Save', icon: <Printer className="h-4 w-4" /> },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFieldValue(field: GeneratedFormField): string {
  if (!field.finalValue) return ''
  if (field.def.type === 'currency') return `$${field.finalValue}`
  if (field.def.type === 'masked') {
    const digits = field.finalValue.replace(/\D/g, '')
    return digits.length >= 4 ? `***-**-${digits.slice(-4)}` : `***-**-${digits.padStart(4, '*')}`
  }
  return field.finalValue
}

function fieldWidthClass(width?: string): string {
  switch (width) {
    case 'full': return 'col-span-4'
    case 'two-thirds': return 'col-span-3'
    case 'half': return 'col-span-2'
    case 'third': return 'col-span-1 sm:col-span-1'
    default: return 'col-span-2'
  }
}

// ---------------------------------------------------------------------------
// Form Preview Renderer
// ---------------------------------------------------------------------------

function FormPreviewCard({ form, index }: { form: GeneratedForm; index: number }) {
  const sections = form.template.sections

  return (
    <div className="form-preview-page rounded-lg border border-border bg-card shadow-sm overflow-hidden print:shadow-none print:border-border/50 print:rounded-none print:break-before-page">
      {/* Form header */}
      <div className="bg-muted/40 border-b border-border px-6 py-4 print:bg-transparent">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {FORM_CATEGORY_LABELS[form.template.category]}
            </p>
            <h3 className="text-lg font-bold tracking-tight mt-0.5">{form.template.name}</h3>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">Form {index + 1}</p>
            {form.hasWarnings && (
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-xs mt-1">
                <Warning className="h-3 w-3 mr-1" /> Missing required fields
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="p-6 space-y-6">
        {sections.map((section) => {
          const sectionFields = form.fields.filter((f) => f.def.section === section)
          if (sectionFields.length === 0) return null
          return (
            <div key={section}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b border-border pb-1 mb-3">
                {section}
              </h4>
              <div className="grid grid-cols-4 gap-x-4 gap-y-3">
                {sectionFields.map((f) => (
                  <div key={f.def.id} className={fieldWidthClass(f.def.width)}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                      {f.def.label}
                      {f.def.required && <span className="text-red-400 ml-0.5">*</span>}
                    </p>
                    {f.isMissing ? (
                      <div className={`h-7 rounded border-b ${f.isRequired ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-900/10' : 'border-muted-foreground/20'}`} />
                    ) : (
                      <p className="text-sm font-medium border-b border-muted-foreground/30 pb-0.5 min-h-[1.75rem] leading-7">
                        {formatFieldValue(f)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Signature lines if delivery / deal docs */}
      {(form.template.category === 'deal_documents' || form.template.category === 'delivery' || form.template.category === 'disclosure') && (
        <div className="border-t border-border px-6 py-4 grid grid-cols-2 gap-6">
          <div>
            <div className="border-b border-foreground/50 h-8 mb-1" />
            <p className="text-[10px] text-muted-foreground">Buyer Signature / Date</p>
          </div>
          <div>
            <div className="border-b border-foreground/50 h-8 mb-1" />
            <p className="text-[10px] text-muted-foreground">Dealer Representative / Date</p>
          </div>
          {form.fields.find((f) => f.def.dataKey === 'coBuyerFullName' && !f.isMissing) && (
            <div>
              <div className="border-b border-foreground/50 h-8 mb-1" />
              <p className="text-[10px] text-muted-foreground">Co-Buyer Signature / Date</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 1: Form Selection
// ---------------------------------------------------------------------------

function SelectFormsStep({
  selectedIds,
  onToggle,
  onPreset,
  onNext,
}: {
  selectedIds: string[]
  onToggle: (id: string) => void
  onPreset: (ids: string[], presetName: string) => void
  onNext: () => void
}) {
  const categories = [...new Set(DEAL_FORM_TEMPLATES.map((t) => t.category))]

  return (
    <div className="space-y-6">
      {/* Packet presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Stack className="h-4 w-4 text-primary" /> Packet Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PACKET_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onPreset(preset.formIds, preset.name)}
                className="rounded-lg border border-border bg-card p-3 text-left hover:border-primary/50 hover:bg-accent/30 transition-colors"
              >
                <p className="font-semibold text-sm">{preset.name}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{preset.description}</p>
                <p className="text-xs text-primary mt-2">{preset.formIds.length} forms</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual form selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" /> Individual Forms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {categories.map((cat) => {
            const catForms = DEAL_FORM_TEMPLATES.filter((t) => t.category === cat)
            return (
              <div key={cat}>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  {FORM_CATEGORY_LABELS[cat]}
                </h4>
                <div className="space-y-1.5">
                  {catForms.map((template) => {
                    const checked = selectedIds.includes(template.id)
                    return (
                      <label
                        key={template.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                          checked
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-border hover:border-primary/20 hover:bg-accent/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded accent-primary"
                          checked={checked}
                          onChange={() => onToggle(template.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {template.fields.length} fields
                        </Badge>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-muted-foreground">
          {selectedIds.length === 0
            ? 'No forms selected'
            : `${selectedIds.length} form${selectedIds.length !== 1 ? 's' : ''} selected`}
        </p>
        <Button onClick={onNext} disabled={selectedIds.length === 0} className="gap-2">
          Review Fields <CaretRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2: Override / Review Missing Fields
// ---------------------------------------------------------------------------

function ReviewFieldsStep({
  packet,
  onOverrideChange,
  onBack,
  onNext,
}: {
  packet: DealFormPacket
  onOverrideChange: (fieldId: string, value: string) => void
  onBack: () => void
  onNext: () => void
}) {
  const summary = getMissingFieldSummary(packet)
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [draftValues, setDraftValues] = useState<Record<string, string>>({})

  const allFields = packet.forms.flatMap((f) =>
    f.fields.map((field) => ({ form: f, field }))
  )

  const fieldsWithMissing = allFields.filter(({ field }) => field.isMissing)
  const fieldsWithValues = allFields.filter(({ field }) => !field.isMissing)

  const commitOverride = (fieldId: string) => {
    const val = draftValues[fieldId]
    if (val !== undefined) {
      onOverrideChange(fieldId, val)
    }
    setEditingFieldId(null)
  }

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      {summary.totalMissingRequired > 0 ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <Warning className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {summary.totalMissingRequired} required field{summary.totalMissingRequired !== 1 ? 's' : ''} missing
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              You can still print. Fill in fields below to improve the document, or leave blank.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">
            All required fields are populated
          </p>
        </div>
      )}

      {/* Missing fields editor */}
      {fieldsWithMissing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Pencil className="h-4 w-4 text-amber-500" />
              Missing or Empty Fields
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {fieldsWithMissing.map(({ form, field }) => {
              const isEditing = editingFieldId === field.def.id
              const currentVal = draftValues[field.def.id] ?? packet.overrides[field.def.id] ?? ''

              return (
                <div
                  key={`${form.template.id}-${field.def.id}`}
                  className={`rounded-lg border px-3 py-2.5 ${
                    field.isRequired
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-border bg-muted/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          {form.template.shortName}
                        </p>
                        {field.isRequired && (
                          <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px] px-1">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-semibold">{field.def.label}</p>
                    </div>
                    {!isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 gap-1"
                        onClick={() => {
                          setEditingFieldId(field.def.id)
                          setDraftValues((prev) => ({ ...prev, [field.def.id]: currentVal }))
                        }}
                      >
                        <Pencil className="h-3 w-3" /> Fill
                      </Button>
                    )}
                  </div>
                  {isEditing && (
                    <div className="mt-2 flex gap-2">
                      <input
                        autoFocus
                        type={field.def.type === 'date' ? 'date' : field.def.type === 'number' || field.def.type === 'currency' ? 'text' : 'text'}
                        value={draftValues[field.def.id] ?? ''}
                        onChange={(e) =>
                          setDraftValues((prev) => ({ ...prev, [field.def.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitOverride(field.def.id)
                          if (e.key === 'Escape') setEditingFieldId(null)
                        }}
                        placeholder={`Enter ${field.def.label.toLowerCase()}…`}
                        className="flex-1 rounded border border-input bg-background px-2.5 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
                      />
                      <Button size="sm" className="h-8" onClick={() => commitOverride(field.def.id)}>
                        Apply
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8" onClick={() => setEditingFieldId(null)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Populated fields summary */}
      {fieldsWithValues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Populated Fields ({fieldsWithValues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {fieldsWithValues.slice(0, 18).map(({ field }) => (
                <div
                  key={field.def.id}
                  className="flex items-center justify-between rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent/20"
                >
                  <span className="font-medium truncate">{field.def.label}</span>
                  <span className="ml-2 truncate text-foreground text-right max-w-[120px]">
                    {field.def.type === 'masked' ? '•••••' : field.finalValue}
                  </span>
                </div>
              ))}
              {fieldsWithValues.length > 18 && (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  +{fieldsWithValues.length - 18} more fields mapped
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <CaretLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={onNext} className="gap-2">
          Preview Forms <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3: Preview
// ---------------------------------------------------------------------------

function PreviewStep({
  packet,
  onBack,
  onNext,
}: {
  packet: DealFormPacket
  onBack: () => void
  onNext: () => void
}) {
  const [activeFormIdx, setActiveFormIdx] = useState(0)
  const previewRef = useRef<HTMLDivElement>(null)

  const activeForm = packet.forms[activeFormIdx]
  const summary = getMissingFieldSummary(packet)

  return (
    <div className="space-y-4">
      {/* Form nav */}
      <div className="flex items-center gap-2 flex-wrap">
        {packet.forms.map((form, idx) => (
          <button
            key={form.template.id}
            onClick={() => setActiveFormIdx(idx)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              idx === activeFormIdx
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {form.hasWarnings && <Warning className="h-3 w-3 text-amber-400" />}
            {form.template.shortName}
          </button>
        ))}
      </div>

      {/* Warnings summary */}
      {summary.totalMissingRequired > 0 && (
        <div className="flex items-center gap-2 rounded border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          <Warning className="h-4 w-4 shrink-0" />
          {summary.totalMissingRequired} required field{summary.totalMissingRequired !== 1 ? 's' : ''} missing across {summary.missingRequiredByForm.length} form{summary.missingRequiredByForm.length !== 1 ? 's' : ''} — printing is still allowed.
        </div>
      )}

      {/* Active form preview */}
      <div ref={previewRef}>
        {activeForm && <FormPreviewCard form={activeForm} index={activeFormIdx} />}
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <CaretLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button onClick={onNext} className="gap-2">
            Print & Save <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 4: Print & Save
// ---------------------------------------------------------------------------

function PrintSaveStep({
  packet,
  onBack,
  onSaved,
}: {
  packet: DealFormPacket
  onBack: () => void
  onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [printMode, setPrintMode] = useState<'all' | 'single'>('all')
  const [singleFormIdx, setSingleFormIdx] = useState(0)

  const summary = getMissingFieldSummary(packet)

  const handlePrint = useCallback(() => {
    // Inject print styles temporarily and trigger window.print()
    const styleId = 'deal-forms-print-styles'
    let style = document.getElementById(styleId) as HTMLStyleElement | null
    if (!style) {
      style = document.createElement('style')
      style.id = styleId
      document.head.appendChild(style)
    }

    if (printMode === 'all') {
      style.textContent = `
        @media print {
          body > * { display: none !important; }
          #deal-forms-print-root { display: block !important; }
          #deal-forms-print-root .form-preview-page { page-break-before: always; }
          #deal-forms-print-root .form-preview-page:first-child { page-break-before: avoid; }
        }
      `
    } else {
      style.textContent = `
        @media print {
          body > * { display: none !important; }
          #deal-forms-print-single { display: block !important; }
        }
      `
    }
    window.print()
    // Cleanup after print dialog closes using the afterprint event
    const cleanup = () => {
      style?.remove()
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)
    // Fallback cleanup if afterprint doesn't fire (e.g., some mobile browsers)
    setTimeout(cleanup, 10000)
  }, [printMode])

  const handleSave = useCallback(async () => {
    setSaving(true)
    const result = await savePacketRecord({
      dealId: packet.dealId,
      dealLabel: packet.dealLabel,
      formIds: packet.formIds,
      formsIncluded: packet.forms.map((f) => f.template.name),
      presetName: packet.presetName,
      createdBy: 'staff',
      version: 1,
    })
    setSaving(false)
    if (result.ok) {
      setSavedId(result.value.id)
      onSaved()
    }
  }, [packet, onSaved])

  const activeSingleForm = packet.forms[singleFormIdx]

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Packet Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {packet.forms.map((form) => (
              <Badge key={form.template.id} variant="secondary" className="gap-1">
                {form.hasWarnings && <Warning className="h-3 w-3 text-amber-400" />}
                {form.template.shortName}
              </Badge>
            ))}
          </div>
          {summary.totalMissingRequired > 0 && (
            <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Warning className="h-3.5 w-3.5" />
              {summary.totalMissingRequired} required field{summary.totalMissingRequired !== 1 ? 's' : ''} missing — forms will print with blank lines.
            </div>
          )}
          {summary.totalMissingRequired === 0 && (
            <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              All required fields populated.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Printer className="h-4 w-4 text-primary" /> Print Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <label className={`flex-1 cursor-pointer rounded-lg border p-3 transition-colors ${printMode === 'all' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/20'}`}>
              <input type="radio" className="sr-only" checked={printMode === 'all'} onChange={() => setPrintMode('all')} />
              <p className="font-medium text-sm">Print Full Packet</p>
              <p className="text-xs text-muted-foreground mt-0.5">Print all {packet.forms.length} selected forms</p>
            </label>
            <label className={`flex-1 cursor-pointer rounded-lg border p-3 transition-colors ${printMode === 'single' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/20'}`}>
              <input type="radio" className="sr-only" checked={printMode === 'single'} onChange={() => setPrintMode('single')} />
              <p className="font-medium text-sm">Print Single Form</p>
              <p className="text-xs text-muted-foreground mt-0.5">Select one form to print</p>
            </label>
          </div>

          {printMode === 'single' && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Select form to print:</p>
              <div className="flex flex-wrap gap-2">
                {packet.forms.map((form, idx) => (
                  <button
                    key={form.template.id}
                    onClick={() => setSingleFormIdx(idx)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      idx === singleFormIdx
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {form.template.shortName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handlePrint} size="lg" className="w-full gap-2">
            <Printer className="h-4 w-4" />
            {printMode === 'all' ? `Print All ${packet.forms.length} Forms` : `Print ${activeSingleForm?.template.shortName ?? 'Form'}`}
          </Button>
        </CardContent>
      </Card>

      {/* Save packet */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FloppyDisk className="h-4 w-4 text-primary" /> Save Packet to Record
          </CardTitle>
        </CardHeader>
        <CardContent>
          {savedId ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              Packet saved to deal record (ID: {savedId.slice(0, 8)})
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                Save this packet definition to the deal record so it can be re-opened later.
                Packet metadata includes forms selected, deal reference, and creation info.
              </p>
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={saving}
                className="gap-2"
              >
                <FloppyDisk className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save Packet to Record'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <CaretLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {/* Hidden print root — full packet */}
      <div id="deal-forms-print-root" className="hidden print:block">
        <div className="space-y-0">
          {packet.forms.map((form, idx) => (
            <FormPreviewCard key={form.template.id} form={form} index={idx} />
          ))}
        </div>
      </div>

      {/* Hidden print root — single form */}
      {activeSingleForm && (
        <div id="deal-forms-print-single" className="hidden print:block">
          <FormPreviewCard form={activeSingleForm} index={0} />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepIndicator({ currentStep }: { currentStep: WorkflowStep }) {
  const currentIdx = STEPS.findIndex((s) => s.id === currentStep)
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              idx < currentIdx
                ? 'bg-primary/20 text-primary'
                : idx === currentIdx
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {idx < currentIdx ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              step.icon
            )}
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`mx-1 h-px w-6 ${idx < currentIdx ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Saved packets sidebar
// ---------------------------------------------------------------------------

function SavedPacketsList({ dealId }: { dealId: string }) {
  const [packets, setPackets] = useState<SavedPacketRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Load saved packets on mount
  useEffect(() => {
    listPacketsForDeal(dealId).then((result) => {
      setPackets(result.ok ? result.value : [])
      setLoading(false)
    })
  }, [dealId])

  if (loading) return null
  if (packets.length === 0) return null

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <MagnifyingGlass className="h-4 w-4" /> Previously Saved Packets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {packets.map((p) => (
          <div key={p.id} className="rounded-lg border border-border px-3 py-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium">{p.presetName ?? 'Custom Packet'}</span>
              <span className="text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-muted-foreground mt-0.5 line-clamp-1">
              {p.formsIncluded.join(', ')}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export function DealFormsPage() {
  const { navigate } = useRouter()
  const dealId = useRouteParam('id')
  const dealQuery = useDeal(dealId)

  const [step, setStep] = useState<WorkflowStep>('select')
  const [selectedFormIds, setSelectedFormIds] = useState<string[]>([])
  const [presetName, setPresetName] = useState<string | undefined>()
  const [packet, setPacket] = useState<DealFormPacket | null>(null)
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [packetSaved, setPacketSaved] = useState(false)

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const toggleForm = useCallback((id: string) => {
    setSelectedFormIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    setPresetName(undefined)
  }, [])

  const applyPreset = useCallback((ids: string[], name: string) => {
    setSelectedFormIds(ids)
    setPresetName(name)
  }, [])

  const handleOverrideChange = useCallback(
    (fieldId: string, value: string) => {
      const newOverrides = { ...overrides, [fieldId]: value }
      setOverrides(newOverrides)
      if (packet) {
        // Re-apply overrides to all forms in the packet
        const newForms = packet.forms.map((form) => {
          const fieldOverrides: Record<string, string> = {}
          form.fields.forEach((f) => {
            if (newOverrides[f.def.id] !== undefined) {
              fieldOverrides[f.def.id] = newOverrides[f.def.id]
            }
          })
          return applyOverrides(form, fieldOverrides)
        })
        setPacket({ ...packet, forms: newForms, overrides: newOverrides })
      }
    },
    [overrides, packet]
  )

  const goToReview = useCallback(() => {
    if (!dealQuery.data) return
    const newPacket = buildPacket(dealQuery.data, selectedFormIds, overrides, undefined, {
      presetName,
      createdBy: 'staff',
    })
    setPacket(newPacket)
    setStep('override')
  }, [dealQuery.data, selectedFormIds, overrides, presetName])

  // -------------------------------------------------------------------------
  // Guards
  // -------------------------------------------------------------------------

  if (!hasRouteParam(dealId)) {
    return (
      <PageNotFoundState
        title="Deal Missing"
        message="No deal ID was provided in this route."
      />
    )
  }

  if (dealQuery.loading) {
    return (
      <PageLoadingState
        title="Loading Deal"
        message="Retrieving deal data for form mapping…"
      />
    )
  }

  const deal = dealQuery.data
  if (!deal) {
    return (
      <PageNotFoundState
        title="Deal Not Found"
        message="This deal could not be found or may have been removed."
      />
    )
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="ods-page ods-flow-lg">
      {/* Back nav */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/app/records/deals/${dealId}`)}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Deal Record
      </Button>

      {/* Header */}
      <SectionHeader
        title="Deal Forms"
        description={`${deal.customerName} — ${deal.vehicleDescription}`}
        action={
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs gap-1">
              <FileText className="h-3 w-3" />
              {deal.status}
            </Badge>
          </div>
        }
      />

      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      {/* Step content */}
      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        <div className="lg:col-span-3">
          {step === 'select' && (
            <SelectFormsStep
              selectedIds={selectedFormIds}
              onToggle={toggleForm}
              onPreset={applyPreset}
              onNext={goToReview}
            />
          )}

          {step === 'override' && packet && (
            <ReviewFieldsStep
              packet={packet}
              onOverrideChange={handleOverrideChange}
              onBack={() => setStep('select')}
              onNext={() => setStep('preview')}
            />
          )}

          {step === 'preview' && packet && (
            <PreviewStep
              packet={packet}
              onBack={() => setStep('override')}
              onNext={() => setStep('print')}
            />
          )}

          {step === 'print' && packet && (
            <PrintSaveStep
              packet={packet}
              onBack={() => setStep('preview')}
              onSaved={() => setPacketSaved(true)}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block lg:col-span-1 space-y-4">
          {/* Deal summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Deal Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium text-right">{deal.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle</span>
                <span className="font-medium text-right max-w-[120px] truncate">{deal.vehicleDescription}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">${deal.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">{deal.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{new Date(deal.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Selected forms */}
          {selectedFormIds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Selected ({selectedFormIds.length})</span>
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => { setSelectedFormIds([]); setPresetName(undefined) }}
                  >
                    Clear all
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {selectedFormIds.map((id) => {
                  const t = DEAL_FORM_TEMPLATES.find((x) => x.id === id)
                  if (!t) return null
                  return (
                    <div key={id} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{t.shortName}</span>
                      <button onClick={() => toggleForm(id)}>
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  )
                })}
                {presetName && (
                  <p className="text-[10px] text-primary pt-1">Preset: {presetName}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Saved packets */}
          {packetSaved && <SavedPacketsList dealId={dealId} />}
        </div>
      </div>
    </div>
  )
}
