# PRD (Product Requirements Document)

## My Blog with Notion

**버전:** 1.0
**작성일:** 2025-12-12
**상태:** Production

---

## 1. 제품 개요 (Product Overview)

### 1.1 제품명
**My Blog with Notion** - Notion을 Headless CMS로 활용하는 개인 블로그 플랫폼

### 1.2 제품 설명
Next.js 15 기반의 개인 블로그 애플리케이션으로, Notion 데이터베이스를 콘텐츠 관리 시스템으로 사용하고 Supabase를 통해 댓글 시스템과 사용자 인증을 제공합니다. Linear Design System 원칙을 따르며 다크/라이트 모드를 지원합니다.

### 1.3 핵심 가치 제안
- **콘텐츠 관리 용이성**: Notion에서 직접 글 작성 및 관리
- **실시간 상호작용**: 실시간 댓글 시스템으로 독자와 소통
- **최신 기술 스택**: React 19, Next.js 15의 최신 기능 활용
- **성능 최적화**: SSG, 이미지 최적화, 캐싱 전략 적용

---

## 2. 목표와 비전 (Goals & Vision)

### 2.1 비전
기술적으로 우수하고 사용자 경험이 뛰어난 개인 블로그 플랫폼 구축

### 2.2 목표
| 목표 | 설명 | 측정 지표 |
|------|------|----------|
| 콘텐츠 접근성 | 빠른 페이지 로드 | LCP < 2.5초 |
| 사용자 참여 | 댓글을 통한 상호작용 | 포스트당 평균 댓글 수 |
| SEO 최적화 | 검색 엔진 노출 향상 | 검색 유입 트래픽 |
| 개발자 경험 | 유지보수 용이한 코드베이스 | TypeScript strict mode 준수 |

---

## 3. 타겟 사용자 (Target Users)

### 3.1 주요 사용자
- **블로그 독자**: 기술 콘텐츠를 소비하고 댓글로 의견을 남기는 방문자
- **블로그 관리자**: Notion에서 콘텐츠를 작성하고 관리하는 운영자

### 3.2 사용자 페르소나

**페르소나 1: 기술 블로그 독자**
- 개발자 또는 기술에 관심 있는 사용자
- 빠른 페이지 로드와 깔끔한 UI 선호
- 댓글을 통해 질문이나 의견 공유 희망

**페르소나 2: 블로그 운영자**
- Notion을 일상적으로 사용하는 사용자
- 별도 CMS 학습 없이 콘텐츠 관리 원함
- 독자와의 상호작용 중시

---

## 4. 기능 요구사항 (Functional Requirements)

### 4.1 포스트 관리

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| F-001 | 포스트 목록 조회 | 페이지네이션, 검색, 카테고리 필터 지원 | P0 |
| F-002 | 포스트 상세 조회 | Markdown 렌더링, 코드 하이라이팅 | P0 |
| F-003 | 태그 기반 필터링 | 태그로 포스트 분류 및 조회 | P1 |
| F-004 | 카테고리 필터링 | 카테고리별 포스트 조회 | P1 |
| F-005 | 검색 기능 | 제목, 내용 기반 검색 | P1 |

### 4.2 댓글 시스템

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| F-101 | 댓글 조회 | 포스트별 댓글 목록 조회 (중첩 답글 지원) | P0 |
| F-102 | 댓글 작성 | 인증된 사용자의 댓글 작성 | P0 |
| F-103 | 댓글 수정 | 본인 댓글 수정 | P1 |
| F-104 | 댓글 삭제 | 본인 댓글 삭제 (소프트 삭제) | P1 |
| F-105 | 답글 작성 | 댓글에 대한 답글 지원 | P1 |
| F-106 | 실시간 업데이트 | WebSocket 기반 실시간 댓글 반영 | P2 |

### 4.3 사용자 인증

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| F-201 | Google OAuth 로그인 | Google 계정으로 소셜 로그인 | P0 |
| F-202 | 세션 관리 | Supabase Auth 기반 세션 유지 | P0 |
| F-203 | 로그아웃 | 세션 종료 | P0 |
| F-204 | 사용자 프로필 | 표시 이름, 아바타 관리 | P2 |

