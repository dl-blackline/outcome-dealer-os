import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { AuthContextValue, CurrentAppUser, AuthStatus } from './auth.types'
import { AuthService } from './auth.service'
import { AppRole } from '@/domains/roles/roles'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
  defaultRole?: AppRole
}

export function AuthProvider({ children, defaultRole = 'gm' }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<CurrentAppUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentRole, setCurrentRole] = useState<AppRole>(defaultRole)

  const loadUser = useCallback(async (role: AppRole) => {
    try {
      setStatus('loading')
      setError(null)
      const currentUser = await AuthService.resolveCurrentUser(role)
      setUser(currentUser)
      setStatus('authenticated')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load user'
      setError(message)
      setStatus('unauthenticated')
    }
  }, [])

  const refreshUser = useCallback(async () => {
    if (user) {
      await loadUser(user.role)
    }
  }, [user, loadUser])

  const handleSetRole = useCallback(
    (role: AppRole) => {
      setCurrentRole(role)
      loadUser(role)
    },
    [loadUser]
  )

  const signOut = useCallback(async () => {
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  useEffect(() => {
    loadUser(currentRole)
  }, [])

  const value: AuthContextValue = {
    status,
    user,
    error,
    refreshUser,
    setRole: handleSetRole,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useCurrentUser(): CurrentAppUser {
  const { user, status } = useAuth()
  if (status !== 'authenticated' || !user) {
    throw new Error('User is not authenticated')
  }
  return user
}

export function useRequireAuth(): CurrentAppUser {
  return useCurrentUser()
}
