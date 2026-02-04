# Tempo Immaterial — studio of Alice Alexandra Moore

This SvelteKit (Svelte 5) site is the public home for my studio work. I keep the repo open for folks curious about how the design and content systems are built. I'm not looking for contributions, but I do appreciate issues for bugs or refactor ideas.

## Overview

Tempo Immaterial is a personal portfolio/studio: writing, art, experiments, and interactive pieces. The site is mostly prerendered static output, with a few interactive "arcade" pages and UI flourishes layered on top.

## Architecture invariants

- Content lives in a private `teenylilcontent` repo and is fetched at build time into `content/`.
- Content-heavy pages are prerendered; there are no runtime CMS/API calls for blog/poems/postcards/studio/career.
- Loaders in `src/lib/content/` parse markdown/JSON into typed data.
- Notion code is legacy-only: types and render helpers, no API client/networking.

## Where things live

- `scripts/fetch-content.sh` and `pnpm vercel-build`: build-time content fetch and filesystem setup (imperative shell).
- `scripts/upload-images.sh`: scan/download/upload ImageKit assets to R2 and emit a URL mapping.
- `scripts/rewrite-image-urls.mjs`: manual mapping-driven URL rewrite tool (run after verification).
- `src/lib/content/*`: parsing/typing for markdown and JSON content (functional-ish core).
- `src/routes/**/+page.server.ts`: orchestration + prerender configuration.
- `src/lib/notion/*`: legacy render helpers and types.

## Key features

- Prerendered content sections across blog, poems, postcards, studio, and career.
- A tabbed News page for studio + site updates.
- Interactive arcade mini-apps for playful experiments.

## Philosophy

This site is always evolving. It's a place to tinker, learn in public, and share what I'm making. Think of this repo as a reference for how the site works, not a reusable product.

## Docs pointers

- `AGENTS.md`: operational workflow and commands for repo agents.
- `docs/product/CONTENT_MANAGEMENT.md`: content pipeline details and ownership boundaries.
