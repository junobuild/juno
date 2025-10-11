import { testWithII } from '@dfinity/internet-identity-playwright';
import { initTestSuite } from './utils/init.utils';

const getConsolePage = initTestSuite();

testWithII('should not allow creating a second satellite', async () => {
	const consolePage = getConsolePage();

	// First creation succeeds (use website by default – scenario symmetry with existing tests)
	await consolePage.createSatellite({ kind: 'website' });

	// Navigate back to root (Launchpad)
	await consolePage.goto();

	// Open Create Satellite wizard again
	await consolePage.openCreateSatelliteWizard();

	// Assert no create button is available
	await consolePage.failedAtCreatingSatellite();
});
