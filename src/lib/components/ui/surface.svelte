<script lang="ts">
	export let as: 'div' | 'section' | 'article' | 'aside' | 'nav' = 'div';
	export let tone: 'default' | 'muted' = 'default';
	export let padded = true;
	export let className = '';
</script>

<svelte:element
	this={as}
	class={`ui-surface ${tone} ${padded ? 'padded' : ''} ${className}`}
	{...$$restProps}
>
	<slot />
</svelte:element>

<style>
	.ui-surface {
		border: var(--ui-surface-border);
		border-radius: var(--ui-surface-radius);
		background: var(--ui-surface-background);
	}

	.ui-surface.muted {
		background: var(--ui-surface-muted-background);
	}

	.ui-surface.padded {
		padding: var(--space-5);
	}
</style>
