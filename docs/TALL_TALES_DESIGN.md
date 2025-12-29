# Tall Tales: Design & Implementation Plan

> A new section of `/studio` for immersive, long-form fiction with rich theming, scroll effects, and ambient audio.

**Status**: Planning  
**Blocked by**: `alicealexandra.com-qrq` (configurable content ref for safe prod testing)  
**Source**: [Tall Tales design brainstorm](obsidian://open?vault=teenylilthoughts&file=Reflections%2FIdeas%2FTall%20Tales%20design%20brainstorm) (Obsidian)

---

## Overview

Tall Tales is a dedicated presentation layer for long-form fiction that goes beyond simple prose rendering. Each story can be divided into **sections** with individual theming (background images, colors, scroll behavior) to create an immersive reading experience. The first pilot story is "The Goat Hunters," currently living in `/studio/postcards`.

### Goals

1. **Immersive story reader** with per-section theming and scroll effects
2. **Accordion-style landing page** at `/studio/tall-tales`
3. **AI-assisted imagery** with stylized stock photos filtered per-story mood
4. **Ambient audio** (Soundcloud embeds initially, custom compositions later)

---

## Phase 1: Story Reader (Priority)

The story reader is the core experience. If it doesn't work well, the landing page is moot.

### 1.1 Content Schema (teenylilcontent)

Create `content/tall-tales/` directory with:

```
tall-tales/
  metadata.json           # Index of all stories (title, slug, description, coverImage)
  the-goat-hunters.md     # Story content with enhanced frontmatter
  factory.md
  ...
```

#### Frontmatter Schema (`tall-tale-frontmatter.schema.json`)

```json
{
	"$schema": "https://json-schema.org/draft/2020-12/schema",
	"title": "Tall Tale Frontmatter",
	"type": "object",
	"required": ["title", "slug", "description", "coverImage", "lastEditedTime"],
	"properties": {
		"title": { "type": "string" },
		"slug": { "type": "string", "pattern": "^[a-z0-9-]+$" },
		"description": { "type": "string" },
		"coverImage": { "type": "string", "description": "URL for landing page card" },
		"lastEditedTime": { "type": "string", "format": "date-time" },
		"audio": {
			"type": "object",
			"properties": {
				"src": { "type": "string", "description": "Soundcloud embed URL or audio file" },
				"loop": { "type": "boolean", "default": true }
			}
		},
		"sectionDivider": {
			"type": "string",
			"enum": ["h2", "hr", "custom"],
			"default": "hr",
			"description": "What markdown element splits sections"
		},
		"defaultTheme": {
			"$ref": "#/$defs/sectionTheme",
			"description": "Fallback theme for sections without explicit config"
		},
		"sections": {
			"type": "array",
			"items": { "$ref": "#/$defs/sectionConfig" },
			"description": "Per-section overrides (matched by index)"
		}
	},
	"$defs": {
		"sectionTheme": {
			"type": "object",
			"properties": {
				"backgroundImage": { "type": "string" },
				"backgroundImageOpacity": { "type": "number", "minimum": 0, "maximum": 1 },
				"backgroundColor": { "type": "string" },
				"overlayColor": { "type": "string", "description": "Color filter over image" },
				"textColor": { "type": "string" },
				"fontFamily": { "type": "string" }
			}
		},
		"sectionConfig": {
			"type": "object",
			"properties": {
				"theme": { "$ref": "#/$defs/sectionTheme" },
				"scrollBehavior": {
					"type": "string",
					"enum": ["normal", "fixed", "parallax", "slideshow"],
					"default": "normal"
				},
				"transitionDirection": {
					"type": "string",
					"enum": ["vertical", "horizontal"],
					"default": "vertical"
				},
				"audio": {
					"type": "object",
					"properties": {
						"src": { "type": "string" },
						"crossfadeDuration": { "type": "number", "default": 2000 }
					}
				}
			}
		}
	}
}
```

### 1.2 Content Loader (alicealexandra.com)

Create `src/lib/content/tall-tales.ts`:

```typescript
// Similar pattern to postcards.ts
// - loadTallTalesMeta(): Promise<TallTaleMeta[]>
// - loadTallTaleBySlug(slug: string): Promise<TallTale | null>
// - parseSections(content: string, divider: 'h2' | 'hr' | 'custom'): Section[]
```

Key addition: **section parsing** that splits the markdown body based on `sectionDivider` and associates each chunk with its config from `frontmatter.sections[index]`.

### 1.3 Routes

```
src/routes/(landing-pages)/studio/tall-tales/
  +page.server.ts      # Load metadata for landing
  +page.svelte         # Accordion landing (Phase 2)
  [slug]/
    +page.server.ts    # Load full story + sections
    +page.svelte       # Story reader
```

### 1.4 Story Reader Component (`[slug]/+page.svelte`)

#### Section Rendering

Each section is wrapped in a container that applies:

- **Background**: `background-image`, `background-color`, overlay via `::before` pseudo-element
- **Scroll behavior**: CSS `background-attachment: fixed` for parallax, or `scroll-snap` for slideshow
- **Text styling**: `color`, `font-family` from theme

```svelte
{#each sections as section, i}
	<section
		class="tall-tale-section"
		class:parallax={section.scrollBehavior === 'parallax'}
		class:fixed={section.scrollBehavior === 'fixed'}
		style:--bg-image="url({section.theme.backgroundImage})"
		style:--bg-opacity={section.theme.backgroundImageOpacity}
		style:--overlay-color={section.theme.overlayColor}
		style:--text-color={section.theme.textColor}
	>
		<div class="section-content prose">
			{@html section.htmlContent}
		</div>
	</section>
{/each}
```

#### CSS-First Scroll Effects

Prefer native CSS over GSAP where possible:

```css
.tall-tale-section {
	position: relative;
	padding: 4rem 2rem;
	min-height: 100vh;
	color: var(--text-color, #fff);
}

.tall-tale-section::before {
	position: absolute;
	opacity: var(--bg-opacity, 0.6);
	z-index: -2;
	inset: 0;
	background-image: var(--bg-image);
	background-position: center;
	background-size: cover;
	content: '';
}

.tall-tale-section::after {
	position: absolute;
	z-index: -1;
	mix-blend-mode: multiply;
	inset: 0;
	background-color: var(--overlay-color, transparent);
	content: '';
}

/* Parallax via CSS */
.tall-tale-section.parallax::before {
	background-attachment: fixed;
}

/* Fixed background (no scroll) */
.tall-tale-section.fixed::before {
	position: fixed;
}

/* Slideshow snap */
.tall-tale-wrapper.slideshow {
	height: 100vh;
	overflow-y: scroll;
	scroll-snap-type: y mandatory;
}

.tall-tale-wrapper.slideshow .tall-tale-section {
	height: 100vh;
	scroll-snap-align: start;
}
```

#### When to Use GSAP

Fall back to GSAP ScrollTrigger only for:

1. **Horizontal scroll sections**: CSS `scroll-snap-type: x` is limited; GSAP provides smoother horizontal-in-vertical experiences
2. **Complex choreographed animations**: e.g., elements animating in sequence as you scroll
3. **Cross-section transitions**: Smooth background crossfades between sections

### 1.5 Audio Player

Simple global audio player component:

```svelte
<!-- AudioPlayer.svelte -->
<script lang="ts">
	let { src, loop = true } = $props();
	let audio: HTMLAudioElement;
	let isPlaying = $state(false);

	function toggle() {
		if (isPlaying) {
			audio.pause();
		} else {
			audio.play();
		}
		isPlaying = !isPlaying;
	}
</script>

<audio bind:this={audio} {src} {loop}></audio>
<button onclick={toggle} class="audio-toggle">
	{isPlaying ? 'Pause' : 'Play'} Music
</button>
```

Future: Per-section audio with crossfade transitions.

---

## Phase 2: Landing Page (Accordion)

### Design

Vertical ribbons, each representing a story:

```
+-------+-------+-------+-------+-------+
|       |       |       |       |       |
| Goat  |Factory| Two   | Trust |Invis- |
|Hunters|       |Truths | Fund  | ible  |
|       |       |       |       |       |
+-------+-------+-------+-------+-------+
```

- **Hover**: Ribbon saturates, slight expand
- **Click**: Ribbon expands to ~80% width, shows description + "Read" button
- **Mobile**: Horizontal ribbons stacked vertically

### CSS-First Accordion

```css
.ribbon-container {
	display: flex;
	height: 100vh;
}

.ribbon {
	flex: 1;
	filter: saturate(0.7);
	transition:
		flex 0.4s ease-out,
		filter 0.3s;
	cursor: pointer;
	overflow: hidden;
}

.ribbon:hover {
	filter: saturate(1);
}

.ribbon.expanded {
	flex: 5;
}

/* Responsive: stack vertically */
@media (max-aspect-ratio: 1/1) {
	.ribbon-container {
		flex-direction: column;
	}
}
```

---

## Phase 3: Content Migration

### Stories to Move

| Story                      | Current Location    | Notes                                   |
| -------------------------- | ------------------- | --------------------------------------- |
| The Goat Hunters           | `/studio/postcards` | Pilot; uses `hr` dividers, ~12 sections |
| Factory                    | `/studio/postcards` | Uses image breaks, ~4 sections          |
| Two Truths and a Lie       | `/blog`             | TBD                                     |
| Something Like Solace      | `/blog`             | TBD                                     |
| Trust Fund Baby Goes Rogue | `/blog`             | TBD                                     |
| Invisible Solutions        | `/blog`             | TBD                                     |

### Migration Steps

1. Copy markdown to `teenylilcontent/tall-tales/`
2. Enhance frontmatter with section configs
3. Source/generate background images (AI-assisted)
4. Update `metadata.json`
5. Add redirects from old URLs (optional)

---

## Phase 4: Future Enhancements

- **Custom music per section** with instrument layering
- **Reading progress indicator**
- **"Quiet mode"** toggle (minimal UI, no controls)
- **Print-friendly stylesheet**
- **RSS feed for new stories**

---

## Technical Decisions

| Decision          | Choice                        | Rationale                                                                                      |
| ----------------- | ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Animation library | CSS-first, GSAP fallback      | CSS animations are performant and increasingly capable in 2025+; GSAP for complex choreography |
| Section divider   | Configurable per-story        | "Goat Hunters" uses `hr`, "Factory" uses images, flexibility needed                            |
| Audio             | Native `<audio>` + Soundcloud | Simple start; upgrade path to custom compositions                                              |
| Image storage     | ImageKit                      | Already used for postcards; supports transforms                                                |

---

## Open Questions

1. **Dark mode**: Should Tall Tales support dark mode, or is theming per-section sufficient?
2. **Accessibility**: How to handle motion sensitivity (`prefers-reduced-motion`)?
3. **SEO**: Full-text indexable or just landing + first section?
4. **Analytics**: Track section scroll depth?

---

## Appendix: The Goat Hunters Section Analysis

The story has **12 sections** separated by `---` (horizontal rules). A rough theming sketch:

| Section                  | Mood                 | Suggested Palette            |
| ------------------------ | -------------------- | ---------------------------- |
| 1 (Summer/goats)         | Nostalgic, warm      | Golden hour, amber overlay   |
| 2 (Night, radios)        | Intimate, tense      | Deep blue, low opacity       |
| 3 (Maddie's POV)         | Introspective        | Muted greens, forest         |
| 4 (Church/pastor)        | Conflicted           | Stained glass colors, dim    |
| 5 (Goats, heat)          | Languid, oppressive  | Saturated yellow, haze       |
| 6 (Maddie/Denton)        | Romantic, uneasy     | Warm dusk, truck cabin       |
| 7 (River, kiss)          | Pivotal, vulnerable  | Blue-green water             |
| 8 (After, confrontation) | Raw, emotional       | Stark, desaturated           |
| 9 (Denton's father)      | Grief, shock         | Cool grey, clinical          |
| 10 (Gun, rain)           | Climactic, dangerous | Storm purple, high contrast  |
| 11 (River finale)        | Cathartic, ambiguous | Pre-dawn, blood-tinted water |
| 12 (Epilogue)            | Hopeful? Unresolved  | Return to gold, softer       |
