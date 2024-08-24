#!/usr/bin/env node

import { OBSERVATORY_ID } from './constants.mjs';
import { upgrade } from './module.upgrade.mjs';

await upgrade({
	sourceFilename: 'observatory.wasm.gz',
	canisterId: OBSERVATORY_ID
});
