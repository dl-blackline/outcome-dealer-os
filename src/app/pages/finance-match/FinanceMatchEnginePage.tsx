import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Lightning,
  CheckCircle,
  XCircle,
  Warning,
  CaretDown,
  CaretUp,
  Buildings,
  CurrencyDollar,
  SpinnerGap,
  Info,
  Intersect,
} from '@phosphor-icons/react'
import {
  DealStructureInput,
  LenderMatchResult,
  LenderMatchRun,
  MatchResultStatus,
} from '@/domains/finance-match/finance-match.types'
import { buildDealCalculations } from '@/domains/finance-match/finance-match.calculations'
import { useRunFinanceMatch } from '@/domains/finance-match/finance-match.hooks'

const DEFAULT_INPUT: DealStructureInput = {
  creditScore: undefined,
  monthlyGrossIncome: undefined,
  monthlyRentMortgage: undefined,
  existingMonthlyDebt: undefined,
  state: 'OH',
  vehicleYear: undefined,
  vehicleMileage: undefined,
  titleType: 'clean',
  vehicleType: 'used',
  salesPrice: undefined,
  cashDown: undefined,
  tradeValue: undefined,
  tradePayoff: undefined,
  taxes: undefined,
  titleLicenseFees: undefined,
  docFee: undefined,
  bookValue: undefined,
  retailValue: undefined,
  proposedMonthlyPayment: undefined,
  proposedTerm: 72,
  proposedRate: undefined,
  gapPrice: undefined,
  vscPrice: undefined,
  maintenancePrice: undefined,
  otherBackendPrice: undefined,
}

