import { resolve } from 'node:path';
import type { AliasOptions } from 'vite';

export const defineVitestAlias = (): AliasOptions => [
	{
		find: '$test-declarations',
		replacement: resolve(__dirname, 'src/tests/declarations')
	},
	{
		find: '$declarations',
		replacement: resolve(__dirname, 'src/declarations')
	},
	{
		find: '$lib',
		replacement: resolve(__dirname, 'src/frontend/src/lib')
	}
];
