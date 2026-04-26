import { useEffect, useMemo, useState } from 'react'
import { useRouter } from '@/app/router'
import { computePaymentEstimate } from '@/domains/buyer-hub/buyerHub.types'
import { useShoppingState } from '@/domains/buyer-hub/useShoppingState'
import { useInventoryRecord } from '@/domains/inventory/inventory.runtime'
import { setSelectedUnit } from '@/domains/buyer-hub/helpers/selectedVehicleContext'
import { InventoryPhotoImage } from '@/components/inventory/InventoryPhotoImage'
import { ArrowLeft, Heart, Car, Lock, Phone } from '@phosphor-icons/react'
import { DEALER } from '@/lib/dealer.constants'

function fmt(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}
function fmtMi(v: number) {
  return new Intl.NumberFormat('en-US').format(v)
}

export function VehicleDetailPage() {
  const { params, navigate } = useRouter()
  const { isSaved, toggleSaved } = useShoppingState()
  const { record: vehicle, loading } = useInventoryRecord(params.unitId)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  useEffect(() => {
    if (params.unitId) setSelectedUnit(params.unitId, 'shop')
  }, [params.unitId])

  const isFavorited = vehicle ? isSaved(vehicle.id) : false

  const paymentEstimate = useMemo(() => {
    if (!vehicle) return null
    return computePaymentEstimate({ vehiclePrice: vehicle.price, downPayment: 0, tradeValue: 0, termMonths: 72, interestRate: 6.9 })
  }, [vehicle])

  if (loading) {
    return (
      <div style={{ background: '#0a0a0f', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#8898b8', fontFamily: 'Barlow, Manrope, sans-serif' }}>Loading vehicle...</p>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div style={{ background: '#0a0a0f', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <Car size={56} style={{ color: '#2a2a40' }} />
        <p style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 700, fontSize: '1.3rem', textTransform: 'uppercase', color: '#c8d4f0' }}>Vehicle Not Found</p>
        <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.85rem', color: '#8898b8' }}>This vehicle may no longer be available.</p>
        <button onClick={() => navigate('/shop')} className="ncm-btn-red" style={{ borderRadius: '0.55rem', marginTop: '0.5rem' }}>
          <ArrowLeft size={15} /> Back to Inventory
        </button>
      </div>
    )
  }

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`
  const selectedPhoto = vehicle.photos[selectedPhotoIndex] || vehicle.photos[0]
  const monthly = paymentEstimate ? Math.round(paymentEstimate.monthlyPayment) : null

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', paddingBottom: '6.2rem' }}>
      <div style={{ background: 'linear-gradient(180deg, #0e121c 0%, #0a0d15 100%)', borderBottom: '1px solid var(--border-subtle)', padding: '0.85rem 0' }}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/shop')} style={{ display: 'flex', alignItems: 'center', gap: '0.42rem', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.74rem', color: '#9aafcf', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <ArrowLeft size={14} /> Back to Inventory
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-5">
            <div className="ncm-section-shell" style={{ position: 'relative', borderRadius: '0.95rem', overflow: 'hidden', padding: '0.35rem' }}>
              <div style={{ borderRadius: '0.72rem', overflow: 'hidden', background: '#111118' }}>
                <div style={{ height: '430px', position: 'relative' }}>
                  {selectedPhoto ? (
                    <InventoryPhotoImage
                      record={vehicle}
                      photo={selectedPhoto}
                      alt={title}
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Car size={64} style={{ color: '#2a2a40' }} />
                    </div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,9,14,0) 40%, rgba(8,9,14,0.94) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', right: '1.25rem' }}>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.65rem', fontWeight: 700, color: '#93a8cb', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                      {vehicle.year} {vehicle.make}
                    </div>
                    <h1 style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem, 3.2vw, 2.35rem)', textTransform: 'uppercase', color: '#f4f8ff', lineHeight: 0.95, marginTop: '0.25rem' }}>
                      {vehicle.model} {vehicle.trim}
                    </h1>
                    {vehicle.available && (
                      <span style={{ display: 'inline-block', marginTop: '0.55rem', background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.42)', color: '#4ade80', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.24rem 0.64rem', borderRadius: '999px' }}>
                        Available Now
                      </span>
                    )}
                  </div>
                  <button onClick={() => toggleSaved(vehicle.id)} style={{ position: 'absolute', top: '1rem', right: '1rem', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}>
                    <Heart size={18} style={{ color: isFavorited ? '#ff5a5a' : '#c8d4f0' }} weight={isFavorited ? 'fill' : 'regular'} />
                  </button>
                </div>

                {vehicle.photos.length > 1 && (
                  <div style={{ display: 'flex', gap: '0.55rem', padding: '0.8rem', overflowX: 'auto', background: '#0f131e', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    {vehicle.photos.map((photo, i) => (
                      <button key={photo.id} onClick={() => setSelectedPhotoIndex(i)} style={{ flexShrink: 0, width: '78px', height: '58px', borderRadius: '0.45rem', overflow: 'hidden', border: i === selectedPhotoIndex ? '2px solid #df2424' : '2px solid rgba(255,255,255,0.14)', background: '#111118', cursor: 'pointer' }}>
                        <InventoryPhotoImage record={vehicle} photo={photo} alt={photo.alt} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="ncm-section-shell" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderRadius: '0.9rem', overflow: 'hidden' }}>
              {[
                { label: 'Price', value: fmt(vehicle.price), color: '#ff5a5a' },
                { label: 'Mileage', value: `${fmtMi(vehicle.mileage)} mi`, color: '#7cb0ff' },
                { label: 'Year', value: String(vehicle.year), color: '#f0f5ff' },
                { label: 'Body', value: vehicle.bodyStyle, color: '#f0f5ff' },
              ].map((spec, i) => (
                <div key={spec.label} style={{ padding: '1rem', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#91a7cb', marginBottom: '0.3rem' }}>{spec.label}</div>
                  <div style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: spec.color }}>{spec.value}</div>
                </div>
              ))}
            </div>

            {vehicle.features.length > 0 && (
              <div className="ncm-section-shell" style={{ borderRadius: '0.9rem', padding: '1.25rem 1.4rem' }}>
                <h3 style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#95aacd', marginBottom: '0.85rem' }}>Highlights</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {vehicle.features.map((f) => (
                    <span key={f} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '999px', padding: '0.25rem 0.68rem', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.72rem', color: '#cfdcf5' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {vehicle.description && (
              <div className="ncm-section-shell" style={{ borderRadius: '0.9rem', padding: '1.25rem 1.4rem' }}>
                <h3 style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#95aacd', marginBottom: '0.75rem' }}>Vehicle Overview</h3>
                <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.82rem', color: '#c7d5f2', lineHeight: 1.68 }}>{vehicle.description}</p>
              </div>
            )}

            <div className="ncm-section-shell" style={{ borderRadius: '0.9rem', padding: '1.25rem 1.4rem' }}>
              <h3 style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#95aacd', marginBottom: '0.85rem' }}>Vehicle Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Condition', vehicle.condition || 'Pre-owned'],
                  ['Drivetrain', vehicle.drivetrain || 'Not specified'],
                  ['Engine', vehicle.engine || 'Not specified'],
                  ['Transmission', vehicle.transmission || 'Not specified'],
                  ['Exterior Color', vehicle.exteriorColor || vehicle.color || 'Not specified'],
                  ['Interior Color', vehicle.interiorColor || 'Not specified'],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.55rem', padding: '0.65rem 0.85rem' }}>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#90a5c8' }}>{label}</div>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: '#f0f5ff', marginTop: '0.2rem' }}>{value}</div>
                  </div>
                ))}
              </div>
              {vehicle.vin && (
                <div style={{ marginTop: '0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.55rem', padding: '0.65rem 0.85rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#90a5c8' }}>VIN</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.82rem', color: '#f0f5ff', marginTop: '0.2rem' }}>{vehicle.vin}</div>
                  </div>
                  {vehicle.stockNumber && (
                    <div>
                      <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#90a5c8' }}>Stock #</div>
                      <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.82rem', color: '#f0f5ff', marginTop: '0.2rem' }}>{vehicle.stockNumber}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5 lg:sticky lg:top-[80px] lg:self-start">
            <div className="ncm-section-shell" style={{ borderRadius: '0.95rem', padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.65rem', fontWeight: 700, color: '#93a9cd', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                  {vehicle.year} {vehicle.make}
                </div>
                <h2 style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 800, fontSize: '1.5rem', textTransform: 'uppercase', color: '#f4f8ff', lineHeight: 1.05, marginTop: '0.2rem' }}>
                  {vehicle.model} {vehicle.trim}
                </h2>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                <div className="ncm-price" style={{ fontSize: '2.35rem' }}>{fmt(vehicle.price)}</div>
                {monthly && (
                  <div className="ncm-monthly" style={{ fontSize: '0.92rem', marginTop: '0.25rem' }}>
                    ${monthly} <span style={{ color: '#6f80a3', fontWeight: 500 }}>/mo*</span>
                    <span style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.65rem', color: '#6f80a3', marginLeft: '0.4rem' }}>est. 72mo @ 6.9%</span>
                  </div>
                )}
                {paymentEstimate && (
                  <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.62rem', color: '#7083a8', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    {paymentEstimate.disclaimer}
                  </p>
                )}
              </div>
            </div>

            <div className="ncm-section-shell" style={{ borderRadius: '0.95rem', padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.58rem' }}>
              <button onClick={() => { setSelectedUnit(vehicle.id, 'finance'); navigate('/finance/apply') }} className="ncm-btn-red" style={{ borderRadius: '0.55rem', justifyContent: 'center', width: '100%', padding: '0.86rem' }}>
                GET APPROVED
              </button>
              <button onClick={() => navigate(`/inquiry/${vehicle.id}`)} className="ncm-btn-outline" style={{ borderRadius: '0.55rem', justifyContent: 'center', width: '100%', padding: '0.8rem' }}>
                CHECK AVAILABILITY
              </button>
              <button onClick={() => navigate('/trade')} className="ncm-btn-outline" style={{ borderRadius: '0.55rem', justifyContent: 'center', width: '100%', padding: '0.8rem' }}>
                VALUE YOUR TRADE
              </button>
              <a href={DEALER.phoneTel} className="ncm-btn-blue" style={{ borderRadius: '0.55rem', justifyContent: 'center', width: '100%', padding: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={15} /> CALL {DEALER.phone}
              </a>
              <button onClick={() => toggleSaved(vehicle.id)} style={{ width: '100%', padding: '0.62rem', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.55rem', color: isFavorited ? '#ff5a5a' : '#96aacd', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <Heart size={15} weight={isFavorited ? 'fill' : 'regular'} />
                {isFavorited ? 'Saved to Favorites' : 'Save to Favorites'}
              </button>
            </div>

            <div style={{ background: 'linear-gradient(160deg, rgba(223,36,36,0.12), rgba(44,105,255,0.08))', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '0.75rem', padding: '1rem 1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Lock size={14} style={{ color: '#ff6565' }} />
                <span style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f2f7ff' }}>Secure and Trusted</span>
              </div>
              <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.68rem', color: '#9bb0d2', lineHeight: 1.5 }}>
                Family-owned since 1962. Over 60 years of serving Cleveland with honesty and integrity.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 lg:hidden" style={{ background: 'rgba(8,10,15,0.97)', borderTop: '1px solid rgba(255,255,255,0.14)', padding: '0.75rem 1rem', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => { setSelectedUnit(vehicle.id, 'finance'); navigate('/finance/apply') }} className="ncm-btn-red" style={{ flex: 1, borderRadius: '0.55rem', justifyContent: 'center', fontSize: '0.72rem', padding: '0.75rem 0.5rem' }}>
            GET APPROVED
          </button>
          <button onClick={() => navigate(`/inquiry/${vehicle.id}`)} className="ncm-btn-outline" style={{ flex: 1, borderRadius: '0.55rem', justifyContent: 'center', fontSize: '0.72rem', padding: '0.75rem 0.5rem' }}>
            CHECK AVAIL.
          </button>
          <a href={DEALER.phoneTel} className="ncm-btn-blue" style={{ flex: 1, borderRadius: '0.55rem', justifyContent: 'center', fontSize: '0.72rem', padding: '0.75rem 0.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            CALL
          </a>
        </div>
      </div>
    </div>
  )
}
