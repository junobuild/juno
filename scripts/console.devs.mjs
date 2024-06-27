#!/usr/bin/env node

import { consoleActorIC, consoleActorLocal } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

const countDevs = async (mainnet) => {
	const actor = await (mainnet ? consoleActorIC() : consoleActorLocal());

	const devs = await actor.list_user_mission_control_centers();

	console.log('Developers:', devs.length);
};

const mainnet = targetMainnet();

await countDevs(mainnet);