### 4.4 태그 시스템

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| F-301 | 태그 클라우드 | D3 기반 시각적 태그 표시 | P1 |
| F-302 | 태그 상세 페이지 | 태그별 포스트 목록 | P1 |
| F-303 | 태그 통계 | 월별 트렌드, 연관 태그, 포스트 분포 | P2 |
| F-304 | 태그 트렌드 차트 | Recharts 기반 시각화 | P2 |

### 4.5 UI/UX

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| F-401 | 반응형 디자인 | 모바일/태블릿/데스크톱 지원 | P0 |
| F-402 | 다크/라이트 모드 | 테마 전환 지원 | P1 |
| F-403 | 로딩 스켈레톤 | 콘텐츠 로딩 중 스켈레톤 UI | P1 |
| F-404 | 에러 처리 | ErrorBoundary, Toast 알림 | P1 |
| F-405 | 스크롤 투 탑 | 상단 이동 버튼 | P2 |

---

## 5. 비기능적 요구사항 (Non-Functional Requirements)

### 5.1 성능

| 요구사항 | 목표 | 측정 방법 |
|----------|------|----------|
| 초기 로드 시간 (LCP) | < 2.5초 | Lighthouse |
| First Input Delay (FID) | < 100ms | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| API 응답 시간 | < 500ms | 서버 로그 |
| 이미지 캐시 TTL | 30일 | Next.js 설정 |

### 5.2 보안

| 요구사항 | 구현 방법 |
|----------|----------|
| 인증/인가 | Supabase Auth, RLS 정책 |
| 입력 검증 | Zod 스키마 검증 |
| PII 보호 | 민감 정보 필터링 (user_email 등) |
| XSS 방지 | React 기본 이스케이핑 |
| 환경 변수 보호 | Fail-fast 패턴 |

### 5.3 안정성

| 요구사항 | 구현 방법 |
|----------|----------|
| 네트워크 복원력 | Circuit Breaker, Retry with exponential backoff |
| 동시성 제어 | Request Queue (max 3개) |
| 에러 복구 | ErrorBoundary, Fallback UI |
| 메모리 관리 | Realtime 구독 정리 |

### 5.4 확장성

| 요구사항 | 구현 방법 |
|----------|----------|
| 코드 확장성 | 모듈화된 서비스 레이어, 커스텀 훅 |
| 데이터 확장성 | 커서 기반 페이지네이션 |
| UI 확장성 | shadcn/ui 기반 컴포넌트 시스템 |

### 5.5 유지보수성

| 요구사항 | 구현 방법 |
|----------|----------|
| 타입 안정성 | TypeScript strict mode (any 금지) |
| 코드 품질 | ESLint, 일관된 코드 패턴 |
| 테스트 | Vitest + React Testing Library |
| 문서화 | CLAUDE.md, docs/ 폴더 |

---

## 6. 기술 스택 및 아키텍처 (Tech Stack & Architecture)

### 6.1 기술 스택

| 레이어 | 기술 |
|--------|------|
| **프론트엔드** | React 19, Next.js 15, TypeScript 5.9 |
| **스타일링** | Tailwind CSS 3.4, shadcn/ui |
| **콘텐츠 소스** | Notion API (@notionhq/client) |
| **데이터베이스** | Supabase (PostgreSQL) |
| **인증** | Supabase Auth (Google OAuth) |
| **실시간** | Supabase Realtime (WebSocket) |
| **시각화** | Recharts, D3-cloud |
| **테스트** | Vitest, React Testing Library |

### 6.2 아키텍처 다이어그램

