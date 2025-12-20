<script>
	import ComingSoon from '$lib/subpages/studio/coming-soon.svelte';
	//@ts-expect-error vite-imagetools not working properly
	import ComingSoonBetson from '../../../../cms/text/studio/betson/coming-soon-betson.md';
</script>

<svelte:head>
	<title>Betson, Ohio</title>
	<meta
		name="description"
		content="In the backwoods, tangled undergrowth dictates creatures and canopies. A novel by Alice Alexandra Moore, based on where she grew up."
	/>
</svelte:head>

{#snippet title()}betson, ohio{/snippet}

{#snippet subtitle()}
	in the backwoods tangled undergrowth dictates creatures & canopies
{/snippet}

{#snippet summary()}
	Interconnected short stories getting published here soon.
{/snippet}

{#snippet text()}
	<ComingSoonBetson />
{/snippet}

<ComingSoon {title} {subtitle} {summary} {text} />
