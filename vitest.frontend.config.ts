import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';
import { CSS_CONFIG_OPTIONS, defineViteReplacements } from './vite.utils';
import { defineVitestAlias } from './vitest.utils';

export default defineConfig({
	plugins: [sveltekit(), svelteTesting()],
	...CSS_CONFIG_OPTIONS,
	define: {
		...defineViteReplacements()
	},
	test: {
		setupFiles: ['./vitest.setup.ts'],
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
		environment: 'jsdom'
	},
	resolve: {
		alias: defineVitestAlias()
	}
});
