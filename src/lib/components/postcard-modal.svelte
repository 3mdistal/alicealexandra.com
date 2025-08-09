<script lang="ts">
	import NotionPageParser from '$lib/notion/components/notion-page-parser.svelte';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { page } from '$app/state';
	import type {
		PageObjectResponse,
		UrlPropertyItemObjectResponse
	} from '$lib/notion/types/notion-types';

	interface Props {
		data: any;
		onclose: () => void;
	}

	let { data, onclose }: Props = $props();

	let modalElement: HTMLElement;
	let modalContentElement: HTMLElement;
	let savedScrollPosition = 0;

	// Modal sizing configuration with 3:2 aspect ratio
	const MODAL_CONFIG = {
		// Base width as percentage of viewport width
		widthPercent: 85, // Wider but not full width
		// Maximum width in pixels
		maxWidth: 1400,
		// Minimum width in pixels
		minWidth: 600,
		// Aspect ratio (width/height)
		aspectRatio: 3 / 2,
		// Viewport margins
		margin: 40
	};

	// Calculate modal dimensions
	function getModalDimensions() {
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		// Calculate width based on percentage, constrained by min/max
		let width = Math.min(
			MODAL_CONFIG.maxWidth,
			Math.max(MODAL_CONFIG.minWidth, viewportWidth * (MODAL_CONFIG.widthPercent / 100))
		);

		// Ensure width doesn't exceed viewport minus margins
		width = Math.min(width, viewportWidth - MODAL_CONFIG.margin * 2);

		// Calculate height based on aspect ratio
		const height = width / MODAL_CONFIG.aspectRatio;

		// Ensure height doesn't exceed viewport minus margins
		const maxHeight = viewportHeight - MODAL_CONFIG.margin * 2;
		if (height > maxHeight) {
			const constrainedHeight = maxHeight;
			const constrainedWidth = constrainedHeight * MODAL_CONFIG.aspectRatio;
			return {
				width: constrainedWidth,
				height: constrainedHeight
			};
		}

		return { width, height };
	}

	const { queryResponse, contentResponse } = data.postcard || {};
	const postcard = queryResponse?.results?.[0] as PageObjectResponse | undefined;
	const content = contentResponse?.results || [];

	// Type guards for Notion properties
	function isUrlProperty(prop: any): prop is UrlPropertyItemObjectResponse {
		return prop?.type === 'url';
	}

	// Note: rich text property guard not needed in this component

	const {
		Title: title,
		Description: description,
		'Hero Image': heroImage,
		Slug: slug
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

	// Helper function to get slug (can be URL or rich text)
	function getSlug(prop: any) {
		if (prop?.type === 'url') {
			return prop.url || '';
		}
		if (prop?.type === 'rich_text') {
			return prop.rich_text?.[0]?.plain_text || '';
		}
		return '';
	}

	const postcardTitle = getTextContent(title);
	const postcardDescription = getTextContent(description);
	const postcardHeroImage = getUrl(heroImage);
	const postcardSlug = getSlug(slug);

	onMount(() => {
		// Prevent background scroll
		savedScrollPosition = window.scrollY;
		// Compensate for scrollbar to avoid layout shift when locking body
		const scrollbarComp = window.innerWidth - document.documentElement.clientWidth;
		document.body.style.position = 'fixed';
		document.body.style.top = `-${savedScrollPosition}px`;
		document.body.style.width = '100%';
		document.body.style.overflow = 'hidden';
		if (scrollbarComp > 0) {
			document.body.style.paddingRight = `${scrollbarComp}px`;
		}

		// Make background content inert
		const mainElement = document.querySelector('main');
		if (mainElement) {
			mainElement.inert = true;
		}

		const animationOrigin = (page.state as any)?.animationOrigin as
			| { x: number; y: number; width: number; height: number }
			| undefined;

		if (animationOrigin && modalContentElement) {
			// Get calculated modal dimensions
			const modalDimensions = getModalDimensions();

			// Start modal from the postcard's position and size
			gsap.set(modalElement, { opacity: 0 });

			// Calculate final position for centered modal
			const finalX = (window.innerWidth - modalDimensions.width) / 2;
			const finalY = (window.innerHeight - modalDimensions.height) / 2;

			// Set the initial animation position to match postcard
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
			gsap
				.timeline()
				.to(modalElement, { opacity: 1, duration: 0.2 })
				.to(
					modalContentElement,
					{
						left: finalX,
						top: finalY,
						width: modalDimensions.width,
						height: modalDimensions.height,
						borderRadius: '20px',
						duration: 0.6,
						ease: 'power2.out'
					},
					'-=0.1'
				)
				.set(modalContentElement, {
					position: 'relative',
					left: 'auto',
					top: 'auto'
					// Keep GSAP dimensions - don't reset to auto
				});
		} else {
			// Fallback animation if no origin data
			gsap.set(modalElement, { opacity: 0 });
			gsap.set(modalContentElement, { scale: 0.8, y: 50 });

			gsap.timeline().to(modalElement, { opacity: 1, duration: 0.3 }).to(
				modalContentElement,
				{
					scale: 1,
					y: 0,
					duration: 0.6,
					ease: 'back.out(1.7)'
				},
				'-=0.2'
			);
		}

		// Handle escape key
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				closeWithAnimation();
			}
		};

		document.addEventListener('keydown', handleKeydown);

		// Manage focus for accessibility
		if (modalElement) {
			modalElement.focus();
		}

		return () => {
			document.removeEventListener('keydown', handleKeydown);

			// Ensure body styles are cleared if component unmounts unexpectedly
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.width = '';
			document.body.style.overflow = '';
			document.body.style.paddingRight = '';

			// Remove inert from background content
			const mainElement = document.querySelector('main');
			if (mainElement) {
				mainElement.inert = false;
			}
		};
	});

	function closeWithAnimation() {
		const animationOrigin = (page.state as any)?.animationOrigin as
			| { x: number; y: number; width: number; height: number }
			| undefined;

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
			gsap
				.timeline()
				.to(modalContentElement, {
					left: animationOrigin.x,
					top: animationOrigin.y,
					width: animationOrigin.width,
					height: animationOrigin.height,
					borderRadius: '16px',
					duration: 0.5,
					ease: 'power2.in'
				})
				.to(
					modalElement,
					{
						opacity: 0,
						duration: 0.2
					},
					'-=0.2'
				)
				.call(() => {
					// Restore styles and scroll synchronously in the same frame to avoid flash
					document.body.style.position = '';
					document.body.style.top = '';
					document.body.style.width = '';
					document.body.style.overflow = '';
					document.body.style.paddingRight = '';

					const root = document.documentElement;
					const prevBehavior = root.style.scrollBehavior;
					root.style.scrollBehavior = 'auto';
					window.scrollTo(0, savedScrollPosition);
					root.style.scrollBehavior = prevBehavior;

					const main = document.querySelector('main');
					if (main) main.inert = false;
					onclose();
				});
		} else {
			// Fallback animation
			gsap
				.timeline()
				.to(modalContentElement, {
					scale: 0.8,
					y: 50,
					duration: 0.4,
					ease: 'power2.in'
				})
				.to(
					modalElement,
					{
						opacity: 0,
						duration: 0.2
					},
					'-=0.2'
				)
				.call(() => {
					document.body.style.position = '';
					document.body.style.top = '';
					document.body.style.width = '';
					document.body.style.overflow = '';
					document.body.style.paddingRight = '';

					const root = document.documentElement;
					const prevBehavior = root.style.scrollBehavior;
					root.style.scrollBehavior = 'auto';
					window.scrollTo(0, savedScrollPosition);
					root.style.scrollBehavior = prevBehavior;

					const main = document.querySelector('main');
					if (main) main.inert = false;
					onclose();
				});
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			closeWithAnimation();
		}
	}

	function handleBackdropKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			closeWithAnimation();
		}
	}
