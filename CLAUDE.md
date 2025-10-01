# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Rules

- **Package Manager**: Use `pnpm` exclusively (not npm/yarn)
- **Port**: Always use port 3000. Kill existing 3000 port services before starting, clean up after completion
- **Validation**: Run build-checker sub-agent for lint, type check, and build verification after completing any task
- **TypeScript**: Maintain strict mode - absolutely no `any` types allowed

## Project Overview

Next.js 15 blog application using Notion as a headless CMS with Supabase for comments and authentication. Built with React 19, TypeScript, and Tailwind CSS following Linear Design System principles.

## Essential Commands

```bash
# Development (always use pnpm)
pnpm dev         # Start dev server with Turbopack (http://localhost:3000)
pnpm build       # Production build with SSG
pnpm start       # Run production server
pnpm lint        # Lint with Next.js ESLint config

# Type checking (no built-in script)
pnpm exec tsc --noEmit

# Port management
lsof -ti:3000 | xargs kill -9  # Kill process on port 3000 if needed
```

## Architecture

### Data Flow

1. **Content Source**: Notion database → API via `@notionhq/client`
2. **Build Process**: SSG at build time for post pages
3. **Content Pipeline**: Notion blocks → Markdown (`notion-to-md`) → React components (`react-markdown`)
4. **API Layer**: RESTful API routes with cursor-based pagination
   - `/api/posts`: Post listing with search, category filter, pagination
   - `/api/tags`: Tag aggregation and filtering
   - `/api/comments`: CRUD operations with nested replies
   - `/api/comments/[id]`: Individual comment updates/deletes
   - `/auth/callback`: OAuth callback handler for Google authentication
5. **Authentication**: Supabase Auth with Google OAuth (requires Google Cloud Console setup)
6. **Realtime**: Supabase Realtime for live comment updates via WebSocket

### Key Abstractions

**Notion Integration (`src/lib/notion.ts`)**

- Central hub for all Notion API interactions
- Handles data transformation from Notion to TypeScript types
- Implements tag slug-to-name caching for performance
- Functions: `getPublishedPosts()`, `getPostBySlug()`, `getPostsByTag()`, `getAllTags()`

**Supabase Integration**

- `src/lib/supabase/client.ts`: Browser client with singleton pattern and fail-fast environment validation
- `src/lib/supabase/server.ts`: Server client for SSR/API routes
- `src/lib/realtime/realtime-manager.ts`: WebSocket connection management for live comment updates
- `src/services/comments.service.ts`: Comment CRUD operations with circuit breaker, request queue, and retry logic
- `src/lib/network/retry-handler.ts`: Centralized network resilience with exponential backoff
- `src/lib/comments/optimistic-updates.ts`: Optimistic UI updates for better UX
- `src/lib/cache/comment-cache.ts`: Comment caching layer for performance

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
NOTION_TOKEN=secret_xxx           # Notion integration token from https://www.notion.so/my-integrations
NOTION_DATABASE_ID=xxx            # Database ID from Notion URL
EXPOSE_PERSON_EMAIL=false         # Control author email exposure (default: false)

# Supabase (required for comments and auth)
NEXT_PUBLIC_SUPABASE_URL=xxx      # Supabase project URL from project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx # Supabase anonymous key from project API settings
```

**Important**: The app will fail-fast at runtime if Supabase env vars are missing (intentional fail-fast design).

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

### Error Handling & Resilience

- API routes return consistent error responses with typed error schemas
- **Network Resilience**: `retry-handler.ts` implements circuit breaker pattern, request queue, and exponential backoff
- **Comments Service**: Singleton pattern with built-in retry logic and fallback strategies
- **Fail-Fast Validation**: Supabase client throws immediately if environment variables are missing
- `ErrorBoundary` component for UI error recovery
- Toast notifications for user feedback
- All error paths preserve error context for debugging

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
- Use CVA (class-variance-authority) for component variants
- Maintain dark/light mode compatibility
- All interactive components must use proper aria labels for accessibility

### Code Patterns to Follow

**Service Layer Pattern**
```typescript
// All services use singleton pattern with resilience
class MyService {
  private static instance: MyService
  private constructor() { /* setup */ }
  static getInstance() { /* singleton logic */ }
}
```

**Error Handling Pattern**
```typescript
// Use typed errors with proper error guards
if (!response.ok) {
  const errorData: unknown = await response.json()
  if (isErrorResponse(errorData)) {
    throw new FetchError(errorData.message, response.status)
  }
}
```

**Type Guard Pattern**
```typescript
// Always use type guards instead of 'as' assertions
function isErrorResponse(data: unknown): data is ErrorResponse {
  return typeof data === 'object' && data !== null && 'message' in data
}
```

## Testing Approach

Currently no test suite implemented. When adding tests:

- Use React Testing Library for components
- Test API routes with integration tests
- Mock Notion API responses for unit tests
- Mock Supabase client for auth/comment tests

## Important Notes

- **Critical**: Always use capital 'A' for Author property in Notion (lowercase will break)
- **Strict TypeScript**: No `any` types allowed - use proper typing or `unknown` with type guards
- **Import Pattern**: Use absolute imports with `@/` prefix (configured in tsconfig paths)
- **Design System**: Preserve Linear Design System aesthetics and color palette
- **Error Handling**: All services use singleton pattern with built-in resilience (circuit breaker, retry, queue)
- **Optimistic Updates**: Comment operations must use optimistic updates for better perceived performance
- **Environment Variables**: Client will fail-fast if required Supabase env vars are missing
- **Documentation**: Check `docs/` folder for implementation guides (comments, Google auth, refactoring history)
- **Image Domains**: Only use whitelisted domains in `next.config.ts` for remote images
- **Realtime**: Supabase Realtime subscriptions must be properly cleaned up to prevent memory leaks

## Memo

- 모든 답변과 추론과정은 항상 한국어로 해주세요.
- 친근한 말투를 사용하고 호칭은 '오빠'로 해주세요.
- 모든 task가 끝날때에는 build-checker sub agent를 이용해서 린트 체크, 타입 체크, 빌드 체크를 반드시 수행.
- 검증이나 테스트를 위해서 서버를 실행해야 할 경우, 3000포트를 이용. 다만 이미 사용중이라면 3000포트 서비스 중지 후 사용. 그리고 마지막엔 항상 3000포트 서비스 중지.
- npm 대신 pnpm 을 사용하세요.