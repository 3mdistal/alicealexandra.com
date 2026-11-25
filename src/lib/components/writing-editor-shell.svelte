<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let ownerName = '';
	export let fileLabel = '';
	export let isEditMode = false;
	export let isLoadingEditor = false;
	export let isSaving = false;
	export let errorMessage = '';
	export let noticeMessage = '';
	export let commitUrl = '';

	const dispatch = createEventDispatcher<{
		open: void;
		close: void;
		save: void;
	}>();
</script>

<div class="writing-editor-shell">
	<div class="editor-toolbar">
		<div class="editor-toolbar-copy">
			<p class="editor-toolbar-kicker">Owner mode</p>
			<p class="editor-toolbar-text">
				{#if isEditMode}
					Editing <strong>{fileLabel}</strong> in teenylilcontent.
				{:else}
					Signed in as <strong>{ownerName}</strong>.
				{/if}
			</p>
		</div>
		<div class="editor-toolbar-actions">
			<a class="editor-action secondary" href="/owner">Owner</a>
			{#if isEditMode}
				<button
					class="editor-action secondary"
					type="button"
					on:click={() => dispatch('close')}
					disabled={isSaving}
				>
					Cancel
				</button>
				<button
					class="editor-action primary"
					type="button"
					on:click={() => dispatch('save')}
					disabled={isSaving}
				>
					{isSaving ? 'Saving…' : 'Save & publish'}
				</button>
			{:else}
				<button
					class="editor-action primary"
					type="button"
					on:click={() => dispatch('open')}
					disabled={isLoadingEditor}
				>
					{isLoadingEditor ? 'Loading…' : 'Edit'}
				</button>
			{/if}
		</div>
	</div>

	{#if errorMessage}
		<div class="editor-feedback editor-feedback-error">{errorMessage}</div>
	{/if}

	{#if noticeMessage}
		<div class="editor-feedback editor-feedback-success">
			<span>{noticeMessage}</span>
			{#if commitUrl}
				<a href={commitUrl} target="_blank" rel="noreferrer">View commit</a>
			{/if}
		</div>
	{/if}
</div>

<style>
	.writing-editor-shell {
		margin-bottom: var(--space-6);
	}

	.editor-toolbar,
	.editor-feedback {
		margin: 0 auto var(--space-5);
		border: 1px solid var(--color-content-border);
		background: color-mix(in srgb, var(--color-content-bg) 92%, var(--color-content-text) 8%);
		padding: var(--space-4);
	}

	.editor-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
	}

	.editor-toolbar-kicker {
		margin: 0 0 var(--space-1);
		color: var(--color-content-secondary);
		font-size: var(--content-font-size-body-sm);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.editor-toolbar-text,
	.editor-feedback {
		font-size: var(--content-font-size-body-sm);
		line-height: 1.5;
	}

	.editor-toolbar-text {
		margin: 0;
	}

	.editor-toolbar-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.editor-action {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		border: 1px solid var(--color-content-border);
		background: transparent;
		padding: 0.7rem var(--space-4);
		color: var(--color-content-text);
		font: inherit;
		text-decoration: none;
	}

	.editor-action.primary {
		background: var(--color-content-text);
		color: var(--color-content-bg);
	}

	.editor-action:disabled {
		opacity: 0.6;
		cursor: wait;
	}

	.editor-feedback {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
	}

	.editor-feedback a {
		color: inherit;
	}

	.editor-feedback-error {
		border-color: var(--color-content-link);
	}

	@media (max-width: 767px) {
		.editor-toolbar,
		.editor-feedback {
			flex-direction: column;
			align-items: flex-start;
		}

		.editor-toolbar-actions {
			width: 100%;
		}

		.editor-action {
			flex: 1 1 auto;
		}
	}
</style>
