import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null

  if (!browserClient) {
    browserClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
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
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    storageBucket: getSupabaseStorageBucket(),
    enabled: isSupabaseConfigured(),
  }
}