# AGENTS.md

IMPORTANT: This project uses bd (beads) for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods. Full Beads/bd rules are in `Beads.md`.

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common commands

Package manager is pnpm (see `package.json#packageManager`).

### Install

- `pnpm install`

### Run locally

- `pnpm dev` (Vite dev server)
- `pnpm build`
- `pnpm preview` (serves the built site)

### Typecheck

- `pnpm check`
- `pnpm check:watch`

### Lint / format

- `pnpm lint` (Prettier check + ESLint)
- `pnpm format` (Prettier write)

### Tests

- `pnpm test` (runs integration then unit)
- `pnpm test:unit` (Vitest)
- `pnpm test:integration` (Playwright; uses `npm run build && npm run preview` via `playwright.config.ts`)

Run a single unit test:

- `pnpm vitest src/index.test.ts`
- `pnpm vitest -t "<test name substring>"`

Run a single Playwright test:

- `pnpm playwright test tests/<file>.spec.ts`
- `pnpm playwright test -g "<test name substring>"`

### Content fetch (Vercel/build)

- `pnpm vercel-build`
  - Runs `scripts/fetch-content.sh` then `vite build`.

`scripts/fetch-content.sh` behavior:

- If `GITHUB_TOKEN` is set, it clones a private content repo into `content/` and then removes `content/.git`.
- If `GITHUB_TOKEN` is not set, it expects `content/` to already exist (typical local dev).

## Architecture (big picture)

This is a SvelteKit app (Svelte 5) built with Vite.

### Routing and page composition

- `src/routes/` contains the actual routes.
  - `src/routes/(landing-pages)/` groups the main “site pages” (about, studio, blog, etc.).
  - Many content-heavy pages are **prerendered** at build time via `export const prerender = true` in `+page.server.ts`.
- Page-level layout glue lives in `src/routes/+layout.svelte` and route-group layouts like `src/routes/(landing-pages)/+layout.svelte`.
- Most “page body” components are in `src/lib/subpages/` and then composed by the route components.

### Two content sources: local markdown vs Notion

The site pulls content from two different systems depending on the area:

1. Local, repo-fetched markdown content (build-time)

- The `content/` directory is expected to exist at build time.
- Loaders live in `src/lib/content/`:
  - `src/lib/content/blog.ts` reads `content/blog/posts.json` and `content/blog/<slug>.md`.
  - `src/lib/content/poems.ts` reads `content/poems/sections.json` and `content/poems/*.md`.
  - `src/lib/content/postcards.ts` reads `content/postcards/metadata.json` and `content/postcards/<slug>.md`.
- These loaders parse simple YAML-like frontmatter and return typed objects.
- Several loaders also provide `transform*ToNotionFormat(...)` helpers: route code and/or components were originally written against Notion’s response shapes, and these helpers keep the UI compatible while sourcing from markdown.

2. Notion-backed data sources (runtime + ISR)

- Notion wrapper code is under `src/lib/notion/` (see `src/lib/notion/API_DOCUMENTATION.md`).
- The core client and error handling are in `src/lib/notion/api/client.ts`.
- Runtime pages query Notion in their `+page.server.ts` and usually include an ISR config:
  - Example: `src/routes/(landing-pages)/studio/+page.server.ts` (cards)
  - Example: `src/routes/(landing-pages)/studio/illustrations/+page.server.ts` (illustrations)
  - Example: `src/routes/(landing-pages)/career/vercel/+page.server.ts` (publications)

Practical implication when editing:

- If you’re changing “studio cards / illustrations / professional publications”, you’re likely touching Notion queries + the corresponding page components.
- If you’re changing “blog / poems / postcards content”, you’re likely touching the `content/` repo shape and the loaders in `src/lib/content/`.

### Revalidation / ISR

- `src/routes/api/revalidate/+server.ts` triggers background revalidation for a small allowlist of routes.
  - It sends a `HEAD` request to the target route with `x-prerender-revalidate` set to `BYPASS_TOKEN`.
- Client helpers for triggering this after page load live in `src/lib/utils/revalidation.ts`.

### mdsvex / markdown rendering

- mdsvex is enabled in `svelte.config.js` using `mdsvex.config.js` extensions.
- Content loaders currently parse frontmatter themselves (regex + simple `key: value` parsing) rather than relying on mdsvex frontmatter parsing.

### “Arcade” mini-apps

- Interactive/physics-style pages live under `src/routes/(landing-pages)/studio/arcade/...`.
- Supporting logic (input, shapes, physics params) is under `src/lib/arcade/`.

## Environment variables

See `.env.example` for local setup (and note that the codebase currently references more vars than the example file lists).

Commonly referenced variables:

- `NOTION_KEY` (required for any Notion calls)
- Notion data source IDs used by server routes:
  - `STUDIO_DB`
  - `ILLUSTRATIONS_DB`
  - `PROFESSIONAL_DB`
  - `SUBSCRIBERS_DB` (used by `src/lib/notion/api/pages.ts`)
- ISR bypass:
  - `BYPASS_TOKEN` (used by ISR config and `/api/revalidate`)

Build-time content fetching:

- `GITHUB_TOKEN` (used by `scripts/fetch-content.sh` when `content/` is not already present)

If you’re working in the `content/` subtree (fetched/embedded content), also see `content/WARP.md` for its domain-specific conventions.
