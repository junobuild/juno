#!/usr/bin/env node

import { consoleActorLocal } from './actor.mjs';
import { segmentType } from './console.utils.mjs';

const setFee = async ({ actor, type }) => {
	await actor.set_fee(segmentType(type), { e8s: 30_000_000n });

	console.log(`Fee set for ${type}.`);
};

const actor = await consoleActorLocal();

await Promise.all([setFee({ actor, type: 'satellite' }), setFee({ actor, type: 'orbiter' })]);
