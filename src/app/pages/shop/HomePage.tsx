import {
  ArrowRight,
  CheckCircle,
  CurrencyDollar,
  Gauge,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkle,
  TrendUp,
} from '@phosphor-icons/react'
import { useRouter } from '@/app/router'
import { useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import { useScrollIntoView } from '@/hooks/useScrollIntoView'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function HomePage() {
  const { navigate } = useRouter()
  const { featuredRecords, publicRecords, masterSource } = useInventoryCatalog()
  const heroUnit = featuredRecords[0] || publicRecords[0]
  const featureCardsRef = useScrollIntoView()
  const inventoryGridRef = useScrollIntoView()

  return (
    <div className="space-y-20 pb-16">
      <section className="vault-panel vault-edge vault-animate-fade overflow-hidden rounded-[2.2rem]">
        <div className="grid min-h-[42rem] gap-0 lg:grid-cols-[0.85fr_1.15fr]">
          {/* LEFT: Minimal text */}
          <div className="relative flex flex-col justify-center p-7 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(182,212,255,0.12),transparent_45%),radial-gradient(circle_at_80%_90%,rgba(168,189,255,0.08),transparent_40%)]" />
            <div className="relative z-10 max-w-sm space-y-6">
              <div>
                <Badge className="vault-chip rounded-full px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.18em]">
                  Vehicle Vault
                </Badge>
                <h1 className="vault-title mt-6 text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
                  Premium Inventory. Precision Buying.
                </h1>
              </div>
              <p className="text-sm leading-7 text-slate-300 max-w-sm">
                Explore verified vehicles in a vault-inspired gallery built for serious buyers.
              </p>
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3">
                <Button size="lg" onClick={() => navigate('/shop')} className="vault-btn rounded-full px-6 py-2.5 text-xs uppercase tracking-[0.14em]">
                  Browse Inventory
                  <ArrowRight size={16} />
                </Button>
                <Button size="lg" onClick={() => navigate('/finance')} className="vault-btn-muted rounded-full px-6 py-2.5 text-xs uppercase tracking-[0.14em]">
                  Finance
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT: Full image with minimal overlay */}
          <div className="relative min-h-[25rem] sm:min-h-[35rem]">
            <img
              src={heroUnit?.photos[0]?.url || '/inventory/national-car-mart/placeholder.jpg'}
              alt={heroUnit ? `${heroUnit.year} ${heroUnit.make} ${heroUnit.model}` : 'Featured vehicle'}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(6,9,15,0),rgba(6,9,15,0.4)),linear-gradient(180deg,transparent_50%,rgba(2,5,10,0.7))]" />
            {heroUnit && (
              <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end space-y-3 p-6 sm:p-8">
                <p className="vault-title text-[0.58rem] text-slate-200">Featured</p>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {heroUnit.year} {heroUnit.make} {heroUnit.model}
                </h2>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-400">{heroUnit.trim}</p>
                    <p className="mt-1 text-xl font-semibold text-white">{formatPrice(heroUnit.price)}</p>
                  </div>
                  <Button size="sm" onClick={() => navigate(`/shop/${heroUnit.id}`)} className="vault-btn-muted vault-tap rounded-full px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.12em]">
                    View Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats row - compact, underneath hero */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 px-2 sm:px-0">
        <Card className="vault-panel-soft rounded-2xl">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Available</p>
            <p className="mt-1.5 text-2xl font-bold text-white">{publicRecords.length}</p>
          </CardContent>
        </Card>
        <Card className="vault-panel-soft rounded-2xl">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Live Inventory</p>
            <p className="mt-1.5 text-sm font-medium text-slate-300">{masterSource.label}</p>
          </CardContent>
        </Card>
        <Card className="vault-panel-soft rounded-2xl col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Browse Type</p>
            <p className="mt-1.5 text-sm font-medium text-slate-300">CSV-Sourced</p>
          </CardContent>
        </Card>
      </div>

      <section className="grid gap-5 md:grid-cols-3" ref={featureCardsRef}>
        <Card className="vault-panel-soft vault-edge vault-scroll-stagger rounded-2xl">
          <CardContent className="space-y-3 p-6">
            <ShieldCheck size={20} className="text-blue-200" />
            <p className="text-base font-semibold text-white">Secure purchase flow</p>
            <p className="text-sm text-slate-400">Inquiry, finance, and scheduling pathways are separated cleanly from internal operations.</p>
          </CardContent>
        </Card>
        <Card className="vault-panel-soft vault-edge vault-scroll-stagger rounded-2xl">
          <CardContent className="space-y-3 p-6">
            <TrendUp size={20} className="text-emerald-300" />
            <p className="text-base font-semibold text-white">Premium inventory intelligence</p>
            <p className="text-sm text-slate-400">Pricing, availability, mileage, and publishing status stay synchronized across buyer and admin surfaces.</p>
          </CardContent>
        </Card>
        <Card className="vault-panel-soft vault-edge vault-scroll-stagger rounded-2xl">
          <CardContent className="space-y-3 p-6">
            <Gauge size={20} className="text-violet-300" />
            <p className="text-base font-semibold text-white">Cinematic browsing speed</p>
            <p className="text-sm text-slate-400">High-impact visuals, sharp typography, and layered motion with fast loading image flows.</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="vault-title text-[0.63rem] text-slate-400">Featured Capsules</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Hand-selected units inside the vault</h2>
          </div>
          <Button onClick={() => navigate('/shop')} className="vault-btn-muted rounded-full px-6 py-5 text-xs uppercase tracking-[0.16em]">
            View Full Inventory
            <ArrowRight size={15} />
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-3" ref={inventoryGridRef}>
          {featuredRecords.slice(0, 3).map((record, index) => (
            <button
              key={record.id}
              type="button"
              onClick={() => navigate(`/shop/${record.id}`)}
              className="vault-panel vault-edge vault-scroll-stagger vault-animate-rise overflow-hidden rounded-[1.7rem] text-left transition-all hover:-translate-y-1 hover:border-blue-200/40"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="vault-image-frame aspect-[16/10]">
                <img
                  src={record.photos[0]?.url || '/inventory/national-car-mart/placeholder.jpg'}
                  alt={`${record.year} ${record.make} ${record.model}`}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <p className="text-lg font-semibold text-white">{record.year} {record.make} {record.model}</p>
                  <p className="mt-1 text-sm text-slate-400">{record.trim} · {record.bodyStyle}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <Badge className="vault-chip">{record.drivetrain || 'Available'}</Badge>
                  <p className="font-semibold text-white">{formatPrice(record.price)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="vault-panel-soft vault-edge grid gap-8 rounded-[2rem] p-8 lg:grid-cols-[1fr_1fr] lg:p-10">
        <div>
          <p className="vault-title text-[0.63rem] text-slate-400">Buyer Confidence Layer</p>
          <h2 className="mt-3 max-w-xl text-3xl font-bold text-white">Luxury presentation backed by operational trust.</h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400">
            Vehicle Vault combines cinematic browsing with direct paths into finance, inquiry,
            and appointment workflows so customers can move from inspiration to intent quickly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => navigate('/schedule')} className="vault-btn rounded-full px-6 py-5 text-xs uppercase tracking-[0.16em]">Schedule Visit</Button>
            <Button onClick={() => navigate('/trade')} className="vault-btn-muted rounded-full px-6 py-5 text-xs uppercase tracking-[0.16em]">Value Trade</Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="vault-panel rounded-2xl p-5">
            <MapPin size={18} className="text-slate-200" />
            <p className="mt-3 font-semibold text-white">Vault Showroom</p>
            <p className="mt-1 text-sm text-slate-400">123 Main Street, Anytown, USA</p>
          </div>
          <div className="vault-panel rounded-2xl p-5">
            <CurrencyDollar size={18} className="text-slate-200" />
            <p className="mt-3 font-semibold text-white">Finance Confidence</p>
            <p className="mt-1 text-sm text-slate-400">Transparent payment tooling and pre-qualification flow.</p>
          </div>
          <div className="vault-panel rounded-2xl p-5 sm:col-span-2">
            <div className="flex items-start gap-3">
              <Lock size={18} className="mt-0.5 text-blue-200" />
              <p className="text-sm leading-7 text-slate-300">
                Public routes stay open for browsing while administrative systems remain protected behind authenticated access.
              </p>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <CheckCircle size={18} className="mt-0.5 text-emerald-300" />
              <p className="text-sm leading-7 text-slate-300">
                Imagery and inventory assets are reused directly from the existing repository archive and mapped runtime catalog.
              </p>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <Sparkle size={18} className="mt-0.5 text-violet-300" />
              <p className="text-sm leading-7 text-slate-300">
                Every listing is displayed in premium vault panels with high-contrast typography and cinematic spacing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}