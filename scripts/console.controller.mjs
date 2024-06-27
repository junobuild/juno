#!/usr/bin/env node

import { Ed25519KeyIdentity } from '@dfinity/identity';
import { hasArgs } from '@junobuild/cli-tools';
import { getIdentity, saveToken } from './console.config.utils.mjs';

const key = Ed25519KeyIdentity.generate();
const principal = key.getPrincipal().toText();
const token = key.toJSON();

const args = process.argv.slice(2);
const mainnet = hasArgs({ args, options: ['--mainnet'] });

if (!mainnet) {
	await fetch(`http://localhost:5999/console/controller/?id=${principal}`);
}

await saveToken({ token, mainnet });

console.log('Controller generated:', (await getIdentity(mainnet)).getPrincipal().toText());
