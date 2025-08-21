# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language & Communication
- 답변과 추론과정은 항상 한국어로 작성해주세요.
- 커밋 메세지는 conventional commits 형식을 따르되, 접두사(fix, feat, chore, style, test, docs, refactor)는 영어로, 내용은 한글로 작성
- 검증 과정이나 테스트 용도로 3000포트 서버를 작동한 경우 마지막에 항상 3000포트 서비스 중지

## Development Commands

```bash
# Development
npm run dev          # Start development server with Turbopack on http://localhost:3000
npm run build        # Create production build (SSG for posts)
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint for code quality checks
npx tsc --noEmit     # Run TypeScript type checking (strict mode)
npx tsc --noEmit --watch  # Watch mode for continuous type checking

# Component Management
npx shadcn@latest add [component-name]  # Add new shadcn/ui component

# Bundle Analysis (if needed)
npm run build && npx @next/bundle-analyzer  # Analyze bundle size
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
# Required
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional
EXPOSE_PERSON_EMAIL=false  # Controls Author email visibility (default: false)
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

### Data Flow & Architecture

1. **Static Site Generation (SSG)**: 
   - Posts pre-rendered at build time using `generateStaticParams()`
   - Homepage and post pages are statically generated
   - API routes handle dynamic data fetching

2. **Content Pipeline**: 
   - Notion blocks → Markdown (notion-to-md) → HTML (react-markdown)
   - Syntax highlighting with react-syntax-highlighter
   - Image optimization through Next.js Image component

3. **Type Safety**: 
   - TypeScript strict mode enabled
   - All Notion responses typed via `NotionPageProperties` interface
   - No `any` types allowed in codebase

4. **Error Handling**: 
   - Centralized with `AppError` class and `ErrorBoundary` component
   - Graceful fallbacks for missing data
   - User-friendly error messages via `src/config/messages.ts`

5. **Performance Optimizations**:
   - Image lazy loading (priority for first 3 images)
   - Component-level code splitting
   - 30-day cache TTL with stale-while-revalidate
   - Cursor-based pagination for efficient data loading

### Key Design Patterns

**Component Organization:**
- Shared components extracted to reduce duplication (e.g., `PostCard`)
- Large components split into smaller, focused components
- Custom hooks for data fetching logic separation (`usePosts`, `useCategories`)
- Client/Server component separation following Next.js 15 patterns

**State Management:**
- Local state for UI interactions (mobile menu, filters)
- URL state for pagination and search
- No global state management needed (SSG-focused)

**Configuration Management:**
- Constants centralized in `src/config/constants.ts`
- UI messages in `src/config/messages.ts` (supports i18n)
- Environment variables for sensitive data

**Type Safety:**
- No `any` types allowed (use specific types or `unknown`)
- Notion API responses typed with `NotionPageProperties`
- Next.js 15 params handling: Direct object, not Promise
- Strict null checks enabled

**Styling Patterns:**
- Tailwind CSS utility classes
- shadcn/ui components with CSS variables
- Mobile-first responsive design
- Dark/light theme support via next-themes

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

### Key Features & Implementation Notes

**Tag System:**
- Tag Cloud and Tag List views at `/tags`
- Tag-filtered posts at `/tags/[slug]`
- Tag slug-to-name caching for performance
- Tags aggregation optimized (~50-70% performance improvement)

**Author System:**
- Author information display with avatar and name
- Email exposure controlled via `EXPOSE_PERSON_EMAIL` env variable
- Notion People property must be named "Author" (capital A)

**Image Optimization:**
- Custom utilities in `src/lib/image-utils.ts`
- Responsive sizes: card (33vw), hero (100vw), full (80vw)
- 30-day cache TTL with stale-while-revalidate
- Vercel deployment: Let Next.js handle optimization (no URL manipulation)

**UI/UX Features:**
- Mobile responsive navigation with hamburger menu
- Page transition progress bar
- Scroll to top button
- Hover effects and smooth transitions
- WCAG 2.1 AA accessibility compliance

### Common Issues & Solutions

**Author Data Not Retrieved:**
- Ensure Notion property is named "Author" (capital A), not "author"
- The API uses case-sensitive property names

**DOM Nesting Errors:**
- Avoid nesting interactive elements (Links, Buttons)
- PostCard component has been refactored to prevent these issues

**TypeScript Errors:**
- Next.js 15: params are NOT Promises, use direct object access
- Handle undefined/null cases explicitly
- Use specific types instead of `any`

**Tag Filtering Issues:**
- Tags use slug in URL but Notion expects name
- Solution: slug-to-name mapping cache implemented

**Image 502 Errors on Vercel:**
- Don't manipulate Notion image URLs
- Let Next.js Image component handle optimization

**Performance Issues:**
- Use cursor-based pagination, not offset
- Implement proper caching strategies
- Optimize tag aggregation queries

### Testing & Validation

When making changes:
1. Run `npm run lint` to check code quality
2. Run `npx tsc --noEmit` to verify TypeScript types
3. Test mobile responsiveness (hamburger menu, touch targets)
4. Verify tag filtering works with Korean and English tags
5. Check image loading performance (priority vs lazy)
6. Ensure accessibility (keyboard navigation, aria labels)