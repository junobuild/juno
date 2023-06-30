#!/usr/bin/env node

import { Principal } from '@dfinity/principal';
import { consoleActorLocal } from './actor.mjs';

const addCredits = async () => {
	const [, , user] = process.argv;

	if (user === undefined || user === '' || user === null) {
		throw new Error('No user id provided.');
	}

	const actor = await consoleActorLocal();

	await actor.add_credits({ user: Principal.fromText(user) });

	console.log('Credits added.');
};

await addCredits();
