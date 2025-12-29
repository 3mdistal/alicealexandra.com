# AGENTS.md

IMPORTANT: This project uses bd (beads) for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods. Full Beads/bd rules are in `.beads/README.md`.

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

- `pnpm test` (Vitest)

Run a single unit test:

- `pnpm vitest src/index.test.ts`
- `pnpm vitest -t "<test name substring>"`

### Content fetch (Vercel/build)

- `pnpm vercel-build`
  - Runs `scripts/fetch-content.sh` then `vite build`.

`scripts/fetch-content.sh` behavior:

- If `GITHUB_TOKEN` is set, it clones a private content repo into `content/` and then removes `content/.git`.
- If `GITHUB_TOKEN` is not set, it expects `content/` to already exist (typical local dev).
- `CONTENT_REF` env var controls which branch/tag to fetch (default: `main`).

### Coordinated content + site changes

When making changes that span both `alicealexandra.com` and `teenylilcontent`:

1. Create matching branch names in both repos (e.g., `feature/my-change`)
2. For Vercel preview deployments, set `CONTENT_REF` to match the branch name
3. In Vercel project settings, you can set `CONTENT_REF=$VERCEL_GIT_COMMIT_REF` to auto-match branch names

**Recommended Vercel setup:** Set `CONTENT_REF=$VERCEL_GIT_COMMIT_REF` once in project settings. Then:

- **Site-only changes:** Just push to `alicealexandra.com`. The build will fall back to `main` content with a warning in the build log.
- **Coordinated changes:** Create matching branch names in both repos. The build will automatically use the matching content branch.
- **Production:** Both repos merge to `main`, so production always uses `main` content.

## Architecture (big picture)

This is a SvelteKit app (Svelte 5) built with Vite.

### Routing and page composition

- `src/routes/` contains the actual routes.
  - `src/routes/(landing-pages)/` groups the main “site pages” (about, studio, blog, etc.).
  - Many content-heavy pages are **prerendered** at build time via `export const prerender = true` in `+page.server.ts`.
- Page-level layout glue lives in `src/routes/+layout.svelte` and route-group layouts like `src/routes/(landing-pages)/+layout.svelte`.
- Most “page body” components are in `src/lib/subpages/` and then composed by the route components.

### Content sources: local markdown and JSON (build-time)

All content is sourced from the private `teenylilcontent` repo (cloned to `content/` at build time):

- The `content/` directory is expected to exist at build time.
- Loaders live in `src/lib/content/`:
  - `src/lib/content/blog.ts` reads `content/blog/posts.json` and `content/blog/<slug>.md`.
  - `src/lib/content/poems.ts` reads `content/poems/sections.json` and `content/poems/*.md`.
  - `src/lib/content/postcards.ts` reads `content/postcards/metadata.json` and `content/postcards/<slug>.md`.
  - `src/lib/content/studio.ts` reads `content/studio/cards.json` and `content/studio/illustrations.json`.
  - `src/lib/content/career.ts` reads `content/career/publications.json`.
- These loaders parse frontmatter/JSON and return typed objects.
- All content-heavy pages are **prerendered** at build time.

### Notion types (historical)

The `src/lib/notion/` directory contains:

- `types/` - Type definitions like `RichTextItemResponse` still used for rich text rendering
- `components/text-macro.svelte` - Renders Notion-style rich text arrays (used by poems, studio cards, illustrations)
- `utils/blog-helpers.ts` - Helper functions for blog post rendering

The Notion API client and database operations have been removed after migrating all content to local files.

### mdsvex / markdown rendering

- mdsvex is enabled in `svelte.config.js` using `mdsvex.config.js` extensions.
- Content loaders currently parse frontmatter themselves (regex + simple `key: value` parsing) rather than relying on mdsvex frontmatter parsing.

### “Arcade” mini-apps

- Interactive/physics-style pages live under `src/routes/(landing-pages)/studio/arcade/...`.
- Supporting logic (input, shapes, physics params) is under `src/lib/arcade/`.

## Environment variables

See `.env.example` for local setup.

Commonly referenced variables:

- `GITHUB_TOKEN` (used by `scripts/fetch-content.sh` to clone the private content repo at build time)
- `CONTENT_REF` (branch/tag of `teenylilcontent` to fetch; default: `main`)

If you're working in the `content/` subtree (fetched/embedded content), also see `content/WARP.md` for its domain-specific conventions.
