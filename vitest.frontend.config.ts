import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import { defineViteReplacements } from './vite.utils';
import { defineVitestAlias } from './vitest.utils';

export default defineConfig(
	async ({ mode }): Promise<UserConfig> => ({
		plugins: [sveltekit(), svelteTesting()],
		define: await defineViteReplacements({ mode }),
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
	})
);
