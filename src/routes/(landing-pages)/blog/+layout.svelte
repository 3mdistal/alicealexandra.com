<script>
	// Import any necessary components
</script>

<slot />

<style>
	/* Define CSS variables for blog */
	:global(:root) {
		/* Colors */
		--blog-text-light: #111827;
		--blog-text-dark: #e5e7eb;
		--blog-bg-light: #e5e7eb;
		--blog-bg-dark: #141414;
		--blog-link-light: #31676c;
		--blog-link-dark: #67e8f9;
		--blog-link-hover-dark: #a5f3fc;
		--blog-accent-light: #374151;
		--blog-accent-dark: #d1d5db;
		--blog-secondary-light: #6b7280;
		--blog-secondary-dark: #d1d5db;
		--blog-secondary-dark: #9ca3af;
		--blog-heading-light: #111827;
		--blog-heading-dark: #f3f4f6;
		--blog-callout-light: #d1d5db;
		--blog-callout-dark: #1f2937;
		--blog-quote-bg-light: #f3f4f6;
		--blog-quote-bg-dark: #1f2937;
		--blog-code-bg-light: #d1d5db;
		--blog-code-bg-dark: #141414;
		--blog-inline-code-bg-light: #e5e7eb;
		--blog-inline-code-bg-dark: #1f2937;
		--blog-code-tag-light: #0f766e;
		--blog-code-tag-dark: #f87171;
		--blog-code-property-light: #374151;
		--blog-code-property-dark: #e5e7eb;
		--blog-divider-light: #6b7280;
		--blog-divider-dark: #4b5563;
		--blog-mention-light: #0f766e;
		--blog-mention-dark: #34d399;
		--blog-equation-light: #4b5563;
		--blog-equation-dark: #d1d5db;
		--blog-border-light: #939599;
		--blog-border-dark: #686a6c;

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
