#!/usr/bin/env node

import { fromNullable, isNullish } from '@dfinity/utils';
import { nextArg } from '@junobuild/cli-tools';
import { observatoryActorIC, observatoryActorLocal } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

const fromBigIntNanoSeconds = (nanoseconds) => new Date(Number(nanoseconds / 1_000_000n));

const getGoogleCertificate = async ({ mainnet, provider: cmdProvider }) => {
	const { get_openid_certificate } = await (mainnet
		? observatoryActorIC()
		: observatoryActorLocal());

	const provider = cmdProvider === 'github' ? { GitHub: null } : { Google: null };

	const certificate = await get_openid_certificate({ provider });

	console.log(`📥  ${cmdProvider} certificate:`, certificate);

	const cert = fromNullable(certificate);
	if (isNullish(cert)) {
		return;
	}

	console.log('🔄 Last update:', fromBigIntNanoSeconds(cert.updated_at));
};

const mainnet = targetMainnet();

const args = process.argv.slice(2);
const provider = nextArg({ args, option: '-p' }) ?? nextArg({ args, option: '--provider' });

if (!['google', 'github'].includes(provider)) {
	console.log(`Provider ${provider} is not supported`);
	process.exit(1);
}

await getGoogleCertificate({ mainnet, provider });
