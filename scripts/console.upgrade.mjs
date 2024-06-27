#!/usr/bin/env node

import { IDL } from '@dfinity/candid';
import { ICManagementCanister, InstallMode } from '@dfinity/ic-management';
import { fromNullable, uint8ArrayToHexString } from '@dfinity/utils';
import { fileExists } from '@junobuild/cli-tools';
import { createHash } from 'crypto';
import { readFile } from 'fs/promises';
import { join } from 'node:path';
import { localAgent } from './actor.mjs';
import { CONSOLE_ID } from './constants.mjs';

const target = join(process.cwd(), 'target', 'deploy');

const loadGzippedWasm = async (destination) => {
	const buffer = await readFile(destination);

	return {
		wasm: [...new Uint8Array(buffer)],
		hash: createHash('sha256').update(buffer).digest('hex')
	};
};

const agent = await localAgent();

const upgrade = async () => {
	const sourceFilename = `console.wasm.gz`;
	const source = join(target, sourceFilename);

	if (!(await fileExists(source))) {
		throw new Error(`${source} not found.`);
	}

	const EMPTY_ARG = IDL.encode([], []);

	const { installCode, canisterStatus } = ICManagementCanister.create({
		agent
	});

	const { wasm, hash } = await loadGzippedWasm(source);

	const { module_hash } = await canisterStatus(CONSOLE_ID);

	const currentHash = fromNullable(module_hash);

	if (uint8ArrayToHexString(currentHash) === hash) {
		console.log(`Module hash ${hash} already installed.`);
		return;
	}

	await installCode({
		mode: InstallMode.Upgrade,
		canisterId: CONSOLE_ID,
		wasmModule: wasm,
		arg: new Uint8Array(EMPTY_ARG)
	});

	console.log(`Module upgraded to hash ${hash}.`);
};

await upgrade();
