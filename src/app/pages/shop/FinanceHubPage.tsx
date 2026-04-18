import { useState, useMemo } from 'react'
import { useRouter } from '@/app/router'
import { computePaymentEstimate } from '@/domains/buyer-hub/buyerHub.types'
import { useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import {
  CurrencyDollar,
  Calculator,
  CheckCircle,
  ShieldCheck,
  Wrench,
  Umbrella,
  Tire,
  ArrowRight,
  Info,
} from '@phosphor-icons/react'

const TERM_OPTIONS = [24, 36, 48, 60, 72, 84]

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

const FI_PRODUCTS = [
  {
    icon: ShieldCheck,
    title: 'Extended Vehicle Protection',
    description:
      'Comprehensive mechanical breakdown coverage after factory warranty expires. Covers engine, transmission, drivetrain, and hundreds of components.',
    color: 'text-blue-600',
  },
  {
    icon: Umbrella,
    title: 'GAP Coverage',
    description:
      "If your vehicle is totaled or stolen, GAP covers the difference between what you owe and what your insurance pays \u2014 so you're never upside-down.",
    color: 'text-violet-600',
  },
  {
    icon: Wrench,
    title: 'Prepaid Maintenance',
    description:
      "Lock in today's prices for future oil changes, tire rotations, and multi-point inspections. Keep your vehicle running at peak condition.",
    color: 'text-amber-600',
  },
  {
    icon: Tire,
    title: 'Tire & Wheel Protection',
    description:
      'Flat tires, blowouts, and pothole damage are covered. Includes cosmetic wheel repair and roadside assistance for any tire event.',
    color: 'text-emerald-600',
  },
]

export function FinanceHubPage() {
  const { navigate } = useRouter()
  const { publicRecords } = useInventoryCatalog()

  const maxPrice = Math.max(...publicRecords.map((u) => u.price), 50_000)
  const [vehiclePrice, setVehiclePrice] = useState(35_000)
  const [downPayment, setDownPayment] = useState(3_000)
  const [tradeValue, setTradeValue] = useState(0)
  const [termMonths, setTermMonths] = useState(72)
  const [interestRate, setInterestRate] = useState(6.9)

  const estimate = useMemo(() =>
    computePaymentEstimate({ vehiclePrice, downPayment, tradeValue, termMonths, interestRate }),
    [vehiclePrice, downPayment, tradeValue, termMonths, interestRate]
  )

  const effectiveDownPct = vehiclePrice > 0
    ? Math.round(((downPayment + tradeValue) / vehiclePrice) * 100)
    : 0

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-2 py-4 sm:px-3 lg:px-4">
      {/* Header */}
      <div className="vault-panel-soft rounded-4xl border border-white/15 p-7 sm:p-8">
        <p className="vault-title text-[0.62rem] text-slate-400">Vehicle Vault Finance</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">Get Pre-Qualified & Drive Home Faster</h1>
        <p className="mt-2 text-slate-300">
          Transparent payment estimates, flexible terms, and premium protection options — all designed to accelerate your buying journey.
        </p>
      </div>

      {/* Payment Calculator */}
      <section>
        <div className="mb-4 flex items-center gap-2 text-white">
          <Calculator size={22} className="text-primary" />
          <h2 className="text-xl font-semibold">Payment Estimator</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Controls */}
          <Card className="vault-panel vault-edge lg:col-span-3 rounded-3xl border-white/15 bg-black/30">
            <CardContent className="space-y-7 pt-6">
              {/* Vehicle Price */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Vehicle Price</label>
                  <span className="text-sm font-semibold text-white">{formatCurrency(vehiclePrice)}</span>
                </div>
                <Slider
                  min={10_000}
                  max={Math.max(maxPrice + 10_000, 100_000)}
                  step={500}
                  value={[vehiclePrice]}
                  onValueChange={([v]) => setVehiclePrice(v)}
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>$10,000</span>
                  <span>{formatCurrency(Math.max(maxPrice + 10_000, 100_000))}</span>
                </div>
              </div>

              {/* Down Payment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Down Payment</label>
                  <span className="text-sm font-semibold text-white">{formatCurrency(downPayment)}</span>
                </div>
                <Slider
                  min={0}
                  max={Math.min(vehiclePrice, 30_000)}
                  step={250}
                  value={[downPayment]}
                  onValueChange={([v]) => setDownPayment(v)}
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>$0</span>
                  <span>{formatCurrency(Math.min(vehiclePrice, 30_000))}</span>
                </div>
              </div>

              {/* Trade-In Value */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Trade-In Value</label>
                  <span className="text-sm font-semibold text-white">{formatCurrency(tradeValue)}</span>
                </div>
                <Slider
                  min={0}
                  max={40_000}
                  step={250}
                  value={[tradeValue]}
                  onValueChange={([v]) => setTradeValue(v)}
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>$0</span>
                  <span>$40,000</span>
                </div>
              </div>

              {/* Loan Term */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Loan Term</label>
                <div className="flex flex-wrap gap-2">
                  {TERM_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTermMonths(t)}
                      className={`vault-tap rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] transition-colors ${
                        termMonths === t
                          ? 'border-blue-200/45 bg-blue-300/20 text-blue-100'
                          : 'border-white/15 bg-white/3 text-slate-300 hover:border-white/35 hover:bg-white/8'
                      }`}
                    >
                      {t} mo
                    </button>
                  ))}
                </div>
              </div>

              {/* APR */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Estimated APR</label>
                  <span className="text-sm font-semibold text-white">{interestRate.toFixed(1)}%</span>
                </div>
                <Slider
                  min={0}
                  max={20}
                  step={0.1}
                  value={[interestRate]}
                  onValueChange={([v]) => setInterestRate(Math.round(v * 10) / 10)}
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>0%</span>
                  <span>20%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Result */}
          <Card className="vault-panel vault-edge lg:col-span-2 flex flex-col rounded-3xl border-white/15 bg-black/35">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">Your Estimate</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between space-y-5">
              <div className="text-center py-4">
                <div className="text-5xl font-bold tracking-tight text-white">
                  {formatCurrency(estimate.monthlyPayment)}
                </div>
                <div className="mt-1 text-sm text-slate-400">/month</div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle Price</span>
                  <span className="font-medium text-white">{formatCurrency(vehiclePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Down + Trade</span>
                  <span className="font-medium text-emerald-600">
                    −{formatCurrency(downPayment + tradeValue)} ({effectiveDownPct}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Financed</span>
                  <span className="font-medium text-white">
                    {formatCurrency(Math.max(0, vehiclePrice - downPayment - tradeValue))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Term / APR</span>
                  <span className="font-medium text-white">{termMonths} mo @ {interestRate.toFixed(1)}%</span>
                </div>
                <Separator className="bg-white/15" />
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Cost</span>
                  <span className="font-semibold text-white">{formatCurrency(estimate.totalCost)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="vault-btn vault-tap w-full gap-1.5 rounded-full text-xs uppercase tracking-[0.14em]" onClick={() => navigate('/finance/apply')}>
                  Get Pre-Qualified
                  <ArrowRight size={16} />
                </Button>
                <Button variant="outline" className="vault-btn-muted vault-tap w-full rounded-full text-xs uppercase tracking-[0.14em]" onClick={() => navigate('/trade')}>
                  Value My Trade
                </Button>
              </div>

              <div className="flex items-start gap-1.5 rounded-xl border border-white/15 bg-black/30 p-3 text-xs text-slate-400">
                <Info size={14} className="mt-0.5 shrink-0" />
                <span>{estimate.disclaimer}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* F&I Products */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle size={22} className="text-primary" />
          <h2 className="text-xl font-semibold">Protection &amp; Products</h2>
        </div>
        <p className="mb-6 text-sm text-slate-400">
          Our finance department offers carefully selected products to protect your investment.
          Ask your finance manager for pricing and details.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {FI_PRODUCTS.map((product) => {
            const Icon = product.icon
            return (
              <Card key={product.title} className="vault-panel-soft rounded-2xl border-white/15 bg-white/3">
                <CardContent className="flex gap-4 pt-5">
                  <div className="shrink-0 mt-0.5">
                    <Icon size={28} className={product.color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-white">{product.title}</h3>
                      <Badge variant="outline" className="border-white/18 bg-white/3 text-xs text-slate-200">Ask us</Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      {product.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <Card className="vault-panel vault-edge rounded-3xl border-white/20 bg-black/35">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
          <CurrencyDollar size={48} className="shrink-0 text-primary" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Ready to see your real rate?</h3>
            <p className="mt-1 text-sm text-slate-300">
              Complete our 2-minute quick application and get a preliminary credit decision
              before you even set foot in the showroom.
            </p>
          </div>
          <Button
            size="lg"
            className="vault-btn vault-tap shrink-0 gap-1.5 rounded-full px-6 text-xs uppercase tracking-[0.14em]"
            onClick={() => navigate('/finance/apply')}
          >
            Start Application
            <ArrowRight size={16} />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
