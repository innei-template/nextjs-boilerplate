## Overview

This repository is a Next.js 15 + React 19 application scaffolded for production apps with Tailwind CSS v4, Radix UI, motion animations, React Query, Jotai, and a tokenized color system powered by `@pastel-palette/tailwindcss`.

This file is an AI-oriented index per the AGENTS.md specification. See the format reference at `https://agents.md/`.

## Setup & Commands

- Install dependencies: `pnpm install`
- Start dev server (Turbopack, port 4399): `pnpm dev`
- Build (production): `pnpm build`
- Analyze bundle (browser): `pnpm analyze`
- Lint & fix: `pnpm lint`
- Prepare hooks and env (auto-copies .env.template → .env if missing): `pnpm prepare`

Notes:

- Package manager: PNPM (see `packageManager` in `package.json`).
- TypeScript strict mode is enabled.
- Pre-commit hooks run ESLint and Prettier via `lint-staged`.

## Tech Stack

- Next.js 15 (App Router), React 19
- Tailwind CSS v4 with PostCSS, `@tailwindcss/typography`
- Color system: `@pastel-palette/tailwindcss` (OKLCH theme tokens)
- UI foundations: Radix UI primitives, motion (Framer Motion v12 API)
- State & data: React Query (@tanstack), Jotai
- Icons: `@egoist/tailwindcss-icons` with Iconify packs (lucide, mingcute, simple-icons)
- Notifications: `sonner`

## Project Structure

- `src/app/`
  - Next.js App Router entries (`layout.tsx`, `page.tsx`, errors, metadata). The root layout wires providers and global theme wrapper.
- `src/components/`
  - `layout/`: app and content layout primitives
  - `common/`: general-purpose wrappers (providers composer, client-only helpers)
  - `ui/`: design-system components (button, dialog, select, input, form, tooltip, hover-card, sheet, etc.)
  - `widgets/`: higher-level, app-specific UI
- `src/providers/root/`
  - Composition of cross-cutting providers: Theme, React Query, Jotai, Modal stack, Event bus, Page scroll info, Debug, Toaster. Framer features are lazy-loaded.
- `src/styles/globals.css`
  - Tailwind v4 entry, plugins, and theme tokens import from `@pastel-palette/tailwindcss`. Defines custom variants, typography, container, and scrollbar styling.
- `src/lib/`
  - Utilities such as `cn`/`cx` (Tailwind merge + clsx), DOM helpers, request, route builder, etc.
- `src/hooks/`, `src/constants/`, `src/atoms/`

Path alias: `~/*` → `./src/*` (see `tsconfig.json`).

## Providers & App Wiring

- `src/app/layout.tsx` imports `Providers` and wraps the app body. The page content is under a `<div data-theme>` wrapper.
- `src/providers/root/index.tsx` composes:
  - `ThemeProvider` (next-themes)
  - `ReactQueryProvider`
  - `JotaiStoreProvider`
  - `LazyMotion` features
  - `ModalStackProvider`, `EventProvider`, `PageScrollInfoProvider`, `DebugProvider`
  - `Toaster` (sonner)

## UI System

All UI components live under `src/components/ui/*`. They are built on Radix primitives and Tailwind, with consistent variants and tokens.

You need to use these existing components. If they don't meet your needs, you should perform an extension. Or create new components using the same UI design style with Radix.

## Design Tokens & Color System (Pastel Palette)

Tailwind v4 is configured via PostCSS in `src/styles/globals.css`. The file:

- Imports Tailwind and plugins: `@tailwindcss/typography`, `@egoist/tailwindcss-icons`, `tailwind-scrollbar`, `tailwindcss-animate`.
- Imports `@pastel-palette/tailwindcss/dist/theme-oklch.css`, which provides semantic tokens:
  - Background: `bg-background`, `bg-background-secondary`
  - Text: `text-text`, `text-text-secondary`, `text-text-tertiary`
  - Accent: `bg-accent`, `text-accent`, `outline-accent`
  - Fill/material: `bg-fill`, `bg-fill-secondary`, `bg-material-medium`, etc.
  - Borders: `border-border`
- Exposes derived CSS variables (e.g., `--color-accent-10..80`) and container/typography variables in `@theme`.

Usage guidelines:

- Prefer semantic classes over hard-coded colors:
  - Buttons and CTAs: `bg-accent text-background hover:bg-accent/90`
  - Surfaces: `bg-background` (primary), `bg-fill` (raised), `bg-material-medium` (blurred overlays)
  - Text: `text-text` (primary), `text-text-secondary` for subdued copy
  - Borders: `border-border`
- Focus styles are standardized via helpers from `~/lib/cn`:
  - `focusRing` for buttons/controls, `focusInput` and `hasErrorInput` for inputs
- Icons (Iconify via Tailwind icons) use the `i-*` syntax (e.g., `i-mingcute-down-line`).

Dark mode:

- A custom variant `dark` is defined as `@custom-variant dark (&:where([data-color-mode='dark'], [data-color-mode='dark'] *));`.
- To drive dark mode via `next-themes`, configure the provider with `attribute="data-color-mode"` or ensure your theme switcher toggles that attribute on the root element.

Tip: Keep UI color usage to tokens; avoid raw color utilities to retain theme portability.

Reference: `@ai-docs/color-system.md`

## Patterns: Store + Actions (Zustand)

Complex feature modules must follow the Store + Actions pattern:

- Keep serializable state only in a Zustand store (`store.ts`).
- Expose all business logic and side-effects through a global `*Actions` singleton.
- Components subscribe with selectors and call actions directly; components never mutate store state.

Internal docs:

- `ai-docs/store-actions-pattern.md`
- `ai-docs/discover-modal-architecture.md`

## Linting & Style

- ESLint: `eslint-config-hyoban` base with Tailwind plugin settings; see `eslint.config.mjs`.
- Prettier: `@innei/prettier` config.
- Run `pnpm lint` and ensure zero errors before committing.

## Build & Analyze

- Production build: `pnpm build`
- Browser bundle analysis: `pnpm analyze`
- The Next.js config (`next.config.ts`) enables source maps in production and Webpack plugins (code inspector, externals tuning). When `ANALYZE=true`, bundle analyzer is enabled.

## Agent Notes

- Use the `~/*` alias for imports from `src`.
- Dev server runs on port 4399 by default.
- When adding UI, reuse existing tokens and variants; prefer composition over new bespoke styles.
- For any new complex feature, set up `store.ts` + `*Actions` per the internal guides.

## Agent-Specific Guidelines

- See CLAUDE guidelines at `./CLAUDE.md` for automation and agent workflows.
- Complex feature modules (e.g., Discover modal) must follow the "Zustand store + singleton actions" pattern (state in `store.ts`, business logic in a global `*Actions` singleton, UI uses selectors and calls actions). Refer to `ai-docs/store-actions-pattern.md`.
