## 0.6.0
_11 Aug 2025_

**Enhancements**
- New interactive postcard gallery with smooth GSAP animations for better user engagement.
- Added external link button to modal dialogs for improved navigation.
- Enhanced arcade game with variable jump height and physics parameters panel.
- Improved modal system with better layout, animation, and responsive behavior.

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

## 0.5.0
_20 Jan 2025_

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

## 0.4.1
_27 Feb 2024_

**Refactors**
- Moved application into a monorepo alongside some other projects.
- Internal Notion fetching wasn't super typed, but now it is.

**Bugfixes**
- There was an edge case where you could hit a 404 by trying to visit a blog, which happened if you hard refreshed the homepage and then navigated to the blog + an article. This is fixed.

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

## 0.4.0
_21 Nov 2023_

**Honestly, this release is just a lot of random shit I've been working on.**

**Features**
- New studio homepage! (/studio)
  
- Lots of projects coming here, lots of new links. Highly recommend checking it out to see what's coming, creatively speaking.
- New poems page! (/studio/hfc)
- New illustrations page! (/studio/illustrations)
- New arcade page! (/studio/arcade) (But let's be real, this is just a weird place where _I'm_ playing and learning HTML canvas.)
- Vercel Analytics added for shallow info (Basically number of requests coming in for which pages. Nothing too user-tracky.)
