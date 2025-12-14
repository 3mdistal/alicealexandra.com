# WARP.md

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

1) Local, repo-fetched markdown content (build-time)
- The `content/` directory is expected to exist at build time.
- Loaders live in `src/lib/content/`:
  - `src/lib/content/blog.ts` reads `content/blog/posts.json` and `content/blog/<slug>.md`.
  - `src/lib/content/poems.ts` reads `content/poems/sections.json` and `content/poems/*.md`.
  - `src/lib/content/postcards.ts` reads `content/postcards/metadata.json` and `content/postcards/<slug>.md`.
- These loaders parse simple YAML-like frontmatter and return typed objects.
- Several loaders also provide `transform*ToNotionFormat(...)` helpers: route code and/or components were originally written against Notion’s response shapes, and these helpers keep the UI compatible while sourcing from markdown.

2) Notion-backed data sources (runtime + ISR)
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

---

## Issue Tracking with bd (beads)

**IMPORTANT**: This project uses **bd (beads)** for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods.

### Why bd?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Auto-syncs to JSONL for version control
- Agent-optimized: JSON output, ready work detection, discovered-from links
- Prevents duplicate tracking systems and confusion

### Quick Start

**Check for ready work:**
```bash
bd ready --json
```

**Create new issues:**
```bash
bd create "Issue title" -t bug|feature|task -p 0-4 --json
bd create "Issue title" -p 1 --deps discovered-from:bd-123 --json
bd create "Subtask" --parent <epic-id> --json  # Hierarchical subtask (gets ID like epic-id.1)
```

**Claim and update:**
```bash
bd update bd-42 --status in_progress --json
bd update bd-42 --priority 1 --json
```

**Complete work:**
```bash
bd close bd-42 --reason "Completed" --json
```

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `bd ready` shows unblocked issues
2. **Claim your task**: `bd update <id> --status in_progress`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `bd create "Found bug" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `bd close <id> --reason "Done"`
6. **Commit together**: Always commit the `.beads/issues.jsonl` file together with the code changes so issue state stays in sync with code state

### Auto-Sync

bd automatically syncs with git:
- Exports to `.beads/issues.jsonl` after changes (5s debounce)
- Imports from JSONL when newer (e.g., after `git pull`)
- No manual export/import needed!

### GitHub Copilot Integration

If using GitHub Copilot, also create `.github/copilot-instructions.md` for automatic instruction loading.
Run `bd onboard` to get the content, or see step 2 of the onboard instructions.

### MCP Server (Recommended)

If using Claude or MCP-compatible clients, install the beads MCP server:

```bash
pip install beads-mcp
```

Add to MCP config (e.g., `~/.config/claude/config.json`):
```json
{
  "beads": {
    "command": "beads-mcp",
    "args": []
  }
}
```

Then use `mcp__beads__*` functions instead of CLI commands.

### Managing AI-Generated Planning Documents

AI assistants often create planning and design documents during development:
- PLAN.md, IMPLEMENTATION.md, ARCHITECTURE.md
- DESIGN.md, CODEBASE_SUMMARY.md, INTEGRATION_PLAN.md
- TESTING_GUIDE.md, TECHNICAL_DESIGN.md, and similar files

**Best Practice: Use a dedicated directory for these ephemeral files**

**Recommended approach:**
- Create a `history/` directory in the project root
- Store ALL AI-generated planning/design docs in `history/`
- Keep the repository root clean and focused on permanent project files
- Only access `history/` when explicitly asked to review past planning

**Example .gitignore entry (optional):**
```
# AI planning documents (ephemeral)
history/
```

**Benefits:**
- ✅ Clean repository root
- ✅ Clear separation between ephemeral and permanent documentation
- ✅ Easy to exclude from version control if desired
- ✅ Preserves planning history for archeological research
- ✅ Reduces noise when browsing the project

### CLI Help

Run `bd <command> --help` to see all available flags for any command.
For example: `bd create --help` shows `--parent`, `--deps`, `--assignee`, etc.

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `bd ready` before asking "what should I work on?"
- ✅ Store AI planning docs in `history/` directory
- ✅ Run `bd <cmd> --help` to discover available flags
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems
- ❌ Do NOT clutter repo root with planning documents

For more details, see README.md and QUICKSTART.md.
