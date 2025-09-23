import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

// Browser client for client-side operations
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 환경변수 가드 - fail-fast approach
  if (!url || !anonKey) {
    const missingVars = []
    if (!url) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!anonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}. Please check your .env.local file.`

    // Always throw error to prevent NPEs later (fail-fast)
    throw new Error(errorMsg)
  }

  return createBrowserClient<Database>(url, anonKey)
}

// Singleton pattern for client instance
let client: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!client) {
    client = createClient()
    // createClient() now throws if env vars are missing, so client is always valid here
  }
  return client
}