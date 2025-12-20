<script>
	import ComingSoon from '$lib/subpages/studio/coming-soon.svelte';
	// @ts-expect-error vite-imagetools not working properly
	import ComingSoonJukebox from '../../../../cms/text/studio/jukebox/coming-soon-jukebox.md';
</script>

<svelte:head>
	<title>Jukebox</title>
	<meta
		name="description"
		content="Music and compositions by Alice Alexandra Moore. Find her work on Soundcloud, Spotify, Apple Music, and Tidal."
	/>
</svelte:head>

{#snippet title()}jukebox{/snippet}

{#snippet subtitle()}attempts at taming the cacophany of noise{/snippet}

{#snippet summary()}
	I write music. Will be publishing here and to streaming services soon.
{/snippet}

{#snippet text()}
	<ComingSoonJukebox />
{/snippet}

<ComingSoon {title} {subtitle} {summary} {text} />
