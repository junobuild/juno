#!/usr/bin/env node

import { ICManagementCanister } from '@icp-sdk/canisters/ic-management';
import { icAgent, localAgent } from './actor.mjs';
import { OBSERVATORY_ID } from './constants.mjs';
import { targetMainnet } from './utils.mjs';

const fnAgent = targetMainnet() ? icAgent : localAgent;

const { fetchCanisterLogs } = ICManagementCanister.create({
	agent: await fnAgent()
});

const { canister_log_records } = await fetchCanisterLogs(OBSERVATORY_ID);

const mapLog = async ({ idx, timestamp_nanos: timestamp, content }) => {
	const blob = new Blob([content instanceof Uint8Array ? content : new Uint8Array(content)]);

	return [
		`[ic]-${idx}`,
		{
			message: await blob.text(),
			timestamp
		}
	];
};

const logs = await Promise.all(canister_log_records.map(mapLog));

console.log(logs);
