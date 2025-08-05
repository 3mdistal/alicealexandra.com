<script>
	import HomeButton from '$lib/icons/home-button.svelte';
	import { setupViewTransition } from 'sveltekit-view-transition';

	setupViewTransition();
</script>

<HomeButton />
<slot />
