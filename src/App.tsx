import { RouterProvider, useRouter } from '@/app/router'
import { AppShell } from '@/app/AppShell'
import { BuyerHubShell } from '@/app/BuyerHubShell'

const BUYER_HUB_PREFIXES = ['/shop', '/compare', '/favorites', '/finance', '/trade', '/schedule', '/my-next-steps']

function ShellRouter() {
  const { currentPath } = useRouter()
  const isBuyerHub = BUYER_HUB_PREFIXES.some(
    (prefix) => currentPath === prefix || currentPath.startsWith(prefix + '/')
  )
  return isBuyerHub ? <BuyerHubShell /> : <AppShell />
}

function App() {
  return (
    <RouterProvider>
      <ShellRouter />
    </RouterProvider>
  )
}

export default App
