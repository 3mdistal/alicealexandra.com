import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vitest/config';
import mdsvexConfig from './mdsvex.config.js';

export default defineConfig({
	plugins: [
		// SvelteKit 3 takes what used to be svelte.config.js here.
		sveltekit({
			extensions: ['.svelte', ...(mdsvexConfig.extensions ?? [])],
			// Consult https://svelte.dev/docs/kit/integrations#Preprocessors
			// for more information about preprocessors
			preprocess: [vitePreprocess(), mdsvex(mdsvexConfig)],

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter(),

			prerender: {
				handleHttpError: ({ path, referrer, message, status }) => {
					// Ignore 404s for internal links that may not exist yet
					if (status === 404) {
						console.warn(`Warning: ${path} (linked from ${referrer}) returned 404`);
						return;
					}
					throw new Error(message);
				}
			}
		})
	],
	ssr: {
		noExternal: ['gsap']
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}', 'lint/**/*.test.ts', 'scripts/**/*.test.ts']
	}
});
