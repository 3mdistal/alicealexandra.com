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
	import { state } from '$lib/stores';

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
		state.set('home');
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
				Though I have plans of fuller, richer ways to engage with the work here—even to
				contribute—this is what I have for now. My ears are open, and as such, I may take my time to
				consider before replying. I'll get back to you as I'm able.
			</p>
		</div>
	</div>
</div>

<div class="connect-section">
	<h2 style="color: {accent}">let's keep in touch.</h2>
	<p>My monthly newsletter highlights what I've been up to:</p>
	<div class="newsletter">
		{#if visibility}
			{#if loading}
				<p>Submitting your info . . .</p>
			{:else}
				<form on:submit|preventDefault={subscribe}>
					<label for="email" class="hidden">Your email:</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						name="email"
						required
						placeholder="queen.doe@gmail.com"
						class="email-input"
					/>
					<button class="subscribe-button">Subscribe</button>
				</form>
			{/if}
		{:else}
			<p>
				Thank you for subscribing! You will receive the monthly newsletter at <span
					class="email-highlight">{email}</span
				>.
			</p>
		{/if}
	</div>
	<div class="spacer"></div>
	<p class="socials-text">Or you can always reach out to me on one of my socials:</p>
	<div class="socials-container">
		<Socials />
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

	.about-footer-link {
		font-weight: 500;
	}

	.connect-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 2rem auto;
		border-radius: 8px;
		background-color: #eeeded;
		padding: 2rem 1rem;
		max-width: 800px;
	}

	.newsletter {
		margin-top: 1.25rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 400px;
	}

	.email-input {
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 0.5rem;
		width: 100%;
	}

	.subscribe-button {
		transition: background-color 0.2s;
		cursor: pointer;
		border: none;
		border-radius: 4px;
		background-color: #726a12;
		padding: 0.5rem 1rem;
		color: white;
	}

	.subscribe-button:hover {
		background-color: #5a5410;
	}

	.email-highlight {
		color: #726a12;
		font-weight: 600;
	}

	.hidden {
		display: none;
	}

	.socials-text {
		margin-top: 2rem;
		text-align: center;
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
