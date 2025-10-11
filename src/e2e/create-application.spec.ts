import { testWithII } from '@dfinity/internet-identity-playwright';
import { expect } from '@playwright/test';
import { initTestSuite } from './utils/init.utils';

const getConsolePage = initTestSuite();

testWithII('should create a satellite for an application', async () => {
	const consolePage = getConsolePage();

	await consolePage.createSatellite({ kind: 'application' });
});

testWithII('should visit newly create satellite', async () => {
	const consolePage = getConsolePage();

	const satellitePage = await consolePage.visitSatellite();

	await expect(satellitePage).toHaveScreenshot({ fullPage: true });
});
