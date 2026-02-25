<script lang="ts">
	import { generateSrcSet, getOptimizedImageUrl, CLOUDFLARE_IMAGE_VARIANTS } from '$lib/utils/images';

	export let src: string;
	export let alt: string;
	export let sizes: string = '(min-width: 1200px) 1200px, 100vw';
	export let loading: 'lazy' | 'eager' | null | undefined = 'lazy';
	export let decoding: 'async' | 'sync' | 'auto' | null | undefined = 'async';
	let clazz: string = '';
	export { clazz as class };
	export let style: string = '';

	$: srcset = generateSrcSet(src);
	$: fallbackSrc = getOptimizedImageUrl(src, Math.max(...CLOUDFLARE_IMAGE_VARIANTS));
</script>

<img
	src={fallbackSrc || src}
	{srcset}
	{sizes}
	{alt}
	{loading}
	{decoding}
	class={clazz}
	{style}
	{...$$restProps}
/>