</script>

<div
	class="modal-backdrop"
	bind:this={modalElement}
	onclick={handleBackdropClick}
	onkeydown={handleBackdropKeydown}
	role="dialog"
	aria-modal="true"
	aria-labelledby="modal-title"
	tabindex="-1"
	style="--modal-width-percent: {MODAL_CONFIG.widthPercent}%; --modal-max-width: {MODAL_CONFIG.maxWidth}px; --modal-min-width: {MODAL_CONFIG.minWidth}px; --modal-aspect-ratio: {MODAL_CONFIG.aspectRatio}; --modal-margin: {MODAL_CONFIG.margin}px;"
>
	<div class="modal-content" bind:this={modalContentElement}>
		<div class="modal-body">
			<div class="modal-controls">
				<button class="close-button" onclick={closeWithAnimation} aria-label="Close modal">
					<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			{#if postcard}
				{#if postcardHeroImage}
					<div class="modal-hero" style="background-image: url('{postcardHeroImage}')"></div>
				{/if}

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
		display: flex;
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		background: rgba(0, 0, 0, 0.8);
		padding: var(--modal-margin);
	}

	.modal-content {
		position: relative;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
		border: 2px dotted rgba(0, 0, 0, 0.5);
		border-radius: 20px;
		background: #e8e8e8;
		/* Remove CSS sizing - let GSAP handle dimensions */
		overflow: hidden;
	}

	.modal-hero {
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		aspect-ratio: 3 / 2;
		width: 100%;
	}

	.modal-body {
		position: relative;
		padding-bottom: 9rem;
		max-height: calc(100vh - var(--modal-margin) * 2);
		overflow-y: auto;
	}

	.modal-controls {
		display: flex;
		position: sticky;
		top: 1rem;
		justify-content: flex-end;
		gap: 0.5rem;
		z-index: 10;
		margin-bottom: -52px;
		padding-right: 1rem;
		pointer-events: none;
	}

	.close-button,
	.external-link-button {
		display: flex;
		justify-content: center;
		align-items: center;
		transition: background-color 0.2s;
		cursor: pointer;
		border: none;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.9);
		width: 40px;
		height: 40px;
		pointer-events: auto;
		color: #333;
		text-decoration: none;
	}

	.close-button:hover,
	.external-link-button:hover {
		background: white;
	}

	.modal-header {
		flex-shrink: 0;
		margin: 0 auto;
		padding: 2rem 2rem 1rem;
		max-width: 800px;
	}

	h1 {
		margin-bottom: 1rem;
		color: #333;
		font-size: 2.5rem;
	}

	.description {
		margin-bottom: 2rem;
		color: #666;
		font-style: italic;
		font-size: 1.2rem;
	}

	.modal-content-area {
		margin: 0 auto;
		padding: 0 2rem 3rem;
		max-width: 800px;
	}

	.notion-container {
		font-size: 1.1rem;
		line-height: 1.7;
	}

	.notion-container :global(p) {
		margin-bottom: 1.5rem;
	}

	.notion-container :global(h2) {
		margin-top: 2rem;
		margin-bottom: 1rem;
		color: #333;
		font-size: 1.8rem;
	}

	.notion-container :global(h3) {
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		color: #333;
		font-size: 1.4rem;
	}

	.notion-container :global(blockquote) {
		margin: 1.5rem 0;
		border-left: 3px solid #ddd;
		padding-left: 1rem;
		color: #666;
		font-style: italic;
	}

	.notion-container :global(code) {
		border-radius: 3px;
		background-color: #f4f4f4;
		padding: 0.2rem 0.4rem;
		font-family: 'Monaco', 'Courier New', monospace;
	}

	.notion-container :global(pre) {
		margin: 1rem 0;
		border-radius: 6px;
		background-color: #f4f4f4;
		padding: 1rem;
		overflow-x: auto;
	}

	.notion-container :global(pre code) {
		background: none;
		padding: 0;
	}

	.not-found {
		padding: 4rem 2rem;
		text-align: center;
	}

	.not-found h1 {
		color: #666;
	}

	.not-found p {
		margin-bottom: 2rem;
		color: #999;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.modal-backdrop {
			--modal-width-percent: 95%;
			--modal-margin: 20px;
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

	@media (max-width: 480px) {
		.modal-backdrop {
			--modal-width-percent: 100%;
			--modal-margin: 10px;
		}

		.modal-content {
			border-radius: 16px;
		}
	}
</style>
