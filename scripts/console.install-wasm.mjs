#!/usr/bin/env node

import { consoleActorLocal } from './actor.mjs';
import { loadWasm, readVersion } from './code.utils.mjs';

const didType = (type) => {
	switch (type) {
		case 'satellite':
			return { Satellite: null };
		case 'orbiter':
			return { Orbiter: null };
		default:
			return { MissionControl: null };
	}
};

const resetRelease = ({ actor, type }) => actor.reset_release(didType(type));

const installRelease = async ({ actor, type, wasmModule, version }) => {
	console.log(`Installing ${type} wasm code v${version} in console.`);

	const chunkSize = 700000;

	const upload = async (chunks) => {
		const result = await actor.load_release(didType(type), chunks, version);
		console.log(`Chunks ${type}:`, result);
	};

	for (let start = 0; start < wasmModule.length; start += chunkSize) {
		const chunks = wasmModule.slice(start, start + chunkSize);
		await upload(chunks);
	}

	console.log(`Installation ${type} done.`);
};

const install = async ({ actor, type }) => {
	const wasmModule = await loadWasm(type);
	const version = await readVersion(type);

	if (!version) {
		console.error(`Version for wasm ${type} cannot be read.`);
		return;
	}

	await resetRelease({ actor, type });
	await installRelease({ actor, type, wasmModule, version });
};

(async () => {
	const actor = await consoleActorLocal();

	await Promise.all([
		install({ actor, type: 'mission_control' }),
		install({ actor, type: 'satellite' }),
		install({ actor, type: 'orbiter' })
	]);
})();