```
┌──────────────────────────────────────────────────────────────┐
│                        클라이언트                              │
│  ┌────────────────┐  ┌─────────────┐  ┌───────────────────┐  │
│  │  Server Comps  │  │ Client Comps│  │   Custom Hooks    │  │
│  │  (SSG/SSR)     │  │ (Interactive)│  │ (State Management)│  │
│  └────────────────┘  └─────────────┘  └───────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                        API 레이어                             │
│  ┌────────────────────┐  ┌───────────────────────────────┐   │
│  │  /api/posts        │  │  /api/comments                │   │
│  │  /api/tags         │  │  /api/comments/[id]           │   │
│  └────────────────────┘  └───────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│       Notion API        │     │         Supabase            │
│  ┌───────────────────┐  │     │  ┌──────────┐  ┌─────────┐  │
│  │   Database        │  │     │  │ Database │  │  Auth   │  │
│  │   (Posts/Tags)    │  │     │  │ (Comments│  │ (OAuth) │  │
│  └───────────────────┘  │     │  │ Profiles)│  └─────────┘  │
│                         │     │  └──────────┘               │
│                         │     │  ┌──────────────────────┐   │
│                         │     │  │   Realtime (WS)      │   │
│                         │     │  └──────────────────────┘   │
└─────────────────────────┘     └─────────────────────────────┘
```

### 6.3 데이터 흐름

```
1. 콘텐츠 파이프라인:
   Notion DB → notion.ts → notion-to-md → react-markdown → UI

2. 댓글 파이프라인:
   사용자 입력 → Zod 검증 → CommentsService → Supabase →
   → Realtime → useRealtimeComments → UI 업데이트

3. 인증 파이프라인:
   Google OAuth → Supabase Auth → 세션 생성 → AuthContext 업데이트
```

---

## 7. 사용자 스토리 (User Stories)

### 7.1 블로그 독자

```
US-001: 포스트 목록 조회
AS A 블로그 독자
I WANT TO 최신 포스트 목록을 볼 수 있기를
SO THAT 관심 있는 글을 찾을 수 있다

Acceptance Criteria:
- 페이지네이션으로 포스트 목록 조회
- 각 포스트 카드에 제목, 요약, 날짜, 태그 표시
- 카테고리/태그 필터 적용 가능
```

```
US-002: 포스트 읽기
AS A 블로그 독자
I WANT TO 포스트 상세 내용을 읽을 수 있기를
SO THAT 기술 지식을 얻을 수 있다

Acceptance Criteria:
- Markdown 콘텐츠 렌더링
- 코드 블록 하이라이팅
- 읽기 시간 표시
- 관련 태그 표시
```

```
US-003: 댓글 작성
AS A 인증된 독자
I WANT TO 포스트에 댓글을 남길 수 있기를
SO THAT 의견을 공유하고 질문할 수 있다

Acceptance Criteria:
- Google 로그인 후 댓글 작성 가능
- 실시간으로 댓글 반영
- 답글 작성 가능
```

```
US-004: 태그 탐색
AS A 블로그 독자
I WANT TO 태그 클라우드를 통해 관심 주제를 찾을 수 있기를
SO THAT 관련 포스트를 쉽게 발견할 수 있다

Acceptance Criteria:
- D3 기반 태그 클라우드 표시
- 태그 클릭 시 관련 포스트 목록 조회
- 태그 통계 및 트렌드 확인
```

### 7.2 블로그 관리자

```
US-101: 콘텐츠 관리
AS A 블로그 관리자
I WANT TO Notion에서 글을 작성하고 관리할 수 있기를
SO THAT 익숙한 도구로 콘텐츠를 관리할 수 있다

Acceptance Criteria:
- Notion 데이터베이스와 실시간 동기화
- Draft/Published 상태 관리
- 카테고리, 태그 설정
```

---

## 8. 데이터 모델 (Data Model)

### 8.1 Notion 데이터베이스 스키마

| 속성 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | Title | O | 포스트 제목 |
| slug | Text | O | URL 경로 |
| excerpt | Text | O | 요약 (150자) |
| coverImage | Files | - | 커버 이미지 |
| status | Select | O | Draft/Published/Archived |
| category | Select | O | 단일 카테고리 |
| tags | Multi-select | - | 다중 태그 |
| Author | People | - | 작성자 (대문자 A 필수) |
| publishedAt | Date | O | 발행일 |
| readingTime | Number | - | 읽기 시간 (분) |

### 8.2 Supabase 테이블 스키마

**comments 테이블**
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  user_name TEXT,
  user_avatar TEXT,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**profiles 테이블**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 9. API 명세 (API Specification)

