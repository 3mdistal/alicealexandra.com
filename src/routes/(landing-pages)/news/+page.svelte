<script lang="ts">
	import { onDestroy } from 'svelte';
	import { state } from '$lib/stores';
	import { marked } from 'marked';

	// Read the CHANGELOG.md content
	import changelog from '../../../../CHANGELOG.md?raw';

	// Parse markdown to HTML
	const changelogHtml = marked(changelog);

	onDestroy(() => {
		state.set('home');
	});
</script>

<svelte:head>
	<title>News</title>
	<meta name="description" content="Recent changes and updates to Tempo Immaterial." />
</svelte:head>

<div class="container">
	<h1>News</h1>
	<div class="changelog-content">
		{@html changelogHtml}
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #eeeded;
		padding: 5rem 1rem;
		min-height: 100lvh;
	}

	h1 {
		margin-bottom: 2rem;
		color: #726a12;
	}

	.changelog-content {
		margin: 0 auto;
		width: 100%;
		max-width: 800px;
		line-height: 1.6;
	}

	.changelog-content :global(h2) {
		margin-top: 2rem;
		margin-bottom: 1rem;
		color: #726a12;
	}

	.changelog-content :global(ul) {
		margin-bottom: 1.5rem;
		margin-left: 1.5rem;
		list-style-type: disc;
	}

	.changelog-content :global(li) {
		margin-bottom: 0.5rem;
	}

	.changelog-content :global(p) {
		margin-bottom: 1rem;
	}
</style>
