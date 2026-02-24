<script>
	import { createEventDispatcher } from 'svelte';
	import LinkButton from '$lib/components/ui/link-button.svelte';

	export let url = '';
	export let text = '';
	export let target = '';
	export let type = '';
	export let accent = 'var(--color-accent)';
	export let background = 'var(--color-surface)';

	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('clickMessage', { click: true });
	}

	function handleFocus() {
		dispatch('focusMessage', { focus: true });
	}

	function handleBlur() {
		dispatch('focusMessage', { focus: false });
	}
</script>

<LinkButton
	href={url}
	{target}
	rel={target === '_blank' ? 'noopener noreferrer' : undefined}
	style={`--_button-accent: ${accent}; --_button-bg: ${background};`}
	className="legacy-icon-button"
	aria-busy={type === 'loading' ? 'true' : undefined}
	on:click={handleClick}
	on:focus={handleFocus}
	on:blur={handleBlur}
>
	{text}
</LinkButton>

<style>
	:global(.legacy-icon-button) {
		border-width: 2px;
		border-radius: 0.75rem;
		font-weight: var(--font-weight-regular);
	}

	@media (min-width: 1024px) {
		:global(.legacy-icon-button) {
			font-size: 1.25rem;
		}
	}
</style>
