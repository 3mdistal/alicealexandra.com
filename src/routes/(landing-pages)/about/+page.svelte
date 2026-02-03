<script>
	import About from './about.svelte';
	import LandingPage from '$lib/components/landing-page.svelte';

	const Hand =
		'https://pub-a1233e2ec22b407fb8ef2b8a06521728.r2.dev/site/images/flowers-in-hand.webp';
</script>

<svelte:body data-theme="about" />

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
