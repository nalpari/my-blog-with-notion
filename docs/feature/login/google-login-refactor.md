# Google Login Refactor Plan

## 현황 분석 Summary

### 🔍 현재 구현 상태

1. **기본 OAuth 플로우 구현됨**
   - `/src/hooks/useAuth.ts`: `signInWithOAuth` 함수 구현
   - `/src/components/auth/AuthModal.tsx`: Google 로그인 버튼 구현
   - `/src/app/auth/callback/route.ts`: OAuth 콜백 라우트 구현

2. **환경변수 설정 확인**
   - ✅ `NEXT_PUBLIC_SUPABASE_URL` 설정됨
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정됨
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` 설정됨 (필수는 아니지만 존재)

3. **이미지 호스팅 설정**
   - ✅ `lh3.googleusercontent.com` (Google 프로필 이미지) 허용됨

### ❌ 식별된 문제점

1. **Supabase Dashboard 설정 미확인**
   - Google OAuth Provider가 Supabase 대시보드에서 활성화되어 있는지 확인 필요
   - Google Cloud Console에서 OAuth 2.0 Client ID 생성 및 설정 필요

2. **에러 처리 부재**
   - `/auth/error` 라우트가 구현되지 않음
   - 사용자에게 인증 실패 시 피드백 제공 불가

3. **Google OAuth Scope 누락**
   - 특정 Google Workspace 환경에서 이메일 접근 권한 문제 가능
   - `userinfo.email` scope를 명시적으로 요청하지 않음

4. **서버 클라이언트 패턴 불일치**
   - `createClient` 함수가 server.ts에 있지만 await 처리가 필요할 수 있음

5. **리디렉션 URL 처리**
   - Production 환경에서 `x-forwarded-host` 헤더 처리 누락

## 해결 방안

### 📋 Phase 1: Supabase Dashboard 설정 (우선순위: 높음)

#### 1.1 Google OAuth Provider 활성화

**작업 내용:**
1. Supabase Dashboard → Authentication → Providers 접속
2. Google Provider 활성화
3. 다음 설정 입력:
   - **Client ID**: Google Cloud Console에서 생성한 OAuth 2.0 Client ID
   - **Client Secret**: Google Cloud Console에서 생성한 OAuth 2.0 Client Secret
   - **Authorized Redirect URI**: `https://[PROJECT_ID].supabase.co/auth/v1/callback`

**Google Cloud Console 설정:**
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
3. Application Type: Web Application
4. Authorized redirect URIs:
   - `https://stcwgfbjyvlyshdvojgn.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (개발 환경)

### 📋 Phase 2: 코드 개선 (우선순위: 높음)

#### 2.1 Google OAuth Scope 추가

**파일:** `/src/hooks/useAuth.ts`

```typescript
const signInWithOAuth = async (provider: 'google' | 'github') => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      // Google OAuth에 대한 추가 scope 설정
      ...(provider === 'google' && {
        scopes: 'https://www.googleapis.com/auth/userinfo.email'
      })
    },
  })
  if (error) throw error
  return data
}
```

#### 2.2 콜백 라우트 개선

**파일:** `/src/app/auth/callback/route.ts`

```typescript
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
```

### 📋 Phase 3: 에러 페이지 구현 (우선순위: 중간)

#### 3.1 에러 페이지 생성

**파일:** `/src/app/auth/error/page.tsx`

```typescript
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthError({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  const message = searchParams.message || 'An authentication error occurred'

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription>{decodeURIComponent(message)}</AlertDescription>
      </Alert>

      <div className="mt-6 flex flex-col gap-4">
        <Link href="/">
          <Button className="w-full">
            Return to Home
          </Button>
        </Link>

        <div className="text-sm text-muted-foreground">
          <p>Common causes:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Google account permissions denied</li>
            <li>Pop-up blocker preventing authentication</li>
            <li>Session expired or invalid</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
```

### 📋 Phase 4: 디버깅 및 모니터링 (우선순위: 중간)

#### 4.1 로깅 추가

**파일:** `/src/components/auth/AuthModal.tsx`

```typescript
const handleOAuthSignIn = async (provider: 'google' | 'github') => {
  setIsLoading(true)
  setError(null)

  try {
    console.log(`Starting OAuth sign-in with ${provider}`)
    await signInWithOAuth(provider)
    // OAuth 리디렉션이 발생하므로 onSuccess는 호출되지 않음
  } catch (error) {
    console.error(`OAuth sign-in error:`, error)
    setError(error instanceof Error ? error.message : 'Failed to sign in with provider')
  } finally {
    setIsLoading(false)
  }
}
```

### 📋 Phase 5: 테스트 체크리스트 (우선순위: 높음)

#### 5.1 기능 테스트

- [ ] Google 로그인 버튼 클릭 시 Google OAuth 페이지로 리디렉션
- [ ] Google 계정 선택 후 앱으로 정상 리디렉션
- [ ] 로그인 후 사용자 세션 생성 확인
- [ ] 댓글 작성 권한 확인
- [ ] 로그아웃 기능 정상 동작

#### 5.2 에러 케이스 테스트

- [ ] Google 권한 거부 시 에러 페이지 표시
- [ ] 잘못된 콜백 URL 처리
- [ ] 네트워크 오류 처리
- [ ] 팝업 차단 시 안내 메시지

### 📋 Phase 6: Production 배포 준비 (우선순위: 낮음)

#### 6.1 환경별 설정

**개발 환경 (.env.local):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://stcwgfbjyvlyshdvojgn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
```

**Production 환경 (Vercel/배포 플랫폼):**
- 동일한 환경변수 설정
- Google OAuth Redirect URI에 production 도메인 추가

#### 6.2 보안 검토

- [ ] 환경변수 노출 방지
- [ ] CORS 설정 확인
- [ ] CSP(Content Security Policy) 헤더 설정
- [ ] Rate limiting 고려

## 실행 우선순위

### 🚨 즉시 실행 (Day 1)
1. **Supabase Dashboard에서 Google OAuth Provider 설정**
2. **Google Cloud Console에서 OAuth 2.0 Client 생성**
3. **OAuth Scope 추가 코드 수정**
4. **콜백 라우트 개선**

### 📅 단기 실행 (Day 2-3)
1. **에러 페이지 구현**
2. **로깅 추가**
3. **기능 테스트 수행**

### 📋 장기 개선 (Week 1)
1. **Production 환경 설정**
2. **보안 검토**
3. **모니터링 시스템 구축**

## 예상 소요 시간

| Phase | 예상 시간 | 복잡도 |
|-------|----------|--------|
| Phase 1: Dashboard 설정 | 30분 | 낮음 |
| Phase 2: 코드 개선 | 2시간 | 중간 |
| Phase 3: 에러 페이지 | 1시간 | 낮음 |
| Phase 4: 디버깅 | 1시간 | 낮음 |
| Phase 5: 테스트 | 2시간 | 중간 |
| Phase 6: Production | 2시간 | 높음 |
| **총 예상 시간** | **8.5시간** | - |

## 주요 참고 자료

- [Supabase Auth with Next.js App Router](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Google OAuth 2.0 Setup](https://support.google.com/cloud/answer/6158849)
- [Troubleshooting Google Auth Failures](https://supabase.com/docs/troubleshooting/google-auth-fails-for-some-users)
- [Next.js Middleware with Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)

## 성공 지표

- ✅ Google 로그인 100% 성공률
- ✅ 에러 발생 시 명확한 사용자 피드백
- ✅ 3초 이내 인증 완료
- ✅ 모든 브라우저에서 정상 동작
- ✅ Mobile 환경 지원