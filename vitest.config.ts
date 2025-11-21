import { defineConfig } from 'vitest/config';
import { defineVitestAlias } from './vitest.utils';

export default defineConfig({
	test: {
		globalSetup: './vitest.global.ts',
		globals: true,
		watch: false,
		silent: false,
		reporters: [
			[
				'default',
				{
					summary: false
				}
			]
		],
		environment: 'node',
		maxWorkers: 1, // single thread
		testTimeout: 60000,
		hookTimeout: 60000
	},
	resolve: {
		alias: defineVitestAlias()
	}
});
