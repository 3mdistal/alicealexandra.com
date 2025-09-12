<script lang="ts">
	import Blog from '$lib/subpages/blog.svelte';
	import type { QueryDatabaseResponse } from '$lib/notion/types/notion-types';
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { pageState } from '$lib/stores';
	import Bird from '../../../cms/images/blog/bird.webp?enhanced';

	export let data: { post: QueryDatabaseResponse };

	const accent = '#d1dce7';

	function fadeIn() {
		gsap.to('.opacity-0', {
			duration: 1,
			opacity: 1,
			ease: 'power2.inOut'
		});
	}

	onMount(() => {
		fadeIn();
	});

	onDestroy(() => {
		pageState.set('home');
	});
</script>

<svelte:head>
	<title>Blog</title>
	<meta
		name="description"
		content="Blog entries and writing that doesn't quite fit anywhere else, from Alice Alexandra Moore."
	/>
</svelte:head>

<div class="opacity-0 blog-page">
	<div class="blog-content">
		<div class="blog-wrapper">
			<Blog {accent} {data} />
		</div>
	</div>
	<div class="background-container">
		<div>
			<enhanced:img
				src={Bird}
				alt="A painting of a colorful bird in flight."
				class="background-image"
			/>
		</div>
	</div>
</div>

<style>
	/* Override blog colors for white text hierarchy on listing page only */
	:global(.blog-wrapper) {
		--blog-text: #ffffff;
		--blog-heading: #ffffff;
		--blog-accent: #e5e7eb;
		--blog-secondary: #d1d5db;
		--blog-link: #ffffff;
		--blog-link-hover: #e5e7eb;
		--blog-heading-dark: #ffffff;
		--blog-secondary-dark: #d1d5db;
	}

	.blog-page {
		background-color: #838391;
		min-height: 100vh;
	}

	.opacity-0 {
		opacity: 0;
	}

	.blog-content {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;
		z-index: 20;
		padding-top: 5rem;
		padding-bottom: 5rem;
		width: 100%;
	}

	.blog-wrapper {
		position: relative;
		width: 90%;
	}

	.background-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.background-image {
		position: absolute;
		opacity: 0.1;
		z-index: 10;
		width: 100%;
		height: 100%;
		object-position: right;
	}

	@media (min-width: 768px) {
		.blog-wrapper {
			left: 2.5rem;
			width: 60%;
		}

		.background-image {
			object-position: 50% 35%;
		}
	}
</style>
