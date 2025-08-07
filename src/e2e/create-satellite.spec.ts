import { initTestSuite } from './utils/init.utils';
import { testWithII } from '@dfinity/internet-identity-playwright';
import { expect } from '@playwright/test';

const getConsolePage = initTestSuite();

testWithII('should create a satellite', async () => {
	const consolePage = getConsolePage();

	await consolePage.createSatellite();
});

testWithII('should visite newly create satellite', async () => {
	const consolePage = getConsolePage();

	const satellitePage = await consolePage.visitSatellite();

	await expect(satellitePage).toHaveScreenshot();
});