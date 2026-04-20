import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

function getSupabaseAnonKey(): string {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLIC_KEY || ''
}

export function isSupabaseConfigured(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && getSupabaseAnonKey())
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null

  if (!browserClient) {
    browserClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      getSupabaseAnonKey(),
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      },
    )
  }

  return browserClient
}

export function getSupabaseStorageBucket(): string {
  return import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'vehicle-photos'
}

export function getSupabaseSetupSummary() {
  const anonKey = getSupabaseAnonKey()

  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    storageBucket: getSupabaseStorageBucket(),
    enabled: isSupabaseConfigured(),
    anonKeySource: import.meta.env.VITE_SUPABASE_ANON_KEY
      ? 'VITE_SUPABASE_ANON_KEY'
      : import.meta.env.VITE_SUPABASE_PUBLIC_KEY
        ? 'VITE_SUPABASE_PUBLIC_KEY'
        : 'missing',
    anonKeyPresent: Boolean(anonKey),
  }
}