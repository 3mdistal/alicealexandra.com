<script lang="ts">
	import SubpageContent from '$lib/partials/subpage-content.svelte';
	import About1 from '../../cms/text/about/about1.svelte';
	import About2 from '../../cms/text/about/about2.svelte';
	import About3 from '../../cms/text/about/about3.svelte';
	import AuthorPhoto from '../../cms/images/about/author-photo.jpg?enhanced';
	import Mirror from '../../cms/images/about/mirror.jpeg?enhanced';
	import Owl from '../../cms/images/about/owl.png?enhanced';
	import Socials from '$lib/icons/socials.svelte';
	import { onDestroy } from 'svelte';
	import { pageState } from '$lib/stores';

	export let accent = '';

	let loading = false;
	let visibility = true;
	let email: string;

	async function subscribe(event: Event) {
		loading = true;
		const form = event.target as HTMLFormElement;
		const data = new FormData(form);

		const response = await fetch('/connect', {
			method: 'POST',
			body: data
		});

		if (response.ok) {
			visibility = false;
			loading = false;
		}

		if (!response.ok) {
			const message = `An error has occured: ${response.status}`;
			throw new Error(message);
		}
	}

	onDestroy(() => {
		pageState.set('home');
	});
</script>

<div class="spacer"></div>

<SubpageContent
	{accent}
	imageSource={Owl}
	imageAlt="A painting of a Screech Owl staring eerily at the viewer. Painting by Alice Alexandra Moore."
>
	<svelte:fragment slot="heading">
		<strong>tempo immaterial</strong>, verb,
		<em>to dream of perpetual insufficiency.</em>
	</svelte:fragment>
	<svelte:fragment slot="text">
		<About1 {accent} />
	</svelte:fragment>
</SubpageContent>

<div class="spacer"></div>

<SubpageContent
	flexDirection="row"
	{accent}
	imageSource={AuthorPhoto}
	imageAlt="Alice Alexandra Moore"
>
	<svelte:fragment slot="heading">
		i grew up in a backwoods town, just above the Ohio River.
	</svelte:fragment>
	<svelte:fragment slot="text">
		<About2 />
	</svelte:fragment>
</SubpageContent>

<div class="spacer"></div>

<SubpageContent
	{accent}
	imageSource={Mirror}
	imageAlt="Painting of a person sitting, holding a mirror. By Alice Alexandra Moore."
>
	<svelte:fragment slot="heading">why do i limit my definition of meaningful?</svelte:fragment>
	<svelte:fragment slot="text">
		<About3 {accent} />
	</svelte:fragment>
</SubpageContent>

<div class="spacer"></div>

<div class="about-footer">
	<h2 class="about-footer-heading" style="color: {accent}">have thoughts to share?</h2>
	<div class="about-footer-content">
		<div class="about-footer-text">
			<p>
				Though I have plans of fuller, richer ways to engage with the work here—even to contribute,
				for now, my ears are open. I'll get back to you as I'm able.
			</p>
			<div class="socials-container">
				<Socials />
			</div>
		</div>
	</div>
</div>

<div class="spacer"></div>

<style>
	strong {
		font-weight: 600;
	}

	p {
		margin-bottom: 1.5em;
	}

	.about-footer {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.about-footer-heading {
		max-width: 80%;
	}

	.about-footer-content {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: flex-start;
		max-width: 100%;
	}

	.about-footer-text {
		max-width: 80%;
	}

	.socials-container {
		margin-top: 1rem;
	}

	@media (min-width: 768px) {
		.about-footer-content {
			flex-wrap: nowrap;
			max-width: 80%;
		}

		.about-footer-text {
			flex-basis: 50%;
		}
	}
</style>
