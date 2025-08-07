import { defineConfig, devices } from '@playwright/test';

const DEV = (process.env.NODE_ENV ?? 'production') === 'development';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: './src/e2e',
	snapshotDir: './src/e2e/snapshots',
	testMatch: ['**/*.e2e.ts', '**/*.spec.ts'],
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	expect: {
		toHaveScreenshot: {
			animations: 'disabled',
			caret: 'hide'
		}
	},
	use: {
		testIdAttribute: 'data-tid',
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry',
		...(DEV && { headless: false })
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
