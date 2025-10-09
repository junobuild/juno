import { testWithII } from '@dfinity/internet-identity-playwright';
import { initTestSuite } from './utils/init.utils';

const getConsolePage = initTestSuite();

testWithII('should create analytics', async () => {
	const consolePage = getConsolePage();

	await consolePage.createAnalytics();
});
