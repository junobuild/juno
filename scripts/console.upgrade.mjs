#!/usr/bin/env node

import { UpgradeCodeUnchangedError } from '@junobuild/admin';
import { CONSOLE_ID } from './constants.mjs';
import { upgrade } from './module.upgrade.mjs';

try {
	await upgrade({
		sourceFilename: 'console.wasm.gz',
		canisterId: CONSOLE_ID
	});
} catch (err) {
	// In the CI, it can happen that we are using the newest Docker image
	// and no changes have been yet developed to the Console.
	if (err instanceof UpgradeCodeUnchangedError) {
		console.warn(err.message);
		process.exit(0);
	}

	throw err;
}
