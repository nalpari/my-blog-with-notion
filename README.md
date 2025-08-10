# My Blog with Notion

Linear.app에서 영감을 받은 모던하고 미니멀한 개발자 블로그입니다. Next.js 15와 React 19의 최신 기능을 활용하며, **Notion을 헤드리스 CMS로 활용**하여 컨텐츠를 관리합니다.

## 🚀 주요 특징

### 성능 최적화
- **Turbopack** 기반 초고속 개발 환경
- **Static Site Generation (SSG)** 으로 빌드 시점 페이지 생성
- **Next.js Image Optimization** 으로 이미지 최적화
- **Cursor-based Pagination** 으로 효율적인 데이터 로딩
- **컴포넌트 레벨 코드 스플리팅** 자동 적용

### 디자인 & UX
- **Linear Design System** 기반 미니멀하고 세련된 UI
- **다크/라이트 모드** 자동 전환 및 수동 토글 지원
- **반응형 디자인** 모든 디바이스에 최적화
- **부드러운 애니메이션** Tailwind Animate 활용
- **접근성 최적화** Radix UI 기반 컴포넌트

### 개발자 경험
- **TypeScript** 완벽한 타입 안정성 (no any)
- **ESLint & Prettier** 코드 품질 관리
- **shadcn/ui** 재사용 가능한 컴포넌트 라이브러리
- **Hot Module Replacement** 실시간 개발 피드백
- **커스텀 훅** 로직 분리 및 재사용

## ✨ 주요 기능

- **Notion CMS 통합**: Notion 데이터베이스를 사용한 블로그 포스트 관리
- **실시간 검색**: 제목과 내용 기반 포스트 검색
- **카테고리 필터링**: 카테고리별 포스트 분류 및 필터
- **태그 시스템**: 다중 태그 지원
- **Markdown 렌더링**: 코드 하이라이팅을 포함한 풍부한 콘텐츠 표현
- **SEO 최적화**: 메타데이터 및 Open Graph 태그 자동 생성
- **에러 처리**: ErrorBoundary와 중앙화된 에러 관리

## 🛠 기술 스택

