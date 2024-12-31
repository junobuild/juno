#!/usr/bin/env node

import { Principal } from '@dfinity/principal';
import { observatoryActorIC, observatoryActorLocal } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

const testNotify = async (mainnet) => {
	const { notify } = await (mainnet ? observatoryActorIC() : observatoryActorLocal());

	await notify({
		user: Principal.fromText('bnz7o-iuaaa-aaaaa-qaaaa-cai'),
		segment_id: Principal.fromText(
			'plrof-3btl5-tyr2o-pf5zm-qvidg-f3awf-fg4w6-xuipq-m34q3-27d6d-yqe'
		),
		notification: {
			DepositedCyclesEmail: {
				to: 'david@fluster.io',
				deposited_cycles: {
					timestamp: 1704032400000000000n,
					amount: 10_000n
				},
				metadata: []
			}
		}
	});

	console.log('Notification sent! ✅');
};

const mainnet = targetMainnet();

await testNotify(mainnet);
