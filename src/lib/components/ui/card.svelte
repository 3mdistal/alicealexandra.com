<script lang="ts">
	export let as: 'div' | 'article' | 'section' | 'a' = 'article';
	export let elevated = false;
	export let interactive = false;
	export let padded = true;
	export let className = '';
</script>

<svelte:element
	this={as}
	class={`ui-card ${elevated ? 'elevated' : ''} ${interactive ? 'interactive' : ''} ${padded ? 'padded' : ''} ${className}`}
	{...$$restProps}
>
	<slot />
</svelte:element>

<style>
	.ui-card {
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard),
			box-shadow var(--duration-fast) var(--ease-standard),
			transform var(--duration-fast) var(--ease-standard);
		border: var(--ui-surface-border);
		border-radius: var(--ui-surface-radius);
		background: var(--ui-surface-background);
		color: inherit;
		text-decoration: none;
	}

	.ui-card.padded {
		padding: var(--space-5);
	}

	.ui-card.elevated {
		box-shadow: var(--ui-surface-shadow);
	}

	.ui-card.interactive {
		cursor: pointer;
	}

	.ui-card.interactive:hover {
		transform: translateY(-2px);
		filter: none;
		box-shadow: var(--shadow-2);
	}

	.ui-card.interactive:focus-visible {
		box-shadow: var(--shadow-2);
	}
</style>
