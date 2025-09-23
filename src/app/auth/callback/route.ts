import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Validates that the redirect path is a safe relative path
 * @param path The path to validate
 * @returns The validated path or '/' if invalid
 */
function validateRedirectPath(path: string): string {
  // Remove any leading/trailing whitespace
  const trimmed = path.trim()

  // Default to home if empty
  if (!trimmed) return '/'

  // Must start with '/' (relative path)
  if (!trimmed.startsWith('/')) return '/'

  // Prevent protocol-relative URLs (//example.com)
  if (trimmed.startsWith('//')) return '/'

  // Prevent any URLs with protocols (http://, https://, javascript:, etc.)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return '/'

  // Prevent URLs with @ (user@host)
  if (trimmed.includes('@')) return '/'

  // Additional validation: no backslashes (Windows paths)
  if (trimmed.includes('\\')) return '/'

  return trimmed
}

export async function GET(request: NextRequest) {
  // Use Next.js's built-in URL parsing for security
  const origin = request.nextUrl.origin
  const searchParams = request.nextUrl.searchParams

  const code = searchParams.get('code')
  const rawNext = searchParams.get('next')
  const next = validateRedirectPath(rawNext ?? '/')
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
        // Always use the trusted origin from request.nextUrl
        // Never trust x-forwarded-host or other user-controlled headers
        return NextResponse.redirect(`${origin}${next}`)
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