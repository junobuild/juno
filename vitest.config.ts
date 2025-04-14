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
		poolOptions: {
			threads: {
				singleThread: true
			}
		},
		testTimeout: 60000,
		hookTimeout: 60000
	},
	resolve: {
		alias: defineVitestAlias()
	}
});
