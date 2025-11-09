#!/usr/bin/env node

import { hasArgs } from '@junobuild/cli-tools';
import { observatoryActorIC, observatoryActorLocal } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

const toggleOpenIdMonitoring = async ({ mainnet, start }) => {
	const { start_openid_monitoring, stop_openid_monitoring } = await (mainnet
		? observatoryActorIC()
		: observatoryActorLocal());

	if (start) {
		await start_openid_monitoring();
		console.log('Monitoring started 🟢');
		return;
	}

	await stop_openid_monitoring();
	console.log('Monitoring stopped 🔴');
};

const mainnet = targetMainnet();

const args = process.argv.slice(2);
const start = hasArgs({ args, options: ['--start'] });
const stop = hasArgs({ args, options: ['--stop'] });

if (start === false && stop === false) {
	console.log('Run script with either --start or --stop');
	process.exit(1);
}

if (start === true && stop === true) {
	console.log('Cannot --start and --stop at the same time');
	process.exit(1);
}

await toggleOpenIdMonitoring({ mainnet, start: start === true });
