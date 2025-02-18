import { sveltekit } from '@sveltejs/kit/vite';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, type UserConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const { version } = JSON.parse(json);


const config: UserConfig = {
	plugins: [sveltekit(), nodePolyfills()],
	resolve: {
		alias: {
			$declarations: resolve('./src/declarations')
		}
	},
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler'
			}
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
			VITE_APP_VERSION: JSON.stringify(version)
		}
	})
);
