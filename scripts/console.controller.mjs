#!/usr/bin/env node

import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { getIdentity, saveToken } from './console.config.utils.mjs';
import { targetMainnet } from './utils.mjs';

const key = Ed25519KeyIdentity.generate();
const principal = key.getPrincipal().toText();
const token = key.toJSON();

const mainnet = targetMainnet();

if (!mainnet) {
	await fetch(`http://localhost:5999/console/controller/?id=${principal}`);
}

await saveToken({ token, mainnet });

console.log('Controller generated:', (await getIdentity(mainnet)).getPrincipal().toText());
