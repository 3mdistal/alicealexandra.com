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
		deployConfigured: boolean;
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
		<h1 class="owner-title">Edit the site’s blog content from here.</h1>
		<p class="owner-copy">
			Sign in once with GitHub, then open any blog post and the inline edit button will appear for
			your session.
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
				<p class="owner-status-row">
					<span>Vercel deploy hook</span>
					<strong>{ownerStatus.deployConfigured ? 'Ready' : 'Optional / missing'}</strong>
				</p>
			</div>

			{#if ownerStatus.isOwner}
				<p class="owner-status">
					Signed in as <strong>{ownerStatus.owner?.name || ownerStatus.owner?.login}</strong>
				</p>
				<div class="owner-actions">
					<a class="owner-button primary" href="/blog">Open the blog</a>
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
		padding: 7rem 1.5rem 3rem;
		min-height: 100vh;
	}

	.owner-card {
		border: 1px solid var(--color-content-border);
		background: var(--color-content-bg);
		padding: 2rem;
		width: min(100%, 40rem);
		color: var(--color-content-text);
	}

	.owner-kicker {
		margin: 0 0 0.75rem;
		color: var(--color-content-secondary);
		font-size: var(--content-font-size-body-sm);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.owner-title {
		margin: 0 0 1rem;
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
		margin: 0 0 1.5rem;
	}

	.owner-error {
		margin: 0 0 1rem;
		color: var(--color-content-link);
	}

	.owner-status-group {
		margin-bottom: 1.5rem;
		border-top: 1px solid var(--color-content-border);
		border-bottom: 1px solid var(--color-content-border);
		padding: 1rem 0;
	}

	.owner-status-row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin: 0;
	}

	.owner-status-row + .owner-status-row {
		margin-top: 0.5rem;
	}

	.owner-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.owner-button {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		padding: 0.85rem 1.25rem;
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
			padding-top: 6rem;
		}

		.owner-card {
			padding: 1.5rem;
		}

		.owner-status-row {
			flex-direction: column;
			gap: 0.15rem;
		}
	}
</style>
