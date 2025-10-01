# 리팩토링 가이드

## 개요
이 문서는 현재 코드베이스를 분석하여 식별된 개선 필요사항과 권장 리팩토링 전략을 정리한 것입니다.

## 우선순위별 리팩토링 항목

### 🔴 높은 우선순위 (즉시 개선 필요)

#### 1. 컴포넌트 중복 제거
**문제점:**
- `PostCard` 컴포넌트가 `src/app/page.tsx`와 `src/app/posts/posts-list-page.tsx`에 중복 구현
- 동일한 로직이 여러 곳에 분산되어 유지보수가 어려움

**해결방안:**
```typescript
// src/components/post-card.tsx 생성
export const PostCard = ({ post }: { post: Post }) => {
  // 공통 PostCard 컴포넌트 구현
}
```

**영향 범위:**
- `src/app/page.tsx`
- `src/app/posts/posts-list-page.tsx`

---

#### 2. 거대한 컴포넌트 분할
**문제점:**
- `PostsListPage` 컴포넌트가 574줄로 너무 거대함
- 8개의 useState와 복잡한 useEffect 체인
- 단일 책임 원칙 위반

**해결방안:**
```typescript
// 커스텀 훅으로 로직 분리
// src/hooks/usePosts.ts
export const usePosts = () => {
  // 데이터 페칭 로직
}

// src/hooks/useCategories.ts  
export const useCategories = () => {
  // 카테고리 관리 로직
}

// 컴포넌트 분할
// src/components/posts/PostsGrid.tsx
// src/components/posts/PostsFilters.tsx
// src/components/posts/PostsPagination.tsx
```

**영향 범위:**
- `src/app/posts/posts-list-page.tsx`

---

#### 3. 타입 안정성 강화
**문제점:**
- `any` 타입 사용 (posts/[slug]/page.tsx:104, lib/notion.ts:103)
- 타입 정의 중복
- 선택적 타입 처리 미흡

**해결방안:**
```typescript
// any 타입 제거 및 구체적 타입 정의
interface ComponentProps {
  // 구체적인 props 타입 정의
}

// 타입 가드 함수 추가
function isValidPost(post: unknown): post is Post {
  // 타입 검증 로직
}
```

**영향 범위:**
- `src/types/notion.ts`
- `src/lib/notion.ts`
- `src/app/posts/[slug]/page.tsx`

---

### 🟡 중간 우선순위 (단계적 개선)

#### 4. 유틸리티 함수 중앙화
**문제점:**
- `formatDate` 함수가 여러 컴포넌트에 중복
- 날짜/시간 처리 로직이 분산

**해결방안:**
```typescript
// src/lib/date-utils.ts
export const formatDate = (date: string | Date) => {
  // 중앙화된 날짜 포맷팅
}

export const getReadingTime = (content: string) => {
  // 읽기 시간 계산 로직
}
```

---

#### 5. 상수 및 설정 중앙화
**문제점:**
- 하드코딩된 값들 (postsPerPage, maxTags 등)
- "By Swaraj Bachu", "3 min read" 등 정적 텍스트
- 매직 넘버 사용

**해결방안:**
```typescript
// src/config/constants.ts
export const POSTS_CONFIG = {
  POSTS_PER_PAGE: 10,
  MAX_TAGS_DISPLAY: 3,
  DEFAULT_AUTHOR: 'Your Name',
  // ...
}

// src/config/messages.ts
export const MESSAGES = {
  NO_POSTS: '게시물이 없습니다',
  LOADING: '불러오는 중...',
  // ...
}
```

---

#### 6. 에러 처리 개선
**문제점:**
- 일관성 없는 에러 처리 (빈 배열 vs null 반환)
- 사용자 친화적이지 않은 에러 메시지

**해결방안:**
```typescript
// src/lib/error-handler.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message)
  }
}

// src/components/ErrorBoundary.tsx
export const ErrorBoundary = ({ children }) => {
  // 통합 에러 처리 컴포넌트
}
```

---

### 🟢 낮은 우선순위 (성능 최적화)

#### 7. 성능 최적화
**문제점:**
- 메모화 부재
- 불필요한 API 호출 (카테고리 목록을 위해 전체 포스트 조회)
- 이미지 크기 하드코딩

**해결방안:**
```typescript
// React.memo, useMemo, useCallback 활용
const PostCard = React.memo(({ post }) => {
  // ...
})

// 별도 카테고리 API 엔드포인트
// src/app/api/categories/route.ts

// 동적 이미지 최적화
const getOptimizedImageSize = (viewport: 'mobile' | 'desktop') => {
  // ...
}
```

---

#### 8. 커스텀 훅 생성
**문제점:**
- 데이터 페칭 로직이 컴포넌트에 직접 구현
- AbortController 관리 로직 복잡

**해결방안:**
```typescript
// src/hooks/useApi.ts
export const useApi = <T>(url: string, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // AbortController 자동 관리
  // 재시도 로직
  // 캐싱
  
  return { data, loading, error, refetch }
}
```

---

## 구현 로드맵

### Phase 1 (1-2주)
- [ ] PostCard 컴포넌트 추출 및 공통화
- [ ] any 타입 제거
- [ ] formatDate 등 유틸리티 함수 중앙화

### Phase 2 (2-3주)
- [ ] PostsListPage 컴포넌트 분할
- [ ] 커스텀 훅 생성 (usePosts, useCategories)
- [ ] 상수 및 설정 파일 생성

### Phase 3 (3-4주)
- [ ] 통합 에러 처리 시스템 구축
- [ ] 성능 최적화 (메모화, 가상화)
- [ ] 테스트 코드 추가

## 예상 효과

### 코드 품질 개선
- **중복 코드 감소**: 약 30% 코드량 감소 예상
- **유지보수성 향상**: 컴포넌트 책임 명확화
- **타입 안정성**: 런타임 에러 방지

### 성능 개선
- **불필요한 렌더링 감소**: 메모화를 통한 최적화
- **API 호출 최적화**: 필요한 데이터만 요청
- **번들 크기 감소**: 중복 코드 제거

### 개발 경험 향상
- **재사용성 증가**: 공통 컴포넌트/훅 활용
- **디버깅 용이**: 명확한 에러 처리
- **확장성 개선**: 새 기능 추가 용이

## 주의사항

1. **단계적 접근**: 한 번에 모든 것을 변경하지 말고 단계적으로 진행
2. **테스트 우선**: 리팩토링 전 테스트 코드 작성
3. **기능 동일성**: 리팩토링 중 기능 변경 금지
4. **문서화**: 변경사항은 즉시 문서화
5. **코드 리뷰**: 모든 변경은 리뷰 후 머지

## 참고 자료

- [React 성능 최적화 가이드](https://react.dev/learn/render-and-commit)
- [TypeScript 베스트 프랙티스](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Next.js 최적화 팁](https://nextjs.org/docs/app/building-your-application/optimizing)