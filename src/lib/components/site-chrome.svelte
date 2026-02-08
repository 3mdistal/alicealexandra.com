<script lang="ts">
	import { page } from '$app/stores';
	import { isActive, navItems } from '$lib/chrome/nav-model';

	$: pathname = $page.url.pathname;
</script>

<nav class="site-chrome" aria-label="Primary">
	<div class="site-chrome__surface">
		{#each navItems as item}
			<a
				href={item.href}
				class="site-chrome__link"
				class:site-chrome__link--active={isActive(pathname, item.href)}
				aria-current={isActive(pathname, item.href) ? 'page' : undefined}
			>
				{item.label}
			</a>
		{/each}
	</div>
</nav>
