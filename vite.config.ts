import { sveltekit } from '@sveltejs/kit/vite';
import { dirname, resolve } from 'path';
import { defineConfig, type UserConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { CSS_CONFIG_OPTIONS, defineViteReplacements } from './vite.utils';

const config: UserConfig = {
	plugins: [sveltekit(), nodePolyfills()],
	resolve: {
		alias: {
			$declarations: resolve('./src/declarations')
		}
	},
	...CSS_CONFIG_OPTIONS,
	build: {
		target: 'es2020',
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					const folder = dirname(id);

					if (
						['@sveltejs', 'svelte', 'layercake', 'd3-'].find((lib) => folder.includes(lib)) ===
							undefined &&
						folder.includes('node_modules')
					) {
						return 'vendor';
					}

					return undefined;
				}
			}
		}
	},
	worker: {
		format: 'es'
	}
};

export default defineConfig(
	(): UserConfig => ({
		...config,
		define: {
			...defineViteReplacements()
		}
	})
);
