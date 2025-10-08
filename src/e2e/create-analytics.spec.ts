import { testWithII } from '@dfinity/internet-identity-playwright';
import { expect } from '@playwright/test';
import { testIds } from '$lib/constants/test-ids.constants';
import { initTestSuite } from './utils/init.utils';

const getConsolePage = initTestSuite();

testWithII('should create Analytics via wizard', async () => {
	const consolePage = getConsolePage();

	await consolePage.createAnalytics();
});

testWithII('should verify Analytics creation success', async () => {
	const consolePage = getConsolePage();

	// Navigate back to Analytics page to verify creation
	await consolePage.page.getByTestId(testIds.createAnalytics.navLink).click();

	// Take screenshot to verify the Analytics page after creation
	await expect(consolePage.page).toHaveScreenshot({ fullPage: true });
});
