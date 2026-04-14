import { useMemo } from 'react'
import { useRouter } from '@/app/router'
import { BUYER_HUB_INVENTORY } from '@/domains/buyer-hub/buyerHub.mock'
import { computePaymentEstimate } from '@/domains/buyer-hub/buyerHub.types'
import { useShoppingState } from '@/domains/buyer-hub/useShoppingState'
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
  Car,
  ChatCircle,
  Scales,
  CarProfile,
  Star,
} from '@phosphor-icons/react'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function formatMileage(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

export function VehicleDetailPage() {
  const { params, navigate } = useRouter()
  const { isSaved, toggleSaved } = useShoppingState()

  const vehicle = useMemo(
    () => BUYER_HUB_INVENTORY.find((u) => u.id === params.unitId),
    [params.unitId],
  )

  const isFavorited = vehicle ? isSaved(vehicle.id) : false

  const paymentEstimate = useMemo(() => {
    if (!vehicle) return null
    return computePaymentEstimate({
      vehiclePrice: vehicle.askingPrice,
      downPayment: 0,
      tradeValue: 0,
      termMonths: 72,
      interestRate: 6.9,
    })
  }, [vehicle])

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back navigation */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => navigate('/shop')}
      >
        <ArrowLeft size={18} className="mr-1.5" />
        Back to Inventory
      </Button>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* ===== LEFT COLUMN — Hero, Specs, Highlights ===== */}
        <div className="lg:col-span-3 space-y-6">
          {/* Hero section */}
          <Card className="overflow-hidden">
            <div className="relative flex items-center justify-center bg-muted/40 py-20">
              <div className="text-center space-y-3">
                <Car size={80} weight="thin" className="mx-auto text-muted-foreground/50" />
                <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
                <div className="flex items-center justify-center gap-2">
                  {vehicle.available ? (
                    <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
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
                className="absolute top-4 right-4 rounded-full p-2 transition-colors hover:bg-background/80"
                aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Heart
                  size={26}
                  weight={isFavorited ? 'fill' : 'regular'}
                  className={isFavorited ? 'text-red-500' : 'text-muted-foreground'}
                />
              </button>
            </div>
          </Card>

          {/* Key specs grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card>
              <CardContent className="flex flex-col items-center py-4 px-3 text-center">
                <CurrencyDollar size={24} className="mb-1.5 text-emerald-600" />
                <span className="text-xs text-muted-foreground">Price</span>
                <span className="text-lg font-bold">{formatPrice(vehicle.askingPrice)}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center py-4 px-3 text-center">
                <Speedometer size={24} className="mb-1.5 text-blue-600" />
                <span className="text-xs text-muted-foreground">Mileage</span>
                <span className="text-lg font-bold">{formatMileage(vehicle.mileage)} mi</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center py-4 px-3 text-center">
                <CarProfile size={24} className="mb-1.5 text-violet-600" />
                <span className="text-xs text-muted-foreground">Body Style</span>
                <span className="text-lg font-bold">{vehicle.bodyStyle}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center py-4 px-3 text-center">
                <CalendarPlus size={24} className="mb-1.5 text-amber-600" />
                <span className="text-xs text-muted-foreground">Year</span>
                <span className="text-lg font-bold">{vehicle.year}</span>
              </CardContent>
            </Card>
          </div>

          {/* Highlights */}
          {vehicle.highlights.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Highlights</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {vehicle.highlights.map((h) => (
                  <Badge key={h} variant="secondary" className="text-sm">
                    {h}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {/* VIN */}
          <div className="text-center">
            <span className="text-xs text-muted-foreground">VIN</span>
            <p className="font-mono text-sm tracking-wider text-muted-foreground">
              {vehicle.vin}
            </p>
          </div>
        </div>

        {/* ===== RIGHT COLUMN — Payment Estimate + CTAs ===== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Estimate */}
          {paymentEstimate && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CurrencyDollar size={20} />
                  Estimated Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <span className="text-4xl font-bold">
                    {formatPrice(paymentEstimate.monthlyPayment)}
                  </span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-muted-foreground">Vehicle Price</div>
                  <div className="text-right font-medium">{formatPrice(vehicle.askingPrice)}</div>
                  <div className="text-muted-foreground">Down Payment</div>
                  <div className="text-right font-medium">{formatPrice(0)}</div>
                  <div className="text-muted-foreground">Term</div>
                  <div className="text-right font-medium">72 months</div>
                  <div className="text-muted-foreground">Est. APR</div>
                  <div className="text-right font-medium">6.9%</div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-muted-foreground">Total Cost</div>
                  <div className="text-right font-semibold">{formatPrice(paymentEstimate.totalCost)}</div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {paymentEstimate.disclaimer}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/finance')}
                >
                  Customize Payment
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Conversion CTAs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Interested?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => navigate(`/inquiry/${vehicle.id}`)}>
                <ChatCircle size={18} className="mr-2" />
                Inquire About This Vehicle
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/schedule')}>
                <CalendarPlus size={18} className="mr-2" />
                Schedule a Test Drive
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/finance/apply')}>
                <CurrencyDollar size={18} className="mr-2" />
                Get Pre-Qualified
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/trade')}>
                <Scales size={18} className="mr-2" />
                Value Your Trade
              </Button>
              <Separator />
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => vehicle && toggleSaved(vehicle.id)}
              >
                <Heart
                  size={18}
                  weight={isFavorited ? 'fill' : 'regular'}
                  className={`mr-2 ${isFavorited ? 'text-red-500' : ''}`}
                />
                {isFavorited ? 'Saved to Favorites' : 'Save to Favorites'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
