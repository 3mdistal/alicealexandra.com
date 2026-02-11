<script lang="ts">
	import { page } from '$app/stores';
	import { isActive, navItems } from '$lib/chrome/nav-model';

	const logo = '/images/logo/logo.png';
	const plainCircle = '/images/logo/plain-circle.svg';

	$: pathname = $page.url.pathname;
</script>

<nav class="site-chrome" aria-label="Primary">
	<a href="/" class="site-chrome__home" aria-label="Go home">
		<img src={logo} alt="" class="site-chrome__logo" />
		<div class="site-chrome__home-back">
			<img src={plainCircle} class="site-chrome__home-circle" alt="" />
			<span class="site-chrome__home-label">home.</span>
		</div>
	</a>

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
