import { RouterProvider, useRouter } from '@/app/router'
import { AppShell } from '@/app/AppShell'
import { BuyerHubShell } from '@/app/BuyerHubShell'

function ShellRouter() {
  const { currentPath } = useRouter()
  return currentPath.startsWith('/app') ? <AppShell /> : <BuyerHubShell />
}

function App() {
  return (
    <RouterProvider>
      <ShellRouter />
    </RouterProvider>
  )
}

export default App
