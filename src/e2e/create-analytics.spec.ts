import { test } from '@playwright/test';
import { initTestSuite } from './utils/init.utils';

const getConsolePage = initTestSuite();

test('should create analytics', async () => {
	const consolePage = getConsolePage();

	await consolePage.createAnalytics();
});
