<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	let {
		title,
		subtitle,
		summary,
		text
	}: {
		title: Snippet;
		subtitle: Snippet;
		summary: Snippet;
		text: Snippet;
	} = $props();
</script>

<div class="coming-soon" in:fade={{ duration: 500 }} out:fade={{ duration: 500 }}>
	<h1>{@render title()}</h1>
	<p>
		<em>{@render subtitle()}</em>
	</p>
	<hr />
	<p>
		<em class="tl-dr">tl;dr</em>
		{@render summary()}
	</p>
	<hr />
	<div class="coming-soon__text">{@render text()}</div>
	<p>
		<a href="/studio#works">back.</a>
	</p>
</div>

<style>
	.coming-soon {
		background-color: black;
		padding: 2.5rem 1rem;
		height: 100%;
		min-height: 100vh;
		color: white;
		letter-spacing: 0.025em;
	}

	.coming-soon * {
		color: inherit;
	}

	h1 {
		margin-bottom: 0.5rem;
		color: white;
		font-size: 3rem;
		line-height: 1;
	}

	p {
		margin-bottom: 1em;
		max-width: 25ch;
		font-size: 1.5rem;
		line-height: 2rem;
	}

	hr {
		opacity: 0.5;
		margin: 2.5rem 2.5rem;
	}

	em.tl-dr {
		margin-right: 1rem;
		color: white;
		font-weight: 500;
	}

	.coming-soon__text {
		max-width: 60ch;
		font-size: 1.25rem;
		line-height: 1.75rem;
	}

	:global(.coming-soon__text *) {
		color: inherit;
	}

	:global(.coming-soon__text p) {
		margin-bottom: 1em;
	}

	p:last-child {
		font-size: 2.25rem;
		line-height: 2.5rem;
		text-align: right;
	}

	a {
		display: inline-block;
		padding: 1.5rem;
		color: white;
	}

	@media (min-width: 640px) {
		.coming-soon {
			padding-right: 2.5rem;
			padding-left: 2.5rem;
		}
	}

	@media (min-width: 768px) {
		h1 {
			font-size: 4.5rem;
			line-height: 1;
		}

		p {
			font-size: 2.25rem;
			line-height: 2.5rem;
		}

		p:last-child {
			font-size: 3.75rem;
			line-height: 1;
		}
	}

	@media (min-width: 1024px) {
		.coming-soon__text {
			font-size: 1.5rem;
			line-height: 2rem;
		}
	}
</style>
