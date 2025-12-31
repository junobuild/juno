import { testWithII } from '@dfinity/internet-identity-playwright';
import { initTestSuite } from './utils/init.utils';

const getConsolePage = initTestSuite();

testWithII(
	'should have wallet balance equal 330.010 T Cycles when developer click on Get Cycles',
	async () => {
		testWithII.setTimeout(60_000);

		const consolePage = getConsolePage();

		await consolePage.getCycles({ balance: '330.010 T Cycles' });
	}
);
