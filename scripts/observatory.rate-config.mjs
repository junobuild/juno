#!/usr/bin/env node

import { observatoryActorIC, observatoryActorLocal } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

const setRateConfig = async (mainnet) => {
	const { update_rate_config } = await (mainnet ? observatoryActorIC() : observatoryActorLocal());

	await update_rate_config(
		{ OpenIdCertificateRequests: null },
		{
			max_tokens: 300, // allow up to 300 requests
			time_per_token_ns: 200_000_000n // 0.2s per token -> 300/min
		}
	);

	console.log('Rate config applied! ✅');
};

const mainnet = targetMainnet();

await setRateConfig(mainnet);
