<script lang="ts">
	import { onMount } from 'svelte';

	type OwnerStatus = {
		isOwner: boolean;
		owner: {
			login: string;
			name: string | null;
			avatarUrl: string | null;
		} | null;
		authConfigured: boolean;
		publishConfigured: boolean;
	};

	let ownerStatus: OwnerStatus | null = null;
	let loading = true;
	let errorMessage = '';

	const searchParams =
		typeof window === 'undefined'
			? new URLSearchParams()
			: new URLSearchParams(window.location.search);
	const ownerErrorCode = searchParams.get('error');

	const errorLabels: Record<string, string> = {
		'auth-not-configured': 'GitHub owner authentication is not configured yet.',
		'invalid-state': 'The GitHub sign-in session expired. Please try again.',
		'token-exchange-failed': 'GitHub sign-in could not finish. Please try again.',
		'github-user-fetch-failed': 'GitHub returned an unexpected response while signing in.',
		'owner-not-authorized': 'The signed-in GitHub account is not allowed to edit this site.'
	};

	if (ownerErrorCode) {
		errorMessage = errorLabels[ownerErrorCode] ?? 'Owner sign-in failed.';
	}

	onMount(async () => {
		try {
			const response = await fetch('/api/owner/session');
			if (!response.ok) {
				throw new Error('Failed to load owner status.');
			}

			ownerStatus = (await response.json()) as OwnerStatus;
		} catch (caughtError) {
			errorMessage =
				caughtError instanceof Error ? caughtError.message : 'Failed to load owner status.';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Owner</title>
</svelte:head>

<div class="owner-page">
	<div class="owner-card">
		<p class="owner-kicker">Owner mode</p>
		<h1 class="owner-title">Edit the site’s writing from here.</h1>
		<p class="owner-copy">
			Sign in once with GitHub, then open any blog post, poem, postcard, or tall tale and the inline
			edit button will appear for your session.
		</p>

		{#if errorMessage}
			<p class="owner-error">{errorMessage}</p>
		{/if}

		{#if loading}
			<p class="owner-status">Checking owner session…</p>
		{:else if ownerStatus}
			<div class="owner-status-group">
				<p class="owner-status-row">
					<span>Authentication</span>
					<strong>{ownerStatus.authConfigured ? 'Ready' : 'Missing setup'}</strong>
				</p>
				<p class="owner-status-row">
					<span>Content publishing</span>
					<strong>{ownerStatus.publishConfigured ? 'Ready' : 'Missing setup'}</strong>
				</p>
			</div>

			{#if ownerStatus.isOwner}
				<p class="owner-status">
					Signed in as <strong>{ownerStatus.owner?.name || ownerStatus.owner?.login}</strong>
				</p>
				<div class="owner-actions">
					<a class="owner-button primary" href="/blog">Open the blog</a>
					<a class="owner-button secondary" href="/studio/hfc">Open poems</a>
					<a class="owner-button secondary" href="/studio/postcards">Open postcards</a>
					<a class="owner-button secondary" href="/studio/tall-tales">Open tall tales</a>
					<a class="owner-button secondary" href="/api/auth/logout?redirectTo=/owner">Sign out</a>
				</div>
			{:else}
				<div class="owner-actions">
					<a class="owner-button primary" href="/api/auth/github?redirectTo=/blog">
						Sign in with GitHub
					</a>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.owner-page {
		display: flex;
		justify-content: center;
		align-items: center;
		background: var(--color-bg);
		padding: 7rem var(--space-24) var(--space-48);
		min-height: 100vh;
	}

	.owner-card {
		border: 1px solid var(--color-content-border);
		background: var(--color-content-bg);
		padding: var(--space-32);
		width: min(100%, 40rem);
		color: var(--color-content-text);
	}

	.owner-kicker {
		margin: 0 0 var(--space-12);
		color: var(--color-content-secondary);
		font-size: var(--content-font-size-body-sm);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.owner-title {
		margin: 0 0 var(--space-16);
		color: var(--color-content-heading);
		font-size: clamp(2rem, 4vw, 3.5rem);
		line-height: 1;
		font-family: var(--font-serif);
	}

	.owner-copy,
	.owner-status,
	.owner-error,
	.owner-status-row {
		font-size: var(--content-font-size-body);
		line-height: 1.6;
	}

	.owner-copy {
		margin: 0 0 var(--space-24);
	}

	.owner-error {
		margin: 0 0 var(--space-16);
		color: var(--color-content-link);
	}

	.owner-status-group {
		margin-bottom: var(--space-24);
		border-top: 1px solid var(--color-content-border);
		border-bottom: 1px solid var(--color-content-border);
		padding: var(--space-16) 0;
	}

	.owner-status-row {
		display: flex;
		justify-content: space-between;
		gap: var(--space-16);
		margin: 0;
	}

	.owner-status-row + .owner-status-row {
		margin-top: var(--space-8);
	}

	.owner-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-12);
		margin-top: var(--space-24);
	}

	.owner-button {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		padding: var(--space-12) var(--space-20);
		text-decoration: none;
	}

	.owner-button.primary {
		background: var(--color-content-text);
		color: var(--color-content-bg);
	}

	.owner-button.secondary {
		border: 1px solid var(--color-content-border);
		color: var(--color-content-text);
	}

	@media (max-width: 640px) {
		.owner-page {
			padding-top: var(--space-96);
		}

		.owner-card {
			padding: var(--space-24);
		}

		.owner-status-row {
			flex-direction: column;
			gap: var(--space-4);
		}
	}
</style>
