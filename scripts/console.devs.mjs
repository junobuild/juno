#!/usr/bin/env node

import { consoleActorIC, consoleActorLocal } from './actor.mjs';

const countDevs = async (mainnet) => {
	const actor = await (mainnet ? consoleActorIC() : consoleActorLocal());

	const devs = await actor.list_user_mission_control_centers();

	console.log('Developers:', devs.length);
};

const mainnet = process.argv.find((arg) => arg.indexOf(`--mainnet`) > -1) !== undefined;

await countDevs(mainnet);
