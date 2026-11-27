import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit({
			extensions: ['.svelte', ...mdsvexConfig.extensions],
			// Consult https://kit.svelte.dev/docs/integrations#preprocessors
			// for more information about preprocessors
			preprocess: [vitePreprocess(), mdsvex(mdsvexConfig)],

			// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://kit.svelte.dev/docs/adapters for more information about adapters.
			adapter: adapter(),

			// Type-check the site's ESLint plugin along with the app.
			prerender: {
				handleHttpError: ({ path, referrer, message }) => {
					// Ignore 404s for internal links that may not exist yet
					if (message.includes('404')) {
						console.warn(`Warning: ${path} (linked from ${referrer}) returned 404`);

						return;
					}

					throw new Error(message);
				}
			}
		})
	],
	ssr: { noExternal: ['gsap'] },
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}', 'lint/**/*.test.ts', 'scripts/**/*.test.ts']
	}
});
