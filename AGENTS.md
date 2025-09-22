# Repository Guidelines

## Note
- 모든 답변과 추론과정은 한국어로 해주세요.
- 검증 및 테스트 과정에서 서버 실행할 경우 3000 포트로 진행하고 태스크 종료시 서버도 반드시 종료해주세요.
- 3000포트를 사용중이라면 중지하고 사용하세요.

## Project Structure & Module Organization
The Next.js 15 app lives in `src/app` for routing, server components, and layouts. Interactive UI sits in `src/components` (shadcn primitives in `ui`, blog features in `posts`). Domain logic is in `src/lib`, Supabase/Notion wrappers in `src/services`, contexts in `src/contexts`, hooks in `src/hooks`, and types in `src/types`. Static assets live in `public/`, Supabase SQL and policies in `supabase/`, and architecture notes in `docs/`—skim the relevant memo first.

## Build, Test, and Development Commands
Install dependencies with `pnpm install` (lockfile is `pnpm-lock.yaml`; use `npm install` only if required). Key scripts:
- `pnpm dev`: Turbopack dev server on `http://localhost:3000`.
- `pnpm build`: Production build; generates SSG output.
- `pnpm start`: Runs the compiled build for smoke testing.
- `pnpm lint`: ESLint via `next lint`; fix issues before pushing.
- `pnpm exec tsc --noEmit`: Type-check without emitting files.

## Coding Style & Naming Conventions
Code is TypeScript-first with two-space indentation. Use path aliases (`@/…`) instead of relative climbs. Components live in `PascalCase.tsx`, hooks in `useThing.ts`, utilities in `camelCase.ts`. Keep Tailwind utilities grouped by layout → spacing → color; prefer `clsx`/`tailwind-merge` for conditionals. Run `pnpm lint --fix` rather than editing whitespace manually, and avoid `any`—extend interfaces in `src/types` when needed.

## Testing Guidelines
Automated tests are not yet wired into `package.json`; when adding features, include focused React Testing Library or integration tests alongside the module (e.g., `ComponentName.test.tsx`). Mock Notion and Supabase clients via dependency injection from `src/lib`. Until a runner lands, treat `pnpm lint` and `pnpm exec tsc --noEmit` as mandatory guards and manually verify auth, commenting, and post rendering in the browser.

## Commit & Pull Request Guidelines
Local git history is currently blocked by the host Xcode license prompt, so follow Conventional Commits (`feat:`, `fix:`, `chore:`) with <72 character subjects to stay aligned once history is accessible. Keep commits scoped to a single concern and include paired docs or config updates. Pull requests must describe the change, list verification steps (commands run, screenshots for UI), note env variables, and link tracking items. Request review once lint and type-checks pass locally.

## Configuration & Secrets
Copy `.env.local.example` if present or create `.env.local` with Notion (`NOTION_TOKEN`, `NOTION_DATABASE_ID`) and Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) values before running local builds. Never commit secrets; store shared credentials in the team vault. When altering schema or security rules under `supabase/`, document the change in `docs/` and include migration instructions in the PR body.
