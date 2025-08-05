<script>
	import HomeButton from '$lib/icons/home-button.svelte';
	import { onNavigate } from '$app/navigation';

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<HomeButton />
<slot />

<style>
	/* View transition CSS animations */
	:global(::view-transition-old(root)),
	:global(::view-transition-new(root)) {
		animation-duration: 0.5s;
	}

	/* Style specific transitions for postcard images */
	:global(::view-transition-old(postcard-image-test-2)),
	:global(::view-transition-new(postcard-image-test-2)),
	:global(::view-transition-old(postcard-image-test-3)),
	:global(::view-transition-new(postcard-image-test-3)) {
		object-fit: cover;
		width: 100%;
		height: 100%;
	}

	/* Animation for all postcard transitions */
	:global([style*="view-transition-name: postcard-image"]::view-transition-old),
	:global([style*="view-transition-name: postcard-image"]::view-transition-new) {
		animation-duration: 0.6s;
		animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}
</style>
