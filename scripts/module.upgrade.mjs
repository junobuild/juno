#!/usr/bin/env node

import { IDL } from '@dfinity/candid';
import { ICManagementCanister } from '@dfinity/ic-management';
import { fromNullable, uint8ArrayToHexString } from '@dfinity/utils';
import { fileExists } from '@junobuild/cli-tools';
import { createHash } from 'crypto';
import { readFile } from 'fs/promises';
import { join } from 'node:path';
import { icAgent, localAgent } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

const INSTALL_MODE_UPGRADE = {
	upgrade: [{ skip_pre_upgrade: [false], wasm_memory_persistence: [{ replace: null }] }]
};

const target = join(process.cwd(), 'target', 'deploy');

const loadGzippedWasm = async (destination) => {
	const buffer = await readFile(destination);

	return {
		wasm: [...new Uint8Array(buffer)],
		hash: createHash('sha256').update(buffer).digest('hex')
	};
};

const fnAgent = targetMainnet() ? icAgent : localAgent;
const agent = await fnAgent();

export const upgrade = async ({ sourceFilename, canisterId }) => {
	const source = join(target, sourceFilename);

	console.log(`About to upgrade module ${canisterId} with source ${source}...`);

	if (!(await fileExists(source))) {
		throw new Error(`${source} not found.`);
	}

	const EMPTY_ARG = IDL.encode([], []);

	const { installCode, canisterStatus } = ICManagementCanister.create({
		agent
	});

	const { wasm, hash } = await loadGzippedWasm(source);

	const { module_hash } = await canisterStatus(canisterId);

	const currentHash = fromNullable(module_hash);

	if (uint8ArrayToHexString(currentHash) === hash) {
		console.log(`Module hash ${hash} already installed.`);
		return;
	}

	await installCode({
		mode: INSTALL_MODE_UPGRADE,
		canisterId,
		wasmModule: wasm,
		arg: new Uint8Array(EMPTY_ARG)
	});

	console.log(`Module upgraded to hash ${hash}.`);
};
