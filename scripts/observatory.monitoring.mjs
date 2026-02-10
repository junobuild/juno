#!/usr/bin/env node

import { hasArgs, nextArg } from '@junobuild/cli-tools';
import { observatoryActorIC, observatoryActorLocal } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

const toggleOpenIdMonitoring = async ({ mainnet, provider, start }) => {
	const { start_openid_monitoring, stop_openid_monitoring } = await (mainnet
		? observatoryActorIC()
		: observatoryActorLocal());

	const args =
		provider === 'gh_auth'
			? { GitHubAuth: null }
			: provider === 'gh_actions'
				? { GitHubActions: null }
				: { Google: null };

	if (start) {
		await start_openid_monitoring(args);
		console.log(`Monitoring started for ${provider} 🟢`);
		return;
	}

	await stop_openid_monitoring(args);
	console.log(`Monitoring stopped for ${provider} 🔴`);
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

const provider = nextArg({ args, option: '-p' }) ?? nextArg({ args, option: '--provider' });

if (!['google', 'gh_auth', 'gh_actions'].includes(provider)) {
	console.log(`Provider ${provider} is not supported`);
	process.exit(1);
}

await toggleOpenIdMonitoring({ mainnet, provider, start: start === true });
