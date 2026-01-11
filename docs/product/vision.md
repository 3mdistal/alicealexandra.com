# Vision: alicealexandra.com

alicealexandra.com is the home of Alice’s creative work.

It is a portfolio, but it’s also a studio: a place where I publish anything I make that I want people to consume—writing, art, experiments, interactive pieces, and the weird little things that don’t fit anywhere else.

This site should feel unmistakably **Alice**: quirky, queer, neurodivergent, and alive—**non‑traditional on purpose**, but still polished, usable, and respectful of the visitor’s time.

## North Star

When someone visits this site, they should:

- Quickly see what’s new / recently updated
- Understand who Alice is (voice, taste, values)
- Effortlessly explore a body of work (portfolio + studio)

If a change makes the site more “standard SaaS” but less “Alice,” it’s the wrong direction.

## Audience (and decision priority)

This site should serve all of these audiences, but when tradeoffs exist, prioritize in this order:

1. **Curious visitors + friends/fans** (primary)
2. **Creative collaborators + recruiters** (secondary)
3. **Potential clients** (tertiary)

Practically: if a choice comes down to “optimize for recruiters” vs “optimize for the people who actually want to live in this world,” lead friends/fans.

## Product pillars

### 1) A living studio + portfolio

- The site is an archive _and_ a feed: people can browse the past and immediately see what’s current.
- Publishing is celebratory, not transactional.
- The portfolio should feel expansive (many mediums), but still navigable.

### 2) Weird, but never annoying

Weirdness is a feature. Annoyance is a bug.

- Interactions feel **snappy** and responsive.
- Motion is used as a cue and a vibe-setter, not as friction.
- Surprises are allowed, but should be occasional, delightful, and never disorienting.
- Navigation stays discoverable and consistent even when visuals are unconventional.

### 3) Exemplary accessibility (non-negotiable)

This site should be an exemplar of accessibility.

- Respect `prefers-reduced-motion` and avoid mandatory heavy motion.
- Full keyboard navigation with clear focus states.
- Semantic HTML and screen reader support.
- Readable typography (contrast, line length, spacing, responsive sizing).
- No autoplay audio, ever—audio is always explicit, user-controlled.

If a “cool” interaction compromises accessibility, it gets redesigned or removed.

### 4) Polished consistency via a design system

The site’s weird identity should be expressed through a **cohesive system**, not one-off hacks.

- Establish shared tokens: type scale, spacing, color roles, motion durations/easings.
- Build reusable components for repeated patterns (navigation, cards, lists, headings, buttons).
- Bring older/uglier sections up to the current standard.

### 5) Privacy-respecting, banner-free analytics

Analytics are desirable, but:

- No cookie banner.
- Prefer **cookieless, privacy-first** analytics (no tracking cookies, no cross-site profiling).

If analytics requires a consent banner or invasive tracking, we don’t do it here.

### 6) Project incubation (and graduation)

This site is an incubation chamber for projects.

- Projects can start here.
- If a project outgrows the site, it can graduate to its own repo/site.
- The main site should link out clearly and proudly when that happens.

Do not contort alicealexandra.com into a sprawling platform when a project should graduate.

## Experience principles (how it should feel)

- **Immediate vibe**: the first impression signals “this isn’t a template.”
- **Low friction**: people can always find their way around.
- **Fast feedback**: clicks, hovers, scroll effects respond quickly.
- **Careful delight**: motion, sound, and visuals feel intentional—not noisy.
- **Calm control**: reduced-motion and readability are first-class.

## Content principles

- “What’s new” is a first-class feature; the site should clearly surface recent publishing and updates.
- The site’s writing voice can be **warm, candid, playful, and sometimes poetic**—but clarity still wins.
- Content should be easy to maintain and safe to publish (see `docs/product/CONTENT_MANAGEMENT.md`).

## Near-term focus (next ~3 months)

In roughly this order:

- Design system foundation (tokens + core components)
- Navigation quality-of-life improvements (consistent, predictable, discoverable)
- Stronger content surfacing (news/recent updates; better discovery flows)
- Visual refresh of older/stubbed/ugly sections
- Performance improvements that preserve the vibe
- Build out **Tall Tales** as a new immersive studio section (see `docs/product/TALL_TALES_DESIGN.md`)

## Explicit non-goals (for now)

- Authentication, accounts, gated content
- Paywalls / subscriptions inside this repo/site
- Dark-pattern growth mechanics (popups, forced funnels, urgency spam)
- A corporate “neutral” redesign
- Analytics that require a cookie consent banner

Monetization (if it ever happens) is more likely to live in separate projects/repos; this site remains free.

## Decision checklist (for PRs and reviews)

A change is aligned if it:

- Makes it easier to see what’s new / explore the work
- Preserves (or strengthens) the site’s quirky identity _without_ adding friction
- Improves consistency (design system adoption) rather than adding new one-off styles
- Improves accessibility, or at minimum does not regress it
- Keeps interactions fast and respectful of attention
- Respects privacy (no banner-requiring tracking)

If you’re unsure, optimize for: **accessible + polished + unmistakably Alice**.
