import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error_description = searchParams.get('error_description')

  // OAuth 에러 처리
  if (error_description) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent(error_description)}`
    )
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        // Production 환경 헤더 처리 추가
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      } else {
        throw error
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        `${origin}/auth/error?message=${encodeURIComponent(
          error instanceof Error ? error.message : 'Authentication failed'
        )}`
      )
    }
  }

  // code가 없는 경우
  return NextResponse.redirect(`${origin}/auth/error?message=No%20authorization%20code%20received`)
}