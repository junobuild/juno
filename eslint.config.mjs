import { default as svelteConfig } from '@dfinity/eslint-config-oisy-wallet/svelte';
import { default as vitestConfig } from '@dfinity/eslint-config-oisy-wallet/vitest';

export default [
	...vitestConfig,
	...svelteConfig,
	{
		rules: {
			// TODO: re-enable this rule when it includes `expect` statements nested in callable functions.
			'vitest/expect-expect': ['off']
		}
	},
	{
		ignores: [
			'**/.DS_Store',
			'**/node_modules',
			'build',
			'.svelte-kit',
			'package',
			'**/.env',
			'**/.env.*',
			'!**/.env.example',
			'**/pnpm-lock.yaml',
			'**/package-lock.json',
			'**/yarn.lock',
			'src/declarations/**/*',
			'src/frontend/src/env/tokens/tokens.sns.json',
			'**/playwright-report',
			'**/coverage',
			'src/declarations/**/*',
			'src/tests/declarations/**/*',
			'target/**/*',
			'tmp/**/*'
		]
	},
	{
		ignores: [
			'src/sputnik/resources/index.mjs',
			'src/sputnik/src/js/apis/node/text_encoding/javy/text-encoding.js'
		]
	}
];
