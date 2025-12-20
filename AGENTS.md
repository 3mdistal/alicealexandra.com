# Agent Guide (alicealexandra.com)

IMPORTANT: Read `Beads.md` first (task tracking rules). Use bd for ALL issue tracking; do not use markdown TODOs.

Commands (pnpm, Node >= 24.12)

- Install: `pnpm install`
- Dev: `pnpm dev`
- Typecheck: `pnpm check`
- Lint/format: `pnpm lint` ; `pnpm format`
- Build/preview: `pnpm build` ; `pnpm preview` ; Vercel: `pnpm vercel-build`
- Tests: `pnpm test` (Playwright + Vitest)
- Single unit test (Vitest): `pnpm test:unit -- src/index.test.ts` or `pnpm test:unit -- -t "name"`
- Single integration test (Playwright): `pnpm test:integration -- tests/foo.spec.ts` or `pnpm test:integration -- -g "name"`

Code Style

- Prettier: tabs, single quotes, printWidth 100, no trailing commas (`.prettierrc`).
- Imports: ESM; group/sort; prefer `import type { ... }` for types.
- TypeScript: keep `strict`; avoid `any`; handle `undefined`; no unused locals/params.
- Naming: `camelCase` vars/functions, `PascalCase` components/types; follow existing SvelteKit route conventions.
- Errors/logging: throw `Error` with context; don’t swallow; keep console output intentional.

Other rules

- Cursor/Copilot rules: none found (`.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`).
- Builder.io: consult `.builderrules` when editing Builder-related pages.
