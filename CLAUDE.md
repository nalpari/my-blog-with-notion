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
npx tsc --noEmit     # Run TypeScript type checking
```

## Architecture Overview

This is a Next.js 15 blog application that uses **Notion as a headless CMS** with a Linear.app-inspired design system.

### Core Stack
- **Next.js 15.4.5** with App Router and Turbopack
- **React 19.1.0** with TypeScript 5.9.2 (strict mode)
- **Notion API** (@notionhq/client) for content management
- **Tailwind CSS** with custom Linear design system
- **shadcn/ui** components (New York style, CSS variables)

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/posts/         # API endpoint for posts
│   └── posts/[slug]/      # Dynamic post pages with SSG
├── components/
│   ├── posts/             # Post-related components (Grid, Filters, Pagination, Loading)
│   ├── ui/                # shadcn/ui components
│   ├── post-card.tsx      # Reusable PostCard component
│   └── ErrorBoundary.tsx  # Error handling wrapper
├── config/                # Configuration files
│   ├── constants.ts       # App-wide constants (POSTS_CONFIG, PAGINATION_CONFIG, etc.)
│   └── messages.ts        # UI messages and text content
├── hooks/                 # Custom React hooks
│   ├── usePosts.ts       # Posts data fetching and management
│   └── useCategories.ts  # Categories management
├── lib/                   # Utility functions
│   ├── notion.ts         # Notion API integration
│   ├── date-utils.ts     # Date formatting utilities
│   └── error-handler.ts  # Error handling utilities
└── types/                # TypeScript type definitions
    └── notion.ts         # Notion-related types
```

### Notion CMS Integration

**Required Environment Variables:**
```bash
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Notion Database Schema Requirements:**
- `title` (Title): Post title
- `slug` (Text): URL slug for the post
- `excerpt` (Text): Post summary (150 chars recommended)
- `coverImage` (Files & media): Cover image
- `status` (Select): Draft/Published/Archived
- `category` (Select): Post category
- `tags` (Multi-select): Post tags
- `publishedAt` (Date): Publication date
- `readingTime` (Number): Estimated reading time in minutes

**Key API Functions** in `src/lib/notion.ts`:
- `getPublishedPosts(limit, cursor?, search?, category?)` - Paginated posts with filtering
- `getLatestPosts()` - Homepage featured posts
- `getPostBySlug(slug)` - Individual post data
- `getPostBlocks(pageId)` - Post content as Markdown
- `getPostsByCategory(category, limit?)` - Category-filtered posts

### Data Flow

1. **Static Site Generation (SSG)**: Posts are pre-rendered at build time using `generateStaticParams()`
2. **Content Pipeline**: Notion blocks → Markdown (notion-to-md) → HTML (react-markdown with syntax highlighting)
3. **Type Safety**: All Notion responses are strongly typed via `NotionPageProperties` interface
4. **Error Handling**: Centralized error handling with `AppError` class and `ErrorBoundary` component

### Key Design Patterns

**Component Organization:**
- Shared components extracted to reduce duplication (e.g., `PostCard`)
- Large components split into smaller, focused components
- Custom hooks for data fetching logic separation

**Configuration Management:**
- Constants centralized in `src/config/constants.ts`
- UI messages in `src/config/messages.ts`
- Environment variables for sensitive data

**Type Safety:**
- No `any` types allowed (use specific types or `unknown`)
- Notion API responses typed with `NotionPageProperties`
- Next.js 15 async params handling: `params: Promise<{ slug: string }>`

### Image Optimization

Configured domains in `next.config.ts`:
- `prod-files-secure.s3.us-west-2.amazonaws.com` (Notion files)
- `images.unsplash.com` (External images)
- `www.notion.so` (Notion avatars)

### Adding New shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

Components are installed to `src/components/ui/` with CSS variables for theming.

### Recent Refactoring (Completed)

The codebase recently underwent major refactoring with the following improvements:
- Component deduplication and extraction
- Type safety improvements (removed all `any` types)
- Utility functions centralization
- Large component splitting into smaller, focused components
- Custom hooks for logic separation
- Configuration and message centralization
- Error handling system implementation

See `docs/REFACTORING.md` for detailed refactoring guidelines and patterns.