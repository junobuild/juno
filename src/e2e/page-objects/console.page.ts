import { testIds } from '$lib/constants/test-ids.constants';
import i18n from '$lib/i18n/en.json' with { type: 'json' };
import { type BrowserContext, expect } from '@playwright/test';
import type { Page } from 'playwright-core';
import { TIMEOUT_AVERAGE, TIMEOUT_LONG } from '../constants/e2e.constants';

export interface ConsolePageParams {
	page: Page;
	context: BrowserContext;
}

export class ConsolePage {
	readonly #page: Page;
	readonly #context: BrowserContext;

	constructor({ page, context }: ConsolePageParams) {
		this.#page = page;
		this.#context = context;
	}

	async goto(): Promise<void> {
		await this.#page.goto('/');
	}

	async signIn(): Promise<void> {
		await expect(this.#page.getByTestId(testIds.auth.switchDevAccount)).toBeVisible(
			TIMEOUT_AVERAGE
		);
		await this.#page.getByTestId(testIds.auth.switchDevAccount).click();

		await expect(this.#page.getByTestId(testIds.auth.inputDevIdentifier)).toBeVisible();
		await this.#page.getByTestId(testIds.auth.inputDevIdentifier).fill(crypto.randomUUID());

		await expect(this.#page.getByTestId(testIds.auth.continueDevAccount)).toBeVisible();
		await this.#page.getByTestId(testIds.auth.continueDevAccount).click();
	}

	async createSatellite({ kind }: { kind: 'website' | 'application' }): Promise<void> {
		await expect(this.#page.getByTestId(testIds.launchpad.launch)).toBeVisible(TIMEOUT_AVERAGE);

		await this.#page.getByTestId(testIds.launchpad.launch).click();

		await expect(this.#page.getByTestId(testIds.createSatellite.create)).toBeVisible();

		await this.#page.getByTestId(testIds.createSatellite.input).fill('Test');
		await this.#page.getByTestId(testIds.createSatellite[kind]).click();

		await this.#page.getByTestId(testIds.createSatellite.create).click();

		await expect(this.#page.getByTestId(testIds.createSatellite.continue)).toBeVisible(
			TIMEOUT_AVERAGE
		);

		await this.#page.getByTestId(testIds.createSatellite.continue).click();
	}

	async visitSatellite(): Promise<Page> {
		await expect(this.#page.getByTestId(testIds.satelliteOverview.visit)).toBeVisible();

		const satellitePagePromise = this.#context.waitForEvent('page');

		await this.#page.getByTestId(testIds.satelliteOverview.visit).click();

		const satellitePage = await satellitePagePromise;

		await expect(satellitePage).toHaveTitle('Juno / Satellite');

		return satellitePage;
	}

	async createAnalytics(): Promise<void> {
		await this.#page.goto('/analytics');

		await expect(this.#page.getByTestId(testIds.createAnalytics.launch)).toBeVisible(
			TIMEOUT_AVERAGE
		);

		await this.#page.getByTestId(testIds.createAnalytics.launch).click();

		await expect(this.#page.getByTestId(testIds.createAnalytics.create)).toBeVisible();

		await this.#page.getByTestId(testIds.createAnalytics.create).click();

		await expect(this.#page.getByTestId(testIds.createAnalytics.close)).toBeVisible(
			TIMEOUT_AVERAGE
		);

		await this.#page.getByTestId(testIds.createAnalytics.close).click();

		await expect(this.#page.getByText(i18n.analytics.unique_page_views)).toBeVisible(
			TIMEOUT_AVERAGE
		);

		await expect(this.#page).toHaveScreenshot({ fullPage: true, maxDiffPixelRatio: 0.05 });
	}

	async getCycles(expected: { balance: string }): Promise<void> {
		await this.#page.getByTestId(testIds.navbar.openWallet).click();

		await this.#page.getByTestId(testIds.navbar.getCycles).click();

		await expect(this.#page.getByRole('menu')).toContainText(expected.balance, TIMEOUT_LONG);
	}

	async openCreateAdditionalSatelliteWizard(): Promise<void> {
		await expect(this.#page.getByTestId(testIds.launchpad.actions)).toBeVisible(TIMEOUT_AVERAGE);

		await this.#page.getByTestId(testIds.launchpad.actions).click();

		await expect(this.#page.getByTestId(testIds.launchpad.launchExtraSatellite)).toBeVisible(
			TIMEOUT_AVERAGE
		);

		await this.#page.getByTestId(testIds.launchpad.launchExtraSatellite).click();
	}

	async failedAtCreatingSatellite(): Promise<void> {
		await expect(this.#page.getByTestId(testIds.wizard.closeInsufficientFunds)).toBeVisible();
		await expect(this.#page.getByTestId(testIds.createSatellite.create)).not.toBeVisible();

		const expectedText = i18n.satellites.create_satellite_price
			.replace('{0}', '3.000 TCycles')
			.replace('{1}', '0.000 TCycles');

		await expect(this.#page.getByText(expectedText)).toBeVisible();
	}
}
