import { test } from '@playwright/test';
import { initTestSuite } from './utils/init.utils';

const getConsolePage = initTestSuite();

test('should have wallet balance equal 330.010 TCycles when developer click on Get Cycles', async () => {
	test.setTimeout(60_000);

	const consolePage = getConsolePage();

	await consolePage.getCycles({ balance: '330.010 TCycles' });
});
