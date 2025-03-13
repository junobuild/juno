import { default as config } from '@dfinity/eslint-config-oisy-wallet/svelte';

export default [
	...config,
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
