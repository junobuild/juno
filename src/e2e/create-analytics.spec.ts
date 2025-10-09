import { testWithII } from '@dfinity/internet-identity-playwright';
import { expect } from '@playwright/test';
import { initTestSuite } from './utils/init.utils';

const getConsolePage = initTestSuite();

testWithII('should create Analytics via wizard', async () => {
	const consolePage = getConsolePage();

	await consolePage.createAnalytics();
});

testWithII('should verify Analytics creation success', async () => {
	const consolePage = getConsolePage();

	// Navigate back to Analytics page to verify creation
	await consolePage.page.goto('/analytics');

	// Take screenshot to verify the Analytics page after creation
	await expect(consolePage.page).toHaveScreenshot({ fullPage: true });
});
