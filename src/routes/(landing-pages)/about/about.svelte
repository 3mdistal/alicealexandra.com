<script lang="ts">
	import SubpageContent from '$lib/partials/subpage-content.svelte';
	import AboutSection1 from '$lib/content-components/about/section-1.svelte';
	import AboutSection2 from '$lib/content-components/about/section-2.svelte';
	import AboutSection3 from '$lib/content-components/about/section-3.svelte';
	import { IMAGE_DOMAIN } from '$lib/utils/images';
	const AuthorPhoto = `https://${IMAGE_DOMAIN}/site/images/author-photo.webp`;
	const Mirror = `https://${IMAGE_DOMAIN}/site/images/mirror.webp`;
	const Owl = `https://${IMAGE_DOMAIN}/site/images/owl.webp`;
	import Socials from '$lib/icons/socials.svelte';
	import { onDestroy } from 'svelte';
	import { pageState } from '$lib/stores';

	export let accent = 'var(--color-accent)';

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
		<AboutSection1 {accent} />
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
		<AboutSection2 />
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
		<AboutSection3 {accent} />
	</svelte:fragment>
</SubpageContent>

<div class="spacer"></div>

<div class="about-footer" id="connect">
	<h2 class="about-footer-heading" style="color: {accent}">have thoughts to share?</h2>
	<div class="about-footer-content">
		<div class="about-footer-text">
			<p>
				Feel free to reach out to me on any of my socials. I'd love to hear from you. I'll get back
				to you as I'm able.
			</p>
			<div class="socials-container">
				<Socials />
			</div>
		</div>
	</div>
</div>

<div class="spacer"></div>

<style>
	.spacer {
		height: 200px;
	}

	strong {
		font-weight: 600;
	}

	p {
		margin-bottom: 1.5em;
		font-size: var(--font-size-lg);
		line-height: 1.75;
	}

	.about-footer {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.about-footer-heading {
		margin-bottom: var(--space-4);
		max-width: 80%;
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-2xl);
		line-height: var(--line-height-tight);
	}

	@media (min-width: 1024px) {
		.about-footer-heading {
			font-size: var(--font-size-3xl);
		}

		p {
			font-size: var(--font-size-xl);
		}
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
