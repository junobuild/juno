import { testIds } from '$lib/constants/test-ids.constants';
import { InternetIdentityPage } from '@dfinity/internet-identity-playwright';
import { expect } from '@playwright/test';
import type { Page } from 'playwright-core';
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

		await expect(this.page.getByTestId(testIds.createSatellite.continue)).toBeVisible();

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

		await expect(this.page.getByTestId(testIds.createAnalytics.launch)).toBeVisible();
		await this.page.getByTestId(testIds.createAnalytics.launch).click();

		await expect(this.page.getByTestId(testIds.createAnalytics.create)).toBeVisible();
		await this.page.getByTestId(testIds.createAnalytics.create).click();

		//  closes the wizard after the completion
		await expect(this.page.getByTestId(testIds.createAnalytics.close)).toBeVisible();
		await this.page.getByTestId(testIds.createAnalytics.close).click();
	}
}
