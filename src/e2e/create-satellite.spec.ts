import { initTestSuite } from './utils/init.utils';
import { testWithII } from '@dfinity/internet-identity-playwright';

const getConsolePage = initTestSuite();

testWithII('should create a satellite', async () => {
	const consolePage = getConsolePage();

	await consolePage.createSatellite();
});

testWithII('should visite newly create satellite', async () => {
	const consolePage = getConsolePage();

	await consolePage.visitSatellite();
});