### 9.1 포스트 API

**GET /api/posts**
```typescript
// Query Parameters
{
  limit?: number;      // 페이지 크기 (기본: 10)
  page?: number;       // 페이지 번호
  q?: string;          // 검색어
  category?: string;   // 카테고리 필터
  tag?: string;        // 태그 필터
}

// Response
{
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}
```

### 9.2 댓글 API

**GET /api/comments**
```typescript
// Query Parameters
{
  postSlug: string;    // 포스트 slug (필수)
  cursor?: string;     // 커서 기반 페이지네이션
  limit?: number;      // 페이지 크기
}

// Response
{
  comments: CommentWithReplies[];
  nextCursor?: string;
}
```

**POST /api/comments**
```typescript
// Request Body
{
  postSlug: string;
  content: string;
  parentId?: string;   // 답글인 경우
}

// Response
{
  comment: Comment;
}
```

### 9.3 태그 API

**GET /api/tags**
```typescript
// Response
{
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
    count: number;
  }>
}
```

**GET /api/tags/[slug]/statistics**
```typescript
// Response
{
  monthlyTrend: Array<{ month: string; count: number }>;
  relatedTags: Array<{ name: string; count: number }>;
  postDistribution: Array<{ category: string; count: number }>;
  topPosts: Post[];
}
```

---

## 10. 제약사항 및 의존성 (Constraints & Dependencies)

### 10.1 외부 의존성

| 서비스 | 의존성 | 영향도 |
|--------|--------|--------|
| Notion API | 콘텐츠 소스 | Critical |
| Supabase | 댓글, 인증, 실시간 | Critical |
| Google OAuth | 사용자 인증 | High |
| Vercel/호스팅 | 배포 환경 | High |

### 10.2 제약사항

- **Notion API 제한**: Rate limit 3 req/sec
- **이미지 도메인**: next.config.ts에 whitelist 필요
- **환경 변수**: Supabase 설정 누락 시 앱 시작 실패 (fail-fast)
- **TypeScript**: strict mode 필수, any 타입 금지
- **패키지 매니저**: pnpm 전용

### 10.3 브라우저 지원

- Chrome (최신 2개 버전)
- Firefox (최신 2개 버전)
- Safari (최신 2개 버전)
- Edge (최신 2개 버전)

---

## 11. 향후 로드맵 (Future Roadmap)

### Phase 1: 안정화
- [ ] 테스트 커버리지 확대
- [ ] 성능 모니터링 도입
- [ ] 에러 추적 시스템 (Sentry)

### Phase 2: 기능 확장
- [ ] 포스트 좋아요/북마크 기능
- [ ] 이메일 구독 (Newsletter)
- [ ] RSS 피드 지원
- [ ] 다국어 지원 (i18n)

### Phase 3: 고급 기능
- [ ] 포스트 시리즈 기능
- [ ] 독자 통계 대시보드
- [ ] SEO 자동 최적화
- [ ] AI 기반 관련 포스트 추천

---

## 12. 부록 (Appendix)

### A. 코드베이스 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # Auth Pages
│   ├── posts/             # Post Pages
│   └── tags/              # Tag Pages
├── components/            # React Components
│   ├── ui/               # shadcn/ui
│   ├── auth/             # Auth Components
│   ├── comments/         # Comment Components
│   ├── posts/            # Post Components
│   └── tags/             # Tag Components
├── hooks/                 # Custom Hooks
├── lib/                   # Utilities
│   ├── supabase/         # Supabase Client
│   ├── realtime/         # WebSocket Manager
│   ├── cache/            # Cache Layer
│   └── network/          # Retry Handler
├── services/             # Business Logic
├── contexts/             # React Context
├── config/               # Configuration
└── types/                # TypeScript Types
```

### B. 환경 변수

```bash
# Notion (필수)
NOTION_TOKEN=secret_xxx
NOTION_DATABASE_ID=xxx
EXPOSE_PERSON_EMAIL=false

# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### C. 주요 명령어

```bash
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드
pnpm lint         # 린트 체크
pnpm exec tsc --noEmit  # 타입 체크
```

---

**문서 끝**
