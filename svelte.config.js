import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const { version } = JSON.parse(json);

const filesPath = (path) => `src/frontend/${path}`;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			fallback: '404.html',
			precompress: false
		}),
		files: {
			assets: filesPath('static'),
			lib: filesPath('src/lib'),
			params: filesPath('src/params'),
			routes: filesPath('src/routes'),
			appTemplate: filesPath('src/app.html')
		},
		alias: {
			$declarations: './src/declarations'
		},
		version: {
			name: version
		},
		serviceWorker: {
			register: false
		}
	}
};
export default config;
