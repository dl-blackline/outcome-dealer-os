import { RouterProvider } from '@/app/router'
import { AuthProvider } from '@/domains/auth/auth.store'
import { AppShell } from '@/app/AppShell'

function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppShell />
      </RouterProvider>
    </AuthProvider>
  )
}

export default App
