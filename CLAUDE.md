# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

- 답변과 추론과정은 항상 한국어로 작성해주세요.
- 커밋 메세지는 항상 fix, feat, chore, style, test, docs, refactor 등 접두사는 영어로 하고, 나머지 커밋 내용은 한글로 작성해줘.
- 검증 과정이나 테스트 용도로 3000포트 서버를 작동한 경우 마지막에 항상 3000포트 서비스 중지해줘.

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
│   ├── posts/[slug]/      # Dynamic post pages with SSG
│   └── tags/[slug]/       # Tag-filtered posts pages
├── components/
│   ├── posts/             # Post-related components (Grid, Filters, Pagination, Loading)
│   ├── tags/              # Tag components (TagCloud, TagList)
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
│   ├── image-utils.ts    # Image optimization utilities
│   ├── word-count.ts     # Reading time calculation
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
- `Author` (People): Post author - **Note: Capital 'A' in property name**
- `publishedAt` (Date): Publication date
- `readingTime` (Number): Estimated reading time in minutes

**Key API Functions** in `src/lib/notion.ts`:

- `getPublishedPosts(limit, cursor?, search?, category?)` - Paginated posts with filtering
- `getLatestPosts()` - Homepage featured posts
- `getPostBySlug(slug)` - Individual post data
- `getPostBlocks(pageId)` - Post content as Markdown
- `getPostsByCategory(category, limit?)` - Category-filtered posts
- `getAllTags()` - All tags with usage count
- `getPostsByTag(tagName, limit?, cursor?)` - Tag-filtered posts

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
- `s3.us-west-2.amazonaws.com` (Notion S3)
- `images.unsplash.com` (External images)
- `www.notion.so` (Notion avatars)
- `lh3.googleusercontent.com` (Google profile images)

**Caching Strategy:**

- 30-day minimum cache TTL
- WebP/AVIF format support
- Blur placeholder for improved UX
- Priority loading for first 3 images

### Adding New shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

Components are installed to `src/components/ui/` with CSS variables for theming.

### Recent Features

**Tag System:**

- Tag Cloud and Tag List views at `/tags`
- Tag-filtered posts at `/tags/[slug]`
- Clickable tags throughout the UI

**Author System:**

- Author information display with avatar and email
- Notion People property integration (property name must be "Author" with capital A)

**Image Optimization:**

- Custom image utilities in `src/lib/image-utils.ts`
- Automatic optimization for Notion and Unsplash images
- Responsive image sizing based on viewport

### Common Issues & Solutions

**Author Data Not Retrieved:**

- Ensure Notion property is named "Author" (capital A), not "author"
- The API uses case-sensitive property names

**DOM Nesting Errors:**

- Avoid nesting interactive elements (Links, Buttons)
- PostCard component has been refactored to prevent these issues

**TypeScript Strict Mode:**

- All variables must be properly typed
- Use specific types instead of `any`
- Handle undefined/null cases explicitly
