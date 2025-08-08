import { testWithII } from '@dfinity/internet-identity-playwright';
import { expect } from '@playwright/test';
import type { BrowserContextOptions } from 'playwright-core';
import { initTestSuite } from './utils/init.utils';

const getConsolePage = initTestSuite();

const themes: BrowserContextOptions['colorScheme'][] = ['light', 'dark'];

themes.forEach((colorScheme) => {
	testWithII.describe(`${colorScheme} mode`, () => {
		testWithII.use({
			colorScheme
		});

		testWithII('should create a satellite', async () => {
			const consolePage = getConsolePage();

			await consolePage.createSatellite();
		});

		testWithII('should visite newly create satellite', async () => {
			const consolePage = getConsolePage();

			const satellitePage = await consolePage.visitSatellite();

			await expect(satellitePage).toHaveScreenshot({ fullPage: true });
		});
	});
});
