# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

- 답변과 추론과정은 항상 한국어로 작성해주세요.

## Development Commands

```bash
npm run dev          # Start development server with Turbopack on http://localhost:3000
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint for code quality checks
```

## Architecture Overview

This is a Next.js 15 application using the App Router architecture with a Linear.app-inspired design system.

### Core Technologies

- **Next.js 15.4.5** with App Router and Turbopack
- **React 19.1.0** with TypeScript
- **Tailwind CSS** with custom Linear design system colors
- **shadcn/ui** components (New York style, CSS variables)

### Project Structure

The application follows Next.js App Router conventions:

- `src/app/` - App Router pages and layouts
- `src/components/ui/` - shadcn/ui components
- `src/lib/utils.ts` - Utility functions including `cn()` for className merging

### Design System

The project implements a Linear.app-inspired design system with:

- Custom CSS variables defined in `src/app/globals.css`
- Light/dark mode support via CSS variables
- Tailwind configuration extends these variables for consistent theming
- Color palette includes primary, secondary, muted, accent (blue, green, orange, red, yellow, indigo)

### Component Architecture

**shadcn/ui Integration:**

- Components are stored in `src/components/ui/`
- Configuration in `components.json` specifies New York style with CSS variables
- Uses Radix UI primitives for accessibility
- Components use `class-variance-authority` (cva) for variant management

**Key Components:**

- `Button` - Multiple variants (default, destructive, outline, secondary, ghost, link)
- `Card` - Container with CardHeader, CardTitle, CardDescription, CardContent
- `Input` - Form input with consistent styling

### Styling Approach

1. **Tailwind CSS** for utility-first styling
2. **CSS Variables** for theming (defined in `:root` and `.dark`)
3. **cn() utility** for conditional className merging (from `@/lib/utils`)
4. **Container queries** with responsive breakpoints configured in Tailwind

### Import Aliases

TypeScript path aliases configured:

- `@/*` → `./src/*`
- `@/components` → UI components
- `@/lib` → Utilities and helpers

### Development Considerations

When modifying the codebase:

1. Use existing shadcn/ui components where possible
2. Follow the established color variable pattern for theming
3. Maintain responsive design with Tailwind's breakpoint system
4. Components should support both light and dark modes via CSS variables

### Adding New shadcn/ui Components

Use the shadcn CLI to add components:

```bash
npx shadcn@latest add [component-name]
```

This will automatically:

- Install required dependencies
- Add the component to `src/components/ui/`
- Maintain consistent styling with the existing design system
