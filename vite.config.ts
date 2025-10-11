import { sveltekit } from '@sveltejs/kit/vite';
import { dirname, resolve } from 'path';
import { defineConfig, type UserConfig } from 'vite';
import { defineViteReplacements } from './vite.utils';

const config: UserConfig = {
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$declarations: resolve('./src/declarations')
		}
	},
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
