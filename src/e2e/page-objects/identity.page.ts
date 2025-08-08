import type { Browser, BrowserContext, Page } from '@playwright/test';

export interface IdentityPageParams {
	page: Page;
	context: BrowserContext;
	browser: Browser;
}

export abstract class IdentityPage {
	protected identity: number | undefined;

	protected readonly page: Page;
	protected readonly context: BrowserContext;
	protected readonly browser: Browser;

	protected constructor({ page, context, browser }: IdentityPageParams) {
		this.page = page;
		this.context = context;
		this.browser = browser;
	}

	async close(): Promise<void> {
		await this.page.close();
	}
}
