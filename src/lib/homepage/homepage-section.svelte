<script lang="ts">
	import { pageState } from '$lib/stores';
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
		if (!gsap) return;
		gsap.to(section, { y: yPos, ease: 'elastic.out', duration: 2 });
	}

	function animateOut() {
		if (!gsap) {
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

	function handleMouseEnter() {
		if (hover) {
			ease(-30);
		}
	}

	function handleMouseLeave() {
		if (hover) {
			ease(0);
		}
	}

	function navigate() {
		goto(name);
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

<div
	class="homepage-section {name}"
	bind:this={section}
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
	on:pointerdown={activate}
	role="presentation"
>
	<a
		href={name}
		title={name}
		class="homepage-section-link {name}"
		on:click|preventDefault={activate}
	>
		<h2>{name}</h2>
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

	.homepage-section-link:focus-visible {
		outline: none;
		box-shadow: 0 0 0 4px var(--a11y-focus-color);
		border-radius: var(--radius-pill);
		background: color-mix(in srgb, var(--color-surface) 88%, transparent);
	}

	.homepage-section-link {
		display: inline-block;
		position: absolute;
		border-radius: var(--radius-pill);
		padding: 0.35rem 0.75rem;
		color: inherit;
		text-decoration: none;
	}

	.homepage-section-link h2 {
		font-weight: 300;
		font-size: 1.125rem;
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
			clip-path: url(#studio-path);
		}

		&.career {
			--home-section-bg: var(--home-career-bg);
			--home-section-label: var(--home-career-label);
			clip-path: url(#career-path);
			height: 82%;
		}

		&.blog {
			--home-section-bg: var(--home-blog-bg);
			--home-section-label: var(--home-blog-label);
			clip-path: url(#blog-path);
			height: 75%;
		}

		&.news {
			--home-section-bg: var(--home-news-bg);
			--home-section-label: var(--home-news-label);
			clip-path: url(#news-path);
			height: 50%;
		}
	}

	.homepage-section-link.about {
		top: 15%;
		left: 33%;
	}

	.homepage-section-link.studio {
		top: 8%;
		right: 18%;
	}

	.homepage-section-link.career {
		top: 9%;
		right: 36%;
	}

	.homepage-section-link.blog {
		top: 22%;
		right: 20%;
	}

	.homepage-section-link.news {
		top: 12%;
		left: 27%;
	}

	@media screen and (max-width: 1024px) {
		.homepage-section {
			&.studio {
				clip-path: url(#studio-path-mobile);
				height: 90%;
			}

			&.career {
				clip-path: url(#career-path-mobile);
				height: 78%;
			}

			&.blog {
				clip-path: url(#blog-path-mobile);
				height: 68%;
			}

			&.news {
				height: 55%;
			}
		}

		.homepage-section-link.about {
			top: 10%;
		}

		.homepage-section-link.studio {
			top: 6%;
			right: 14%;
		}

		.homepage-section-link.career {
			right: 30%;
		}

		.homepage-section-link.blog {
			top: 12%;
		}

		.homepage-section-link.news {
			left: 23%;
		}
	}

	@media (min-width: 768px) {
		.homepage-section-link h2 {
			font-size: 1.5rem;
		}
	}

	@media (min-width: 1024px) {
		.homepage-section-link h2 {
			font-size: 1.875rem;
		}
	}
</style>
