# Tempo Immaterial — studio of Alice Alexandra Moore

This SvelteKit (Svelte 5) site is the public home for my studio work. The repo is here for folks curious about how the design and content systems are implemented.

While I’m not seeking code contributions, feel free to open issues for bugs or refactor ideas—I work in public to learn and share.

## Stack at a glance
- SvelteKit + Vite, pnpm-managed.
- mdsvex enabled for Markdown routes/components.
- Content lives in `content/` (cloned from a private repo during build or pre-populated locally).
- Site is mostly prerendered; dynamic bits are limited to interactive “arcade” pages and small UI flourishes.

## Local development
```bash
pnpm install
pnpm dev       # Vite dev server
pnpm build
pnpm preview
```

## Quality checks
```bash
pnpm lint      # Prettier check + ESLint
pnpm format    # Prettier write
pnpm check     # SvelteKit/TypeScript type checks
pnpm test      # Vitest
```

## Content architecture
- Blog: `content/blog/posts.json` + `content/blog/<slug>.md`
- Poems: `content/poems/sections.json` + `content/poems/*.md`
- Postcards: `content/postcards/metadata.json` + `content/postcards/<slug>.md`
- Studio cards & illustrations: `content/studio/cards.json`, `content/studio/illustrations.json`
- Career/publications: `content/career/publications.json`
Loaders in `src/lib/content/` parse these sources at build time.

## App structure highlights
- Routes: `src/routes/`, with main pages grouped under `src/routes/(landing-pages)/`.
- Shared layout glue: `src/routes/+layout.svelte` and group layouts.
- Page bodies: `src/lib/subpages/`.
- Arcade mini-apps: `src/routes/(landing-pages)/studio/arcade/...` with logic in `src/lib/arcade/`.
- Notion API code has been removed; only historical types/render helpers remain in `src/lib/notion/`.

## Build & deploy
- `pnpm vercel-build` runs content fetch (if `GITHUB_TOKEN` is set) then `vite build`. Vercel uses this script.

_Last updated 27 Dec 2025._
