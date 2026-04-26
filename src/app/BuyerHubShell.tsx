import { useRouter, matchRoute } from '@/app/router'
import { RouteNotFound } from '@/components/shell/RouteNotFound'
import { NcmHeader } from '@/components/shell/NcmHeader'
import { NcmFooter } from '@/components/shell/NcmFooter'
import { hasWholesaleAccess } from '@/domains/wholesale/wholesaleAccess'

// Buyer hub pages
import { HomePage } from '@/app/pages/shop/HomePage'
import { ShopInventoryPage } from '@/app/pages/shop/ShopInventoryPage'
import { VehicleDetailPage } from '@/app/pages/shop/VehicleDetailPage'
import { ComparePage } from '@/app/pages/shop/ComparePage'
import { FavoritesPage } from '@/app/pages/shop/FavoritesPage'
import { FinanceHubPage } from '@/app/pages/shop/FinanceHubPage'
import { QuickAppPage } from '@/app/pages/shop/QuickAppPage'
import { TradeInPage } from '@/app/pages/shop/TradeInPage'
import { SchedulePage } from '@/app/pages/shop/SchedulePage'
import { NextStepsPage } from '@/app/pages/shop/NextStepsPage'
import { InquiryPage } from '@/app/pages/shop/InquiryPage'
import { LoginPage } from '@/app/pages/auth/LoginPage'
import { WholesaleInventoryPage } from '@/app/pages/wholesale/WholesaleInventoryPage'
import { WholesaleVehicleDetailPage } from '@/app/pages/wholesale/WholesaleVehicleDetailPage'
import { WholesaleGatePage } from '@/app/pages/wholesale/WholesaleGatePage'

const BUYER_ROUTE_COMPONENTS: Record<string, React.ComponentType> = {
  '/': HomePage,
  '/login': LoginPage,
  '/shop': ShopInventoryPage,
  '/shop/:unitId': VehicleDetailPage,
  '/inquiry/:unitId': InquiryPage,
  '/compare': ComparePage,
  '/favorites': FavoritesPage,
  '/finance': FinanceHubPage,
  '/finance/apply': QuickAppPage,
  '/trade': TradeInPage,
  '/schedule': SchedulePage,
  '/my-next-steps': NextStepsPage,
  '/wholesale': WholesaleInventoryPage,
  '/wholesale/:unitId': WholesaleVehicleDetailPage,
}

function resolveBuyerPage(path: string): React.ComponentType | null {
  for (const [pattern, Component] of Object.entries(BUYER_ROUTE_COMPONENTS)) {
    if (matchRoute(pattern, path)) return Component
  }
  return null
}

export function BuyerHubShell() {
  const { currentPath, navigate } = useRouter()
  const PageComponent = resolveBuyerPage(currentPath)
  const isUtilityPage = currentPath === '/login'
  const isWholesaleRoute = currentPath === '/wholesale' || currentPath.startsWith('/wholesale/')
  const wholesaleAccessGranted = hasWholesaleAccess()

  if (isUtilityPage) {
    return PageComponent ? <PageComponent /> : <LoginPage />
  }

  return (
    <div
      style={{ background: '#0a0a0f', minHeight: '100vh', color: '#f0f2f8' }}
      className="flex flex-col"
    >
      <NcmHeader />

      <main className="flex-1">
        {isWholesaleRoute && !wholesaleAccessGranted ? (
          <WholesaleGatePage onAccessGranted={() => navigate('/wholesale')} />
        ) : PageComponent ? (
          <PageComponent />
        ) : (
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
            <RouteNotFound
              title="Page Not Found"
              message="This page is unavailable."
              actionLabel="Back to Inventory"
              onAction={() => navigate('/shop')}
            />
          </div>
        )}
      </main>

      <NcmFooter />
    </div>
  )
}
