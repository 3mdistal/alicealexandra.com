<script lang="ts">
	import NotionPageParser from '$lib/notion/components/notion-page-parser.svelte';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { page } from '$app/state';
	import type {
		PageObjectResponse,
		RichTextPropertyItemObjectResponse,
		UrlPropertyItemObjectResponse
	} from '$lib/notion/types/notion-types';

	interface Props {
		data: any;
		onclose: () => void;
	}

	let { data, onclose }: Props = $props();

	let modalElement: HTMLElement;
	let modalContentElement: HTMLElement;
	let heroElement: HTMLElement;

	const { queryResponse, contentResponse } = data.postcard || {};
	const postcard = queryResponse?.results?.[0] as PageObjectResponse | undefined;
	const content = contentResponse?.results || [];

	// Type guards for Notion properties
	function isUrlProperty(prop: any): prop is UrlPropertyItemObjectResponse {
		return prop?.type === 'url';
	}

	function isRichTextProperty(prop: any): prop is RichTextPropertyItemObjectResponse {
		return prop?.type === 'rich_text';
	}

	const {
		Title: title,
		Description: description,
		Slug: slug,
		'Hero Image': heroImage
	} = postcard?.properties || {};

	// Helper function to safely get text content
	function getTextContent(prop: any) {
		if (prop?.type === 'title') {
			return prop.title?.[0]?.plain_text || '';
		}
		return prop?.rich_text?.[0]?.plain_text || '';
	}

	// Helper function to get URL from URL property
	function getUrl(prop: any) {
		if (isUrlProperty(prop)) {
			return prop.url;
		}
		return '';
	}

	const postcardTitle = getTextContent(title);
	const postcardDescription = getTextContent(description);
	const postcardSlug = getTextContent(slug);
	const postcardHeroImage = getUrl(heroImage);

	onMount(() => {
		// Prevent background scroll
		const scrollPosition = window.scrollY;
		document.body.style.position = 'fixed';
		document.body.style.top = `-${scrollPosition}px`;
		document.body.style.width = '100%';
		document.body.style.overflow = 'hidden';

		// Make background content inert
		const mainElement = document.querySelector('main');
		if (mainElement) {
			mainElement.inert = true;
		}

		const animationOrigin = page.state.animationOrigin;

		if (animationOrigin && modalContentElement) {
			// Start modal from the postcard's position and size
			gsap.set(modalElement, { opacity: 0 });

			// First, temporarily position the modal off-screen to measure its natural size
			gsap.set(modalContentElement, {
				position: 'fixed',
				left: '-9999px',
				top: '0',
				width: Math.min(800, window.innerWidth - 64),
				height: 'auto',
				visibility: 'hidden'
			});

			// Force a layout to get accurate measurements
			modalContentElement.offsetHeight;

			// Get the natural height of the content
			const naturalHeight = modalContentElement.offsetHeight;
			const contentFinalWidth = Math.min(800, window.innerWidth - 64);
			const contentFinalHeight = Math.min(naturalHeight, window.innerHeight - 64);
			const finalX = (window.innerWidth - contentFinalWidth) / 2;
			const finalY = (window.innerHeight - contentFinalHeight) / 2;

			// Now set the initial animation position
			gsap.set(modalContentElement, {
				position: 'fixed',
				left: animationOrigin.x,
				top: animationOrigin.y,
				width: animationOrigin.width,
				height: animationOrigin.height,
				borderRadius: '16px',
				transformOrigin: 'center center',
				visibility: 'visible'
			});

			// Animate modal entrance - postcard growing into modal
			gsap.timeline()
				.to(modalElement, { opacity: 1, duration: 0.2 })
				.to(modalContentElement, {
					left: finalX,
					top: finalY,
					width: contentFinalWidth,
					height: contentFinalHeight,
					borderRadius: '20px',
					duration: 0.6,
					ease: 'power2.out'
				}, '-=0.1')
				.set(modalContentElement, {
					position: 'relative',
					left: 'auto',
					top: 'auto',
					width: '100%',
					height: 'auto'
				});
		} else {
			// Fallback animation if no origin data
			gsap.set(modalElement, { opacity: 0 });
			gsap.set(modalContentElement, { scale: 0.8, y: 50 });

			gsap.timeline()
				.to(modalElement, { opacity: 1, duration: 0.3 })
				.to(modalContentElement, {
					scale: 1,
					y: 0,
					duration: 0.6,
					ease: 'back.out(1.7)'
				}, '-=0.2');
		}

		// Handle escape key
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				closeWithAnimation();
			}
		};

		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);

			// Restore scroll position and body styles
			const scrollPosition = Math.abs(parseInt(document.body.style.top) || 0);
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.width = '';
			document.body.style.overflow = '';
			window.scrollTo(0, scrollPosition);

			// Remove inert from background content
			const mainElement = document.querySelector('main');
			if (mainElement) {
				mainElement.inert = false;
			}
		};
	});

	function closeWithAnimation() {
		// Restore scroll position and body styles
		const scrollPosition = Math.abs(parseInt(document.body.style.top) || 0);
		document.body.style.position = '';
		document.body.style.top = '';
		document.body.style.width = '';
		document.body.style.overflow = '';

		// Remove inert from background content
		const mainElement = document.querySelector('main');
		if (mainElement) {
			mainElement.inert = false;
		}

		const animationOrigin = page.state.animationOrigin;

		if (animationOrigin && modalContentElement) {
			// Get current modal position
			const currentRect = modalContentElement.getBoundingClientRect();

			// Set up for reverse animation
			gsap.set(modalContentElement, {
				position: 'fixed',
				left: currentRect.left,
				top: currentRect.top,
				width: currentRect.width,
				height: currentRect.height
			});

			// Animate modal shrinking back to postcard
			gsap.timeline()
				.to(modalContentElement, {
					left: animationOrigin.x,
					top: animationOrigin.y,
					width: animationOrigin.width,
					height: animationOrigin.height,
					borderRadius: '16px',
					duration: 0.5,
					ease: 'power2.in'
				})
				.to(modalElement, {
					opacity: 0,
					duration: 0.2
				}, '-=0.2')
				.call(() => {
					onclose();
				});
		} else {
			// Fallback animation
			gsap.timeline()
				.to(modalContentElement, {
					scale: 0.8,
					y: 50,
					duration: 0.4,
					ease: 'power2.in'
				})
				.to(modalElement, {
					opacity: 0,
					duration: 0.2
				}, '-=0.2')
				.call(() => {
					onclose();
				});
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			closeWithAnimation();
		}
	}