function StatusBadge({ status }: { status: MatchResultStatus }) {
  const cfg = {
    greenlight: { label: 'GREENLIGHT', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    review: { label: 'REVIEW', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    fail: { label: 'FAIL', className: 'bg-red-100 text-red-800 border-red-200' },
    backend_only: { label: 'BACKEND ONLY', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    info_needed: { label: 'INFO NEEDED', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  }[status]

  return (
    <Badge variant="outline" className={`text-xs font-bold tracking-wide ${cfg.className}`}>
      {cfg.label}
    </Badge>
  )
}

function StatusIcon({ status }: { status: MatchResultStatus }) {
  if (status === 'greenlight') return <CheckCircle className="h-5 w-5 text-emerald-600" />
  if (status === 'review') return <Warning className="h-5 w-5 text-amber-600" />
  if (status === 'fail') return <XCircle className="h-5 w-5 text-red-600" />
  if (status === 'backend_only') return <Info className="h-5 w-5 text-blue-600" />
  return <Info className="h-5 w-5 text-gray-500" />
}

function ResultCard({ result }: { result: LenderMatchResult }) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <StatusIcon status={result.status} />
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{result.lenderName}</div>
                <div className="text-xs text-muted-foreground truncate">{result.programName}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={result.status} />
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  {open ? <CaretUp className="h-4 w-4" /> : <CaretDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Confidence</span>
              <span>{(result.confidence * 100).toFixed(0)}%</span>
            </div>
            <Progress value={result.confidence * 100} className="h-1.5" />
          </div>

          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span className="text-emerald-600">{result.passedRules} passed</span>
            {result.failedRules > 0 && <span className="text-red-500">{result.failedRules} failed</span>}
            {result.warningRules > 0 && <span className="text-amber-500">{result.warningRules} warnings</span>}
          </div>
        </CardContent>

        <CollapsibleContent>
          <Separator />
          <CardContent className="p-4 space-y-3">
            {result.reasons.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Issues</div>
                <ul className="space-y-1.5">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      {r.severity === 'hard_fail'
                        ? <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                        : <Warning className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />}
                      <span>{r.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.restructureSuggestions.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Restructure Options</div>
                <ul className="space-y-1.5">
                  {result.restructureSuggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <Lightning className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                      <span>{s.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.reasons.length === 0 && result.restructureSuggestions.length === 0 && (
              <p className="text-xs text-muted-foreground">No issues detected for this program.</p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

function NumericInput({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  step = 1,
}: {
  label: string
  value: number | undefined
  onChange: (v: number | undefined) => void
  placeholder?: string
  prefix?: string
  step?: number
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{prefix}</span>
        )}
        <Input
          type="number"
          step={step}
          value={value ?? ''}
          onChange={(e) => {
            const v = e.target.value === '' ? undefined : Number(e.target.value)
            onChange(v)
          }}
          placeholder={placeholder}
          className={`text-sm h-8 ${prefix ? 'pl-7' : ''}`}
        />
      </div>
    </div>
  )
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string | undefined
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

const TITLE_TYPES = [
  { value: 'clean', label: 'Clean' },
  { value: 'rebuilt', label: 'Rebuilt' },
  { value: 'salvage', label: 'Salvage' },
  { value: 'flood', label: 'Flood' },
  { value: 'lemon', label: 'Lemon' },
  { value: 'other', label: 'Other' },
]

const VEHICLE_TYPES = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'certified', label: 'Certified Pre-Owned' },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY',
  'LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND',
  'OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
].map(s => ({ value: s, label: s }))

export function FinanceMatchEnginePage() {
  const [input, setInput] = useState<DealStructureInput>(DEFAULT_INPUT)
  const [activeFilter, setActiveFilter] = useState<MatchResultStatus | 'all'>('all')
  const [results, setResults] = useState<LenderMatchResult[]>([])
  const [matchRun, setMatchRun] = useState<LenderMatchRun | null>(null)
  const { execute, loading: isRunning } = useRunFinanceMatch()

  const calc = useMemo(() => buildDealCalculations(input), [input])

  function set<K extends keyof DealStructureInput>(key: K, value: DealStructureInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }))
  }

  async function handleRunMatch() {
    const result = await execute(input)
    if (result) {
      setResults(result.results)
      setMatchRun(result.run)
    }
  }

  const filteredResults = activeFilter === 'all'
    ? results
    : results.filter((r) => r.status === activeFilter)

  const filterCounts = {
    all: results.length,
    greenlight: results.filter(r => r.status === 'greenlight').length,
    review: results.filter(r => r.status === 'review').length,
    fail: results.filter(r => r.status === 'fail').length,
    backend_only: results.filter(r => r.status === 'backend_only').length,
    info_needed: results.filter(r => r.status === 'info_needed').length,
  }

  return (
    <div className="ods-page space-y-4">
      <div className="flex items-center gap-3">
        <Intersect className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold">Bank Match Engine</h1>
          <p className="text-sm text-muted-foreground">Match deal structure against lender programs in real-time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left Column: Form ── */}
        <div className="space-y-4">
          {/* Customer & Credit */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Buildings className="h-4 w-4" />
                Customer & Credit
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <NumericInput label="Credit Score" value={input.creditScore} onChange={(v) => set('creditScore', v)} placeholder="720" />
              <SelectInput label="State" value={input.state} onChange={(v) => set('state', v)} options={US_STATES} />
              <NumericInput label="Monthly Gross Income" value={input.monthlyGrossIncome} onChange={(v) => set('monthlyGrossIncome', v)} prefix="$" placeholder="5000" />
              <NumericInput label="Rent / Mortgage" value={input.monthlyRentMortgage} onChange={(v) => set('monthlyRentMortgage', v)} prefix="$" placeholder="1200" />
              <NumericInput label="Other Monthly Debt" value={input.existingMonthlyDebt} onChange={(v) => set('existingMonthlyDebt', v)} prefix="$" placeholder="300" />
              <div className="space-y-1">
                <Label className="text-xs">Bankruptcy</Label>
                <div className="flex items-center gap-2 h-8">
                  <input
                    type="checkbox"
                    checked={input.hasBankruptcy ?? false}
                    onChange={(e) => set('hasBankruptcy', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Has Bankruptcy</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Repossession</Label>
                <div className="flex items-center gap-2 h-8">
                  <input
                    type="checkbox"
                    checked={input.hasRepossession ?? false}
                    onChange={(e) => set('hasRepossession', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Has Repossession</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Vehicle Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <NumericInput label="Year" value={input.vehicleYear} onChange={(v) => set('vehicleYear', v)} placeholder="2022" />
              <SelectInput label="Type" value={input.vehicleType} onChange={(v) => set('vehicleType', v as DealStructureInput['vehicleType'])} options={VEHICLE_TYPES} />
              <NumericInput label="Mileage" value={input.vehicleMileage} onChange={(v) => set('vehicleMileage', v)} placeholder="45000" />
              <SelectInput label="Title Type" value={input.titleType} onChange={(v) => set('titleType', v as DealStructureInput['titleType'])} options={TITLE_TYPES} />
              <NumericInput label="Book Value (NADA)" value={input.bookValue} onChange={(v) => set('bookValue', v)} prefix="$" placeholder="18000" />
              <NumericInput label="Retail Value" value={input.retailValue} onChange={(v) => set('retailValue', v)} prefix="$" placeholder="20000" />
            </CardContent>
          </Card>

          {/* Deal Structure */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CurrencyDollar className="h-4 w-4" />
                Deal Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <NumericInput label="Sales Price" value={input.salesPrice} onChange={(v) => set('salesPrice', v)} prefix="$" placeholder="22000" />
              <NumericInput label="Cash Down" value={input.cashDown} onChange={(v) => set('cashDown', v)} prefix="$" placeholder="2000" />
              <NumericInput label="Trade Value" value={input.tradeValue} onChange={(v) => set('tradeValue', v)} prefix="$" placeholder="8000" />
              <NumericInput label="Trade Payoff" value={input.tradePayoff} onChange={(v) => set('tradePayoff', v)} prefix="$" placeholder="6000" />
              <NumericInput label="Taxes" value={input.taxes} onChange={(v) => set('taxes', v)} prefix="$" placeholder="1500" />
              <NumericInput label="Title & License" value={input.titleLicenseFees} onChange={(v) => set('titleLicenseFees', v)} prefix="$" placeholder="350" />
              <NumericInput label="Doc Fee" value={input.docFee} onChange={(v) => set('docFee', v)} prefix="$" placeholder="500" />
              <NumericInput label="Proposed Payment" value={input.proposedMonthlyPayment} onChange={(v) => set('proposedMonthlyPayment', v)} prefix="$" placeholder="450" />
              <NumericInput label="Term (months)" value={input.proposedTerm} onChange={(v) => set('proposedTerm', v)} placeholder="72" />
              <NumericInput label="Rate %" value={input.proposedRate} onChange={(v) => set('proposedRate', v)} placeholder="6.9" step={0.1} />
            </CardContent>
          </Card>

          {/* Backend Products */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Backend Products</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <NumericInput label="GAP" value={input.gapPrice} onChange={(v) => set('gapPrice', v)} prefix="$" placeholder="0" />
              <NumericInput label="VSC" value={input.vscPrice} onChange={(v) => set('vscPrice', v)} prefix="$" placeholder="0" />
              <NumericInput label="Maintenance" value={input.maintenancePrice} onChange={(v) => set('maintenancePrice', v)} prefix="$" placeholder="0" />
              <NumericInput label="Other Backend" value={input.otherBackendPrice} onChange={(v) => set('otherBackendPrice', v)} prefix="$" placeholder="0" />
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column: Results ── */}
        <div className="space-y-4">
          {/* Live Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">LTV</div>
              <div className="text-lg font-bold">{(calc.ltv * 100).toFixed(1)}%</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">PTI</div>
              <div className="text-lg font-bold">{(calc.pti * 100).toFixed(1)}%</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">DTI</div>
              <div className="text-lg font-bold">{(calc.dti * 100).toFixed(1)}%</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Amount Financed</div>
              <div className="text-lg font-bold">
                {calc.amountFinanced > 0 ? `$${calc.amountFinanced.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—'}
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Total Backend</div>
              <div className="text-lg font-bold">
                {calc.totalBackend > 0 ? `$${calc.totalBackend.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—'}
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Credit Tier</div>
              <div className="text-lg font-bold">{input.creditScore ? calc.creditTier : '—'}</div>
            </Card>
          </div>

          {/* Run Button */}
          <Button
            className="w-full gap-2 h-10"
            onClick={handleRunMatch}
            disabled={isRunning}
          >
            {isRunning ? (
              <><SpinnerGap className="h-4 w-4 animate-spin" /> Running Match…</>
            ) : (
              <><Lightning className="h-4 w-4" /> Run Bank Match</>
            )}
          </Button>

          {/* Match Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              {matchRun && (
                <div className="flex gap-3 text-sm">
                  <span className="text-emerald-600 font-medium">{matchRun.greenlights} greenlight{matchRun.greenlights !== 1 ? 's' : ''}</span>
                  <span className="text-amber-600 font-medium">{matchRun.reviews} review{matchRun.reviews !== 1 ? 's' : ''}</span>
                  <span className="text-red-500 font-medium">{matchRun.fails} fail{matchRun.fails !== 1 ? 's' : ''}</span>
                </div>
              )}

              <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as MatchResultStatus | 'all')}>
                <TabsList className="flex flex-wrap h-auto gap-1 p-1">
                  <TabsTrigger value="all" className="text-xs">All ({filterCounts.all})</TabsTrigger>
                  <TabsTrigger value="greenlight" className="text-xs">✓ ({filterCounts.greenlight})</TabsTrigger>
                  <TabsTrigger value="review" className="text-xs">⚠ ({filterCounts.review})</TabsTrigger>
                  <TabsTrigger value="fail" className="text-xs">✗ ({filterCounts.fail})</TabsTrigger>
                </TabsList>

                <TabsContent value={activeFilter} className="mt-3 space-y-2">
                  {filteredResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No results in this category.</p>
                  ) : (
                    filteredResults.map((r) => <ResultCard key={r.id} result={r} />)
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {results.length === 0 && !isRunning && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <Intersect className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Fill in the deal structure and click <strong>Run Bank Match</strong> to see lender eligibility results.</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Compliance Notice:</strong> Match results are based on general lender guidelines stored in the system and are for estimation purposes only. Actual lender decisions may vary. Always verify current guidelines with your lender representative before quoting rates or terms to customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
