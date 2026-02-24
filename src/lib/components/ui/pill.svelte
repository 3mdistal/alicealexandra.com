<script lang="ts">
	export let tone: 'neutral' | 'added' | 'edited' | 'removed' = 'neutral';
	export let strong = false;
	export let className = '';
</script>

<span class={`ui-pill ${tone} ${strong ? 'strong' : ''} ${className}`} {...$$restProps}>
	<slot />
</span>

<style>
	.ui-pill {
		display: inline-flex;
		align-items: center;
		border: var(--ui-control-border-width) solid var(--color-border);
		border-radius: var(--radius-pill);
		background: var(--color-surface-muted);
		padding: var(--ui-pill-padding-y) var(--ui-pill-padding-x);
		color: var(--color-text-muted);
		font-size: var(--ui-pill-font-size);
		letter-spacing: 0.02em;
		white-space: nowrap;
	}

	.ui-pill.strong {
		font-weight: var(--font-weight-semibold);
	}

	.ui-pill.added {
		border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border));
		background: color-mix(in srgb, var(--color-accent) 14%, var(--color-surface));
		color: color-mix(in srgb, var(--color-accent) 84%, var(--color-text));
	}

	.ui-pill.edited {
		border-color: color-mix(in srgb, var(--color-text-muted) 40%, var(--color-border));
		background: color-mix(in srgb, var(--color-text-muted) 14%, var(--color-surface));
		color: color-mix(in srgb, var(--color-text-muted) 82%, var(--color-text));
	}

	.ui-pill.removed {
		border-color: color-mix(in srgb, #c94b4b 45%, var(--color-border));
		background: color-mix(in srgb, #c94b4b 14%, var(--color-surface));
		color: color-mix(in srgb, #912a2a 75%, var(--color-text));
	}
</style>
