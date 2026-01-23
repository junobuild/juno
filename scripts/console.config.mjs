#!/usr/bin/env node

import { fromNullable, isNullish, toNullable } from '@dfinity/utils';
import { Principal } from '@icp-sdk/core/principal';
import { consoleActorIC, consoleActorLocal } from './actor.mjs';
import { readJunoConfig } from './console.deploy.utils.mjs';
import { targetMainnet } from './utils.mjs';

const configAuth = async ({ mainnet, config }) => {
	const { set_auth_config, get_auth_config } = await (mainnet
		? consoleActorIC()
		: consoleActorLocal());

	const currentConfig = fromNullable(await get_auth_config());

	await set_auth_config({
		...config,
		version: currentConfig?.version ?? config.version
	});

	console.log('✅ Authentication configuration updated.');
};

const buildConfig = async () => {
	const config = await readJunoConfig();

	if (isNullish(config?.authentication)) {
		console.error('No authentication configuration found.');
		process.exit(1);
	}

	const {
		authentication: { google, github }
	} = config;

	if (isNullish(google) && isNullish(github)) {
		console.error('No Google or GitHub authentication configuration found.');
		process.exit(1);
	}

	const buildDelegation = (delegation) =>
		isNullish(delegation)
			? []
			: [
					{
						targets:
							delegation.allowedTargets === null
								? []
								: [(delegation.allowedTargets ?? [])?.map((target) => Principal.fromText(target))],
						max_time_to_live: toNullable(delegation.sessionDuration)
					}
				];

	const buildGoogleProviderConfig = () =>
		isNullish(google)
			? []
			: [
					{ Google: null },
					{
						client_id: google.clientId,
						delegation: buildDelegation(google.delegation)
					}
				];

	const buildGitHubProviderConfig = () =>
		isNullish(github)
			? []
			: [
					{ GitHub: null },
					{
						client_id: github.clientId,
						delegation: buildDelegation(github.delegation)
					}
				];

	const providers = [...buildGoogleProviderConfig(), ...buildGitHubProviderConfig()];

	return {
		internet_identity: [],
		rules: [],
		version: [],
		openid: providers.length
			? [
					{
						providers,
						observatory_id: []
					}
				]
			: []
	};
};

const config = await buildConfig();

const mainnet = targetMainnet();

await configAuth({ mainnet, config });
