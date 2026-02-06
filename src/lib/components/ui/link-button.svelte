<script lang="ts">
	export let href = '';
	export let target: string | undefined = undefined;
	export let rel: string | undefined = undefined;
	export let variant: 'outline' | 'solid' | 'ghost' = 'outline';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let className = '';
	export let external = false;

	$: computedRel = rel || (target === '_blank' || external ? 'noopener noreferrer' : undefined);
</script>

<a
	{href}
	{target}
	rel={computedRel}
	class={`ui-link-button ${variant} ${size} ${className}`}
	{...$$restProps}
>
	<slot />
</a>

<style>
	.ui-link-button {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		gap: var(--ui-control-gap);
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard),
			transform var(--duration-fast) var(--ease-standard),
			box-shadow var(--duration-fast) var(--ease-standard);
		cursor: pointer;
		border: var(--ui-control-border-width) solid transparent;
		border-radius: var(--ui-control-radius);
		padding: var(--ui-control-padding-y) var(--ui-control-padding-x);
		min-inline-size: fit-content;
		font-weight: var(--ui-control-font-weight);
		font-size: var(--ui-control-font-size);
		line-height: 1.2;
		text-align: center;
		text-decoration: none;
	}

	.ui-link-button.outline {
		border-color: var(--_button-accent, var(--color-accent));
		background: var(--_button-bg, var(--color-surface));
		color: var(--_button-accent, var(--color-accent));
	}

	.ui-link-button.solid {
		border-color: var(--_button-accent, var(--color-accent));
		background: var(--_button-accent, var(--color-accent));
		color: var(--_button-bg, var(--color-bg));
	}

	.ui-link-button.ghost {
		border-color: transparent;
		background: transparent;
		color: var(--color-text-muted);
	}

	.ui-link-button:hover {
		transform: translateY(-1px);
		filter: none;
		box-shadow: var(--shadow-1);
	}

	.ui-link-button.outline:hover {
		background: var(--_button-accent, var(--color-accent));
		color: var(--_button-bg, var(--color-surface));
	}

	.ui-link-button.ghost:hover {
		background: var(--color-surface-muted);
		color: var(--color-text);
	}

	.ui-link-button.sm {
		--ui-control-font-size: var(--font-size-sm);
		--ui-control-padding-y: 0.45rem;
		--ui-control-padding-x: 0.75rem;
	}

	.ui-link-button.lg {
		--ui-control-font-size: var(--font-size-lg);
		--ui-control-padding-y: 0.75rem;
		--ui-control-padding-x: 1.25rem;
	}
</style>
