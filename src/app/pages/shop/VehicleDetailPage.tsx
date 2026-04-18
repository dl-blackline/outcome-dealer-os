import { useMemo, useState } from 'react'
import { useRouter } from '@/app/router'
import { computePaymentEstimate } from '@/domains/buyer-hub/buyerHub.types'
import { useShoppingState } from '@/domains/buyer-hub/useShoppingState'
import { useInventoryRecord } from '@/domains/inventory/inventory.runtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Heart,
  CurrencyDollar,
  CalendarPlus,
  Speedometer,
  ChatCircle,
  Scales,
  CarProfile,
  Star,
  Lock,
  Sparkle,
} from '@phosphor-icons/react'

const IMAGE_FALLBACK = 'https://picsum.photos/seed/placeholder/1280/720'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function formatMileage(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

export function VehicleDetailPage() {
  const { params, navigate } = useRouter()
  const { isSaved, toggleSaved } = useShoppingState()
  const { record: vehicle, loading } = useInventoryRecord(params.unitId)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  const isFavorited = vehicle ? isSaved(vehicle.id) : false

  const paymentEstimate = useMemo(() => {
    if (!vehicle) return null
    return computePaymentEstimate({
      vehiclePrice: vehicle.price,
      downPayment: 0,
      tradeValue: 0,
      termMonths: 72,
      interestRate: 6.9,
    })
  }, [vehicle])

  if (loading) {
    return <div className="py-24 text-center text-sm text-muted-foreground">Loading vehicle…</div>
  }

  // --- Not-found state ---
  if (!vehicle) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <CarProfile size={64} className="mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Vehicle Not Found</h1>
        <p className="text-muted-foreground mt-2 mb-6">
          The vehicle you're looking for is no longer available or the link may be incorrect.
        </p>
        <Button variant="outline" onClick={() => navigate('/shop')}>
          <ArrowLeft size={18} className="mr-2" />
          Back to Inventory
        </Button>
      </div>
    )
  }

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`
  const selectedPhoto = vehicle.photos[selectedPhotoIndex] || vehicle.photos[0]

  return (
    <div className="mx-auto max-w-[88rem] px-2 py-3 sm:px-3 lg:px-4">
      {/* Back navigation */}
      <Button
        variant="ghost"
        size="sm"
        className="vault-btn-muted mb-4 rounded-full border border-white/20 px-5 text-xs uppercase tracking-[0.14em] text-slate-200"
        onClick={() => navigate('/shop')}
      >
        <ArrowLeft size={18} className="mr-1.5" />
        Back to Inventory
      </Button>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* ===== LEFT COLUMN — Hero, Specs, Highlights ===== */}
        <div className="lg:col-span-3 space-y-6">
          {/* Hero section */}
          <Card className="vault-panel vault-edge overflow-hidden rounded-[2rem] border-white/15 bg-black/30">
            <div className="vault-image-frame relative h-[23rem] bg-muted/40 sm:h-[34rem]">
              <img
                src={selectedPhoto?.url || IMAGE_FALLBACK}
                alt={title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = IMAGE_FALLBACK
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_44%,rgba(3,7,14,0.95))]" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                <p className="vault-title text-[0.62rem] text-slate-300">Vault Asset Profile</p>
                <h1 className="mt-2 text-2xl font-bold text-white sm:text-4xl">{title}</h1>
                <div className="mt-2 flex items-center gap-2">
                  {vehicle.available ? (
                    <Badge variant="default" className="rounded-full bg-emerald-600/85 hover:bg-emerald-600">
                      <Star size={12} weight="fill" className="mr-1" /> Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Unavailable</Badge>
                  )}
                  <Badge variant="outline">{vehicle.bodyStyle}</Badge>
                </div>
              </div>
              {/* Favorite toggle */}
              <button
                onClick={() => vehicle && toggleSaved(vehicle.id)}
                className="absolute right-4 top-4 rounded-full border border-white/30 bg-black/30 p-2 transition-colors hover:bg-black/55"
                aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Heart
                  size={26}
                  weight={isFavorited ? 'fill' : 'regular'}
                  className={isFavorited ? 'text-red-400' : 'text-slate-300'}
                />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 border-t border-white/15 p-4 sm:grid-cols-5">
              {vehicle.photos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={`overflow-hidden rounded-xl border transition-all ${selectedPhotoIndex === index ? 'border-blue-200/45 ring-2 ring-blue-200/25' : 'border-white/15 hover:border-white/40'}`}
                >
                  <img src={photo.url} alt={photo.alt} className="aspect-4/3 h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </Card>

          {/* Key specs grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="vault-panel-soft border-white/15 bg-white/[0.04]">
              <CardContent className="flex flex-col items-center py-4 px-3 text-center">
                <CurrencyDollar size={24} className="mb-1.5 text-emerald-600" />
                <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Price</span>
                <span className="text-lg font-bold text-white">{formatPrice(vehicle.price)}</span>
              </CardContent>
            </Card>
            <Card className="vault-panel-soft border-white/15 bg-white/[0.04]">
              <CardContent className="flex flex-col items-center py-4 px-3 text-center">
                <Speedometer size={24} className="mb-1.5 text-blue-600" />
                <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Mileage</span>
                <span className="text-lg font-bold text-white">{formatMileage(vehicle.mileage)} mi</span>
              </CardContent>
            </Card>
            <Card className="vault-panel-soft border-white/15 bg-white/[0.04]">
              <CardContent className="flex flex-col items-center py-4 px-3 text-center">
                <CarProfile size={24} className="mb-1.5 text-violet-600" />
                <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Body Style</span>
                <span className="text-lg font-bold text-white">{vehicle.bodyStyle}</span>
              </CardContent>
            </Card>
            <Card className="vault-panel-soft border-white/15 bg-white/[0.04]">
              <CardContent className="flex flex-col items-center py-4 px-3 text-center">
                <CalendarPlus size={24} className="mb-1.5 text-amber-600" />
                <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Year</span>
                <span className="text-lg font-bold text-white">{vehicle.year}</span>
              </CardContent>
            </Card>
          </div>

          {/* Highlights */}
          {vehicle.features.length > 0 && (
            <Card className="vault-panel-soft border-white/15 bg-white/[0.03]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white">Highlights</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {vehicle.features.map((h) => (
                  <Badge key={h} variant="secondary" className="border border-white/15 bg-white/[0.04] text-sm text-slate-200">
                    {h}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="vault-panel-soft border-white/15 bg-white/[0.03]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">Vehicle Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-slate-300">{vehicle.description}</p>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-white/15 bg-black/30 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Condition</p>
                  <p className="mt-1 font-medium text-white">{vehicle.condition || 'Pre-owned'}</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-black/30 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Drivetrain</p>
                  <p className="mt-1 font-medium text-white">{vehicle.drivetrain || 'Not specified'}</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-black/30 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Engine</p>
                  <p className="mt-1 font-medium text-white">{vehicle.engine || 'Not specified'}</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-black/30 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Color</p>
                  <p className="mt-1 font-medium text-white">{vehicle.color || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VIN */}
          <div className="vault-panel-soft grid gap-3 rounded-2xl border border-white/15 p-5 text-center sm:grid-cols-3">
            <div>
              <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Stock #</span>
              <p className="font-mono text-sm tracking-wider text-slate-200">
                {vehicle.stockNumber || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Transmission</span>
              <p className="text-sm tracking-wide text-slate-200">
                {vehicle.transmission || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.14em] text-slate-400">VIN</span>
              <p className="font-mono text-sm tracking-wider text-slate-200">{vehicle.vin}</p>
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN — Payment Estimate + CTAs ===== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Estimate */}
          {paymentEstimate && (
            <Card className="vault-panel vault-edge rounded-3xl border-white/20 bg-black/35">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-white">
                  <CurrencyDollar size={20} />
                  Estimated Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <span className="text-4xl font-bold text-white">
                    {formatPrice(paymentEstimate.monthlyPayment)}
                  </span>
                  <span className="text-slate-400">/mo</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-slate-400">Vehicle Price</div>
                    <div className="text-right font-medium text-slate-100">{formatPrice(vehicle.price)}</div>
                  <div className="text-slate-400">Down Payment</div>
                  <div className="text-right font-medium text-slate-100">{formatPrice(0)}</div>
                  <div className="text-slate-400">Term</div>
                  <div className="text-right font-medium text-slate-100">72 months</div>
                  <div className="text-slate-400">Est. APR</div>
                  <div className="text-right font-medium text-slate-100">6.9%</div>
                </div>
                <Separator className="bg-white/15" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-slate-400">Total Cost</div>
                  <div className="text-right font-semibold text-slate-100">{formatPrice(paymentEstimate.totalCost)}</div>
                </div>
                <p className="text-xs leading-relaxed text-slate-400">
                  {paymentEstimate.disclaimer}
                </p>
                <Button
                  variant="outline"
                  className="vault-btn-muted w-full rounded-full text-xs uppercase tracking-[0.14em]"
                  onClick={() => navigate('/finance')}
                >
                  Customize Payment
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Conversion CTAs */}
          <Card className="vault-panel-soft rounded-3xl border-white/15 bg-white/[0.03]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <Lock size={18} className="text-blue-200" />
                Unlock Next Step
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="vault-btn w-full rounded-full text-xs uppercase tracking-[0.14em]" onClick={() => navigate(`/inquiry/${vehicle.id}`)}>
                <ChatCircle size={18} className="mr-2" />
                Inquire About This Vehicle
              </Button>
              <Button variant="outline" className="vault-btn-muted w-full rounded-full text-xs uppercase tracking-[0.14em]" onClick={() => navigate('/schedule')}>
                <CalendarPlus size={18} className="mr-2" />
                Schedule a Test Drive
              </Button>
              <Button variant="outline" className="vault-btn-muted w-full rounded-full text-xs uppercase tracking-[0.14em]" onClick={() => navigate('/finance/apply')}>
                <CurrencyDollar size={18} className="mr-2" />
                Get Pre-Qualified
              </Button>
              <Button variant="outline" className="vault-btn-muted w-full rounded-full text-xs uppercase tracking-[0.14em]" onClick={() => navigate('/trade')}>
                <Scales size={18} className="mr-2" />
                Value Your Trade
              </Button>
              <Separator className="bg-white/15" />
              <Button
                variant="ghost"
                className="w-full rounded-full text-xs uppercase tracking-[0.14em] text-slate-300 hover:bg-white/8 hover:text-white"
                onClick={() => vehicle && toggleSaved(vehicle.id)}
              >
                <Heart
                  size={18}
                  weight={isFavorited ? 'fill' : 'regular'}
                  className={`mr-2 ${isFavorited ? 'text-red-500' : ''}`}
                />
                {isFavorited ? 'Saved to Favorites' : 'Save to Favorites'}
              </Button>
              <div className="rounded-xl border border-white/12 bg-black/30 p-3 text-xs text-slate-400">
                <p className="flex items-center gap-2">
                  <Sparkle size={14} className="text-blue-200" />
                  Vehicle Vault keeps public browsing premium while internal operations stay protected.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