</script>

<div 
	class="modal-backdrop" 
	bind:this={modalElement}
	onclick={handleBackdropClick}
	role="dialog"
	aria-modal="true"
	aria-labelledby="modal-title"
>
	<div class="modal-content" bind:this={modalContentElement}>
		{#if postcard && postcardHeroImage}
			<div 
				class="modal-hero"
				bind:this={heroElement}
				style="background-image: url('{postcardHeroImage}')"
			></div>
		{/if}
		
		<div class="modal-body">
			<button class="close-button" onclick={closeWithAnimation} aria-label="Close modal">
				<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			{#if postcard}
				<header class="modal-header">
					<h1 id="modal-title">{postcardTitle}</h1>
					{#if postcardDescription}
						<p class="description">{postcardDescription}</p>
					{/if}
				</header>

				<article class="modal-content-area">
					{#if content.length > 0}
						<div class="notion-container">
							<NotionPageParser results={content} />
						</div>
					{:else}
						<p>No content available.</p>
					{/if}
				</article>
			{:else}
				<div class="not-found">
					<h1>Postcard not found</h1>
					<p>The postcard you're looking for doesn't exist.</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 2rem;
	}

	.modal-content {
		background: #e8e8e8;
		border-radius: 20px;
		max-width: 800px;
		max-height: 90vh;
		width: 100%;
		overflow: hidden;
		position: relative;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
		border: 2px dotted rgba(0, 0, 0, 0.5);
	}

	.modal-hero {
		width: 100%;
		aspect-ratio: 3 / 2;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}

	.modal-body {
		position: relative;
		max-height: 60vh;
		overflow-y: auto;
	}

	.close-button {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: rgba(255, 255, 255, 0.9);
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 10;
		transition: background-color 0.2s;
	}

	.close-button:hover {
		background: white;
	}

	.modal-header {
		padding: 2rem 2rem 1rem;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		color: #333;
	}

	.description {
		font-size: 1.2rem;
		color: #666;
		margin-bottom: 2rem;
		font-style: italic;
	}

	.modal-content-area {
		padding: 0 2rem 2rem;
	}

	.notion-container {
		font-size: 1.1rem;
		line-height: 1.7;
	}

	.notion-container :global(p) {
		margin-bottom: 1.5rem;
	}

	.notion-container :global(h2) {
		font-size: 1.8rem;
		margin-top: 2rem;
		margin-bottom: 1rem;
		color: #333;
	}

	.notion-container :global(h3) {
		font-size: 1.4rem;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		color: #333;
	}

	.notion-container :global(blockquote) {
		border-left: 3px solid #ddd;
		padding-left: 1rem;
		margin: 1.5rem 0;
		font-style: italic;
		color: #666;
	}

	.notion-container :global(code) {
		background-color: #f4f4f4;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Courier New', monospace;
	}

	.notion-container :global(pre) {
		background-color: #f4f4f4;
		padding: 1rem;
		border-radius: 6px;
		overflow-x: auto;
		margin: 1rem 0;
	}

	.notion-container :global(pre code) {
		background: none;
		padding: 0;
	}

	.not-found {
		text-align: center;
		padding: 4rem 2rem;
	}

	.not-found h1 {
		color: #666;
	}

	.not-found p {
		color: #999;
		margin-bottom: 2rem;
	}

	@media (max-width: 768px) {
		.modal-backdrop {
			padding: 1rem;
		}

		.modal-header {
			padding: 1.5rem 1.5rem 1rem;
		}

		.modal-content-area {
			padding: 0 1.5rem 1.5rem;
		}

		h1 {
			font-size: 2rem;
		}

		.description {
			font-size: 1.1rem;
		}
	}
</style>
