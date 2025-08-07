import { testWithII } from '@dfinity/internet-identity-playwright';
import { ConsolePage } from '../page-objects/console.page';

export const initTestSuite = (): (() => ConsolePage) => {
	testWithII.describe.configure({ mode: 'serial' });

	let consolePage: ConsolePage;

	testWithII.beforeAll(async ({ playwright }) => {
		testWithII.setTimeout(120000);

		const browser = await playwright.chromium.launch();

		const context = await browser.newContext();
		const page = await context.newPage();

		consolePage = new ConsolePage({
			page,
			context,
			browser
		});

		await consolePage.waitReady();

		await consolePage.goto();

		await consolePage.signIn();
	});

	testWithII.afterAll(async () => {
		await consolePage.close();
	});

	return (): ConsolePage => consolePage;
};
