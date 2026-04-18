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
  const [mode, setMode] = useState(AuthService.getRuntimeMode())

  const loadUser = useCallback(async (role: AppRole) => {
    setMode(AuthService.getRuntimeMode())

    try {
      setStatus('loading')
      setError(null)
      const currentUser = await AuthService.resolveCurrentUser(role)
      setUser(currentUser)
      setStatus('authenticated')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load user'
      setError(message === 'No active Supabase session' || message === 'No active demo session' ? null : message)
      setUser(null)
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
    await AuthService.signOut()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      setStatus('loading')
      setError(null)
      // Step 1: authenticate — throws on bad credentials
      await AuthService.signInWithPassword(email, password, currentRole)
      // Step 2: load session — explicitly rethrow so LoginPage can show errors
      try {
        const sessionUser = await AuthService.loadSessionUser(currentRole)
        const currentUser = AuthService.buildCurrentAppUser(sessionUser)
        setUser(currentUser)
        setStatus('authenticated')
        setError(null)
      } catch (err) {
        setUser(null)
        setStatus('unauthenticated')
        throw err
      }
    },
    [currentRole],
  )

  useEffect(() => {
    void loadUser(currentRole)

    return AuthService.subscribeToAuthChanges(() => {
      void loadUser(currentRole)
    })
  }, [currentRole, loadUser])

  const value: AuthContextValue = {
    status,
    user,
    error,
    mode,
    refreshUser,
    signInWithPassword,
    setRole: handleSetRole,
    allowRoleSwitching: AuthService.allowRoleSwitching(mode),
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
