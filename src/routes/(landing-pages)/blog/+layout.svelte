<script>
	// Import any necessary components
</script>

<slot />

<style>
	/* Define CSS variables for blog with proper media queries */
	:global(:root) {
		/* Colors for light mode */
		--blog-text: #111827;
		--blog-bg: #e5e7eb;
		--blog-link: #31676c;
		--blog-link-hover: #1e4042;
		--blog-accent: #374151;
		--blog-secondary: #6b7280;
		--blog-heading: #111827;
		--blog-callout: #d1d5db;
		--blog-quote-bg: #f3f4f6;
		--blog-code-bg: #d1d5db;
		--blog-inline-code-bg: #e5e7eb;
		--blog-code-tag: #0f766e;
		--blog-code-property: #374151;
		--blog-divider: #6b7280;
		--blog-mention: #0f766e;
		--blog-equation: #4b5563;
		--blog-border: #939599;

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
