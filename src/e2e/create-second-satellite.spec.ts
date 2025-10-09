import { testWithII } from '@dfinity/internet-identity-playwright';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
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
  await expect(consolePage.failedAtCreatingSatellite()).resolves.toBe(true);

  // Assert the message about required ICP and current wallet balance is displayed
  const page = consolePage.getPage();
  await expect(page.getByText('Starting a new satellite requires 0.5000 ICP. Your current wallet balance is 0.0000 ICP.')).toBeVisible();
});