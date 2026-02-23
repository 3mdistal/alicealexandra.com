<script lang="ts">
	export let variant: 'outline' | 'solid' | 'ghost' = 'outline';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let disabled = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let className = '';
</script>

<button {type} class={`ui-button ${variant} ${size} ${className}`} {disabled} {...$$restProps}>
	<slot />
</button>

<style>
	.ui-button {
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

	.ui-button.outline {
		border-color: var(--color-accent);
		background: var(--color-surface);
		color: var(--color-accent);
	}

	.ui-button.solid {
		border-color: var(--color-accent);
		background: var(--color-accent);
		color: var(--color-bg);
	}

	.ui-button.ghost {
		border-color: transparent;
		background: transparent;
		color: var(--color-text-muted);
	}

	.ui-button:hover:not(:disabled) {
		transform: translateY(-1px);
		filter: none;
		box-shadow: var(--shadow-1);
	}

	.ui-button.outline:hover:not(:disabled) {
		background: var(--color-accent);
		color: var(--color-surface);
	}

	.ui-button.ghost:hover:not(:disabled) {
		background: var(--color-surface-muted);
		color: var(--color-text);
	}

	.ui-button:disabled {
		transform: none;
		opacity: 0.6;
		cursor: not-allowed;
		box-shadow: none;
	}

	.ui-button.sm {
		--ui-control-font-size: var(--font-size-sm);
		--ui-control-padding-y: 0.45rem;
		--ui-control-padding-x: 0.75rem;
	}

	.ui-button.lg {
		--ui-control-font-size: var(--font-size-lg);
		--ui-control-padding-y: 0.75rem;
		--ui-control-padding-x: 1.25rem;
	}
</style>
