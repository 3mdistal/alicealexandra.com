<script lang="ts">
	import { pageState } from '$lib/stores';
	import { prefersReducedMotion } from '$lib/accessibility/prefers-reduced-motion';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	type Gsap = typeof import('gsap').gsap;

	export let name: 'about' | 'studio' | 'career' | 'blog' | 'news';
	export let transitionOutWrapper: () => void;

	let section: HTMLElement;
	let hover = true;
	let gsap: Gsap | null = null;
	let hasActivated = false;

	onMount(async () => {
		const mod = await import('gsap');
		gsap = mod.gsap;
	});

	function ease(yPos: number) {
		if (!gsap || $prefersReducedMotion) return;
		gsap.to(section, { y: yPos, ease: 'elastic.out', duration: 2 });
	}

	function animateOut() {
		if ($prefersReducedMotion || !gsap) {
			navigate();
			return;
		}

		const tl = gsap.timeline({ onComplete: navigate });
		tl.to(section, {
			y: '-50vh',
			delay: 0.25,
			ease: 'power4.in',
			duration: 0.75
		});
	}

	function lift() {
		if (hover) ease(-30);
	}

	function settle() {
		if (hover) ease(0);
	}

	function handleFocus(event: FocusEvent) {
		if ((event.currentTarget as HTMLElement).matches(':focus-visible')) lift();
	}

	function navigate() {
		goto(name);
	}

	// Plain primary clicks animate; anything else (new tab, context menu) stays native.
	function isPlainClick(event: MouseEvent) {
		return (
			event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
		);
	}

	function handleLinkClick(event: MouseEvent) {
		if (!isPlainClick(event)) return;
		event.preventDefault();
		activate();
	}

	function handleBandClick(event: MouseEvent) {
		if (!isPlainClick(event)) return;
		activate();
	}

	function activate() {
		if (hasActivated) return;
		hasActivated = true;
		pageState.set(name);
		hover = false;
		ease(0);
		animateOut();
		transitionOutWrapper();
	}
</script>

<!-- The band is a larger pointer target for the link inside it; keyboard users use the link. -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="homepage-section {name}"
	bind:this={section}
	on:mouseenter={lift}
	on:mouseleave={settle}
	on:click={handleBandClick}
	role="presentation"
>
	<a
		href={name}
		class="homepage-section-link {name}"
		on:click={handleLinkClick}
		on:focus={handleFocus}
		on:blur={settle}
	>
		{name}
	</a>
</div>

<style>
	.homepage-section {
		position: absolute;
		bottom: 0;
		cursor: pointer;
		background: var(--home-section-bg);
		width: 100%;
		height: 100%;
		color: var(--home-section-label);
	}

	.homepage-section:hover {
		filter: brightness(0.95) hue-rotate(5deg) saturate(1.5);
	}

	@media (prefers-reduced-motion: reduce) {
		.homepage-section:hover {
			filter: none;
		}
	}

	.homepage-section-link {
		display: inline-block;
		position: absolute;
		border-radius: var(--radius-pill);
		padding: 0.35rem 0.75rem;
		color: inherit;
		font-weight: 300;
		font-size: 1.125rem;
		line-height: 1.6;
		font-family: var(--font-serif);
		text-decoration: none;
	}

	/* A pill plus a ring in the page text color reads against every band in both themes. */
	.homepage-section-link:focus-visible {
		outline: var(--a11y-focus-width) solid var(--color-text);
		outline-offset: 1px;
		background: color-mix(in srgb, var(--color-surface) 88%, transparent);
		color: var(--color-text);
	}

	.homepage-section {
		&.about {
			--home-section-bg: var(--home-about-bg);
			--home-section-label: var(--home-about-label);
			clip-path: url(#about-path);
		}

		&.studio {
			--home-section-bg: var(--home-studio-bg);
			--home-section-label: var(--home-studio-label);
			clip-path: url(#studio-path-mobile);
			height: 90%;
		}

		&.career {
			--home-section-bg: var(--home-career-bg);
			--home-section-label: var(--home-career-label);
			clip-path: url(#career-path-mobile);
			height: 78%;
		}

		&.blog {
			--home-section-bg: var(--home-blog-bg);
			--home-section-label: var(--home-blog-label);
			clip-path: url(#blog-path-mobile);
			height: 68%;
		}

		&.news {
			--home-section-bg: var(--home-news-bg);
			--home-section-label: var(--home-news-label);
			clip-path: url(#news-path);
			height: 55%;
		}
	}

	.homepage-section-link.about {
		top: 10%;
		left: 33%;
	}

	.homepage-section-link.studio {
		top: 6%;
		right: 14%;
	}

	.homepage-section-link.career {
		top: 9%;
		right: 30%;
	}

	.homepage-section-link.blog {
		top: 12%;
		right: 20%;
	}

	.homepage-section-link.news {
		top: 12%;
		left: 23%;
	}

	@media (min-width: 768px) {
		.homepage-section-link {
			font-size: 1.5rem;
		}
	}

	/* Wide composition: desktops, plus landscape phones and tablets. Keep in sync with the homepage. */
	@media (min-width: 1024px), (orientation: landscape) and (min-width: 600px) {
		.homepage-section {
			&.studio {
				clip-path: url(#studio-path);
				height: 100%;
			}

			&.career {
				clip-path: url(#career-path);
				height: 82%;
			}

			&.blog {
				clip-path: url(#blog-path);
				height: 75%;
			}

			&.news {
				height: 50%;
			}
		}

		.homepage-section-link {
			font-size: clamp(1.125rem, min(2.4vw, 4.2dvh), 1.875rem);
		}

		.homepage-section-link.about {
			top: 15%;
		}

		.homepage-section-link.studio {
			top: 8%;
			right: 18%;
		}

		.homepage-section-link.career {
			right: 36%;
		}

		.homepage-section-link.blog {
			top: 22%;
		}

		/* The news band runs off the bottom of the screen; keep its label above the fold. */
		.homepage-section-link.news {
			top: min(12%, calc(15dvh - 1.6em - 0.7rem - 4px));
			left: 27%;
		}
	}

	@media (min-width: 2200px) and (min-height: 1200px) {
		.homepage-section-link {
			font-size: clamp(1.875rem, min(2.4vw, 4.2dvh), 2.5rem);
		}
	}
</style>
