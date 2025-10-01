# 태그 통계 API 엔드포인트 설계

Phase 1 - API 엔드포인트 설계 문서

## 개요

태그 상세보기 화면 리디자인을 위한 새로운 API 엔드포인트 설계.

## API 엔드포인트

### 1. 태그 통계 API

**엔드포인트**: `GET /api/tags/[slug]/statistics`

**경로**: `src/app/api/tags/[slug]/statistics/route.ts`

**목적**: 특정 태그의 상세 통계 데이터 제공

**응답 타입**: `TagStatisticsResponse`

**응답 예시**:
```json
{
  "tag": {
    "id": "tag-123",
    "name": "React",
    "slug": "react",
    "color": "blue"
  },
  "statistics": {
    "monthlyTrend": [
      {
        "month": "2024-01",
        "count": 5,
        "growthRate": 0.25
      }
    ],
    "relatedTags": [
      {
        "tag": {
          "id": "tag-456",
          "name": "TypeScript",
          "slug": "typescript",
          "color": "blue"
        },
        "correlation": 0.85,
        "coOccurrenceCount": 8
      }
    ],
    "postDistribution": [
      {
        "date": "2024-01-15",
        "posts": 2,
        "dayOfWeek": 1
      }
    ],
    "topPosts": [
      {
        "id": "post-789",
        "title": "React 19 신기능",
        "slug": "react-19-features",
        "excerpt": "React 19의 새로운 기능들을 소개합니다",
        "publishedAt": "2024-01-15",
        "readingTime": 5
      }
    ]
  },
  "totalPostCount": 25,
  "generatedAt": "2024-01-20T10:00:00Z"
}
```

**구현 사항** (Phase 3):
- Notion API를 활용한 데이터 집계
- Edge Functions 활용 (성능 최적화)
- CDN 캐싱 전략
- 데이터 압축 전송

---

### 2. 연관 태그 API

**엔드포인트**: `GET /api/tags/[slug]/related`

**경로**: `src/app/api/tags/[slug]/related/route.ts`

**목적**: 특정 태그와 연관성 높은 태그 목록 제공

**Query Parameters**:
- `limit` (optional): 반환할 연관 태그 수 (기본값: 10)
- `minCorrelation` (optional): 최소 상관관계 점수 (기본값: 0.3)

**응답 타입**: `RelatedTagsResponse`

**응답 예시**:
```json
{
  "tag": {
    "id": "tag-123",
    "name": "React",
    "slug": "react",
    "color": "blue"
  },
  "relatedTags": [
    {
      "tag": {
        "id": "tag-456",
        "name": "TypeScript",
        "slug": "typescript",
        "color": "blue"
      },
      "correlation": 0.85,
      "coOccurrenceCount": 8
    },
    {
      "tag": {
        "id": "tag-789",
        "name": "Next.js",
        "slug": "nextjs",
        "color": "black"
      },
      "correlation": 0.72,
      "coOccurrenceCount": 6
    }
  ],
  "generatedAt": "2024-01-20T10:00:00Z"
}
```

**구현 사항** (Phase 3):
- 태그 공동 출현 빈도 계산
- 상관관계 점수 알고리즘
- 캐싱 전략
- 실시간 업데이트 지원

---

## 디렉토리 구조

```
src/app/api/tags/
├── route.ts                          # 기존: 모든 태그 목록
└── [slug]/
    ├── statistics/
    │   └── route.ts                  # 신규: 태그 통계 데이터
    └── related/
        └── route.ts                  # 신규: 연관 태그 데이터
```

---

## 데이터 처리 전략

### 캐싱 전략
- **In-Memory Cache**: 자주 요청되는 태그 통계 (TTL: 5분)
- **CDN Cache**: Edge Functions 응답 (TTL: 1시간)
- **Incremental Updates**: 새 포스트 발행 시 캐시 무효화

### 성능 최적화
- **Parallel Fetching**: 통계 데이터 병렬 수집
- **Data Aggregation**: Notion API 호출 최소화
- **Response Compression**: gzip 압축
- **Edge Functions**: Vercel Edge Runtime 활용

### 에러 처리
- **Graceful Degradation**: 일부 데이터 실패 시 가용 데이터만 반환
- **Retry Logic**: Notion API 타임아웃 시 재시도
- **Error Logging**: 에러 컨텍스트 보존

---

## Phase 3 구현 체크리스트

### `/api/tags/[slug]/statistics`
- [ ] 라우트 파일 생성
- [ ] 월별 트렌드 데이터 집계
- [ ] 연관 태그 계산
- [ ] 포스트 분포 데이터 생성
- [ ] 인기 포스트 정렬
- [ ] 캐싱 레이어 구현
- [ ] 에러 처리 및 로깅

### `/api/tags/[slug]/related`
- [ ] 라우트 파일 생성
- [ ] 태그 공동 출현 빈도 계산
- [ ] 상관관계 점수 알고리즘
- [ ] Query parameter 처리
- [ ] 캐싱 구현
- [ ] 에러 처리 및 로깅

---

## 참고 사항

- 모든 타입은 `src/types/tag-statistics.ts`에 정의됨
- 기존 Notion API 함수는 `src/lib/notion.ts`에 위치
- API 응답 포맷은 기존 `/api/tags` 패턴 유지
- TypeScript strict mode - `any` 타입 사용 금지
