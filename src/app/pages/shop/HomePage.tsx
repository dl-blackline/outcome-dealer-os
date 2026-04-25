import {
  ArrowRight,
  Car,
  CheckCircle,
  CurrencyDollar,
  Gauge,
  MapPin,
  ShieldCheck,
  Star,
  TrendUp,
} from '@phosphor-icons/react'
import { useRouter } from '@/app/router'
import { useInventoryCatalog, pickBestInventoryPhoto } from '@/domains/inventory/inventory.runtime'
import { useScrollIntoView } from '@/hooks/useScrollIntoView'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InventoryPhotoImage } from '@/components/inventory/InventoryPhotoImage'
import { isPlaceholderUrl } from '@/domains/inventory-photo/inventoryPhoto.placeholder'
import { DEALER } from '@/lib/dealer.constants'

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

const TRUST_POINTS = [
  'Financing available for all credit types',
  'Trade-ins welcome — we pay top dollar',
  `Serving ${DEALER.city}, ${DEALER.state} and surrounding areas`,
  'Every vehicle verified before listing',
]

export function HomePage() {
  const { navigate } = useRouter()
  const { featuredRecords, publicRecords, masterSource } = useInventoryCatalog()
  const heroUnit = featuredRecords[0] || publicRecords[0]
  const featureCardsRef = useScrollIntoView()
  const inventoryGridRef = useScrollIntoView()

  const heroPhotoUrl = heroUnit ? pickBestInventoryPhoto(heroUnit)?.url : undefined
  const heroHasRealPhoto = !!heroPhotoUrl && !isPlaceholderUrl(heroPhotoUrl)

  return (
    <div className="space-y-12 pb-20 pt-4 sm:pt-6">
      {/* ── Hero ── */}
      <section className="vault-panel vault-edge vault-animate-fade overflow-hidden rounded-[2rem]">
        <div className="grid min-h-[30rem] gap-0 lg:grid-cols-2 lg:min-h-[38rem]">
          {/* LEFT: headline + trust points + CTAs */}
          <div className="relative flex flex-col justify-center p-7 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(182,212,255,0.1),transparent_45%)]" />
            <div className="relative z-10 max-w-md space-y-5">
              <Badge className="vault-chip rounded-full px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.16em]">
                National Car Mart
              </Badge>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-[2.6rem]">
                Find Your Next Vehicle<br className="hidden sm:block" /> With Confidence
              </h1>
              <p className="text-[0.9rem] leading-7 text-slate-600 dark:text-slate-300">
                Verified inventory, flexible financing, and trade-in options — all in one place.
              </p>
              <ul className="space-y-2">
                {TRUST_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle size={15} weight="fill" className="shrink-0 text-emerald-500 dark:text-emerald-400" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button
                  size="lg"
                  onClick={() => navigate('/shop')}
                  className="vault-btn rounded-xl px-7 py-3 text-sm font-semibold"
                >
                  Browse Inventory
                  <ArrowRight size={16} />
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate('/finance')}
                  className="vault-btn-muted rounded-xl px-7 py-3 text-sm font-semibold"
                >
                  Get Financing
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT: Vehicle image or branded fallback */}
          <div className="relative min-h-[22rem] overflow-hidden lg:min-h-0">
            {heroHasRealPhoto && heroUnit ? (
              <>
                <InventoryPhotoImage
                  record={heroUnit}
                  alt={`${heroUnit.year} ${heroUnit.make} ${heroUnit.model}`}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 space-y-2 p-6 sm:p-8">
                  <p className="vault-title text-[0.55rem] text-slate-200">Featured</p>
                  <h2 className="text-xl font-bold text-white sm:text-2xl">
                    {heroUnit.year} {heroUnit.make} {heroUnit.model}
                  </h2>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-300">{heroUnit.trim}</p>
                      <p className="mt-0.5 text-lg font-semibold text-white">{formatPrice(heroUnit.price)}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/shop/${heroUnit.id}`)}
                      className="vault-btn-muted shrink-0 rounded-xl px-5 py-2 text-xs font-semibold"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              // Branded fallback — shown when no real vehicle photo is available
              <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-slate-800 p-10 text-center">
                {/* Decorative grid */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />
                <div className="relative z-10 space-y-4">
                  <div className="mx-auto w-fit rounded-full border border-blue-400/30 bg-blue-500/15 p-5">
                    <ShieldCheck size={38} weight="duotone" className="text-blue-300" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">National Car Mart</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {heroUnit
                        ? `${heroUnit.year} ${heroUnit.make} ${heroUnit.model} — ${formatPrice(heroUnit.price)}`
                        : 'Premium inventory loading…'}
                    </p>
                  </div>
                  {heroUnit ? (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/shop/${heroUnit.id}`)}
                      className="vault-btn rounded-xl px-6 py-2 text-sm font-semibold"
                    >
                      View Details
                      <ArrowRight size={14} />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => navigate('/shop')}
                      className="vault-btn rounded-xl px-6 py-2 text-sm font-semibold"
                    >
                      Browse Inventory
                      <ArrowRight size={14} />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Card className="vault-panel-soft rounded-2xl">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">In Stock</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{publicRecords.length}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">Available vehicles</p>
          </CardContent>
        </Card>
        <Card className="vault-panel-soft rounded-2xl">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Inventory Source</p>
            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">{masterSource.label}</p>
          </CardContent>
        </Card>
        <Card className="vault-panel-soft col-span-2 rounded-2xl md:col-span-1">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Location</p>
            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Cleveland, Ohio</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Feature cards ── */}
      <section className="grid gap-5 md:grid-cols-3" ref={featureCardsRef}>
        <Card className="vault-panel-soft vault-edge vault-scroll-stagger rounded-2xl">
          <CardContent className="space-y-3 p-6">
            <ShieldCheck size={20} className="text-blue-600 dark:text-blue-300" />
            <p className="text-base font-semibold text-slate-900 dark:text-white">Verified purchase flow</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Transparent inquiry, finance, and scheduling pathways so you know exactly where you stand.</p>
          </CardContent>
        </Card>
        <Card className="vault-panel-soft vault-edge vault-scroll-stagger rounded-2xl">
          <CardContent className="space-y-3 p-6">
            <TrendUp size={20} className="text-emerald-600 dark:text-emerald-300" />
            <p className="text-base font-semibold text-slate-900 dark:text-white">Live inventory sync</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Pricing, availability, and mileage stay up to date so you're always looking at real listings.</p>
          </CardContent>
        </Card>
        <Card className="vault-panel-soft vault-edge vault-scroll-stagger rounded-2xl">
          <CardContent className="space-y-3 p-6">
            <Gauge size={20} className="text-violet-600 dark:text-violet-300" />
            <p className="text-base font-semibold text-slate-900 dark:text-white">Fast, mobile-ready browsing</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Browse vehicles quickly on any device with full details, photos, and easy contact options.</p>
          </CardContent>
        </Card>
      </section>

      {/* ── Featured inventory ── */}
      <section className="space-y-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.63rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Featured Vehicles</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Hand-selected units in stock
            </h2>
          </div>
          <Button
            onClick={() => navigate('/shop')}
            className="vault-btn-muted rounded-xl px-6 py-2.5 text-sm font-semibold"
          >
            View Full Inventory
            <ArrowRight size={15} />
          </Button>
        </div>

        {featuredRecords.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-3" ref={inventoryGridRef}>
            {featuredRecords.slice(0, 3).map((record, index) => (
              <button
                key={record.id}
                type="button"
                onClick={() => navigate(`/shop/${record.id}`)}
                className="vault-panel vault-edge vault-scroll-stagger vault-animate-rise overflow-hidden rounded-[1.5rem] text-left transition-all hover:-translate-y-1 hover:border-blue-500/30 dark:hover:border-blue-200/40"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="vault-image-frame aspect-[16/10]">
                  <InventoryPhotoImage
                    record={record}
                    alt={`${record.year} ${record.make} ${record.model}`}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {record.year} {record.make} {record.model}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{record.trim} · {record.bodyStyle}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="vault-chip text-xs">{record.drivetrain || 'Available'}</Badge>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(record.price)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="vault-panel-soft rounded-2xl p-10 text-center">
            <Car size={32} className="mx-auto mb-4 text-slate-400 dark:text-slate-500" />
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">Featured inventory loading</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Our hand-selected vehicles will appear here. Browse all available inventory below.
            </p>
            <Button
              onClick={() => navigate('/shop')}
              className="vault-btn mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold"
            >
              Browse All Vehicles
              <ArrowRight size={15} />
            </Button>
          </div>
        )}
      </section>

      {/* ── Buyer confidence ── */}
      <section className="vault-panel-soft vault-edge grid gap-8 rounded-3xl p-8 lg:grid-cols-2 lg:p-10">
        <div>
          <p className="text-[0.63rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Why Choose Us</p>
          <h2 className="mt-3 max-w-sm text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            A dealership experience built around you.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600 dark:text-slate-400">
            At National Car Mart, we combine a broad inventory selection with flexible financing,
            transparent pricing, and a team that puts customers first.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/schedule')}
              className="vault-btn rounded-xl px-6 py-2.5 text-sm font-semibold"
            >
              Schedule a Visit
            </Button>
            <Button
              onClick={() => navigate('/trade')}
              className="vault-btn-muted rounded-xl px-6 py-2.5 text-sm font-semibold"
            >
              Value My Trade
            </Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="vault-panel rounded-2xl p-5">
            <MapPin size={18} className="text-blue-600 dark:text-blue-300" />
            <p className="mt-3 font-semibold text-slate-900 dark:text-white">Visit Our Lot</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{DEALER.addressFull}</p>
          </div>
          <div className="vault-panel rounded-2xl p-5">
            <CurrencyDollar size={18} className="text-emerald-600 dark:text-emerald-300" />
            <p className="mt-3 font-semibold text-slate-900 dark:text-white">Flexible Financing</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All credit types welcome. Quick pre-qualification with no obligation.</p>
          </div>
          <div className="vault-panel rounded-2xl p-5 sm:col-span-2">
            <div className="flex items-start gap-3">
              <CheckCircle size={17} weight="fill" className="mt-0.5 shrink-0 text-emerald-500 dark:text-emerald-400" />
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                Browse our inventory online or come in — we're open 6 days a week and ready to work with your budget.
              </p>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <Star size={17} weight="fill" className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-300" />
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                Trade-ins accepted on all makes and models. Get a fast offer on your current vehicle.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}