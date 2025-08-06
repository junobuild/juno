import adapter from '@sveltejs/adapter-static';
import autoprefixer from 'autoprefixer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import preprocess from 'svelte-preprocess';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const { version } = JSON.parse(json);

const filesPath = (path) => `src/frontend/${path}`;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		postcss: {
			plugins: [autoprefixer]
		}
	}),
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
