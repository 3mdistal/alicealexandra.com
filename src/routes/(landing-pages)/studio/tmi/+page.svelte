<script lang="ts">
	import ComingSoon from '$lib/subpages/studio/coming-soon.svelte';
	// @ts-expect-error vite-imagetools not working properly
	import ComingSoonTMI from '../../../../cms/text/studio/tmi/coming-soon-tmi.md';
</script>

<svelte:head>
	<title>These Makeshift Idiotika</title>
	<meta
		name="description"
		content="A sprawling world of lovers and fiends, torn by an ever-titling landscape. Fantasy world-building from Alice Alexandra Moore."
	/>
</svelte:head>

{#snippet title()}these makeshift idiotika{/snippet}

{#snippet subtitle()}
	a sprawling world of lovers & fiends torn by an ever-tilting landscape
{/snippet}

{#snippet summary()}You'll meet some characters very soon.{/snippet}

{#snippet text()}
	<ComingSoonTMI />
{/snippet}

<ComingSoon {title} {subtitle} {summary} {text} />
