<script lang="ts">
	import '../app.css';
</script>

<svelte:head>
	<meta charset="utf-8" />
	<link rel="icon" type="image" href="/images/logo/logo.png" />
	<meta name="viewport" content="width=device-width" />
</svelte:head>

<div data-sveltekit-preload-data="hover" data-sveltekit-preload-code="eager">
	<slot />
</div>
