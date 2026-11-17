<!-- Prototype chrome only: delete with the rest of src/lib/prototypes/tall-tales. -->
<script lang="ts">
	let {
		links,
		current
	}: {
		links: { label: string; href: string }[];
		current: string;
	} = $props();
</script>

<nav class="proto-switch" aria-label="Prototype variants" data-proto>
	{#each links as link}
		<a href={link.href} aria-current={link.label === current ? 'page' : undefined}>{link.label}</a>
	{/each}
</nav>

<style>
	.proto-switch {
		display: flex;
		position: fixed;
		bottom: 12px;
		left: 12px;
		gap: 2px;
		z-index: 1000;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.55);
		padding: 3px;
		font-size: 12px;
		line-height: 1;
		font-family: var(--font-sans);
		-webkit-backdrop-filter: blur(6px);
		backdrop-filter: blur(6px);
	}

	a {
		border-radius: 999px;
		padding: 6px 9px;
		color: rgba(255, 255, 255, 0.75);
		text-decoration: none;
	}

	a:hover,
	a:focus-visible {
		color: #fff;
	}

	a[aria-current='page'] {
		background: rgba(255, 255, 255, 0.9);
		color: #000;
	}
</style>
