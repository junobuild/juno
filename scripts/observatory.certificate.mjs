#!/usr/bin/env node

import { fromNullable, isNullish } from '@dfinity/utils';
import { observatoryActorIC, observatoryActorLocal } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

const fromBigIntNanoSeconds = (nanoseconds) => new Date(Number(nanoseconds / 1_000_000n));

const getGoogleCertificate = async (mainnet) => {
	const { get_openid_certificate } = await (mainnet
		? observatoryActorIC()
		: observatoryActorLocal());

	const certificate = await get_openid_certificate({ provider: { Google: null } });

	console.log('📥 Google certificate:', certificate);

	const cert = fromNullable(certificate);
	if (isNullish(cert)) {
		return;
	}

	console.log('🔄 Last update:', fromBigIntNanoSeconds(cert.updated_at));
};

const mainnet = targetMainnet();

await getGoogleCertificate(mainnet);
