<script>
	import HomeButton from '$lib/icons/home-button.svelte';
	import { onNavigate } from '$app/navigation';

	onNavigate((navigation) => {
		if (!document.startViewTransition) {
			console.log('View Transitions API not supported');
			return;
		}

		console.log('Starting view transition from', navigation.from?.url.pathname, 'to', navigation.to?.url.pathname);

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				console.log('View transition started');
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
		animation-duration: 0.4s;
		animation-timing-function: ease-in-out;
	}

	/* General postcard image transitions */
	:global(::view-transition-old(postcard-image-test-2)),
	:global(::view-transition-new(postcard-image-test-2)),
	:global(::view-transition-old(postcard-image-test-3)),
	:global(::view-transition-new(postcard-image-test-3)) {
		animation-duration: 0.6s;
		animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
		object-fit: cover;
	}

	/* Test if we can style all postcard transitions */
	:global(::view-transition-old(*)),
	:global(::view-transition-new(*)) {
		animation-duration: 0.6s;
		animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}
</style>
