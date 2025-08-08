# My Blog with Notion

Linear.app에서 영감을 받은 모던하고 미니멀한 개발자 블로그입니다. Next.js 15와 React 19의 최신 기능을 활용하며, **Notion을 CMS로 활용**하여 컨텐츠를 관리합니다.

## ✨ 주요 기능

- **Notion CMS 통합**: Notion 데이터베이스를 사용한 블로그 포스트 관리
- **Linear Design System**: Linear.app에서 영감을 받은 깔끔하고 세련된 디자인
- **다크 모드 지원**: next-themes를 활용한 시스템 설정 연동 및 수동 전환
- **태그 시스템**: 포스트별 태그 배지 표시 및 Notion 색상 매핑
- **반응형 디자인**: 모든 디바이스에서 완벽한 레이아웃
- **최적화된 성능**: Next.js 15와 Static Generation으로 빠른 로딩
- **Markdown 렌더링**: react-markdown과 syntax highlighting 지원
- **접근성 준수**: WCAG 가이드라인을 따른 접근성 최적화

## 🛠 기술 스택

### Core

- **[Next.js 15.4.5](https://nextjs.org/)** - React 프레임워크 (App Router)
- **[React 19.1.0](https://react.dev/)** - UI 라이브러리
- **[TypeScript 5](https://www.typescriptlang.org/)** - 타입 안정성

### CMS & Content

- **[@notionhq/client](https://github.com/makenotion/notion-sdk-js)** - Notion API 클라이언트
- **[notion-to-md](https://github.com/souvikinator/notion-to-md)** - Notion 블록을 Markdown으로 변환
- **[react-markdown](https://github.com/remarkjs/react-markdown)** - Markdown 렌더링
- **[remark-gfm](https://github.com/remarkjs/remark-gfm)** - GitHub Flavored Markdown 지원
- **[react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)** - 코드 구문 강조
- **[prismjs](https://prismjs.com/)** - 구문 강조 테마

### Styling

- **[Tailwind CSS 3.4](https://tailwindcss.com/)** - 유틸리티 기반 CSS 프레임워크
- **[shadcn/ui](https://ui.shadcn.com/)** - 재사용 가능한 컴포넌트 라이브러리 (New York 스타일)
- **[tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)** - 애니메이션 유틸리티
- **[next-themes](https://github.com/pacocoursey/next-themes)** - 테마 관리

### UI Components

- **[Radix UI](https://www.radix-ui.com/)** - 접근성이 뛰어난 헤드리스 UI 컴포넌트
- **[Lucide React](https://lucide.dev/)** - 아름다운 오픈소스 아이콘 라이브러리
- **[class-variance-authority](https://cva.style/)** - 컴포넌트 변형 관리
- **[clsx](https://github.com/lukeed/clsx)** & **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - 클래스 이름 유틸리티

## 📦 설치 및 실행

### 사전 요구사항

- Node.js 18.17 이상
- pnpm (권장), npm, yarn, 또는 bun
- Notion 계정 및 API 키

### Notion 설정

1. [Notion Integrations](https://www.notion.so/my-integrations)에서 새 integration 생성
2. 블로그 포스트용 Notion 데이터베이스 생성
3. 데이터베이스에 필요한 속성 추가:
   - `title` (제목): Title 타입
   - `slug` (슬러그): Text 타입
   - `excerpt` (요약): Text 타입
   - `coverImage` (커버 이미지): Files & media 타입
   - `status` (상태): Select 타입 (Draft, Published, Archived)
   - `category` (카테고리): Select 타입
   - `tags` (태그): Multi-select 타입
   - `publishedAt` (발행일): Date 타입
   - `readingTime` (읽기 시간): Number 타입

4. Integration을 데이터베이스에 연결

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정:

```bash
# Notion API 설정
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id

# ISR Revalidation Secret (선택사항)
REVALIDATE_SECRET=your_secret_key

# Next.js 설정
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 설치

```bash
# 저장소 클론
git clone https://github.com/nalpari/my-blog-with-notion.git
cd my-blog-with-notion

# 의존성 설치 (pnpm 권장)
pnpm install
# 또는
npm install
# 또는
yarn install
```

### 개발 서버 실행

```bash
pnpm dev
# 또는
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

### 프로덕션 빌드

```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 코드 품질 체크
pnpm lint

# 타입 체크
pnpm tsc --noEmit
```

## 📁 프로젝트 구조

```
my-blog-with-notion/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # 루트 레이아웃
│   │   ├── page.tsx        # 홈페이지 (최신 포스트 목록)
│   │   ├── globals.css     # 전역 스타일 및 CSS 변수
│   │   └── posts/          
│   │       └── [slug]/     # 동적 포스트 상세 페이지
│   │           └── page.tsx
│   ├── components/         # React 컴포넌트
│   │   ├── header.tsx      # 네비게이션 헤더
│   │   ├── footer.tsx      # 푸터
│   │   ├── theme-provider.tsx  # 테마 제공자
│   │   ├── theme-toggle.tsx    # 테마 전환 버튼
│   │   └── ui/            # shadcn/ui 컴포넌트
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── popover.tsx
│   │       └── tag-badge.tsx  # 태그 배지 컴포넌트
│   ├── lib/               # 유틸리티 함수
│   │   ├── notion.ts      # Notion API 통합
│   │   └── utils.ts       # 헬퍼 함수
│   └── types/             # TypeScript 타입 정의
│       └── notion.ts      # Notion 관련 타입
├── public/                # 정적 파일
├── tailwind.config.ts     # Tailwind CSS 설정
├── components.json        # shadcn/ui 설정
├── next.config.ts         # Next.js 설정 (이미지 도메인 허용)
└── package.json
```

## 🎨 디자인 시스템

### 색상 팔레트

프로젝트는 CSS 변수를 사용하여 라이트/다크 모드를 지원합니다:

- **Primary**: Linear의 시그니처 블루 (`#4ea7fc`)
- **Background**: 라이트 (`#ffffff`) / 다크 (`#08090a`)
- **Foreground**: 라이트 (`#08090a`) / 다크 (`#f7f8f8`)
- **Muted**: 라이트 (`#f1f3f4`) / 다크 (`#1e1f23`)
- **Accent Colors**:
  - Blue (`#4ea7fc`)
  - Red (`#eb5757`)
  - Green (`#4cb782`)
  - Orange (`#fc7840`)
  - Yellow (`#ffc166`)
  - Indigo (`#8370ff`)

### Typography

- **Font Family**: `system-ui, -apple-system, BlinkMacSystemFont`
- **Headings**: 최적화된 font-weight와 letter-spacing
- **Body Text**: 가독성을 위한 적절한 line-height

## 🚀 배포

### Vercel (권장)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nalpari/my-blog-with-notion)

1. 위 버튼을 클릭하여 Vercel에 배포
2. GitHub 저장소 연결
3. 환경 변수 설정 (NOTION_TOKEN, NOTION_DATABASE_ID)
4. 배포 완료!

### 기타 플랫폼

- **Netlify**: Next.js adapter 설정 필요
- **Docker**: Dockerfile 작성 후 컨테이너화
- **AWS/GCP**: SSR을 위한 서버리스 함수 설정

## 🔧 주요 기능 및 컴포넌트

### Notion 통합 함수 (src/lib/notion.ts)

- `getPublishedPosts(limit, startCursor)`: 게시된 포스트 목록 가져오기
- `getLatestPosts(limit)`: 최신 포스트 가져오기
- `getPostBySlug(slug)`: 슬러그로 특정 포스트 가져오기
- `getPostBlocks(pageId)`: 포스트 콘텐츠를 Markdown으로 변환
- `getPostsByCategory(categoryName, limit)`: 카테고리별 포스트 가져오기

### 주요 컴포넌트

- **PostCard**: 포스트 카드 컴포넌트 (썸네일, 제목, 요약, 태그)
- **TagBadge/TagList**: 태그 배지 표시 컴포넌트 (Notion 색상 매핑)
- **ThemeProvider/ThemeToggle**: 다크 모드 전환 기능
- **Header/Footer**: 네비게이션 및 푸터 레이아웃

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🔗 링크

- **GitHub**: [https://github.com/nalpari/my-blog-with-notion](https://github.com/nalpari/my-blog-with-notion)
- **Demo**: [배포 URL]

## 📮 연락처

질문이나 제안사항이 있으시면 이슈를 생성하거나 PR을 보내주세요!

---

Made with ❤️ using Next.js, Notion API, and Linear Design System