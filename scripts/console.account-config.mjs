#!/usr/bin/env node

import { fromNullable } from '@dfinity/utils';
import { consoleActorIC, consoleActorLocal } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

const configAccount = async ({ mainnet, config }) => {
	const { set_account_config, get_account_config } = await (mainnet
		? consoleActorIC()
		: consoleActorLocal());

	const currentConfig = fromNullable(await get_account_config());

	await set_account_config({
		...config,
		version: currentConfig?.version ?? config.version
	});

	console.log('✅ Account configuration updated.');
};

const config = {
	init_credits: { e8s: 0n },
	version: []
};

const mainnet = targetMainnet();

await configAccount({ mainnet, config });
