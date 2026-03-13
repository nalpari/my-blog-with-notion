# Google Analytics (GA4) Design Document

> **Summary**: `@next/third-parties`를 활용한 GA4 통합 설계 - 루트 레이아웃 삽입 및 커스텀 이벤트 유틸리티
>
> **Project**: my-blog-with-notion
> **Version**: 0.1.0
> **Author**: Developer
> **Date**: 2026-03-13
> **Status**: Draft
> **Planning Doc**: [google-analytics.plan.md](../../01-plan/features/google-analytics.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- GA4 스크립트를 Next.js App Router 루트 레이아웃에 최소 침투적으로 통합
- 환경변수 기반 조건부 렌더링으로 개발/프로덕션 환경 분리
- 커스텀 이벤트 전송을 위한 타입 안전 유틸리티 제공

### 1.2 Design Principles

- **최소 변경**: 기존 코드 수정 최소화, layout.tsx에 컴포넌트 1개 추가
- **환경 분리**: 환경변수 미설정 시 GA 스크립트 자체를 렌더링하지 않음
- **공식 API 준수**: `@next/third-parties/google`의 `GoogleAnalytics`, `sendGAEvent` 사용

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────┐
│  RootLayout (src/app/layout.tsx)                │
│  ┌───────────────────────────────────────────┐  │
│  │  <html>                                   │  │
│  │    <body>                                 │  │
│  │      <ThemeProvider>                      │  │
│  │        {children}                         │  │
│  │      </ThemeProvider>                     │  │
│  │    </body>                                │  │
│  │    <GoogleAnalytics gaId={gaId} />  ← NEW │  │
│  │  </html>                                  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Client Components (이벤트 트래킹 필요 시)       │
│  ┌───────────────────────────────────────────┐  │
│  │  import { sendGAEvent }                   │  │
│  │    from '@next/third-parties/google'      │  │
│  │                                           │  │
│  │  onClick={() => sendGAEvent('event',      │  │
│  │    'button_click', { value: 'cta' })}     │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
1. 페이지 뷰 (자동):
   사용자 방문 → GA4 스크립트 로드(afterInteractive) → 페이지 뷰 자동 전송 → GA4 서버

2. SPA 라우트 전환 (자동):
   사용자 네비게이션 → GA4 향상된 측정 → history change 감지 → 페이지 뷰 전송

3. 커스텀 이벤트 (수동):
   사용자 클릭 → onClick 핸들러 → sendGAEvent() 호출 → GA4 서버
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| `GoogleAnalytics` | `@next/third-parties` | GA4 스크립트 삽입 컴포넌트 |
| `sendGAEvent` | `@next/third-parties` | 커스텀 이벤트 전송 함수 |
| `layout.tsx` | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 환경변수로 측정 ID 주입 |

---

## 3. Data Model

### 3.1 GA 이벤트 타입 정의

```typescript
// src/types/analytics.ts

/** GA4 커스텀 이벤트 이름 */
type GAEventName =
  | 'button_click'
  | 'link_click'
  | 'post_view'
  | 'comment_submit'
  | 'search'
  | 'tag_filter'
  | 'category_filter'
  | 'share'

/** GA4 이벤트 파라미터 */
interface GAEventParams {
  value?: string
  category?: string
  label?: string
  [key: string]: string | number | boolean | undefined
}
```

> **참고**: 타입은 선택적 구현 사항. `sendGAEvent`는 자체적으로 string 파라미터를 받으므로 타입 정의 없이도 동작함.

---

## 4. API Specification

해당 기능은 API 엔드포인트 불필요. 클라이언트 사이드에서 GA4 서버로 직접 전송.

---

## 5. UI/UX Design

### 5.1 UI 변경 사항

**없음** - GA는 백그라운드에서 동작하며 UI에 영향 없음.

### 5.2 이벤트 트래킹 대상 (향후 확장)

| 요소 | 이벤트 이름 | 파라미터 | 우선순위 |
|------|-------------|----------|:--------:|
| 포스트 카드 클릭 | `post_view` | `{ value: post.slug }` | Low |
| 검색 실행 | `search` | `{ value: searchQuery }` | Low |
| 태그 필터 클릭 | `tag_filter` | `{ value: tag.name }` | Low |
| 댓글 작성 | `comment_submit` | `{ value: post.slug }` | Low |

> **Note**: 위 이벤트는 현재 스코프에 포함되지 않음. GA4 기본 페이지 뷰 트래킹만 우선 구현.
> 커스텀 이벤트는 `sendGAEvent` 유틸이 준비되면 점진적으로 추가.

---

## 6. Error Handling

### 6.1 에러 시나리오

| 시나리오 | 처리 방식 |
|----------|-----------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` 미설정 | `GoogleAnalytics` 컴포넌트 미렌더링 (조건부) |
| Ad blocker가 GA 스크립트 차단 | 무시 (핵심 기능 아님, graceful degradation) |
| 잘못된 측정 ID 형식 | GA4에서 자체 무시, 앱 동작에 영향 없음 |

---

## 7. Security Considerations

- [x] 측정 ID는 `NEXT_PUBLIC_` 접두사 사용 (클라이언트 노출 의도적 - GA4 측정 ID는 공개 정보)
- [x] 코드에 측정 ID 하드코딩 금지 (환경변수로 관리)
- [x] 서버 사이드 시크릿 불필요 (GA4 클라이언트 전용)

---

## 8. Test Plan

### 8.1 검증 방법

| Type | 방법 | Tool |
|------|------|------|
| 빌드 검증 | `pnpm build` 성공 확인 | build-checker |
| 타입 검증 | `pnpm exec tsc --noEmit` 성공 확인 | TypeScript |
| 런타임 검증 | 개발 서버에서 GA 스크립트 미삽입 확인 | 브라우저 DevTools |
| 프로덕션 검증 | GA4 실시간 보고서에서 이벤트 수신 확인 | GA4 대시보드 |

### 8.2 Test Cases

- [x] 빌드 성공 (lint, type, build 모두 통과)
- [x] `NEXT_PUBLIC_GA_MEASUREMENT_ID` 미설정 시 GA 스크립트 미렌더링
- [x] 측정 ID 설정 시 `<script>` 태그에 GA4 스크립트 포함 확인
- [x] SPA 라우트 전환 시 GA4 대시보드에서 페이지 뷰 기록 확인

---

## 9. Clean Architecture

### 9.1 Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| `GoogleAnalytics` 컴포넌트 삽입 | Presentation | `src/app/layout.tsx` |
| GA 이벤트 타입 정의 (선택) | Domain | `src/types/analytics.ts` |

> 이 기능은 매우 가벼워서 별도 서비스/인프라 레이어 불필요.
> `@next/third-parties`가 인프라 역할을 대신함.

---

## 10. Coding Convention Reference

### 10.1 환경변수 네이밍

| Variable | Convention | 비고 |
|----------|-----------|------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `NEXT_PUBLIC_` 접두사 (클라이언트 접근) | GA4 측정 ID (G-XXXXXXXXXX) |

### 10.2 Import 규칙

```typescript
// @next/third-parties는 외부 라이브러리로 취급
import { GoogleAnalytics } from '@next/third-parties/google'

// 클라이언트 컴포넌트에서 이벤트 전송 시
import { sendGAEvent } from '@next/third-parties/google'
```

---

## 11. Implementation Guide

### 11.1 File Structure (변경 대상)

```
src/
├── app/
│   └── layout.tsx              # [MODIFY] GoogleAnalytics 컴포넌트 추가
├── types/
│   └── analytics.ts            # [CREATE, OPTIONAL] GA 이벤트 타입 정의
.env.local                      # [MODIFY] NEXT_PUBLIC_GA_MEASUREMENT_ID 추가
```

### 11.2 Implementation Order

1. [x] `@next/third-parties` 패키지 설치
2. [x] `.env.local`에 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 환경변수 추가
3. [x] `src/app/layout.tsx`에 `GoogleAnalytics` 컴포넌트 조건부 삽입
4. [ ] (선택) `src/types/analytics.ts` 이벤트 타입 정의

### 11.3 구현 상세

#### Step 1: 패키지 설치

```bash
pnpm add @next/third-parties
```

#### Step 2: 환경변수 추가

```bash
# .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Step 3: layout.tsx 수정

```typescript
// src/app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

// 기존 코드 유지...

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${plusJakarta.variable} ${crimsonPro.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ToastProvider>
            <AuthModalProvider>
              <ProgressBarProvider>
                <div className="relative flex min-h-screen flex-col">
                  <div className="flex-1">{children}</div>
                </div>
              </ProgressBarProvider>
              <GlobalAuthModal />
            </AuthModalProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  )
}
```

**핵심 포인트:**
- `{gaId && <GoogleAnalytics gaId={gaId} />}` - 측정 ID 없으면 컴포넌트 자체를 렌더링하지 않음
- `<html>` 태그 안, `</html>` 직전에 배치 (Next.js 공식 권장 위치)
- `@next/third-parties`가 내부적으로 `afterInteractive` 전략 사용하여 성능 최적화

#### Step 4: (선택) 커스텀 이벤트 사용 예시

```typescript
'use client'
import { sendGAEvent } from '@next/third-parties/google'

// 버튼 클릭 이벤트
<button onClick={() => sendGAEvent('event', 'button_click', { value: 'cta_button' })}>
  클릭
</button>
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-13 | Initial draft | Developer |
