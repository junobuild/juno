#!/usr/bin/env node

import { getIdentity } from './console.config.utils.mjs';
import { targetMainnet } from './utils.mjs';

const mainnet = targetMainnet();

const controller = (await getIdentity(mainnet)).getPrincipal().toText();

console.log('Controller:', controller);

if (!mainnet) {
	await fetch(`http://localhost:5999/observatory/controller/?id=${controller}`);
} else {
	console.log('Nothing done.');
}
