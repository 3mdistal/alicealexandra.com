# Implementation Plan: Tall Tales

## Phase 1: Foundation & Content Setup
1. **Content Schema & Migration (content repo updates)**
   - Create `content/tall-tales/` directory.
   - Move `the-goat-hunters.md` and `factory.md` from `content/postcards/` to `content/tall-tales/`, and remove them from `content/postcards/metadata.json`.
   - Enhance the frontmatter of these markdown files with the new schema (including `sections` configs with themes like `backgroundImage` (using placeholders for now), `textColor`, etc., and `sectionDivider`).
   - Create `content/tall-tales/metadata.json` to index the stories (title, slug, description, coverImage).

2. **Content Loader (`src/lib/content/tall-tales.ts`)**
   - Create a loader similar to `postcards.ts`.
   - Implement `loadTallTalesMeta()` to parse `metadata.json`.
   - Implement `loadTallTaleBySlug(slug)` to read the markdown file and parse frontmatter.
   - Implement a `parseSections()` helper to split the markdown content based on the configured `sectionDivider` (`hr` or `h2`) and map each text block to its corresponding section theme from the frontmatter.

## Phase 2: Core Reader Experience
1. **Story Reader Route & Server Data**
   - Create `src/routes/(landing-pages)/studio/tall-tales/[slug]/+page.server.ts` to fetch story data via `loadTallTaleBySlug`.

2. **Story Reader Component (`[slug]/+page.svelte`)**
   - Implement the immersive reading view.
   - Loop over the sections and wrap each in a `<section class="tall-tale-section">`.
   - Apply CSS variables dynamically (`--bg-image`, `--overlay-color`, `--text-color`, etc.) based on the section's configuration.
   - Implement native CSS scroll effects (parallax via `background-attachment: fixed` or snap scrolling) with GSAP as a fallback for complex horizontal transitions if needed.

3. **Audio Player Component**
   - Build a global/floating `<AudioPlayer>` component to play background music/ambience based on the story's frontmatter configuration.

## Phase 3: Landing Page
1. **Listing Route & Server Data**
   - Create `src/routes/(landing-pages)/studio/tall-tales/+page.server.ts` to load `loadTallTalesMeta()`.

2. **Accordion UI (`+page.svelte`)**
   - Implement the CSS-first accordion design for the landing page with vertical ribbons that expand on hover/click to reveal the story description and "Read" button.

## Phase 4: Final Polish
1. **Refinement & Testing**
   - Ensure the accordion handles mobile screens gracefully (stacking vertically).
   - Test accessibility and read-time calculations.
   - Clean up redirects or remove old URLs for the migrated stories from `/studio/postcards` if required.
