import { testIds } from '$lib/constants/test-ids.constants';
import { InternetIdentityPage } from '@dfinity/internet-identity-playwright';
import { expect } from '@playwright/test';
import type { Page } from 'playwright-core';
import { TIMEOUT_AVERAGE, TIMEOUT_LONG, TIMEOUT_SHORT } from '../constants/e2e.constants';
import { IdentityPage, type IdentityPageParams } from './identity.page';

export class ConsolePage extends IdentityPage {
	#consoleIIPage: InternetIdentityPage;

	constructor(params: IdentityPageParams) {
		super(params);

		this.#consoleIIPage = new InternetIdentityPage({
			page: this.page,
			context: this.context,
			browser: this.browser
		});
	}

	async goto(): Promise<void> {
		await this.page.goto('/');
	}

	async signIn(): Promise<void> {
		this.identity = await this.#consoleIIPage.signInWithNewIdentity({
			selector: `[data-tid=${testIds.auth.signIn}]`
		});
	}

	async waitReady(): Promise<void> {
		const CONTAINER_URL = 'http://127.0.0.1:5987';
		const INTERNET_IDENTITY_ID = 'rdmx6-jaaaa-aaaaa-aaadq-cai';

		await this.#consoleIIPage.waitReady({ url: CONTAINER_URL, canisterId: INTERNET_IDENTITY_ID });
	}

	async createSatellite({ kind }: { kind: 'website' | 'application' }): Promise<void> {
		await expect(this.page.getByTestId(testIds.createSatellite.launch)).toBeVisible();

		await this.page.getByTestId(testIds.createSatellite.launch).click();

		await expect(this.page.getByTestId(testIds.createSatellite.create)).toBeVisible();

		await this.page.getByTestId(testIds.createSatellite.input).fill('Test');
		await this.page.getByTestId(testIds.createSatellite[kind]).click();

		await this.page.getByTestId(testIds.createSatellite.create).click();

		await expect(this.page.getByTestId(testIds.createSatellite.continue)).toBeVisible(
			TIMEOUT_AVERAGE
		);

		await this.page.getByTestId(testIds.createSatellite.continue).click();
	}

	async visitSatellite(): Promise<Page> {
		await expect(this.page.getByTestId(testIds.satelliteOverview.visit)).toBeVisible();

		const satellitePagePromise = this.context.waitForEvent('page');

		await this.page.getByTestId(testIds.satelliteOverview.visit).click();

		const satellitePage = await satellitePagePromise;

		await expect(satellitePage).toHaveTitle('Juno / Satellite');

		return satellitePage;
	}

	async createAnalytics(): Promise<void> {
		await this.page.goto('/analytics');

		await expect(this.page.getByTestId(testIds.createAnalytics.launch)).toBeVisible(TIMEOUT_SHORT);

		await this.page.getByTestId(testIds.createAnalytics.launch).click();

		await expect(this.page.getByTestId(testIds.createAnalytics.create)).toBeVisible();

		await this.page.getByTestId(testIds.createAnalytics.create).click();

		await expect(this.page.getByTestId(testIds.createAnalytics.close)).toBeVisible(TIMEOUT_AVERAGE);

		await this.page.getByTestId(testIds.createAnalytics.close).click();

		await expect(this.page.getByText('Unique page views')).toBeVisible();

		await expect(this.page).toHaveScreenshot({ fullPage: true });
	}

	async getICP(expected: { balance: string }): Promise<void> {
		await this.page.getByTestId(testIds.navbar.openWallet).click();

		await this.page.getByTestId(testIds.navbar.getIcp).click();

		await expect(this.page.getByRole('menu')).toContainText(expected.balance, TIMEOUT_LONG);
	}

	async openCreateSatelliteWizard(): Promise<void> {
		await expect(this.page.getByTestId(testIds.createSatellite.launch)).toBeVisible();
		await this.page.getByTestId(testIds.createSatellite.launch).click();
	}

	async failedAtCreatingSatellite(): Promise<boolean> {
		// Check for create button absence or disabled state
		const createButton = this.page.getByTestId(testIds.createSatellite.create);
		try {
			// If the button is visible and enabled, this should fail
			await expect(createButton).not.toBeVisible({ timeout: 1000 });
			return true;
		} catch {
			// Button is visible, so creation is possible (test should fail)
			return false;
		}
	}

	getPage(): Page {
		return this.page;
	}
}
