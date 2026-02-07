import { test } from '@playwright/test';
import { ConsolePage } from '../page-objects/console.page';

export const initTestSuite = (): (() => ConsolePage) => {
	test.describe.configure({ mode: 'serial' });

	let consolePage: ConsolePage;

	test.beforeAll(async ({ playwright }) => {
		test.setTimeout(120000);

		const browser = await playwright.chromium.launch();

		const context = await browser.newContext();
		const page = await context.newPage();

		consolePage = new ConsolePage({
			page,
			context
		});

		await consolePage.goto();

		await consolePage.signIn();
	});

	return (): ConsolePage => consolePage;
};
