#!/usr/bin/env node

import { OBSERVATORY_ID } from './constants.mjs';
import { listSnapshots } from './module.snapshots.mjs';

await listSnapshots({
	canisterId: OBSERVATORY_ID
});
