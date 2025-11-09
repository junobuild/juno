#!/usr/bin/env node

import { CONSOLE_ID } from './constants.mjs';
import { listSnapshots } from './module.snapshots.mjs';

await listSnapshots({
	canisterId: CONSOLE_ID
});
