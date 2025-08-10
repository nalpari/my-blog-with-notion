# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

- 답변과 추론과정은 항상 한국어로 작성해주세요.
- 커밋 메세지는 항상 fix, feat, chore, style, test, docs, refactor 등 접두사는 영어로 하고, 나머지 커밋 내용은 한글로 작성해줘.

## Development Commands

```bash
npm run dev          # Start development server with Turbopack on http://localhost:3000
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint for code quality checks
```

## Architecture Overview

This is a Next.js 15 blog application that uses **Notion as a CMS** with a Linear.app-inspired design system.

### Core Technologies

- **Next.js 15.4.5** with App Router and Turbopack
- **React 19.1.0** with TypeScript 5
- **Notion API** (@notionhq/client) for content management
- **Tailwind CSS** with custom Linear design system colors
- **shadcn/ui** components (New York style, CSS variables)
- **next-themes** for dark mode support

### Notion Integration

The application uses Notion as a headless CMS. Key integration points:

- **Environment Variables Required:**

  ```bash
  NOTION_TOKEN=your_notion_integration_token
  NOTION_DATABASE_ID=your_notion_database_id
  ```

- **Database Schema:** The Notion database must have these properties:

  - `title` (Title): Post title
  - `slug` (Text): URL slug
  - `excerpt` (Text): Post summary
  - `coverImage` (Files & media): Cover image
  - `status` (Select): Draft/Published/Archived
  - `category` (Select): Post category
  - `tags` (Multi-select): Post tags
  - `publishedAt` (Date): Publication date
  - `readingTime` (Number): Estimated reading time

- **Key API Functions** in `src/lib/notion.ts`:
  - `getPublishedPosts()` - Paginated published posts
  - `getLatestPosts()` - Homepage posts
  - `getPostBySlug()` - Individual post by slug
  - `getPostBlocks()` - Post content as Markdown
  - `getPostsByCategory()` - Category filtering

### Data Flow Architecture

1. **Static Generation:** Posts are pre-rendered at build time using `generateStaticParams()`
2. **Content Transformation:** Notion blocks → Markdown (notion-to-md) → HTML (react-markdown)
3. **Image Optimization:** External images from Notion are optimized via Next.js Image component
4. **Type Safety:** All Notion responses are typed via `src/types/notion.ts`

### Component Architecture

**Page Structure:**

- `src/app/page.tsx` - Homepage with latest posts grid
- `src/app/posts/[slug]/page.tsx` - Individual post pages with SSG

**UI Components:**

- All shadcn/ui components in `src/components/ui/`
- Theme provider wraps the application for dark mode
- Components use CSS variables for theming consistency

### Styling System

1. **CSS Variables** in `src/app/globals.css` define the color palette
2. **Tailwind Config** extends these variables for consistent theming
3. **cn() utility** (`src/lib/utils.ts`) handles conditional className merging
4. **Dark Mode** automatic via system preference or manual toggle

### Image Handling

Configured domains in `next.config.ts`:

- `prod-files-secure.s3.us-west-2.amazonaws.com` (Notion files)
- `images.unsplash.com` (External images)
- `www.notion.so` (Notion avatars)

### TypeScript Configuration

- Path alias: `@/*` → `./src/*`
- Strict mode enabled
- All Notion API responses fully typed

### Adding New shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

This maintains consistent styling with the existing design system.
