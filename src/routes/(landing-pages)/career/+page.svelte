<script>
	import LinkButton from '$lib/components/ui/link-button.svelte';
	import Career from './career.svelte';
	import LandingPage from '$lib/components/landing-page.svelte';

	const Rabbit = 'https://images.alicealexandra.com/site/images/rabbit-in-hat.webp';
</script>

<svelte:head>
	<title>Career</title>
	<meta
		name="description"
		content="Let's collaborate! I specialize in organizing difficult to categorize work and creating custom designs and workflows to meet your needs. All work by Alice Alexandra Moore."
	/>
</svelte:head>

<div class="career-page-surface">
	<LandingPage
		header="let's get technical."
		description="A digital notebook for all my tech advice and ramblings,
                from both my professional life and my wonky experiments."
		src={Rabbit}
		alt="A painting of a rabbit coming out of a hat."
	>
		<LinkButton slot="button" href="#content" size="lg">Explore.</LinkButton>
	</LandingPage>
	<Career />
</div>

<style>
	.career-page-surface {
		background-color: var(--color-bg);
	}
</style>
