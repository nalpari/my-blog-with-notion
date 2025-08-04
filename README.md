# My Blog with Notion

Linear.app에서 영감을 받은 모던하고 미니멀한 개발자 블로그입니다. Next.js 15와 React 19의 최신 기능을 활용하여 빠르고 반응형인 사용자 경험을 제공합니다.

## ✨ 주요 기능

- **Linear Design System**: Linear.app에서 영감을 받은 깔끔하고 세련된 디자인
- **다크 모드 지원**: 시스템 설정에 따른 자동 테마 전환
- **반응형 디자인**: 모든 디바이스에서 완벽한 레이아웃
- **최적화된 성능**: Next.js Turbopack을 활용한 빠른 개발 환경
- **접근성 준수**: WCAG 가이드라인을 따른 접근성 최적화

## 🛠 기술 스택

### Core
- **[Next.js 15.4.5](https://nextjs.org/)** - React 프레임워크
- **[React 19.1.0](https://react.dev/)** - UI 라이브러리
- **[TypeScript 5](https://www.typescriptlang.org/)** - 타입 안정성

### Styling
- **[Tailwind CSS 3.4](https://tailwindcss.com/)** - 유틸리티 기반 CSS 프레임워크
- **[shadcn/ui](https://ui.shadcn.com/)** - 재사용 가능한 컴포넌트 라이브러리
- **[tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)** - 애니메이션 유틸리티

### UI Components
- **[Radix UI](https://www.radix-ui.com/)** - 접근성이 뛰어난 헤드리스 UI 컴포넌트
- **[Lucide React](https://lucide.dev/)** - 아름다운 오픈소스 아이콘 라이브러리
- **[class-variance-authority](https://cva.style/)** - 컴포넌트 변형 관리
- **[clsx](https://github.com/lukeed/clsx)** & **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - 클래스 이름 유틸리티

## 📦 설치 및 실행

### 사전 요구사항
- Node.js 18.17 이상
- npm, yarn, pnpm, 또는 bun

### 설치

```bash
# 저장소 클론
git clone https://github.com/nalpari/my-blog-with-notion.git
cd my-blog-with-notion

# 의존성 설치
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

### 프로덕션 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

## 📁 프로젝트 구조

```
my-blog-with-notion/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── layout.tsx     # 루트 레이아웃
│   │   ├── page.tsx       # 홈페이지
│   │   └── globals.css    # 전역 스타일
│   ├── components/        # React 컴포넌트
│   │   └── ui/           # shadcn/ui 컴포넌트
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── input.tsx
│   └── lib/              # 유틸리티 함수
│       └── utils.ts
├── public/               # 정적 파일
├── tailwind.config.ts    # Tailwind CSS 설정
├── components.json       # shadcn/ui 설정
└── package.json
```

## 🎨 디자인 시스템

### 색상 팔레트

- **Primary**: Linear의 시그니처 블루 (`#4ea7fc`)
- **Background**: 라이트 (`#f8f9fa`) / 다크 (`#08090a`)
- **Foreground**: 라이트 (`#08090a`) / 다크 (`#f7f8f8`)
- **Muted**: 라이트 (`#f1f3f4`) / 다크 (`#32343a`)
- **Accent Colors**: 
  - Blue (`#4ea7fc`)
  - Red (`#eb5757`)
  - Green (`#4cb782`)
  - Orange (`#fc7840`)

### Typography

- **Font Family**: Inter Variable (Sans), SF Pro Display (System)
- **Headings**: 최적화된 font-weight와 letter-spacing
- **Body Text**: 가독성을 위한 적절한 line-height

## 🚀 배포

### Vercel (권장)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nalpari/my-blog-with-notion)

1. 위 버튼을 클릭하여 Vercel에 배포
2. GitHub 저장소 연결
3. 환경 변수 설정 (필요한 경우)
4. 배포 완료!

### 기타 플랫폼

- **Netlify**: `next.config.ts`에서 output을 'export'로 설정
- **Docker**: Dockerfile 작성 후 컨테이너화
- **AWS/GCP**: SSR을 위한 서버리스 함수 설정

## 📝 환경 변수

프로젝트에 필요한 환경 변수가 있다면 `.env.local` 파일을 생성하여 설정하세요:

```bash
# .env.local 예시
NEXT_PUBLIC_API_URL=your_api_url
```

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

Made with ❤️ using Next.js and Linear Design System