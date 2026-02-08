<script lang="ts">
	import CareerDetailShell from '$lib/components/career-detail-shell.svelte';
</script>

<svelte:head>
	<title>Builder.io Work | Career</title>
	<meta name="description" content="This page has moved to the Builder.io career archive." />
	<link rel="canonical" href="https://alicealexandra.com/career/builder" />
</svelte:head>

<CareerDetailShell
	title="Builder.io work moved to"
	highlight="/career/builder"
	subtitle="Use the updated page for the latest Builder.io posts and writing."
	contentMaxWidth="56rem"
>
	<div class="placeholder">
		<p>
			The Builder.io archive now lives at
			<a class="inline-link" href="/career/builder">/career/builder</a>.
		</p>
		<a href="/career/builder" class="primary-link">Go to Builder.io work →</a>
	</div>
</CareerDetailShell>

<style>
	.placeholder {
		box-shadow: var(--shadow-1);
		border-radius: var(--radius-3);
		background-color: var(--color-surface);
		padding: var(--space-8);
		text-align: center;
	}

	.placeholder p {
		margin: 0 0 var(--space-5);
		color: var(--color-text-muted);
		font-size: 1.125rem;
		line-height: var(--line-height-body);
	}

	.inline-link {
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
		text-decoration: underline;
	}

	.primary-link {
		display: inline-block;
		transition:
			background-color var(--duration-base) var(--ease-standard),
			color var(--duration-base) var(--ease-standard),
			transform var(--duration-base) var(--ease-standard);
		border: 2px solid var(--color-accent);
		border-radius: var(--radius-2);
		background-color: var(--color-surface);
		padding: var(--space-3) var(--space-5);
		color: var(--color-accent);
		font-weight: var(--font-weight-medium);
		text-decoration: none;
	}

	.primary-link:hover {
		transform: translateY(calc(var(--space-1) * -1));
		background-color: var(--color-accent);
		color: var(--color-surface);
	}

	@media (min-width: 768px) {
		.placeholder {
			padding: calc(var(--space-8) + var(--space-2));
		}
	}
</style>
