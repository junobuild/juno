#!/usr/bin/env node

import { CONSOLE_ID } from './constants.mjs';
import { upgrade } from './module.upgrade.mjs';

await upgrade({
	sourceFilename: 'console.wasm.gz',
	canisterId: CONSOLE_ID
});