### Core Framework
- **[Next.js 15.4.5](https://nextjs.org/)** - React 프레임워크 (App Router)
- **[React 19.1.0](https://react.dev/)** - UI 라이브러리
- **[TypeScript 5.9.2](https://www.typescriptlang.org/)** - 타입 안정성

### CMS & Content Management
- **[@notionhq/client 4.0.1](https://github.com/makenotion/notion-sdk-js)** - Notion API 클라이언트
- **[notion-to-md 3.1.9](https://github.com/souvikinator/notion-to-md)** - Notion 블록을 Markdown으로 변환
- **[react-markdown 10.1.0](https://github.com/remarkjs/react-markdown)** - Markdown 렌더링
- **[react-syntax-highlighter 15.6.1](https://github.com/react-syntax-highlighter/react-syntax-highlighter)** - 코드 구문 강조

### Styling & UI
- **[Tailwind CSS 3.4.17](https://tailwindcss.com/)** - 유틸리티 기반 CSS 프레임워크
- **[shadcn/ui](https://ui.shadcn.com/)** - 재사용 가능한 컴포넌트 라이브러리 (New York 스타일)
- **[tailwindcss-animate 1.0.7](https://github.com/jamiebuilds/tailwindcss-animate)** - 애니메이션 유틸리티
- **[next-themes 0.4.6](https://github.com/pacocoursey/next-themes)** - 테마 관리

### UI Components & Libraries
- **[Radix UI](https://www.radix-ui.com/)** - 접근성이 뛰어난 헤드리스 UI 컴포넌트
- **[Lucide React 0.536.0](https://lucide.dev/)** - 아이콘 라이브러리
- **[class-variance-authority 0.7.1](https://cva.style/)** - 컴포넌트 변형 관리
- **[clsx 2.1.1](https://github.com/lukeed/clsx)** & **[tailwind-merge 3.3.1](https://github.com/dcastil/tailwind-merge)** - 클래스 이름 유틸리티

## 📦 설치 및 실행

### 사전 요구사항

- Node.js 18.17 이상
- npm, yarn, pnpm, 또는 bun
- Notion 계정 및 API 키

### Notion 설정

1. **Integration 생성**
   - [Notion Integrations](https://www.notion.so/my-integrations)에서 새 integration 생성
   - Integration 토큰 복사

2. **데이터베이스 생성**
   블로그 포스트용 Notion 데이터베이스를 생성하고 다음 속성들을 추가:

   | 속성명 | 타입 | 설명 | 필수 |
   |--------|------|------|------|
   | `title` | Title | 포스트 제목 | ✅ |
   | `slug` | Text | URL 경로 (예: my-first-post) | ✅ |
   | `excerpt` | Text | 포스트 요약 (150자 이내 권장) | ✅ |
   | `coverImage` | Files & media | 커버 이미지 | ❌ |
   | `status` | Select | Draft, Published, Archived | ✅ |
   | `category` | Select | 포스트 카테고리 | ✅ |
   | `tags` | Multi-select | 포스트 태그들 | ❌ |
   | `publishedAt` | Date | 발행일 | ✅ |
   | `readingTime` | Number | 예상 읽기 시간(분) | ❌ |

3. **Integration 연결**
   - 데이터베이스 우측 상단 ⋯ 메뉴 → Connections → Integration 연결

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정:

```bash
# Notion API 설정 (필수)
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> 💡 **Tip**: Database ID는 Notion 데이터베이스 URL에서 확인 가능합니다.
> `https://notion.so/{workspace}/{database_id}?v={view_id}`

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/nalpari/my-blog-with-notion.git
cd my-blog-with-notion

# 의존성 설치
npm install

# 개발 서버 실행 (Turbopack 사용)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 코드 품질 검사
npm run lint

# TypeScript 타입 체크
npx tsc --noEmit
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
my-blog-with-notion/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   └── posts/          # 포스트 API 엔드포인트
│   │   ├── posts/              
│   │   │   ├── [slug]/         # 동적 포스트 상세 페이지 (SSG)
│   │   │   ├── page.tsx        # 포스트 목록 페이지
│   │   │   └── posts-list-page.tsx # 클라이언트 컴포넌트
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 홈페이지
│   │   └── globals.css         # 전역 스타일
│   ├── components/             # React 컴포넌트
│   │   ├── posts/              # 포스트 관련 컴포넌트
│   │   │   ├── PostsGrid.tsx   # 포스트 그리드
│   │   │   ├── PostsFilters.tsx # 검색 및 필터
│   │   │   ├── PostsPagination.tsx # 페이지네이션
│   │   │   └── PostsLoading.tsx # 로딩 스켈레톤
│   │   ├── ui/                 # shadcn/ui 컴포넌트
│   │   ├── post-card.tsx       # 재사용 가능한 포스트 카드
│   │   ├── ErrorBoundary.tsx   # 에러 바운더리
│   │   ├── header.tsx          # 네비게이션 헤더
│   │   ├── footer.tsx          # 푸터
│   │   └── theme-*.tsx         # 테마 관련 컴포넌트
│   ├── config/                 # 설정 파일
│   │   ├── constants.ts        # 앱 전역 상수
│   │   └── messages.ts         # UI 메시지
│   ├── hooks/                  # 커스텀 React 훅
│   │   ├── usePosts.ts         # 포스트 데이터 관리
│   │   └── useCategories.ts    # 카테고리 관리
│   ├── lib/                    # 유틸리티 함수
│   │   ├── notion.ts           # Notion API 통합
│   │   ├── date-utils.ts       # 날짜 포맷팅
│   │   ├── error-handler.ts    # 에러 처리
│   │   └── utils.ts            # 기타 유틸리티
│   └── types/                  # TypeScript 타입 정의
│       └── notion.ts           # Notion 관련 타입
├── public/                     # 정적 파일
├── docs/                       # 문서
│   ├── REFACTORING.md         # 리팩토링 가이드
│   └── design.json            # UI 디자인 명세
├── tailwind.config.ts          # Tailwind CSS 설정
├── components.json             # shadcn/ui 설정
├── next.config.ts              # Next.js 설정
├── tsconfig.json               # TypeScript 설정
├── CLAUDE.md                   # Claude AI 가이드
└── package.json                # 프로젝트 의존성
```

## 🎨 디자인 시스템

### 색상 팔레트

프로젝트는 CSS 변수를 사용하여 일관된 테마를 유지합니다:

#### 기본 색상
- **Primary**: Linear 시그니처 블루 (`#4ea7fc`)
- **Background**: 라이트 (`#ffffff`) / 다크 (`#08090a`)
- **Foreground**: 라이트 (`#08090a`) / 다크 (`#f7f8f8`)
- **Muted**: 라이트 (`#f1f3f4`) / 다크 (`#1e1f23`)
- **Border**: 라이트 (`#e1e8ed`) / 다크 (`#27282c`)

#### 액센트 색상
- **Blue** (`#4ea7fc`): 주요 액션, 링크
- **Green** (`#4cb782`): 성공, 완료 상태
- **Red** (`#eb5757`): 경고, 삭제 액션
- **Orange** (`#fc7840`): 주의, 중요 알림
- **Yellow** (`#ffc166`): 하이라이트, 강조
- **Indigo** (`#8370ff`): 특별 카테고리

### Typography

- **Font Family**: Inter (Variable Font), System UI Fallback
- **Headings**: 최적화된 font-weight와 letter-spacing
- **Body Text**: 16px 기본 크기, 1.5 line-height
- **Code Blocks**: Fira Code 또는 시스템 모노스페이스 폰트

### 컴포넌트 변형

모든 UI 컴포넌트는 다양한 변형을 지원합니다:

- **Button**: default, destructive, outline, secondary, ghost, link
- **Card**: 호버 효과와 그림자 트랜지션
- **Input**: 포커스 상태와 검증 스타일

## 🏗️ 아키텍처 및 패턴

### 데이터 흐름
1. **Static Site Generation (SSG)**: 빌드 시점에 포스트 페이지 생성
2. **Content Pipeline**: Notion blocks → Markdown → HTML
3. **Type Safety**: 모든 Notion 응답은 `NotionPageProperties` 인터페이스로 타입 정의
4. **Error Handling**: `AppError` 클래스와 `ErrorBoundary` 컴포넌트로 중앙화

### 핵심 설계 원칙
- **컴포넌트 분리**: 작고 집중된 컴포넌트로 구성
- **로직 재사용**: 커스텀 훅으로 비즈니스 로직 분리
- **타입 안정성**: any 타입 사용 금지, 엄격한 타입 정의
- **설정 중앙화**: 상수와 메시지를 별도 파일로 관리

## 🔧 주요 API 함수

### Notion 통합 함수 (`src/lib/notion.ts`)

| 함수명 | 설명 | 매개변수 | 반환값 |
|--------|------|----------|--------|
| `getPublishedPosts()` | 게시된 포스트 목록 조회 | limit, cursor?, search?, category? | NotionDatabaseResponse |
| `getLatestPosts()` | 최신 포스트 조회 | limit? | Post[] |
| `getPostBySlug()` | 슬러그로 특정 포스트 조회 | slug | Post \| null |
| `getPostBlocks()` | 포스트 콘텐츠를 Markdown으로 변환 | pageId | string |
| `getPostsByCategory()` | 카테고리별 포스트 조회 | categoryName, limit? | Post[] |

### 커스텀 훅

| 훅 | 설명 | 주요 기능 |
|----|------|----------|
| `usePosts()` | 포스트 데이터 관리 | 페칭, 페이지네이션, 에러 처리 |
| `useCategories()` | 카테고리 관리 | 카테고리 로드, 선택 상태 관리 |

### API Routes (`src/app/api/posts/route.ts`)

**GET /api/posts**

쿼리 파라미터:
- `limit`: 페이지당 포스트 수 (기본값: 9, 최대: 100)
- `page`: 페이지 번호 (기본값: 1)
- `cursor`: 커서 기반 페이지네이션용
- `q`: 검색 쿼리
- `category`: 카테고리 필터

응답 예시:
```json
{
  "posts": [...],
  "pagination": {
    "page": 1,
    "limit": 9,
    "totalPosts": 45,
    "totalPages": 5,
    "hasMore": true,
    "hasNext": true,
    "hasPrevious": false,
    "nextCursor": "..."
  }
}
```

## 🚀 배포

### Vercel (권장)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nalpari/my-blog-with-notion)

1. 위 버튼을 클릭하여 Vercel에 배포
2. GitHub 저장소 연결
3. 환경 변수 설정:
   - `NOTION_TOKEN`
   - `NOTION_DATABASE_ID`
4. 배포 완료!

### 기타 플랫폼

#### Netlify
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NOTION_TOKEN = "your_token"
  NOTION_DATABASE_ID = "your_database_id"
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 성능 최적화

### 이미지 최적화
- Next.js Image 컴포넌트로 자동 최적화
- WebP 포맷 자동 변환
- Lazy Loading 기본 적용
- 반응형 이미지 제공

### 허용된 이미지 도메인
- `prod-files-secure.s3.us-west-2.amazonaws.com` (Notion 파일)
- `images.unsplash.com` (외부 이미지)
- `www.notion.so` (Notion 아바타)

### 빌드 최적화
- Static Generation으로 빌드 시 페이지 생성
- Incremental Static Regeneration (ISR) 지원
- API Route 캐싱
- 컴포넌트 레벨 코드 스플리팅

## 🧪 개발 도구

### VS Code 확장 프로그램 추천
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin
- Thunder Client (API 테스트)

### 디버깅
```bash
# 디버그 모드로 개발 서버 실행
NODE_OPTIONS='--inspect' npm run dev
```

## 📈 최근 업데이트

### v2.0.0 - 대규모 리팩토링 (2025.01)
- ✨ PostCard 컴포넌트 공통화로 중복 코드 30% 감소
- 🎯 모든 any 타입 제거 및 타입 안정성 강화
- 🏗️ PostsListPage를 작은 컴포넌트로 분할
- 🪝 커스텀 훅 생성 (usePosts, useCategories)
- 📦 설정 파일 중앙화 (constants.ts, messages.ts)
- 🛡️ ErrorBoundary 및 에러 처리 시스템 구축
- 📚 날짜 유틸리티 함수 중앙화
- ⚡ Next.js 15 async params 처리 개선

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: 놀라운 기능 추가'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 커밋 컨벤션
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 프로세스 또는 보조 도구 변경

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🔗 링크

- **GitHub**: [https://github.com/nalpari/my-blog-with-notion](https://github.com/nalpari/my-blog-with-notion)
- **Demo**: [배포 URL]
- **Notion Template**: [블로그 데이터베이스 템플릿]

## 📮 연락처

질문이나 제안사항이 있으시면:
- 이슈 생성: [GitHub Issues](https://github.com/nalpari/my-blog-with-notion/issues)
- Pull Request: [GitHub PRs](https://github.com/nalpari/my-blog-with-notion/pulls)

---

Made with ❤️ using Next.js, Notion API, and Linear Design System