<script lang="ts">
	import { onMount } from 'svelte';

	let container: HTMLDivElement;

	function assignIndex() {
		Array.from(container.children).forEach((child, index) => {
			(child as HTMLElement).style.setProperty('--index', index.toString());
		});
	}

	onMount(() => {
		assignIndex();
	});
</script>

<div bind:this={container} id="container">
	<div>
		<a
			href="https://www.instagram.com/alice.alexandra.moore"
			target="_blank"
			rel="noreferrer"
			aria-label="Visit Alice Alexandra Moore on Instagram"
		>
			<enhanced:img
				src="../../cms/images/social-media/instagram-bear.webp"
				alt="Link to Instagram in the form of an illustrated polar bear taking a selfie. Painted dby Alice Alexandra Moore."
			/>
		</a>
	</div>
	<div>
		<a
			href="https://bsky.app/profile/alicealexandra.com"
			target="_blank"
			rel="noreferrer"
			aria-label="Visit Alice Alexandra Moore on Bluesky"
		>
			<enhanced:img
				src="../../cms/images/social-media/bsky-squirrel.webp"
				alt="Link to Bluesky in the form of a squirrel drinking its morning coffee. Painted by Alice Alexandra Moore."
			/>
		</a>
	</div>
	<div>
		<a
			href="https://soundcloud.com/tempoimmaterial"
			target="_blank"
			rel="noreferrer"
			aria-label="Visit Alice Alexandra Moore on SoundCloud"
		>
			<enhanced:img
				src="../../cms/images/social-media/soundcloud-rabbit.webp"
				alt="Link to Soundcloud in the form of an illustrated rabbit wearing headphones. Painted by Alice Alexandra Moore."
			/>
		</a>
	</div>
	<div>
		<a
			href="https://github.com/3mdistal/portfolio"
			target="_blank"
			rel="noreferrer"
			aria-label="View Alice Alexandra Moore's portfolio code on GitHub"
		>
			<enhanced:img
				src="../../cms/images/social-media/github-cat.webp"
				alt="Link to GitHub in the form of a cat. Painted by Alice Alexandra Moore."
			/>
		</a>
	</div>
</div>

<style>
	img {
		transition: transform 0.5s cubic-bezier(0.43, -0.74, 0.43, 2);
		object-fit: contain;
	}

	a:hover img {
		transform: scale(1.1);
	}

	#container {
		--stagger-delay: 0.1s;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));

		@media screen and (min-width: 768px) {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	#container > div:where(#container > div) {
		opacity: 0;
	}

	/* --index assigned in script */
	#container > div {
		animation: popIn 0.5s forwards;
		animation-delay: calc(var(--index) * var(--stagger-delay));
	}

	@keyframes popIn {
		0% {
			transform: translateY(100px);
			opacity: 0;
		}
		100% {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>
