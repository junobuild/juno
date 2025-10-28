#!/usr/bin/env node

import { observatoryActorIC, observatoryActorLocal } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

const getGoogleCertificate = async (mainnet) => {
	const { get_openid_certificate } = await (mainnet
		? observatoryActorIC()
		: observatoryActorLocal());

	const certificate = await get_openid_certificate({ provider: { Google: null } });

	console.log('📥 Google certificate:', certificate);
};

const mainnet = targetMainnet();

await getGoogleCertificate(mainnet);
