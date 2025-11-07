#!/usr/bin/env node

import { Principal } from '@icp-sdk/core/principal';
import { consoleActor } from './actor.mjs';

const addCredits = async () => {
	const [, , user] = process.argv;

	if (user === undefined || user === '' || user === null) {
		throw new Error('No user id provided.');
	}

	const actor = await consoleActor();

	// 100_000_000n === 1 credit
	// e.g. a satellite costs 2 ICP, then 1 credit covers it
	// 10 days later, a satellite costs 9 ICP, then 1 credits covers it
	await actor.add_credits(Principal.fromText(user), { e8s: 100_000_000n });

	console.log('Credits added.');
};

await addCredits();
