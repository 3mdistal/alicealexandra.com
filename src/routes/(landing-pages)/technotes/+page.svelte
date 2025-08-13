<script>
	import Button from '$lib/icons/button.svelte';
	import Technotes from '$lib/subpages/technotes.svelte';
	import LandingPage from '$lib/subpages/landing-page.svelte';
	import Rabbit from '../../../cms/images/technotes/rabbit-in-hat.webp';

	const accent = '#642e1a';
	const background = '#dcc9c6';
</script>

<svelte:head>
	<title>Technotes</title>
	<meta
		name="description"
		content="Let's collaborate! I specialize in organizing difficult to categorize work and creating custom designs and workflows to meet your needs. All work by Alice Alexandra Moore."
	/>
</svelte:head>

<div style="background-color: {background}">
	<LandingPage
		header="let's get technical."
		description="A digital notebook for all my tech advice and ramblings,
                from both my professional life and my wonky experiments."
		src={Rabbit}
		alt="A painting of a rabbit coming out of a hat."
		{accent}
	>
		<Button slot="button" text="Explore." url="#content" {accent} {background} />
	</LandingPage>
	<Technotes {accent} {background} />
</div>
