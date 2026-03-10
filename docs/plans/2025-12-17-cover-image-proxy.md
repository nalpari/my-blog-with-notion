# Cover Image Proxy API Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 포스트 리스트의 커버 이미지를 프록시 API를 통해 제공하여 브라우저 캐싱을 활성화하고 로딩 속도를 개선한다.

**Architecture:** Notion의 signed URL(1시간 만료)을 안정적인 프록시 URL(`/api/cover-image/[pageId]`)로 대체한다. 프록시 API는 노션 페이지 속성에서 coverImage URL을 조회하고 이미지를 fetch하여 1시간 캐싱 헤더와 함께 응답한다.

**Tech Stack:** Next.js 15 API Routes, @notionhq/client, TypeScript

---

## Task 1: Cover Image Proxy API 생성

**Files:**
- Create: `src/app/api/cover-image/[pageId]/route.ts`
- Reference: `src/app/api/notion-image/[blockId]/route.ts` (기존 패턴 참고)

**Step 1: API 라우트 파일 생성**

```typescript
import { Client } from '@notionhq/client'
import { NextRequest, NextResponse } from 'next/server'

// 노션 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

// 노션 파일 타입
type NotionFile = {
  type: 'external' | 'file'
  external?: { url: string }
  file?: { url: string }
}

// 페이지 속성에서 coverImage 추출을 위한 타입
interface PageProperties {
  coverImage?: {
    files: NotionFile[]
  }
}

/**
 * 커버 이미지 프록시 API
 * GET /api/cover-image/[pageId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params

    if (!pageId) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      )
    }

    // 노션 API로 페이지 속성 조회
    const page = await notion.pages.retrieve({ page_id: pageId })

    // 페이지 속성에서 coverImage 추출
    const properties = (page as { properties: PageProperties }).properties
    const coverImageFiles = properties.coverImage?.files

    if (!coverImageFiles || coverImageFiles.length === 0) {
      return NextResponse.json(
        { error: 'No cover image found' },
        { status: 404 }
      )
    }

    // 이미지 URL 추출
    const file = coverImageFiles[0]
    let imageUrl: string | undefined

    if (file.type === 'external') {
      imageUrl = file.external?.url
    } else if (file.type === 'file') {
      imageUrl = file.file?.url
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL not found' },
        { status: 404 }
      )
    }

    // 이미지 데이터 fetch
    const imageResponse = await fetch(imageUrl)

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: 502 }
      )
    }

    // Content-Type 추출
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

    // 이미지 데이터를 버퍼로 변환
    const imageBuffer = await imageResponse.arrayBuffer()

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // 1시간 캐싱 + 30분 stale-while-revalidate
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=1800',
      },
    })
  } catch (error) {
    console.error('Error proxying cover image:', error)

    // 노션 API 에러 처리
    if (error instanceof Error && error.message.includes('Could not find page')) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Step 2: 파일 저장 확인**

Run: `ls -la src/app/api/cover-image/[pageId]/route.ts`
Expected: 파일이 존재함

**Step 3: TypeScript 타입 체크**

Run: `pnpm exec tsc --noEmit`
Expected: 에러 없음

**Step 4: Commit**

```bash
git add src/app/api/cover-image/
git commit -m "feat: add cover image proxy API for caching"
```

---

## Task 2: PostCard 컴포넌트 수정

**Files:**
- Modify: `src/components/post-card.tsx:31-40`

**Step 1: Image src를 프록시 URL로 변경**

변경 전 (line 31-40):
```tsx
{post.coverImage ? (
  <Image
    src={post.coverImage}
    alt={post.title}
    fill
    className="object-cover transition-transform duration-500 group-hover:scale-105"
    sizes={getImageSizes('card')}
    priority={priority}
    loading={priority ? 'eager' : 'lazy'}
  />
```

변경 후:
```tsx
{post.coverImage ? (
  <Image
    src={`/api/cover-image/${post.id}`}
    alt={post.title}
    fill
    className="object-cover transition-transform duration-500 group-hover:scale-105"
    sizes={getImageSizes('card')}
    priority={priority}
    loading={priority ? 'eager' : 'lazy'}
  />
```

**Step 2: TypeScript 타입 체크**

Run: `pnpm exec tsc --noEmit`
Expected: 에러 없음

**Step 3: Commit**

```bash
git add src/components/post-card.tsx
git commit -m "feat: use cover image proxy URL in PostCard"
```

---

## Task 3: 로컬 테스트 및 검증

**Step 1: 기존 3000 포트 프로세스 종료**

Run: `lsof -ti:3000 | xargs kill -9 2>/dev/null || true`

**Step 2: 개발 서버 실행**

Run: `pnpm dev`
Expected: 서버가 http://localhost:3000 에서 실행됨

**Step 3: 브라우저에서 테스트**

1. http://localhost:3000/posts 접속
2. 개발자 도구 Network 탭 열기
3. 페이지 새로고침
4. 이미지 요청 URL이 `/api/cover-image/xxx` 형태인지 확인
5. Response Headers에서 `Cache-Control: public, max-age=3600` 확인
6. 페이지 재방문 시 이미지가 캐시에서 로드되는지 확인 (Network 탭에서 "disk cache" 표시)

**Step 4: 개발 서버 종료**

Run: `lsof -ti:3000 | xargs kill -9`

---

## Task 4: 빌드 검증

**Step 1: Lint 체크**

Run: `pnpm lint`
Expected: 에러 없음

**Step 2: 타입 체크**

Run: `pnpm exec tsc --noEmit`
Expected: 에러 없음

**Step 3: 프로덕션 빌드**

Run: `pnpm build`
Expected: 빌드 성공

**Step 4: 최종 Commit (필요시)**

```bash
git add -A
git commit -m "chore: finalize cover image proxy implementation"
```

---

## 완료 체크리스트

- [ ] `/api/cover-image/[pageId]/route.ts` 생성됨
- [ ] `post-card.tsx`에서 프록시 URL 사용
- [ ] 브라우저 캐싱 동작 확인
- [ ] lint, type check, build 모두 통과
