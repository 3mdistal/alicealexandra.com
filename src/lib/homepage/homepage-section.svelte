<script lang="ts">
	import { pageState } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	type Gsap = typeof import('gsap').gsap;

	export let background: string;
	export let name: 'about' | 'studio' | 'career' | 'blog' | 'news';
	export let transitionOutWrapper: () => void;

	let section: HTMLAnchorElement;
	let hover = true;
	let gsap: Gsap | null = null;

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
			if (typeof document !== 'undefined') {
				document.body.style.backgroundColor = background;
			}
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
		tl.to(
			document.body,
			{
				backgroundColor: background,
				delay: 0.25
			},
			'<'
		);
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

	function handleClick() {
		pageState.set(name);
		hover = false;
		ease(0);
		animateOut();
		transitionOutWrapper();
	}
</script>

<a
	href={name}
	title={name}
	class="homepage-section {name}"
	style:background
	bind:this={section}
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
	on:mousedown={handleClick}
	on:click|preventDefault
>
	<div class="homepage-section-menu-link {name}">
		<h2>{name}</h2>
	</div>
</a>

<style>
	.homepage-section {
		position: absolute;
		bottom: 0;
		width: 100%;
		height: 100%;
	}

	.homepage-section:hover {
		filter: brightness(0.95) hue-rotate(5deg) saturate(1.5);
	}

	.homepage-section:focus {
		filter: brightness(0.85) hue-rotate(10deg) saturate(1.75);
	}

	.homepage-section-menu-link h2 {
		font-weight: 300;
		font-size: 1.125rem;
	}

	.homepage-section {
		&.about {
			clip-path: url(#about-path);
		}

		&.studio {
			clip-path: url(#studio-path);
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
			clip-path: url(#news-path);
			height: 50%;
		}
	}

	.homepage-section-menu-link {
		position: absolute;

		&.about {
			top: 15%;
			left: 33%;
		}

		&.studio {
			top: 8%;
			right: 18%;
		}

		&.career {
			top: 9%;
			right: 36%;
		}

		&.blog {
			top: 22%;
			right: 20%;

			& h2 {
				color: #fafafa;
			}
		}

		&.news {
			top: 12%;
			left: 27%;
		}
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

		.homepage-section-menu-link {
			&.about {
				top: 10%;
			}

			&.studio {
				top: 6%;
				right: 14%;
			}

			&.career {
				right: 30%;
			}

			&.blog {
				top: 12%;
			}

			&.news {
				left: 23%;
			}
		}
	}

	@media (min-width: 768px) {
		.homepage-section-menu-link h2 {
			font-size: 1.5rem;
		}
	}

	@media (min-width: 1024px) {
		.homepage-section-menu-link h2 {
			font-size: 1.875rem;
		}
	}
</style>
