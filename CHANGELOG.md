## 12 Dec 2025

**Features**
- News page refresh: added a tabbed `/news` layout (Studio + Site updates, with placeholders for About/Career/Blog).
- Added site update summaries on `/news`, parsed automatically from `CHANGELOG.md`.

**Enhancements**
- Added action labels for Studio updates (`Added`/`Edited`/`Removed`) and improved styling for tabs/entries.
- Synced `/news` tab + filter state to URL params for shareable, persistent views.
- Improved changelog/news rendering: inline code support, preformatted code styling, and safer HTML escaping in summaries.

**Refactors**
- Standardized `CHANGELOG.md` headings to date-only labels (no version headings); updated changelog summary parsing accordingly.
- Refactored Studio news entries structure for maintainability (segments/links) and expanded content coverage.

## 11 Dec 2025

**Features**
- Migrated HFC poems from Notion to local markdown content loaded at build time. (#23)
- Migrated blog from Notion to static markdown (including `posts.json` listing metadata). (#24)
- Migrated postcards to static markdown and updated related components/loaders. (#25)

**Enhancements**
- Added build-time private content fetch for Vercel via `scripts/fetch-content.sh` and `vercel-build`.
- Added `docs/NOTION_TO_LOCAL_MIGRATION.md` with a full migration blueprint.
- Updated `@notionhq/client` to v5.3.0.

**Refactors**
- Switched content routes to full static prerendering: load all content at build time (no runtime Notion fetches).
- Added build-time content loaders under `src/lib/content/` for blog/poems/postcards.
- Updated poem IDs/slugs to derive from filenames; hardened frontmatter parsing for missing metadata.

**Patches**
- Improved blog migration markdown output (notably list formatting).
- Styling fixes for callouts, dark mode italics, and strong text weight.
- Improved error handling for postcards metadata loading; minor CSS color consistency tweak.

**Breaking changes**
- Blog/poems/postcards content is now expected to be available at build time (Vercel builds can fetch content via `GITHUB_TOKEN`).

## 12 Sep 2025

**Features**
- New career route linked from the homepage.
- New career pages: `/career/vercel` (Vercel work and publications) and `/career/builderio` (Builder.io projects).

**Enhancements**
- Content/IA update: archived the legacy commissions page and assets; added a documented archive at `archived/commissions-page-backup/`.
- Updated homepage/section content and asset paths to use technotes imagery.

**Refactors**
- Notion API migration to v5 conventions: `database_id` → `data_source_id`; added `DataSourceQueryParameters` and updated all Notion queries/parents to use `type: 'data_source_id'`.
- Removed commissions feature integration across the app (routes, API wrappers, docs) and renamed references to career/technotes where applicable.

**Patches**
- Updated `clip-path`/SVG IDs (commissions → career) and fixed internal links/paths after the asset move.
- Minor typography/spacing tweaks on homepage sections and titles; adjusted desktop section positioning.

**Breaking changes**
- Commissions backend removed; `COMMISSIONS_DB` is no longer used.
- Notion wrapper API types and function signatures changed with the v5 migration (`database_id` → `data_source_id`). Update any custom consumers accordingly.

## 11 Aug 2025

**Enhancements**
- New interactive postcard gallery with some fun animations and even better stories.
- Enhanced arcade game with variable jump height and physics parameters panel. (Experimental character controller.)
- In-progress modal navigation system for half-page navigations.

**Refactors**
- Replaced manual revalidation with utility functions for cleaner codebase.
- Blog CSS variables now use media queries for better responsive design.
- Body background replaced with page-specific CSS classes for better organization.
- Updated subpage layout and image handling for consistency.

**Patches**
- Added blog header component and updated package manager for better development workflow.
- White text color overrides added for blog listing page readability.
- Code formatting standardized and TypeScript type safety improvements.
- Fixed modal scroll and resize behavior across different screen sizes.

## 20 Jan 2025

**Minor**
- Tailwind stripped out. Fuck it—we're making a design system. Eventually. But this was the first step towards that.
- News section created. More to look forward to here.

**Patches**
- Illustrations gallery given a facelift.
- Updated Svelte and other packages to latest 2025 builds.
- Switch socials from Twitter to Bluesky and updated the little squirrel's mug. All is right with the world.
- OG image meta tags now support Notion file properties.

**Bugfixes**
- Notion fetches for blogs were failing with ISR revalidation. Patched for now, but will refactor to webhook-based revalidation.

## 27 Feb 2024

**Refactors**
- Moved application into a monorepo alongside some other projects.
- Internal Notion fetching wasn't super typed, but now it is.

**Bugfixes**
- There was an edge case where you could hit a `404` by trying to visit a blog, which happened if you hard refreshed the homepage and then navigated to the blog + an article. This is fixed.

**Goals from Last Changelog**
- SvelteKit -> Next.js (cancelled). After playing with React and Next.js quite a bit, I decided I like the semantics and native performance of SvelteKit more than I like some of the conveniences of Next.js, like component-level data/caching and font optimization. I'll continue to be on the lookout for how to optimize my own workflow within SvelteKit, especially with 5.0 launching soon.

**Adjusted Upcoming Goals**
- Upgrade to SvelteKit 2.0 and prepare for Svelte 5.0
- Monorepo foundations improved
- Design system foundations improved
- Increased type safety across the application
- Test suite begun
- Fix CLS on homepage and subpages for better Core Web Vitals.
- Use SvelteKit 2 image optimization.

## 21 Nov 2023

**Honestly, this release is just a lot of random shit I've been working on.**

**Features**
- New studio homepage! (`/studio`)
  
- Lots of projects coming here, lots of new links. Highly recommend checking it out to see what's coming, creatively speaking.
- New poems page! (`/studio/hfc`)
- New illustrations page! (`/studio/illustrations`)
- New arcade page! (`/studio/arcade`) (But let's be real, this is just a weird place where _I'm_ playing and learning HTML canvas.)
- Vercel Analytics added for shallow info (Basically number of requests coming in for which pages. Nothing too user-tracky.)
