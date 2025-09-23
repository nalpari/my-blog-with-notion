import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

// Browser client for client-side operations
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 환경변수 가드 - 개발 환경에서 조기 감지
  if (!url || !anonKey) {
    const missingVars = []
    if (!url) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!anonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}. Please check your .env.local file.`

    // 개발 환경에서는 명확한 오류 메시지 제공
    if (process.env.NODE_ENV === 'development') {
      throw new Error(errorMsg)
    }

    // 프로덕션에서는 콘솔 경고만 (보안상 상세 정보 노출 방지)
    console.error('Supabase initialization failed: Missing environment variables')

    // 더미 클라이언트 반환하여 런타임 오류 방지
    return null as any
  }

  return createBrowserClient<Database>(url, anonKey)
}

// Singleton pattern for client instance
let client: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!client) {
    client = createClient()

    // 환경변수 누락 시 에러 처리
    if (!client) {
      throw new Error('Failed to initialize Supabase client. Please check your environment variables.')
    }
  }
  return client
}