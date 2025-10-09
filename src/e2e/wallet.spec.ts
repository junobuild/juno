import { testWithII } from '@dfinity/internet-identity-playwright';
import { initTestSuite } from './utils/init.utils';

const getConsolePage = initTestSuite();

testWithII('should have wallet balance equal 55.0001 ICP when user click on Get ICP', async () => {
	testWithII.setTimeout(60_000);

	const consolePage = getConsolePage();

	await consolePage.getICP({ balance: '55.0001 ICP' });
});
