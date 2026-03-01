<script>
	import About from './about.svelte';
	import LandingPage from '$lib/components/landing-page.svelte';
	import { IMAGE_DOMAIN } from '$lib/utils/images';

	const Hand = `https://${IMAGE_DOMAIN}/site/images/flowers-in-hand.webp`;
</script>

<svelte:head>
	<title>hymns for calliope</title>
	<meta
		name="About"
		content="Biographical page to get to know Alice Alexandra Moore and why she cares about what she does."
	/>
</svelte:head>

<div>
	<LandingPage
		header="i'm alice, a digital creator."
		description="Welcome to Tempo Immaterial, a place that both showcases my
                own work and acts as the starting point for yours. I'm proud
                to be a queer, multi-disciplinary creative who works from
                the heart to elevate new and unique projects."
		src={Hand}
		alt="A painted hand holding out flowers."
		noPadding
	/>
	<About />
</div>
