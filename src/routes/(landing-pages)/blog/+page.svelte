<script lang="ts">
	import Blog from './blog.svelte';
	import type { BlogPostMeta } from '$lib/content/blog';
	import { onDestroy } from 'svelte';
	import { pageState } from '$lib/stores';
	import { IMAGE_DOMAIN } from '$lib/utils/images';
	import OptimizedImage from '$lib/components/ui/optimized-image.svelte';

	export let data: { posts: BlogPostMeta[] };

	const Bird = `https://${IMAGE_DOMAIN}/site/images/bird.webp`;

	onDestroy(() => {
		pageState.set('home');
	});
</script>

<svelte:head>
	<title>Blog | Alice Alexandra Moore</title>
	<meta
		name="description"
		content="Blog entries and writing that doesn't quite fit anywhere else, from Alice Alexandra Moore."
	/>
	<link rel="canonical" href="https://www.alicealexandra.com/blog" />

	<meta property="og:url" content="https://www.alicealexandra.com/blog" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Alice Alexandra Moore" />
	<meta property="og:title" content="Blog" />
	<meta
		property="og:description"
		content="Blog entries and writing that doesn't quite fit anywhere else, from Alice Alexandra Moore."
	/>
	<meta
		property="og:image"
		content="https://pub-a1233e2ec22b407fb8ef2b8a06521728.r2.dev/site/images/bird.webp"
	/>

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@tempoimmaterial" />
	<meta name="twitter:creator" content="@tempoimmaterial" />
	<meta name="twitter:domain" content="alicealexandra.com" />
	<meta name="twitter:url" content="https://www.alicealexandra.com/blog" />
	<meta name="twitter:title" content="Blog" />
	<meta
		name="twitter:description"
		content="Blog entries and writing that doesn't quite fit anywhere else, from Alice Alexandra Moore."
	/>
	<meta
		name="twitter:image"
		content="https://pub-a1233e2ec22b407fb8ef2b8a06521728.r2.dev/site/images/bird.webp"
	/>
</svelte:head>

<div class="blog-page">
	<div class="blog-content">
		<div class="blog-wrapper">
			<Blog posts={data.posts} />
		</div>
	</div>
	<div class="background-container">
		<div>
			<OptimizedImage
				src={Bird}
				alt="A painting of a colorful bird in flight."
				class="background-image"
			/>
		</div>
	</div>
</div>

<style>
	.blog-page {
		background-color: var(--color-bg);
		min-height: 100vh;
	}

	/* Content is visible by default (no-JS / pre-hydration safe). The fade-in
	   below is a progressive enhancement for users who don't mind motion. */
	@media (prefers-reduced-motion: no-preference) {
		.blog-page {
			animation: blog-page-fade-in 1s ease-in-out;
		}
	}

	@keyframes blog-page-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
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

	/* Same reading column as blog posts, so the two pages line up. */
	.blog-wrapper {
		padding-inline: var(--content-gutter);
		width: 100%;
		max-width: calc(var(--content-column) + 2 * var(--content-gutter));
	}

	.background-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.background-container :global(.background-image) {
		position: absolute;
		opacity: 0.1;
		z-index: 10;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: right;
	}

	/* In light mode the painting's pale areas would lighten the background
	   behind the white text; multiply lets the bird only darken it. (Set on
	   the fixed container, which is its own stacking context.) */
	@media (prefers-color-scheme: light) {
		.background-container {
			mix-blend-mode: multiply;
		}
	}

	@media (min-width: 768px) {
		.background-container :global(.background-image) {
			object-position: 50% 35%;
		}
	}
</style>
