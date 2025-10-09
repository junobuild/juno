import { expect, test } from '@playwright/test';
import type { Page } from 'playwright-core';

test.describe('redirect to 404', () => {
	const testCases: {
		name: string;
		invalidUrls: string[];
		wait?: (params: { page: Page }) => Promise<void>;
	}[] = [
		{
			name: 'astro-demo',
			invalidUrls: [
				'https://nkzsw-gyaaa-aaaal-ada3a-cai.icp0.io/unknown',
				'https://nkzsw-gyaaa-aaaal-ada3a-cai.icp0.io/unknown/unknown'
			]
		},
		{
			name: 'juno-docs',
			invalidUrls: [
				'https://juno.build/unknown',
				'https://juno.build/unknown/unknown',
				'https://juno.build/docs/unknown',
				'https://juno.build/docs/examples/functions/unknown'
			]
		},
		{
			name: 'juno-console',
			invalidUrls: ['https://console.juno.build/unknown'],
			wait: async ({ page }) => {
				const orderSent = page.locator('.container p[role="presentation"]');
				await orderSent.waitFor();
			}
		}
	];

	testCases.forEach(({ invalidUrls, wait }) => {
		invalidUrls.forEach((invalidUrl) => {
			test(`should redirect ${invalidUrl} to 404`, async ({ page }) => {
				const response = await page.goto(invalidUrl, { waitUntil: 'domcontentloaded' });

				expect(response?.status()).toBe(404);

				await page.waitForFunction(() => document.fonts.ready);

				await wait?.({ page });

				await expect(page).toHaveScreenshot({ maxDiffPixelRatio: 0.05 });
			});
		});
	});
});
