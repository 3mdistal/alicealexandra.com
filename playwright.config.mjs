import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env['CI'];

export default defineConfig({
	// Keep e2e tests separate from vitest unit tests.
	testDir: 'tests/e2e',
	fullyParallel: true,
	forbidOnly: isCI,
	retries: isCI ? 2 : 0,
	...(isCI ? { workers: 1 } : {}),
	reporter: isCI ? 'github' : 'html',

	use: {
		baseURL: 'http://127.0.0.1:4173',
		trace: 'on-first-retry'
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],

	webServer: {
		// CI should stub content before this runs.
		command: 'pnpm preview -- --host 127.0.0.1 --port 4173',
		url: 'http://127.0.0.1:4173',
		reuseExistingServer: !isCI,
		timeout: 120000
	}
});
