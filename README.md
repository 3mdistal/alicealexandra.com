# Tempo Immaterial — studio of Alice Alexandra Moore

This SvelteKit (Svelte 5) site is the public home for my studio work. I keep the repo open for folks curious about how the design and content systems are built. I'm not looking for contributions, but I do appreciate issues for bugs or refactor ideas.

## Overview

Tempo Immaterial is a personal portfolio/studio for writing, art, experiments, and interactive pieces. The site is mostly prerendered static output, with a few interactive "arcade" pages and UI flourishes layered on top.

## Architecture

- Content lives in a private `teenylilcontent` repo and is fetched at build time into `content/` via `scripts/fetch-content.sh`.
- Build-time fetch selects `VERCEL_GIT_COMMIT_REF` (if present), then `CONTENT_REF`, then `main`, and removes `content/.git` after cloning.
- Loaders in `src/lib/content/` parse markdown/JSON for blog, poems, postcards, studio cards/illustrations, and career publications.
- Content-heavy pages are prerendered; there are no runtime CMS/API calls for core sections.
- Notion API code is removed; only historical types/render helpers remain in `src/lib/notion/`.

## Key Features

- A tabbed News page for studio + site updates.
- Career routes like `/career/vercel` and `/career/builderio`.
- Individual poem routes under `/studio/hfc/[slug]`.
- Interactive arcade mini-apps for playful experiments.

## Notable Implementation Decisions

- Built on Svelte 5 (runes) with strict TypeScript settings.
- Shared prose styling system (no Tailwind).
- Syntax highlighting via `highlight.js` for blog posts.
- Social links are Bluesky-first (no Twitter-specific integration).

## Philosophy

This site is always evolving. It's a place to tinker, learn in public, and share what I'm making. Think of this repo as a reference for how the site works, not a reusable product.

## Further Reading

- `docs/product/vision.md`: the product vision and experience principles.
- `docs/product/CONTENT_MANAGEMENT.md`: the content pipeline and content repo structure.
