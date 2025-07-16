import { default as svelteConfig } from '@dfinity/eslint-config-oisy-wallet/svelte';
import { default as vitestConfig } from '@dfinity/eslint-config-oisy-wallet/vitest';

export default [
	...vitestConfig,
	...svelteConfig,
	{
		rules: {
			// TODO: re-enable this rule when it includes `expect` statements nested in callable functions.
			'vitest/expect-expect': ['off'],
			// Following rule is annoying for my workflow as it is conflicting when I'm implementing iteratively
			// features that share similar logic across modules.
			'vitest/no-commented-out-tests': ['off'],
			// It does not always make sense. For example, sometimes it reports function passed as property as being
			// required to be prefixed with "on".
			'svelte/require-event-prefix': ['off']
		}
	},
	{
		files: ['src/frontend/src/lib/stores/**/*'],
		rules: {
			'prefer-arrow/prefer-arrow-functions': 'off'
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
