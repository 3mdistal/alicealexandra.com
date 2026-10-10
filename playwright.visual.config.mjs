import { defineConfig, devices } from '@playwright/test';

// Pixel comparisons for changes that shouldn't move a pixel, such as restructuring the design
// tokens. Screenshots depend on the machine's fonts and rendering, so they aren't committed:
// record a baseline on the base commit with `pnpm test:visual --update-snapshots`, then run
// `pnpm test:visual` on the change. Uses real content (`pnpm setup:content`), not the CI stub, and
// a production build, since the dev server can reload a page mid-test while it optimizes dependencies.
const port = 4175;

export default defineConfig({
	testDir: 'tests/visual',
	snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
	fullyParallel: true,
	workers: 4,
	reporter: 'list',

	expect: {
		// GSAP intros ignore reduced motion; the studio's runs for about 3 seconds.
		timeout: 15000,
		toHaveScreenshot: {
			threshold: 0,
			maxDiffPixels: 0,
			animations: 'disabled',
			caret: 'hide'
		}
	},

	use: {
		baseURL: `http://127.0.0.1:${port}`,
		...devices['Desktop Chrome'],
		reducedMotion: 'reduce'
	},

	webServer: {
		command: `node node_modules/vite/bin/vite.js build && node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port ${port} --strictPort`,
		url: `http://127.0.0.1:${port}`,
		reuseExistingServer: false,
		timeout: 600000
	}
});
