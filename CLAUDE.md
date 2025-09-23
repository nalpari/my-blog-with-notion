# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Memo

- 모든 task가 끝날때에는 린트 체크, 타입 체크, 빌드 체크를 반드시 수행.
- 검증이나 테스트를 위해서 서버를 실행해야 할 경우, 3000포트를 이용. 다만 이미 사용중이라면 3000포트 서비스 중지후 사용. 그리고 마지막엔 항상 3000포트 서비스 중지.
- npm 대신 pnpm 을 사용하세요.

## Project Overview

Next.js 15 blog application using Notion as a headless CMS with Supabase for comments and authentication. Built with React 19, TypeScript, and Tailwind CSS following Linear Design System principles.

## Essential Commands

```bash
# Development
npm run dev      # Start dev server with Turbopack (http://localhost:3000)
npm run build    # Production build with SSG
npm run start    # Run production server
npm run lint     # Lint with Next.js ESLint config

# Type checking (no built-in script)
npx tsc --noEmit
```

## Architecture

### Data Flow

1. **Content Source**: Notion database → API via `@notionhq/client`
2. **Build Process**: SSG at build time for post pages
3. **Content Pipeline**: Notion blocks → Markdown (`notion-to-md`) → React components (`react-markdown`)
4. **API Layer**: `/api/posts`, `/api/tags`, `/api/comments` endpoints with cursor-based pagination
5. **Authentication**: Supabase Auth with Google OAuth
6. **Realtime**: Supabase Realtime for live comment updates

### Key Abstractions

**Notion Integration (`src/lib/notion.ts`)**

- Central hub for all Notion API interactions
- Handles data transformation from Notion to TypeScript types
- Implements tag slug-to-name caching for performance
- Functions: `getPublishedPosts()`, `getPostBySlug()`, `getPostsByTag()`, `getAllTags()`

**Supabase Integration**

- `src/lib/supabase/client.ts`: Browser client with singleton pattern
- `src/lib/supabase/server.ts`: Server client for SSR/API routes
- `src/lib/realtime/realtime-manager.ts`: WebSocket connection management
- `src/services/comments.service.ts`: Comment CRUD operations

**Type System (`src/types/`)**

- `notion.ts`: `Post`, `Category`, `Tag`, `Author` interfaces
- `supabase.ts`: Database schema types, auto-generated from Supabase
- `comment.ts`: Comment-related types and interfaces
- Strict typing throughout (no `any` types)

**Component Architecture**

- Server Components: Layout, pages, data fetching
- Client Components: Interactive features (search, filters, pagination, comments)
- Shared components in `src/components/ui/` (shadcn/ui based)
- Custom hooks in `src/hooks/` for business logic and state management

**State Management Patterns**

- Server state: React Server Components for static content
- Auth state: `AuthModalContext` for authentication modals
- Comment state: Optimistic updates with `optimistic-updates.ts`
- Cache layer: `comment-cache.ts` for performance

## Environment Configuration

Required in `.env.local`:

```bash
# Notion (required)
NOTION_TOKEN=secret_xxx           # Notion integration token
NOTION_DATABASE_ID=xxx            # Database ID from Notion URL
EXPOSE_PERSON_EMAIL=false         # Control author email exposure

# Supabase (required for comments)
NEXT_PUBLIC_SUPABASE_URL=xxx     # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx # Supabase anonymous key
```

## Database Schemas

### Notion Database

| Property    | Type          | Required | Notes                    |
| ----------- | ------------- | -------- | ------------------------ |
| title       | Title         | ✅       | Post title               |
| slug        | Text          | ✅       | URL path                 |
| excerpt     | Text          | ✅       | Summary (150 chars)      |
| coverImage  | Files & media | ❌       | Cover image              |
| status      | Select        | ✅       | Draft/Published/Archived |
| category    | Select        | ✅       | Single category          |
| tags        | Multi-select  | ❌       | Multiple tags            |
| Author      | People        | ❌       | **Capital A required**   |
| publishedAt | Date          | ✅       | Publication date         |
| readingTime | Number        | ❌       | Minutes to read          |

### Supabase Tables

**comments**

- id (uuid, primary)
- post_slug (text)
- content (text)
- user_id (uuid, references auth.users)
- parent_id (uuid, nullable, self-reference)
- created_at, updated_at (timestamps)

**profiles**

- id (uuid, references auth.users)
- display_name, avatar_url, bio (text fields)
- created_at, updated_at (timestamps)

## Key Development Patterns

### State Management

- Server state via React Server Components
- Client state with hooks (`usePosts`, `useCategories`, `useTags`, `useComments`, `useAuth`)
- URL state for filters and pagination
- Realtime state with `useRealtimeComments` for live updates

### Error Handling

- API routes return consistent error responses
- Network retry logic in `src/lib/network/retry-handler.ts`
- `ErrorBoundary` component for UI error recovery
- Toast notifications for user feedback

### Performance Optimizations

- Image optimization with Next.js Image component
- Progressive loading (priority for first 3 images)
- 30-day image caching (`minimumCacheTTL`)
- Component-level code splitting
- Tag mapping cache to reduce API calls
- Comment caching layer for optimistic updates
- Singleton pattern for Supabase client

### Authentication Flow

1. User clicks sign-in → `AuthModal` opens
2. Google OAuth redirect → `/auth/callback` route
3. Session created → User context updated
4. Protected actions check auth state

### Styling Approach

- Tailwind CSS with CSS variables for theming
- shadcn/ui components (New York style)
- Dark/light mode with `next-themes`
- Linear Design System color palette

## Common Tasks

### Adding New Features

1. Define types in appropriate file under `src/types/`
2. Add API functions in relevant service file
3. Create API route if needed in `src/app/api/`
4. Build components (prefer composition over inheritance)
5. Use existing UI components from `src/components/ui/`

### Working with Posts

- Posts are fetched at build time for SSG
- Dynamic routes use `[slug]` pattern
- Pagination uses cursor-based approach
- Search/filter happens server-side

### Working with Comments

- Comments use Supabase with optimistic updates
- Realtime subscriptions for live updates
- Nested replies support with `parent_id`
- Auth required for posting (Google OAuth)

### Modifying UI Components

- Check `src/components/ui/` for existing components
- Follow shadcn/ui patterns for consistency
- Use CVA for component variants
- Maintain dark/light mode compatibility

## Testing Approach

Currently no test suite implemented. When adding tests:

- Use React Testing Library for components
- Test API routes with integration tests
- Mock Notion API responses for unit tests
- Mock Supabase client for auth/comment tests

## Important Notes

- Always use capital 'A' for Author property in Notion
- Maintain TypeScript strict mode (no `any` types)
- Follow existing import patterns (absolute imports with `@/`)
- Preserve Linear Design System aesthetics
- Check `docs/` folder for additional documentation
- Handle Supabase connection errors gracefully
- Implement optimistic updates for better UX
