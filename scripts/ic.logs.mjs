#!/usr/bin/env node

import { ICManagementCanister } from '@dfinity/ic-management';
import { icAgent } from './actor.mjs';
import { OBSERVATORY_ID } from './constants.mjs';

const { fetchCanisterLogs } = ICManagementCanister.create({
	agent: await icAgent()
});

const { canister_log_records } = await fetchCanisterLogs(OBSERVATORY_ID);

console.log(canister_log_records);
