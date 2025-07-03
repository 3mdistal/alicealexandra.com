<script>
	// Import any necessary components
</script>

<slot />

<style>
	/* Define CSS variables for blog - white text hierarchy for all modes */
	:global(:root) {
		/* White text hierarchy - no light/dark mode switching */
		--blog-text: #ffffff;
		--blog-bg: #141414;
		--blog-link: #ffffff;
		--blog-link-hover: #e5e7eb;
		--blog-accent: #e5e7eb;
		--blog-secondary: #d1d5db;
		--blog-heading: #ffffff;
		--blog-callout: #1f2937;
		--blog-quote-bg: #1f2937;
		--blog-code-bg: #141414;
		--blog-inline-code-bg: #1f2937;
		--blog-code-tag: #ffffff;
		--blog-code-property: #e5e7eb;
		--blog-divider: #9ca3af;
		--blog-mention: #ffffff;
		--blog-equation: #e5e7eb;
		--blog-border: #686a6c;
		--blog-heading-dark: #ffffff;
		--blog-secondary-dark: #d1d5db;
	}

	:global(:root) {
		/* Typography */
		--blog-heading-large: 3.75rem;
		--blog-heading-medium: 2.25rem;
		--blog-heading-small: 1.5rem;
		--blog-body-large: 1.5rem;
		--blog-body: 1.25rem;
		--blog-body-small: 1.125rem;
		--blog-code: 1.125rem;

		/* Spacing */
		--blog-spacing-xl: 4rem;
		--blog-spacing-lg: 2.5rem;
		--blog-spacing-md: 1.5rem;
		--blog-spacing-sm: 1rem;
		--blog-spacing-xs: 0.5rem;

		/* Layout */
		--blog-content-width: 60ch;
		--blog-subtitle-width: 45ch;
		--blog-blockquote-width: 40ch;
		--blog-border-radius: 0.375rem;
		--blog-border-radius-sm: 0.25rem;
	}
</style>
