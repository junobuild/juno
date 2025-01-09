import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import inject from '@rollup/plugin-inject';
import { sveltekit } from '@sveltejs/kit/vite';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, type UserConfig } from 'vite';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const { version } = JSON.parse(json);

const config: UserConfig = {
	plugins: [sveltekit()],
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
			},
			// Polyfill Buffer for production build
			plugins: [
				inject({
					modules: { Buffer: ['buffer', 'Buffer'] }
				})
			]
		}
	},
	// Node polyfill agent-js. Thanks solution shared by chovyfu on the Discord channel.
	// https://stackoverflow.com/questions/71744659/how-do-i-deploy-a-sveltekit-app-to-a-dfinity-container
	optimizeDeps: {
		esbuildOptions: {
			// Node.js global to browser globalThis
			define: {
				global: 'globalThis'
			},
			// Enable esbuild polyfill plugins
			plugins: [
				NodeModulesPolyfillPlugin(),
				{
					name: 'fix-node-globals-polyfill',
					setup(build) {
						build.onResolve({ filter: /_virtual-process-polyfill_\.js/ }, ({ path }) => ({ path }));
					}
				}
			]
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
