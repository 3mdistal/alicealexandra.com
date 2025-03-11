<script lang="ts">
	import Blog from '$lib/subpages/blog.svelte';
	import type { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { state } from '$lib/stores';
	import Bird from '../../../cms/images/blog/bird.webp?enhanced';

	export let data: { post: QueryDatabaseResponse };

	const accent = '#d1dce7';

	function fadeIn() {
		gsap.to('.fade-item', {
			duration: 0.8,
			opacity: 1,
			y: 0,
			stagger: 0.1,
			ease: 'power2.out'
		});
	}

	onMount(() => {
		fadeIn();
	});

	onDestroy(() => {
		state.set('home');
	});
</script>

<svelte:head>
	<title>Blog | Alice Alexandra Moore</title>
	<meta
		name="description"
		content="Blog entries and writing that doesn't quite fit anywhere else, from Alice Alexandra Moore."
	/>
</svelte:head>

<div class="blog-page">
	<div class="blog-header fade-item">
		<h1>Thoughts & <span style="color: {accent}">Musings</span></h1>
		<p class="blog-intro">
			Welcome to my corner of the internet where I share ideas, reflections, and creative
			explorations.
		</p>
	</div>

	<div class="blog-content fade-item">
		<div class="blog-wrapper">
			<Blog {accent} {data} />
		</div>
	</div>

	<div class="background-container">
		<div class="image-wrapper fade-item">
			<enhanced:img
				src={Bird}
				alt="A painting of a colorful bird in flight."
				class="background-image"
			/>
		</div>
		<div class="background-overlay"></div>
	</div>
</div>

<style>
	.blog-page {
		position: relative;
		padding: 2rem 1rem;
		min-height: 100vh;
	}

	.blog-header {
		transform: translateY(20px);
		opacity: 0;
		margin: 0 auto 3rem;
		padding-top: 3rem;
		max-width: 800px;
		text-align: center;
	}

	.blog-header h1 {
		margin-bottom: 1rem;
		color: white;
		font-weight: 600;
		font-size: 3.5rem;
		line-height: 1.1;
	}

	.blog-intro {
		margin: 0 auto;
		max-width: 600px;
		color: rgba(255, 255, 255, 0.8);
		font-size: 1.25rem;
		line-height: 1.6;
	}

	.blog-content {
		position: relative;
		transform: translateY(20px);
		opacity: 0;
		z-index: 20;
		backdrop-filter: blur(10px);
		margin: 0 auto;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
		border-radius: 12px;
		background: rgba(0, 0, 0, 0.4);
		padding: 2rem;
		width: 100%;
		max-width: 1200px;
	}

	.blog-wrapper {
		width: 100%;
	}

	.fade-item {
		transform: translateY(20px);
		opacity: 0;
	}

	.background-container {
		position: fixed;
		top: 0;
		left: 0;
		z-index: -1;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.image-wrapper {
		position: absolute;
		top: 0;
		right: 0;
		opacity: 0;
		width: 50%;
		height: 100%;
	}

	.background-image {
		opacity: 0.7;
		filter: saturate(1.2);
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}

	.background-overlay {
		position: absolute;
		top: 0;
		left: 0;
		background: linear-gradient(135deg, rgba(20, 30, 48, 0.95) 0%, rgba(36, 59, 85, 0.8) 100%);
		width: 100%;
		height: 100%;
	}

	@media (max-width: 768px) {
		.blog-header h1 {
			font-size: 2.5rem;
		}

		.blog-content {
			padding: 1.5rem;
		}

		.image-wrapper {
			opacity: 0.3;
			width: 100%;
		}
	}

	@media (min-width: 1024px) {
		.blog-page {
			padding: 3rem;
		}

		.blog-header {
			margin-bottom: 4rem;
		}
	}
</style>
