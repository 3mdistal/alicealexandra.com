<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { isActive, navItems } from '$lib/chrome/nav-model';

	const logo = '/images/logo/logo.png';
	const plainCircle = '/images/logo/plain-circle.svg';

	let mobileMenuOpen = false;
	let isMobile = false;

	$: pathname = $page.url.pathname;

	$: {
		if (typeof document !== 'undefined') {
			document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
		}
	}

	function handleMobileMenuToggle(): void {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu(): void {
		mobileMenuOpen = false;
	}

	onMount(() => {
		const query = window.matchMedia('(max-width: 767px)');

		const syncViewportState = (matches: boolean) => {
			isMobile = matches;
			if (!matches) {
				mobileMenuOpen = false;
			}
		};

		syncViewportState(query.matches);

		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				mobileMenuOpen = false;
			}
		};

		const handleChange = (event: MediaQueryListEvent) => {
			syncViewportState(event.matches);
		};

		window.addEventListener('keydown', handleKeydown);
		query.addEventListener('change', handleChange);

		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', handleKeydown);
			query.removeEventListener('change', handleChange);
		};
	});
</script>

<nav class="site-chrome" class:site-chrome--mobile-open={mobileMenuOpen} aria-label="Primary">
	{#if isMobile}
		<button
			type="button"
			class="site-chrome__home site-chrome__home-button"
			on:click={handleMobileMenuToggle}
			aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
			aria-expanded={mobileMenuOpen}
			aria-controls="mobile-site-menu"
		>
			<img src={logo} alt="" class="site-chrome__logo" />
			<div class="site-chrome__home-back">
				<img src={plainCircle} class="site-chrome__home-circle" alt="" />
				<span class="site-chrome__home-label">menu.</span>
			</div>
		</button>
	{:else}
		<a href="/" class="site-chrome__home" aria-label="Go home">
			<img src={logo} alt="" class="site-chrome__logo" />
			<div class="site-chrome__home-back">
				<img src={plainCircle} class="site-chrome__home-circle" alt="" />
				<span class="site-chrome__home-label">home.</span>
			</div>
		</a>
	{/if}

	<div class="site-chrome__surface" aria-label="Primary sections">
		{#each navItems as item}
			{#if item.href !== '/'}
				<a
					href={item.href}
					class="site-chrome__link"
					class:site-chrome__link--active={isActive(pathname, item.href)}
					aria-current={isActive(pathname, item.href) ? 'page' : undefined}
				>
					{item.label}
				</a>
			{/if}
		{/each}
	</div>
</nav>

<div
	id="mobile-site-menu"
	class="site-chrome-mobile"
	class:site-chrome-mobile--open={mobileMenuOpen}
	aria-hidden={!mobileMenuOpen}
>
	<div class="site-chrome-mobile__surface">
		{#each navItems as item}
			<a
				href={item.href}
				class="site-chrome-mobile__link"
				class:site-chrome-mobile__link--active={isActive(pathname, item.href)}
				on:click={closeMobileMenu}
			>
				{item.label}
			</a>
		{/each}
	</div>
</div>
