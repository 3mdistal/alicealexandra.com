<script>
	import Career from './career.svelte';
	import LandingPage from '$lib/components/landing-page.svelte';

	const Rabbit =
		'https://pub-a1233e2ec22b407fb8ef2b8a06521728.r2.dev/site/images/rabbit-in-hat.webp';
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
	</LandingPage>
	<Career />
</div>

<style>
	.career-page-surface {
		background-color: var(--color-bg);
	}
</style>
