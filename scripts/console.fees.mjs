#!/usr/bin/env node

import { consoleActor } from './actor.mjs';
import { segmentType } from './console.utils.mjs';

const setFee = async ({ actor, type }) => {
	const { set_fee } = actor;

	await set_fee(segmentType(type), { e8s: 40_000_000n });

	console.log(`Fee set for ${type}.`);
};

const actor = await consoleActor();

await Promise.all([
	setFee({ actor, type: 'satellite' }),
	setFee({ actor, type: 'orbiter' }),
	setFee({ actor, type: 'mission-control' })
]);
