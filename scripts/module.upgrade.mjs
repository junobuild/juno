#!/usr/bin/env node

import { IDL } from '@dfinity/candid';
import {
	UpgradeCodeProgressStep,
	UpgradeCodeUnchangedError,
	upgradeModule
} from '@junobuild/admin';
import { fileExists } from '@junobuild/cli-tools';
import { createHash } from 'crypto';
import { readFile } from 'fs/promises';
import { join } from 'node:path';
import { icAgent, localAgent } from './actor.mjs';
import { getIdentity } from './console.config.utils.mjs';
import { targetMainnet } from './utils.mjs';

const INSTALL_MODE_UPGRADE = {
	upgrade: [{ skip_pre_upgrade: [false], wasm_memory_persistence: [{ replace: null }] }]
};

const target = join(process.cwd(), 'target', 'deploy');

const loadGzippedWasm = async (destination) => {
	const buffer = await readFile(destination);

	return {
		wasm: buffer,
		hash: createHash('sha256').update(buffer).digest('hex')
	};
};

const mainnet = targetMainnet();

const fnAgent = mainnet ? icAgent : localAgent;
const agent = await fnAgent();

const identity = await getIdentity(mainnet);

const onProgress = ({ step, state }) => {
	switch (step) {
		case UpgradeCodeProgressStep.AssertingExistingCode:
			console.log(`Validating: ${state}`);
			break;
		case UpgradeCodeProgressStep.StoppingCanister:
			console.log(`Stopping: ${state}`);
			break;
		case UpgradeCodeProgressStep.TakingSnapshot:
			console.log(`Creating a snapshot: ${state}`);
			break;
		case UpgradeCodeProgressStep.UpgradingCode:
			console.log(`Upgrading: ${state}`);
			break;
		case UpgradeCodeProgressStep.RestartingCanister:
			console.log(`Restarting: ${state}`);
			break;
	}
};

export const upgrade = async ({ sourceFilename, canisterId }) => {
	const source = join(target, sourceFilename);

	console.log(`About to upgrade module ${canisterId.toText()} with source ${source}...`);

	if (!(await fileExists(source))) {
		throw new Error(`${source} not found.`);
	}

	console.log('');

	const { wasm, hash } = await loadGzippedWasm(source);

	const EMPTY_ARG = IDL.encode([], []);

	try {
		await upgradeModule({
			actor: {
				agent,
				identity
			},
			mode: INSTALL_MODE_UPGRADE,
			canisterId,
			wasmModule: wasm,
			arg: new Uint8Array(EMPTY_ARG),
			takeSnapshot: true,
			onProgress
		});

		console.log('');
		console.log(`Module upgraded to hash ${hash}.`);
	} catch (err) {
		console.log('');

		// In the CI, it can happen that we are using the newest Docker image
		// and no changes have been yet developed to the Console.
		if (err instanceof UpgradeCodeUnchangedError) {
			console.warn(err.message);
			process.exit(0);
		}

		console.error('message' in err ? err.message : err);
		process.exit(1);
	}
};
