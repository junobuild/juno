#!/usr/bin/env node

import { jsonReplacer } from '@dfinity/utils';
import { writeFile } from 'fs/promises';
import { join } from 'node:path';
import { consoleActorIC, consoleActorLocal } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

/**
 * A temporary script used to backup the mission controls of the console as we aim to migrate those from heap to stable.
 * @param mainnet
 * @returns {Promise<void>}
 */
const saveMissionControls = async (mainnet) => {
	const { list_user_mission_control_centers } = await (mainnet
		? consoleActorIC()
		: consoleActorLocal());

	const users = await list_user_mission_control_centers();

	await writeFile(
		join(process.cwd(), 'console.mission-controls.json'),
		JSON.stringify(users, jsonReplacer, 2)
	);

	console.log(`👩‍🚀🧑‍🚀 ${users.length} mission controls saved locally successfully.`);
};

const mainnet = targetMainnet();

await saveMissionControls(mainnet);
