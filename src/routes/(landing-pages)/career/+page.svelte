<script>
	import Button from '$lib/icons/button.svelte';
	import Career from '$lib/subpages/career.svelte';
	import LandingPage from '$lib/subpages/landing-page.svelte';
	import Rabbit from '../../../cms/images/technotes/rabbit-in-hat.webp';

	const accent = '#642e1a';
	const background = '#dcc9c6';
</script>

<svelte:head>
	<title>Career</title>
	<meta
		name="description"
		content="Let's collaborate! I specialize in organizing difficult to categorize work and creating custom designs and workflows to meet your needs. All work by Alice Alexandra Moore."
	/>
</svelte:head>

<div class="career-page-surface" style="--bg-color: {background}; --accent-color: {accent}">
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
	<Career {accent} {background} />
</div>

<style>
	.career-page-surface {
		background-color: var(--bg-color);
	}
</style>
