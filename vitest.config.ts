import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		watch: false,
		silent: false,
		environment: 'node',
		poolOptions: {
			threads: {
				singleThread: true
			}
		}
	},
	resolve: {
		alias: [
			{
				find: '$declarations',
				replacement: resolve(__dirname, 'src/declarations')
			}
		]
	}
});
