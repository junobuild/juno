#!/usr/bin/env node

import { observatoryActorIC, observatoryActorLocal } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

const setEnv = async (mainnet) => {
	const { set_env } = await (mainnet ? observatoryActorIC() : observatoryActorLocal());

	await set_env({
		email_api_key: ['secret']
	});

	console.log('Env configured ✅');
};

const mainnet = targetMainnet();

await setEnv(mainnet);
