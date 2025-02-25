<script lang="ts">
	import { goto } from '$app/navigation';
	import TextMacro from '$lib/notion/text-macro.svelte';
	import type { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
	import { onMount } from 'svelte';

	export let accent: string;
	export let data: { post: QueryDatabaseResponse };

	let {
		post: { results }
	} = data;

	onMount(() => {
		fetch('/blog', {
			headers: {
				Accept: 'application/json',
				'x-prerender-revalidate': 'JKmtY3BJXXbqQNvcGTUCEkPrrScrd5fs'
			}
		});
	});
</script>

<h1 class="posts-title" style="color: {accent}">Posts</h1>
{#each results as { properties: { Slug: { url }, Name: { title: [{ text: { content: title } }] }, Subtitle, Category: { select: { name: category } }, FormattedPublicationDate: { formula: { string: date } } } }}
	<div class="post-item">
		<p class="post-title-wrapper">
			<a
				on:mousedown={() => {
					title = 'Loading . . .';
					goto(`/blog/${url}`);
				}}
				on:click|preventDefault
				class="post-title-link"
				href="/blog/{url}">{title}</a
			>
		</p>
		<p class="post-subtitle"><TextMacro type={Subtitle} /></p>
		<p class="post-date">
			{date}
		</p>
		<div class="post-category-wrapper">
			<p class="post-category">
				{category}
			</p>
		</div>
	</div>
{/each}

<style>
	.posts-title {
		margin-bottom: 1em;
		font-weight: 500;
		font-size: 4rem;
	}

	.post-item {
		display: grid;
		grid-template-columns: 1fr 1fr;
		margin-bottom: 3rem;

		@media (min-width: 768px) {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}

	.post-title-wrapper {
		grid-column: span 2;
		margin-bottom: 0;
	}

	.post-title-link {
		color: white;
		font-weight: 500;
		font-size: 2rem;
		line-height: 1;
		font-family: 'Spectral', serif;

		@media (max-width: 768px) {
			font-size: 1.75rem;
		}
	}

	.post-title-link:hover {
		text-decoration: underline;
	}

	.post-title-link:active {
		color: #9ca3af;
	}

	.post-subtitle {
		grid-row-start: 2;
		grid-column: span 2;
		margin-bottom: 0.5em;
		max-width: 45ch;
		color: #f3f4f6;
		font-style: italic;
		font-size: 1.25rem;
		line-height: 1;
		text-wrap: balance;
	}

	.post-date {
		grid-row-start: 3;
		color: #f3f4f6;

		@media (min-width: 768px) {
			grid-row-start: 1;
			grid-column-start: 3;
		}
	}

	.post-category-wrapper {
		display: flex;
		grid-column-start: 2;
		justify-content: flex-end;

		@media (min-width: 768px) {
			grid-column-start: 1;
			justify-content: flex-start;
		}
	}

	.post-category {
		color: #f3f4f6;

		@media (max-width: 768px) {
			display: none;
		}
	}
</style>
