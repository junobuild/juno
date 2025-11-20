#!/usr/bin/env node

import { Principal } from '@icp-sdk/core/principal';
import { observatoryActorIC, observatoryActorLocal } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

const testNotify = async (mainnet) => {
	const { ping } = await (mainnet ? observatoryActorIC() : observatoryActorLocal());

	await ping({
		user: Principal.fromText('bnz7o-iuaaa-aaaaa-qaaaa-cai'),
		segment: {
			id: Principal.fromText('plrof-3btl5-tyr2o-pf5zm-qvidg-f3awf-fg4w6-xuipq-m34q3-27d6d-yqe'),
			kind: { Satellite: null },
			metadata: []
		},
		kind: {
			DepositedCyclesEmail: {
				to: 'david@fluster.io',
				deposited_cycles: {
					timestamp: 1704032400000000000n,
					amount: 100_456_000_000n
				}
			}
		}
	});

	console.log('Notification sent! ✅');
};

const mainnet = targetMainnet();

await testNotify(mainnet);
